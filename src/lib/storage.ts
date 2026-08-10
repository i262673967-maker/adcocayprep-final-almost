import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { UserProfile, Student, MeetingPacket, MeetingLog } from '../types';
import { MANDATORY_LEGAL_DISCLAIMER } from '../data/stateData';
import { db, auth, isFirebaseConfigured } from './firebase';

const USER_KEY = 'advocacy_prep_user_profile_v1';
const STUDENTS_KEY = 'advocacy_prep_students_v1';
const PACKETS_KEY = 'advocacy_prep_packets_v1';

// Seed sample packet for new users or fallback preview
export const SAMPLE_MAYA_PACKET: MeetingPacket = {
  id: 'packet_sample_maya',
  studentId: 'student_1',
  meetingType: 'IEP_annual',
  meetingDate: '2026-08-25',
  version: 1,
  status: 'final',
  isWatermarked: false,
  generatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  noticeData: {
    meetingDate: '2026-08-25',
    meetingTime: '10:00 AM PST',
    location: 'Conference Room B / Zoom Hybrid',
    proposedAttendees: [
      'Special Education Teacher (Mr. Harrison)',
      'General Education Teacher (Ms. Gable)',
      'Speech Language Pathologist (SLP Ms. Lin)',
      'School Psychologist (Dr. Vance)',
      'LEA Administrator'
    ],
    purposeText: 'Annual IEP Review to evaluate triennial progress, speech minutes, and classroom accommodations.',
    detectedAcronyms: [
      { term: 'LEA', definition: 'Local Educational Agency representative (has authority to commit district resources)' },
      { term: 'BIP', definition: 'Behavior Intervention Plan' },
      { term: 'FAPE', definition: 'Free Appropriate Public Education' },
      { term: 'SLP', definition: 'Speech-Language Pathologist' }
    ],
    rawNoticeText: 'Annual IEP Meeting Notice for Maya S. Scheduled for August 25, 2026 at 10:00 AM at Oakland Unified. Purpose: Annual Review of goals, SLP service delivery minutes, and LRE placement.'
  },
  intakeResponses: {
    topWorries: 'District proposed cutting speech therapy from 60 mins/week to 30 mins/week despite ongoing articulation issues. Also Maya gets overwhelmed during noisy unstructured assemblies.',
    currentServices: '60 mins/week Speech-Language therapy (individual/small group), 1:1 sensory break accommodations, extra time on district assessments.',
    recentChanges: 'Maya started 4th grade with higher reading expectations. Reports feeling frustrated during group writing time.',
    desiredOutcomes: 'Maintain 60 minutes/week of Speech therapy; add explicit sensory break protocol before assemblies; update reading accommodations.',
    attendingWith: 'Private SLP evaluation summary & Advocate (Jane Miller)',
    childStrengths: 'High creative intelligence, passion for marine biology, eager to participate when visual schedules are provided.'
  },
  content: {
    studentHeader: {
      studentName: 'Maya S.',
      grade: '4th Grade',
      state: 'CA',
      schoolDistrict: 'Oakland Unified School District',
      meetingType: 'IEP_annual',
      meetingDate: '2026-08-25',
      disabilityCategory: 'Autism Spectrum / Speech Impairment'
    },
    topPriorities: [
      {
        rank: 1,
        title: 'Protect Speech-Language Service Minutes (60 mins/wk)',
        rationale: 'District notice hints at reducing SLP minutes. Maya continues to show progress specifically due to current frequency.',
        tacticalTip: 'Ask the SLP to share progress monitoring data across both structured clinic and unstructured classroom environments before accepting any service reduction.'
      },
      {
        rank: 2,
        title: 'Formalize Sensory Break Protocol for Assemblies & Cafeteria',
        rationale: 'Unstructured noise triggers anxiety shutdowns, impacting the rest of her learning day.',
        tacticalTip: 'Request a designated quiet space option and noise-dampening headphones written explicitly into her Accommodations section.'
      },
      {
        rank: 3,
        title: 'Update Visual Graphic Organizers for Written Expression',
        rationale: 'Writing demands in 4th grade have increased. Visual scaffolds will reduce frustration during group tasks.',
        tacticalTip: 'Propose adding assistive technology (speech-to-text preview or mind-mapping templates) to her IEP goal supports.'
      }
    ],
    keyQuestions: [
      {
        id: 'q1',
        question: 'What specific baseline data supports the proposed change in Speech-Language service minutes?',
        goal: 'Require the team to produce concrete data rather than generalized progress claims.',
        whoToAsk: 'Speech-Language Pathologist (Ms. Lin)'
      },
      {
        id: 'q2',
        question: 'How are accommodations being monitored across all gen-ed subjects (including art, music, and PE)?',
        goal: 'Ensure general education teachers understand and consistently track her accommodations daily.',
        whoToAsk: 'General Education Teacher (Ms. Gable)'
      },
      {
        id: 'q3',
        question: 'Can we schedule a 30-day review after implementing the updated sensory break protocol?',
        goal: 'Lock in a designated check-in window so adjustments can be made promptly if needed.',
        whoToAsk: 'LEA Administrator / Special Ed Teacher'
      },
      {
        id: 'q4',
        question: 'Has the school psychologist reviewed the private evaluation report provided by our independent SLP?',
        goal: 'Ensure outside expert findings are formally incorporated into team deliberations.',
        whoToAsk: 'School Psychologist (Dr. Vance)'
      },
      {
        id: 'q5',
        question: 'In what environment will specialized instruction be delivered—pull-out vs. push-in?',
        goal: 'Clarify Least Restrictive Environment (LRE) impact on her classroom instruction time.',
        whoToAsk: 'Special Education Teacher (Mr. Harrison)'
      }
    ],
    jargonDecoder: [
      {
        term: 'LEA Representative',
        plainEnglish: 'Local Educational Agency representative. The district official in the room with authority to allocate school funds and approve services.',
        parentTip: 'Verify that this person is present throughout the entire meeting before agreeing to final service decisions.'
      },
      {
        term: 'LRE (Least Restrictive Environment)',
        plainEnglish: 'The federal requirement that students with disabilities be educated with non-disabled peers to the maximum extent appropriate.',
        parentTip: 'If push-in vs pull-out services are debated, ask how LRE is being balanced with her individual skill mastery.'
      },
      {
        term: 'PWN (Prior Written Notice)',
        plainEnglish: 'A formal document the district must send you whenever they agree to or refuse a parent request for services or placement.',
        parentTip: 'If the district refuses a request (e.g. keeping 60 SLP mins), say: "Please document this refusal and rationale in the PWN."'
      },
      {
        term: 'TRIENNIAL',
        plainEnglish: 'The comprehensive evaluation conducted every 3 years to determine ongoing eligibility and present level of performance.',
        parentTip: 'Review testing protocols in advance to confirm which standardized tools were administered.'
      }
    ],
    rightsAtAGlance: [
      {
        title: 'Right to Advance Document Inspection',
        detail: 'Under IDEA, parents have the right to request draft goals and assessment reports before the meeting.'
      },
      {
        title: 'Right to Bring Accompaniment & Audio Record',
        detail: 'Parents may bring an advocate, therapist, or relative to the meeting and request to audio record proceedings under applicable rules.'
      },
      {
        title: 'Right to Take Document Home Before Signing',
        detail: 'You are an equal IEP team member and do not need to sign consent immediately. You can review at home with family or advocate.'
      },
      {
        title: 'Right to Submit Parent Concern Statement',
        detail: 'You have the right to submit a written Parent Input Statement that must be attached verbatim to the official IEP.'
      }
    ],
    whatToBringChecklist: [
      { id: 'b1', item: 'Notice of Meeting & Attendee Roster', category: 'Documents', essential: true, checked: true },
      { id: 'b2', item: 'Prior IEP & Current Progress Reports', category: 'Documents', essential: true, checked: true },
      { id: 'b3', item: 'Private Evaluation / Outside SLP Summary', category: 'Documents', essential: true, checked: true },
      { id: 'b4', item: 'Top 3 Priorities 1-Page Prep Sheet (This Document)', category: 'Support', essential: true, checked: false },
      { id: 'b5', item: 'Notepad, Pen & Water Bottle', category: 'Personal', essential: false, checked: false },
      { id: 'b6', item: 'Audio Recorder or Recording App (if advance notice provided)', category: 'Support', essential: true, checked: false }
    ],
    disagreementStrategy: [
      {
        stepNumber: 1,
        actionTitle: 'Stay Calm & Request Explanation on Data',
        description: 'If team proposes reducing services, respond: "Please walk me through the specific objective progress data that supports this change."'
      },
      {
        stepNumber: 2,
        actionTitle: 'Ask for Refusal in Prior Written Notice (PWN)',
        description: 'If agreement is not reached, request: "Please document my request for 60 SLP minutes and the district\'s formal refusal rationale in the Prior Written Notice."'
      },
      {
        stepNumber: 3,
        actionTitle: 'Partial Agreement & Take Document Home',
        description: 'Sign agreement ONLY for items you agree with (e.g. accommodations, goals), and state in writing that you reserve agreement on contested service minutes.'
      }
    ],
    legalDisclaimer: MANDATORY_LEGAL_DISCLAIMER
  }
};

// Helper: Get active Firebase user ID if authenticated
function getAuthenticatedUserId(providedUserId?: string): string | null {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) {
    return null;
  }
  if (providedUserId && !providedUserId.startsWith('user_demo_') && !providedUserId.startsWith('user_local_')) {
    if (providedUserId === firebaseUser.uid) {
      return firebaseUser.uid;
    }
    return null;
  }
  return firebaseUser.uid;
}

// --- USER PROFILE ---
export async function getStoredUser(userId?: string): Promise<UserProfile> {
  const targetId = getAuthenticatedUserId(userId);
  if (isFirebaseConfigured() && targetId) {
    console.log('🔍 [FIRESTORE QUERY] Fetching user doc from users collection:', targetId);
    try {
      const userDocRef = doc(db, 'users', targetId);
      const snap = await getDoc(userDocRef);

      if (snap.exists()) {
        const data = snap.data();
        console.log('✅ [FIRESTORE SUCCESS] Loaded user profile from Firestore:', snap.id);
        return {
          id: snap.id,
          email: data.email || auth.currentUser?.email || '',
          name: data.name || (data.email ? data.email.split('@')[0] : 'Parent User'),
          planTier: data.plan_tier || 'free_user',
          lemonsqueezyCustomerId: data.lemonsqueezy_customer_id,
          customerPortalUrl: data.customer_portal_url,
          subscriptionStatus: data.subscription_status,
          subscriptionRenewsAt: data.subscription_renews_at,
          role: data.role || 'user',
          generationsCount: data.generations_count ?? 0,
          maxFreeGenerations: 1,
          createdAt: data.created_at || new Date().toISOString()
        };
      }
    } catch (e) {
      console.error('❌ [FIRESTORE EXCEPTION] getStoredUser thrown exception:', e);
    }
  }

  // Fallback / Local storage
  console.log('ℹ️ [STORAGE LOG] Reading user profile from localStorage fallback.');
  const raw = localStorage.getItem(USER_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {}
  }

  const defaultUser: UserProfile = {
    id: userId || 'user_demo_101',
    email: auth.currentUser?.email || 'parent@example.com',
    name: 'Parent User',
    planTier: 'free_user',
    generationsCount: 0,
    maxFreeGenerations: 1,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem(USER_KEY, JSON.stringify(defaultUser));
  return defaultUser;
}

export async function saveStoredUser(user: UserProfile): Promise<void> {
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  const firebaseUser = auth.currentUser;
  if (isFirebaseConfigured() && firebaseUser && (user.id === firebaseUser.uid || user.id.startsWith('user_demo_') || user.id.startsWith('user_local_'))) {
    console.log('💾 [FIRESTORE UPSERT] Updating users doc:', firebaseUser.uid);
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, {
        id: firebaseUser.uid,
        email: user.email || firebaseUser.email || '',
        name: user.name,
        plan_tier: user.planTier,
        lemonsqueezy_customer_id: user.lemonsqueezyCustomerId || null,
        customer_portal_url: user.customerPortalUrl || null,
        subscription_status: user.subscriptionStatus || null,
        subscription_renews_at: user.subscriptionRenewsAt || null,
        role: user.role || 'user',
        generations_count: user.generationsCount,
        updated_at: new Date().toISOString()
      }, { merge: true });
      console.log('✅ [FIRESTORE SUCCESS] User profile saved to Firestore.');
    } catch (e) {
      console.error('❌ [FIRESTORE EXCEPTION] saveStoredUser thrown exception:', e);
    }
  }
}

// --- STUDENTS ---
export async function getStoredStudents(userId?: string): Promise<Student[]> {
  const targetId = getAuthenticatedUserId(userId);
  if (isFirebaseConfigured() && targetId) {
    console.log('🔍 [FIRESTORE QUERY] Fetching students collection for user:', targetId);
    try {
      const q = query(collection(db, 'students'), where('user_id', '==', targetId));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        console.log(`✅ [FIRESTORE SUCCESS] Loaded ${querySnap.docs.length} student records.`);
        return querySnap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            userId: d.user_id,
            name: d.name,
            grade: d.grade,
            state: d.state,
            schoolDistrict: d.school_district,
            disabilityCategory: d.disability_category,
            notes: d.notes,
            createdAt: d.created_at || new Date().toISOString()
          };
        });
      }
    } catch (e) {
      console.error('❌ [FIRESTORE EXCEPTION] getStoredStudents thrown exception:', e);
    }
  }

  // Local fallback
  console.log('ℹ️ [STORAGE LOG] Reading students from localStorage fallback.');
  const raw = localStorage.getItem(STUDENTS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }

  const defaultStudents: Student[] = [
    {
      id: 'student_1',
      userId: userId || 'user_demo_101',
      name: 'Maya S.',
      grade: '4th Grade',
      state: 'CA',
      schoolDistrict: 'Oakland Unified School District',
      disabilityCategory: 'Autism Spectrum / Speech Impairment',
      notes: 'Loves drawing and science. Struggles with sensory transitions and peer group work.',
      createdAt: new Date().toISOString()
    }
  ];
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(defaultStudents));
  return defaultStudents;
}

export async function saveStoredStudent(student: Student): Promise<void> {
  const current = await getStoredStudents(student.userId);
  const existsIndex = current.findIndex((s) => s.id === student.id);
  let updated: Student[];

  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = student;
  } else {
    updated = [...current, student];
  }
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(updated));

  const firebaseUser = auth.currentUser;
  if (isFirebaseConfigured() && firebaseUser) {
    console.log('💾 [FIRESTORE UPSERT] Saving student doc to Firestore:', student.id);
    try {
      const studentDocRef = doc(db, 'students', student.id);
      await setDoc(studentDocRef, {
        id: student.id,
        user_id: firebaseUser.uid,
        name: student.name,
        grade: student.grade,
        state: student.state,
        school_district: student.schoolDistrict,
        disability_category: student.disabilityCategory,
        notes: student.notes,
        created_at: student.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { merge: true });
      console.log('✅ [FIRESTORE SUCCESS] Student record saved to Firestore.');
    } catch (e) {
      console.error('❌ [FIRESTORE EXCEPTION] saveStoredStudent thrown exception:', e);
    }
  }
}

export async function deleteStoredStudent(studentId: string, userId?: string): Promise<void> {
  const current = await getStoredStudents(userId);
  const filtered = current.filter((s) => s.id !== studentId);
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(filtered));

  if (isFirebaseConfigured() && userId && !userId.startsWith('user_demo_')) {
    console.log('🗑️ [FIRESTORE DELETE] Deleting student doc from Firestore:', studentId);
    try {
      await deleteDoc(doc(db, 'students', studentId));
      console.log('✅ [FIRESTORE SUCCESS] Student record deleted from Firestore.');
    } catch (e) {
      console.error('❌ [FIRESTORE EXCEPTION] deleteStoredStudent thrown exception:', e);
    }
  }
}

// --- PACKETS ---
export async function getStoredPackets(userId?: string): Promise<MeetingPacket[]> {
  const targetId = getAuthenticatedUserId(userId);
  if (isFirebaseConfigured() && targetId) {
    console.log('🔍 [FIRESTORE QUERY] Fetching packets collection for user:', targetId);
    try {
      const q = query(
        collection(db, 'packets'),
        where('user_id', '==', targetId)
      );
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        console.log(`✅ [FIRESTORE SUCCESS] Loaded ${querySnap.docs.length} packet records.`);
        const results = querySnap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            studentId: d.student_id,
            meetingType: d.meeting_type,
            meetingDate: d.meeting_date,
            version: d.version || 1,
            status: d.status || 'final',
            isWatermarked: d.is_watermarked ?? false,
            content: d.content,
            noticeData: d.notice_data,
            intakeResponses: d.intake_responses,
            generatedAt: d.generated_at
          };
        });
        results.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
        return results;
      }
    } catch (e) {
      console.error('❌ [FIRESTORE EXCEPTION] getStoredPackets thrown exception:', e);
    }
  }

  // Local fallback
  console.log('ℹ️ [STORAGE LOG] Reading packets from localStorage fallback.');
  const raw = localStorage.getItem(PACKETS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }

  localStorage.setItem(PACKETS_KEY, JSON.stringify([SAMPLE_MAYA_PACKET]));
  return [SAMPLE_MAYA_PACKET];
}

export async function saveStoredPacket(packet: MeetingPacket, userId?: string): Promise<void> {
  const current = await getStoredPackets(userId);
  const existsIdx = current.findIndex((p) => p.id === packet.id);
  let updated: MeetingPacket[];

  if (existsIdx >= 0) {
    updated = [...current];
    updated[existsIdx] = packet;
  } else {
    updated = [packet, ...current];
  }
  localStorage.setItem(PACKETS_KEY, JSON.stringify(updated));

  const firebaseUser = auth.currentUser;
  if (isFirebaseConfigured() && firebaseUser) {
    console.log('💾 [FIRESTORE UPSERT] Saving packet doc to Firestore:', packet.id);
    try {
      await setDoc(doc(db, 'packets', packet.id), {
        id: packet.id,
        student_id: packet.studentId,
        user_id: firebaseUser.uid,
        meeting_type: packet.meetingType,
        meeting_date: packet.meetingDate,
        version: packet.version,
        status: packet.status,
        is_watermarked: packet.isWatermarked,
        content: packet.content,
        notice_data: packet.noticeData,
        intake_responses: packet.intakeResponses,
        generated_at: packet.generatedAt,
        updated_at: new Date().toISOString()
      }, { merge: true });
      console.log('✅ [FIRESTORE SUCCESS] Packet saved to Firestore.');
    } catch (e) {
      console.error('❌ [FIRESTORE EXCEPTION] saveStoredPacket thrown exception:', e);
    }
  }
}

export async function deleteStoredPacket(packetId: string, userId?: string): Promise<void> {
  const current = await getStoredPackets(userId);
  const filtered = current.filter((p) => p.id !== packetId);
  localStorage.setItem(PACKETS_KEY, JSON.stringify(filtered));

  const targetUserId = userId || auth.currentUser?.uid;
  if (isFirebaseConfigured() && targetUserId && !targetUserId.startsWith('user_demo_')) {
    console.log('🗑️ [FIRESTORE DELETE] Deleting packet doc from Firestore:', packetId);
    try {
      await deleteDoc(doc(db, 'packets', packetId));
      console.log('✅ [FIRESTORE SUCCESS] Packet deleted from Firestore.');
    } catch (e) {
      console.error('❌ [FIRESTORE EXCEPTION] deleteStoredPacket thrown exception:', e);
    }
  }
}

// MEETING LOGS STORAGE
const MEETING_LOGS_KEY = 'advocacyprep_meeting_logs';

export async function getStoredMeetingLogs(userId?: string): Promise<MeetingLog[]> {
  const firebaseUser = auth.currentUser;
  const targetId = userId || firebaseUser?.uid;

  if (isFirebaseConfigured() && targetId && !targetId.startsWith('user_demo_')) {
    try {
      const q = query(
        collection(db, 'meeting_logs'),
        where('user_id', '==', targetId)
      );
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const results = querySnap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            studentId: d.student_id,
            packetId: d.packet_id,
            meetingDate: d.meeting_date,
            meetingType: d.meeting_type,
            liveNotes: d.live_notes || '',
            decisions: d.decisions || [],
            actionItems: d.action_items || [],
            finishedAt: d.finished_at,
            status: d.status || 'completed',
            createdAt: d.created_at
          } as MeetingLog;
        });
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return results;
      }
    } catch (e) {
      console.error('❌ Exception loading meeting logs from Firestore:', e);
    }
  }

  const raw = localStorage.getItem(MEETING_LOGS_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {}
  }
  return [];
}

export async function saveStoredMeetingLog(log: MeetingLog, userId?: string): Promise<void> {
  const current = await getStoredMeetingLogs(userId);
  const existsIdx = current.findIndex((m) => m.id === log.id);
  let updated: MeetingLog[];

  if (existsIdx >= 0) {
    updated = [...current];
    updated[existsIdx] = log;
  } else {
    updated = [log, ...current];
  }
  localStorage.setItem(MEETING_LOGS_KEY, JSON.stringify(updated));

  const firebaseUser = auth.currentUser;
  if (isFirebaseConfigured() && firebaseUser) {
    try {
      await setDoc(doc(db, 'meeting_logs', log.id), {
        id: log.id,
        user_id: firebaseUser.uid,
        student_id: log.studentId,
        packet_id: log.packetId || null,
        meeting_date: log.meetingDate,
        meeting_type: log.meetingType,
        live_notes: log.liveNotes,
        decisions: log.decisions,
        action_items: log.actionItems,
        finished_at: log.finishedAt || new Date().toISOString(),
        status: log.status,
        created_at: log.createdAt,
        updated_at: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error('❌ Exception saving meeting log to Firestore:', e);
    }
  }
}

// INTAKE DRAFT STORAGE FOR ONBOARDING
const DRAFT_INTAKE_KEY = 'advocacyprep_draft_intake';

export function saveDraftIntake(studentId: string, draftData: any) {
  try {
    localStorage.setItem(`${DRAFT_INTAKE_KEY}_${studentId}`, JSON.stringify({
      ...draftData,
      updatedAt: new Date().toISOString()
    }));
  } catch {}
}

export function getDraftIntake(studentId: string) {
  try {
    const raw = localStorage.getItem(`${DRAFT_INTAKE_KEY}_${studentId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraftIntake(studentId: string) {
  try {
    localStorage.removeItem(`${DRAFT_INTAKE_KEY}_${studentId}`);
  } catch {}
}
