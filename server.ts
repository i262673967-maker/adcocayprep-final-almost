import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import crypto from 'crypto';
import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import firebaseAppletConfig from './firebase-applet-config.json';

dotenv.config();

// Initialize Firebase Admin SDK
if (!getApps().length) {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || firebaseAppletConfig?.projectId || 'atlantean-garden-kn50x';
  try {
    initializeApp({
      projectId
    });
    console.log('✅ [SERVER INIT] Firebase Admin SDK initialized for project:', projectId);
  } catch (err) {
    console.warn('⚠️ [SERVER INIT WARNING] Could not initialize Firebase Admin SDK:', err);
  }
}

const firestoreDatabaseId = process.env.VITE_FIREBASE_DATABASE_ID || firebaseAppletConfig?.firestoreDatabaseId;
const getDb = () => {
  if (firestoreDatabaseId && firestoreDatabaseId !== '(default)') {
    return getFirestore(getApp(), firestoreDatabaseId);
  }
  return getFirestore();
};

// Initialize Lemon Squeezy SDK
if (process.env.LEMONSQUEEZY_API_KEY) {
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY
  });
}

// Initialize Gemini Client
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not set. Gemini API calls will fail.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || 'missing_key_fallback',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
};

// Extended Request type with authenticated user
interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

// Auth Middleware: Verifies Firebase ID Token
const requireAuth = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  // Fallback support for local demo session
  if (token === 'demo_token' || token.startsWith('demo_') || token.startsWith('user_demo_')) {
    req.user = {
      id: token.startsWith('user_demo_') ? token : 'user_demo_101',
      email: 'parent@example.com',
      role: 'user'
    };
    return next();
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email || '',
      role: (decodedToken.role as string) || 'user'
    };
    next();
  } catch (err: any) {
    console.error('Firebase Auth token verification failed:', err?.message || err);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }
};

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  const PORT = 3000;

  // Rate Limiting for AI API Routes
  const aiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 AI requests per 15 mins
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP. Please try again after 15 minutes.' }
  });

  // Rate Limiting for Transactional Email Endpoint
  const emailRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 email requests per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many email requests. Please try again later.' }
  });

  // HTML Escaping helper to sanitize user input in transactional emails
  const escapeHtml = (str: string): string => {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Helper: Shared Lemon Squeezy Webhook Handler
  const handleLemonSqueezyWebhook = async (req: express.Request, res: express.Response) => {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    const signature = req.headers['x-signature'] as string;

    let rawBodyBuffer: Buffer;
    if (Buffer.isBuffer(req.body)) {
      rawBodyBuffer = req.body;
    } else if (typeof req.body === 'string') {
      rawBodyBuffer = Buffer.from(req.body);
    } else {
      rawBodyBuffer = Buffer.from(JSON.stringify(req.body || {}));
    }

    if (secret) {
      if (!signature) {
        console.error('Lemon Squeezy webhook missing x-signature header');
        return res.status(401).send('Missing signature');
      }

      const hmac = crypto.createHmac('sha256', secret);
      const digest = Buffer.from(hmac.update(rawBodyBuffer).digest('hex'), 'utf8');
      const signatureBuffer = Buffer.from(signature, 'utf8');

      if (signatureBuffer.length !== digest.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
        console.error('Lemon Squeezy webhook signature verification failed');
        return res.status(401).send('Invalid signature');
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBodyBuffer.toString('utf8'));
    } catch (e) {
      console.error('Lemon Squeezy webhook payload JSON parse error:', e);
      return res.status(400).send('Invalid JSON payload');
    }

    const eventName = payload.meta?.event_name;
    const userId = payload.meta?.custom_data?.user_id || payload.meta?.custom_data?.userId || payload.meta?.passthrough;

    console.log(`[LemonSqueezy Webhook Log] Event: ${eventName}, UserID: ${userId}`);

    if (userId) {
      try {
        const db = getDb();
        const userRef = db.collection('users').doc(userId);
        const userSnap = await userRef.get();
        const userRecord = userSnap.data();

        const attributes = payload.data?.attributes || {};
        const status = attributes.status || 'unknown';
        const customerId = attributes.customer_id ? String(attributes.customer_id) : undefined;
        const customerPortalUrl = attributes.urls?.customer_portal;
        const renewsAt = attributes.renews_at || attributes.ends_at || null;
        const subscriptionId = payload.data?.id ? String(payload.data.id) : null;
        const userEmail = attributes.user_email || userRecord?.email || '';

        // 1. Process User Level Plan Tier and Status
        if (eventName === 'order_created') {
          await userRef.set({
            generations_count: Math.max(0, (userRecord?.generations_count || 0) - 1),
            ...(customerId ? { lemonsqueezy_customer_id: customerId } : {}),
            updated_at: new Date().toISOString()
          }, { merge: true });
        } else if (
          eventName === 'subscription_created' ||
          eventName === 'subscription_updated' ||
          eventName === 'subscription_payment_success'
        ) {
          const isActive = status === 'active' || status === 'on_trial';
          await userRef.set({
            plan_tier: isActive ? 'subscriber' : 'free_user',
            subscription_status: status,
            ...(renewsAt ? { subscription_renews_at: renewsAt } : {}),
            ...(customerId ? { lemonsqueezy_customer_id: customerId } : {}),
            ...(customerPortalUrl ? { customer_portal_url: customerPortalUrl } : {}),
            updated_at: new Date().toISOString()
          }, { merge: true });
        } else if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
          await userRef.set({
            plan_tier: 'free_user',
            subscription_status: status,
            updated_at: new Date().toISOString()
          }, { merge: true });
        } else if (eventName === 'subscription_payment_failed') {
          await userRef.set({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString()
          }, { merge: true });
        }

        // 2. Persist in Firestore subscriptions collection
        const targetSubDocId = subscriptionId || `sub_${userId}`;
        const subRef = db.collection('subscriptions').doc(targetSubDocId);
        await subRef.set({
          subscription_id: subscriptionId,
          user_id: userId,
          user_email: userEmail,
          customer_id: customerId || null,
          status,
          renews_at: renewsAt,
          ends_at: attributes.ends_at || null,
          customer_portal_url: customerPortalUrl || null,
          event_name: eventName,
          updated_at: new Date().toISOString()
        }, { merge: true });

      } catch (dbError) {
        console.error('Lemon Squeezy webhook Firestore update error:', dbError);
      }
    }

    return res.status(200).json({ received: true });
  };

  // Mount Lemon Squeezy Webhook on both route aliases
  app.post('/api/webhook/lemonsqueezy', express.raw({ type: 'application/json' }), handleLemonSqueezyWebhook);
  app.post('/api/lemonsqueezy/webhook', express.raw({ type: 'application/json' }), handleLemonSqueezyWebhook);

  app.use('/api/ai/', aiRateLimiter);
  app.use(express.json({ limit: '15mb' }));

  // Health route
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      firebase: {
        configured: !!(process.env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig?.projectId),
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig?.projectId
      },
      emailService: {
        resendConfigured: !!(process.env.RESEND_API_KEY || process.env.TRANSACTIONAL_EMAIL_API_KEY),
        mode: (process.env.RESEND_API_KEY || process.env.TRANSACTIONAL_EMAIL_API_KEY)
          ? 'resend'
          : 'simulated'
      }
    });
  });

  // 1. Notice Analysis Endpoint
  app.post('/api/ai/analyze-notice', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { noticeText, imageBase64, mimeType } = req.body;
      const ai = getAI();

      const systemInstruction = `You are AdvocacyPrep's specialized document parsing engine for IEP and Section 504 meeting notices.
Analyze the provided meeting notice text or document image and extract structured meeting details.

Output STRICT JSON matching this schema:
{
  "meetingDate": "YYYY-MM-DD or string date",
  "meetingTime": "HH:MM AM/PM string",
  "location": "physical address or virtual platform name",
  "proposedAttendees": ["array of attendee titles/names, e.g. Special Education Teacher"],
  "purposeText": "concise summary of purpose of meeting",
  "detectedAcronyms": [
    { "term": "ACRONYM", "definition": "plain english explanation for parent" }
  ]
}`;

      let contents: any[];

      if (imageBase64) {
        contents = [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType || 'image/png'
            }
          },
          'Extract all meeting details from this IEP/504 notice image.'
        ];
      } else if (noticeText) {
        contents = [`Extract meeting details from this notice text:\n\n${noticeText}`];
      } else {
        return res.status(400).json({ error: 'Please provide notice text or image base64.' });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);

      return res.json({ success: true, data: parsedData });
    } catch (err: any) {
      console.error('Error analyzing notice:', err);
      return res.status(500).json({ error: err.message || 'Failed to analyze meeting notice' });
    }
  });

  // 2. Full Prep Packet Generation Endpoint
  app.post('/api/ai/generate-packet', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { student, meetingType, meetingDate, noticeData, intakeResponses } = req.body;
      const userId = req.user!.id;

      let planTier = 'free_user';
      let generationsCount = 0;

      // Server-side database lookup for plan_tier and generations_count
      try {
        const db = getDb();
        const userSnap = await db.collection('users').doc(userId).get();
        if (userSnap.exists) {
          const userRow = userSnap.data();
          planTier = userRow?.plan_tier || 'free_user';
          generationsCount = userRow?.generations_count ?? 0;
        }
      } catch (dbErr) {
        console.warn('Could not query Firestore users collection, using defaults:', dbErr);
      }

      // Enforce Free Tier Limit: plan_tier === 'free_user' && generations_count >= 1
      if (planTier === 'free_user' && generationsCount >= 1) {
        return res.status(403).json({
          error: 'Free tier limit reached (1 generation). Upgrade to the Family Plan for unlimited meeting prep packets.',
          limitReached: true
        });
      }

      const ai = getAI();

      const prompt = `You are AdvocacyPrep's master special education advocate engine.
Generate a comprehensive, tactical 1-page IEP/504 Meeting Preparation Packet for a parent.

Student Profile:
Name: ${student.name}
Grade: ${student.grade}
State: ${student.state}
District: ${student.schoolDistrict}
Disability Category: ${student.disabilityCategory}
Student Notes: ${student.notes || 'None'}

Meeting Details:
Type: ${meetingType}
Date: ${meetingDate}
Notice Purpose: ${noticeData?.purposeText || 'Not specified'}
Proposed Attendees: ${JSON.stringify(noticeData?.proposedAttendees || [])}

Parent Intake Input:
Top Worries: ${intakeResponses?.topWorries || 'None provided'}
Current Services: ${intakeResponses?.currentServices || 'None provided'}
Recent Changes: ${intakeResponses?.recentChanges || 'None provided'}
Desired Outcomes: ${intakeResponses?.desiredOutcomes || 'None provided'}
Child Strengths: ${intakeResponses?.childStrengths || 'None provided'}
Attending With: ${intakeResponses?.attendingWith || 'Alone'}

Generate a JSON object matching this structure EXACTLY:
{
  "studentHeader": {
    "studentName": "${student.name}",
    "grade": "${student.grade}",
    "state": "${student.state}",
    "schoolDistrict": "${student.schoolDistrict}",
    "meetingType": "${meetingType}",
    "meetingDate": "${meetingDate}",
    "disabilityCategory": "${student.disabilityCategory}"
  },
  "childOverview": {
    "strengths": "Detailed summary of child strengths and interests",
    "concerns": "Detailed summary of parent top concerns and worries",
    "currentSupport": "Summary of current services and accommodations",
    "goalsToDiscuss": "Summary of desired outcomes and goals"
  },
  "topPriorities": [
    {
      "rank": 1,
      "title": "Actionable Priority Title",
      "rationale": "Clear rationale connecting parent worries to state/federal special education rights",
      "tacticalTip": "Exact wording or script for the parent during the meeting"
    }
  ],
  "keyQuestions": [
    {
      "id": "q1",
      "question": "Sharp question targeting baseline data or service minutes",
      "goal": "Objective behind asking this question",
      "whoToAsk": "Specific team role (e.g. SLP, GenEd Teacher, LEA Admin)"
    }
  ],
  "jargonDecoder": [
    {
      "term": "Term or Acronym",
      "plainEnglish": "Simple non-jargon translation",
      "parentTip": "Tactical tip regarding this document/role"
    }
  ],
  "rightsAtAGlance": [
    {
      "title": "Specific State/Federal Right",
      "detail": "Actionable explanation (e.g., right to take IEP home before signing, right to PWN)"
    }
  ],
  "whatToBringChecklist": [
    {
      "id": "b1",
      "item": "Item name",
      "category": "Documents | Support | Personal",
      "essential": true,
      "checked": false
    }
  ],
  "disagreementStrategy": [
    {
      "stepNumber": 1,
      "actionTitle": "Step title",
      "description": "Tactical step if district pushes back or proposes cutting services"
    }
  ]
}

Ensure topPriorities has exactly 3 items ranked 1 to 3.
Ensure keyQuestions has 5 distinct, high-impact questions tailored to the attendee roles.
Ensure rightsAtAGlance includes state-specific guidance for ${student.state}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '{}';
      const packetContent = JSON.parse(responseText);

      packetContent.legalDisclaimer =
        "This document provides general organizational and tactical preparation framework only. It does NOT constitute legal advice. Special education law, procedural rules, and statutory timelines vary by state and school district. Always verify specific rights, procedural steps, and local deadlines with your state's Parent Training and Information Center (PTI) or a licensed special education attorney/advocate.";

      // Increment generations_count in Firestore server-side
      try {
        const db = getDb();
        await db.collection('users').doc(userId).set({
          generations_count: generationsCount + 1,
          updated_at: new Date().toISOString()
        }, { merge: true });
      } catch (dbErr) {
        console.error('Error incrementing generations_count server-side:', dbErr);
      }

      return res.json({ success: true, packetContent });
    } catch (err: any) {
      console.error('Error generating packet:', err);
      return res.status(500).json({ error: err.message || 'Failed to generate meeting packet' });
    }
  });

  // 3. AI Assistant Q&A Endpoint
  app.post('/api/ai/ask-assistant', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { userQuestion, studentState, studentGrade, meetingType } = req.body;
      const ai = getAI();

      const systemInstruction = `You are AdvocacyPrep's tactical IEP/504 parent guidance AI. You provide concise, calm, actionable advice for special education meetings.

Always include a reminder: "This information is organizational guidance, not formal legal counsel. Check with your state's Parent Training and Information Center (PTI) for state-specific rules."
Student context: State: ${studentState || 'US'}, Grade: ${studentGrade || 'K-12'}, Meeting: ${meetingType || 'IEP/504'}.
Keep responses under 250 words, formatted in clean markdown bullet points.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: userQuestion,
        config: {
          systemInstruction
        }
      });

      return res.json({ success: true, answer: response.text });
    } catch (err: any) {
      console.error('Error answering assistant question:', err);
      return res.status(500).json({ error: err.message || 'Failed to get answer' });
    }
  });

  // 4. Transactional Email Endpoint
  app.post('/api/email/send-packet-confirmation', emailRateLimiter, requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) {
        return res.status(400).json({ error: 'Missing recipient email address' });
      }

      const {
        studentName = 'Student',
        meetingType = 'IEP/504 Meeting',
        meetingDate = 'Upcoming',
        topPriorities = [],
        keyQuestions = [],
        rightsAtAGlance = [],
        legalDisclaimer = ''
      } = req.body;

      const safeStudentName = escapeHtml(studentName);
      const safeMeetingType = escapeHtml(meetingType);
      const safeMeetingDate = escapeHtml(meetingDate);
      const safeLegalDisclaimer = escapeHtml(legalDisclaimer || 'This document provides general organizational and tactical preparation framework only and does not constitute formal legal advice.');

      const resendApiKey = process.env.RESEND_API_KEY || process.env.TRANSACTIONAL_EMAIL_API_KEY;
      const fromEmail = process.env.FROM_EMAIL || 'AdvocacyPrep <notifications@advocacyprep.com>';
      const appUrl = process.env.APP_URL || 'https://advocacyprep.com';

      const topPrioritiesListHtml = Array.isArray(topPriorities) && topPriorities.length > 0
        ? topPriorities.map((p: any) => `
          <li style="margin-bottom: 12px;">
            <strong style="color: #1e293b;">${escapeHtml(p.title || 'Priority')}</strong>
            ${p.rationale ? `<div style="color: #475569; font-size: 13px; margin-top: 2px;">${escapeHtml(p.rationale)}</div>` : ''}
            ${p.tacticalTip ? `<div style="color: #4f46e5; font-size: 12px; font-weight: 500; margin-top: 2px;">💡 Tip: ${escapeHtml(p.tacticalTip)}</div>` : ''}
          </li>
        `).join('')
        : '<li>Review meeting goals and accommodations.</li>';

      const keyQuestionsListHtml = Array.isArray(keyQuestions) && keyQuestions.length > 0
        ? keyQuestions.slice(0, 5).map((q: any) => `
          <li style="margin-bottom: 10px;">
            <strong style="color: #312e81;">[${escapeHtml(q.whoToAsk || 'Team')}]:</strong> ${escapeHtml(q.question || '')}
            ${q.goal ? `<div style="color: #4338ca; font-size: 12px; font-style: italic; margin-top: 2px;">Target Goal: ${escapeHtml(q.goal)}</div>` : ''}
          </li>
        `).join('')
        : '<li>What specific progress data was used to create these goals?</li>';

      const rightsHtml = Array.isArray(rightsAtAGlance) && rightsAtAGlance.length > 0
        ? `
          <div style="background-color: #fefce8; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #eab308;">
            <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #854d0e; font-weight: 600;">Key Parental Rights</h3>
            <ul style="margin: 0; padding-left: 20px; color: #713f12; font-size: 13px; line-height: 1.5;">
              ${rightsAtAGlance.slice(0, 4).map((r: any) => `
                <li style="margin-bottom: 6px;">
                  <strong>${escapeHtml(r.rightTitle || '')}:</strong> ${escapeHtml(r.description || '')}
                </li>
              `).join('')}
            </ul>
          </div>
        `
        : '';

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AdvocacyPrep IEP/504 Meeting Prep Packet Summary</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    
    <div style="background-color: #4f46e5; padding: 24px 32px; color: #ffffff;">
      <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">AdvocacyPrep</h1>
      <p style="margin: 4px 0 0 0; font-size: 14px; color: #c7d2fe;">1-Page Meeting Prep Packet Confirmation</p>
    </div>

    <div style="padding: 32px;">
      <p style="font-size: 16px; line-height: 1.5; color: #334155; margin-top: 0;">
        Hello,
      </p>
      <p style="font-size: 15px; line-height: 1.5; color: #334155;">
        Your custom IEP/504 meeting preparation packet for <strong>${safeStudentName}</strong> (${safeMeetingType}) on <strong>${safeMeetingDate}</strong> has been created and saved.
      </p>

      <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #1e293b; font-weight: 600;">Top Meeting Priorities</h3>
        <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.6;">
          ${topPrioritiesListHtml}
        </ul>
      </div>

      <div style="background-color: #eef2ff; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #6366f1;">
        <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #3730a3; font-weight: 600;">Key Questions to Ask</h3>
        <ol style="margin: 0; padding-left: 20px; color: #3730a3; font-size: 14px; line-height: 1.6;">
          ${keyQuestionsListHtml}
        </ol>
      </div>

      ${rightsHtml}

      <div style="text-align: center; margin: 32px 0;">
        <a href="${appUrl}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 28px; border-radius: 8px; display: inline-block;">
          Open AdvocacyPrep App to View Full Packet
        </a>
      </div>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 28px 0 16px 0;" />
      <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin: 0;">
        <strong>Legal Disclaimer:</strong> ${safeLegalDisclaimer}
      </p>
    </div>

    <div style="background-color: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
      © ${new Date().getFullYear()} AdvocacyPrep. Special Education Meeting Preparation for Parents.
    </div>

  </div>
</body>
</html>
      `;

      const subject = `Your IEP/504 Meeting Prep Packet Summary for ${safeStudentName}`;

      if (resendApiKey) {
        console.log('📧 [EMAIL SERVICE] Dispatching via Resend API to:', userEmail);
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [userEmail],
            subject,
            html: emailHtml
          })
        });

        if (!resendRes.ok) {
          const resendErr = await resendRes.text();
          console.error('❌ [EMAIL SERVICE ERROR] Resend dispatch failed:', resendErr);
          throw new Error(`Resend API failed: ${resendErr}`);
        }

        const resendData = await resendRes.json();
        console.log('✅ [EMAIL SERVICE SUCCESS] Sent via Resend:', resendData);
        return res.json({ success: true, provider: 'resend', userEmail });
      }

      // Simulation fallback for dev
      console.log('📧 [EMAIL SERVICE SIMULATION] Email generated for:', userEmail);
      return res.json({
        success: true,
        provider: 'simulated',
        userEmail,
        note: 'Email simulation completed (set RESEND_API_KEY for live delivery).'
      });
    } catch (err: any) {
      console.error('Error sending confirmation email:', err);
      return res.status(500).json({ error: err.message || 'Failed to send confirmation email' });
    }
  });

  // 5. Lemon Squeezy Checkout Handler
  const handleCreateCheckout = async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const { planType, billingCycle } = req.body;
      const userId = req.user!.id;
      const userEmail = req.user!.email;

      const storeId = process.env.LEMONSQUEEZY_STORE_ID;
      const familyMonthlyVariantId = process.env.LEMONSQUEEZY_VARIANT_FAMILY_MONTHLY;
      const familyAnnualVariantId = process.env.LEMONSQUEEZY_VARIANT_FAMILY_ANNUAL;
      const singlePassVariantId = process.env.LEMONSQUEEZY_VARIANT_SINGLE_PASS;

      let variantId: string | undefined;

      if (planType === 'single_pass') {
        variantId = singlePassVariantId;
      } else {
        variantId = billingCycle === 'monthly' ? familyMonthlyVariantId : familyAnnualVariantId;
      }

      if (!storeId || !variantId || !process.env.LEMONSQUEEZY_API_KEY) {
        console.warn('Lemon Squeezy API key, storeId, or variantId missing. Returning simulated checkout URL.');
        return res.json({
          success: true,
          checkoutUrl: 'https://lemonsqueezy.com',
          isSimulated: true
        });
      }

      const checkoutResponse = await createCheckout(storeId, variantId, {
        checkoutData: {
          email: userEmail,
          custom: {
            user_id: userId
          }
        },
        productOptions: {
          redirectUrl: process.env.APP_URL || 'https://advocacyprep.com'
        }
      });

      const checkoutUrl = checkoutResponse.data?.data?.attributes?.url;
      return res.json({ success: true, checkoutUrl });
    } catch (err: any) {
      console.error('Error creating Lemon Squeezy checkout:', err);
      return res.status(500).json({ error: err.message || 'Failed to create checkout URL' });
    }
  };

  app.post('/api/create-checkout', requireAuth, handleCreateCheckout);
  app.post('/api/checkout/create', requireAuth, handleCreateCheckout);

  // 6. Customer Billing Portal Endpoint
  const handleBillingPortal = async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const userId = req.user!.id;
      const db = getDb();
      const userSnap = await db.collection('users').doc(userId).get();

      if (userSnap.exists) {
        const userData = userSnap.data();
        if (userData?.customer_portal_url) {
          return res.json({ success: true, url: userData.customer_portal_url });
        }
      }

      return res.json({
        success: false,
        isSimulated: true,
        message: 'No active billing portal URL found for this account.'
      });
    } catch (err: any) {
      console.error('Error fetching billing portal:', err);
      return res.status(500).json({ error: err.message || 'Failed to access billing portal' });
    }
  };

  app.get('/api/billing-portal', requireAuth, handleBillingPortal);
  app.post('/api/billing-portal', requireAuth, handleBillingPortal);

  // 6. Admin Panel Overview Statistics
  app.get('/api/admin/stats', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const adminSecret = process.env.ADMIN_SECRET_KEY;
      if (!adminSecret && process.env.NODE_ENV === 'production') {
        return res.status(503).json({ error: 'Admin panel not configured' });
      }

      const userId = req.user!.id;
      const db = getDb();

      // Fail closed if user role is not admin
      const userSnap = await db.collection('users').doc(userId).get();
      if (!userSnap.exists || userSnap.data()?.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Administrator role required.' });
      }

      // Query real Firestore statistics
      let totalUsers = 0;
      let activeSubscribers = 0;
      let totalPacketsGenerated = 0;
      let recentPackets: any[] = [];

      try {
        const usersCountSnap = await db.collection('users').count().get();
        totalUsers = usersCountSnap.data().count;

        const subCountSnap = await db.collection('users').where('plan_tier', '==', 'subscriber').count().get();
        activeSubscribers = subCountSnap.data().count;

        const packetsCountSnap = await db.collection('packets').count().get();
        totalPacketsGenerated = packetsCountSnap.data().count;

        const recentPacketsSnap = await db.collection('packets')
          .orderBy('generated_at', 'desc')
          .limit(10)
          .get();

        recentPackets = recentPacketsSnap.docs.map(d => {
          const p = d.data();
          return {
            id: d.id,
            meetingType: p.meeting_type,
            meetingDate: p.meeting_date,
            status: p.status || 'final',
            generatedAt: p.generated_at
          };
        });
      } catch (dbErr) {
        console.warn('Error fetching Firestore stats:', dbErr);
      }

      const estimatedMrr = activeSubscribers * 12;

      return res.json({
        success: true,
        stats: {
          totalUsers,
          activeSubscribers,
          totalPacketsGenerated,
          monthlyRecurringRevenue: estimatedMrr,
          isMrrEstimated: true,
          recentPackets,
          geminiStatus: process.env.GEMINI_API_KEY ? 'Connected (gemini-3.6-flash)' : 'Missing API Key'
        }
      });
    } catch (err: any) {
      console.error('Error fetching admin stats:', err);
      return res.status(500).json({ error: err.message || 'Failed to load admin statistics' });
    }
  });

  // Vite middleware for dev or static files for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AdvocacyPrep server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
