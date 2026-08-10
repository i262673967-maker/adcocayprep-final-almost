import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Users,
  Calendar,
  HelpCircle,
  Loader2,
  FileSearch,
  BookOpen
} from 'lucide-react';
import { Student, MeetingType, MeetingNoticeData, IntakeResponses, MeetingPacket } from '../types';
import { getAuthToken } from '../lib/firebase';
import { saveDraftIntake, getDraftIntake, clearDraftIntake } from '../lib/storage';

interface NewMeetingWizardProps {
  student: Student;
  onCancel: () => void;
  onPacketGenerated: (packet: MeetingPacket) => void;
}

export const NewMeetingWizard: React.FC<NewMeetingWizardProps> = ({
  student,
  onCancel,
  onPacketGenerated
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1 State
  const [meetingType, setMeetingType] = useState<MeetingType>('IEP_annual');
  const [meetingDate, setMeetingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [meetingTime, setMeetingTime] = useState('10:00 AM');
  const [meetingLocation, setMeetingLocation] = useState('Conference Room / Hybrid Zoom');

  // Step 2 State (Notice Upload / Analysis)
  const [noticeText, setNoticeText] = useState('');
  const [noticeFile, setNoticeFile] = useState<File | null>(null);
  const [noticeImageBase64, setNoticeImageBase64] = useState<string | null>(null);
  const [isAnalyzingNotice, setIsAnalyzingNotice] = useState(false);
  const [noticeAnalysis, setNoticeAnalysis] = useState<MeetingNoticeData | null>(null);
  const [noticeAnalysisError, setNoticeAnalysisError] = useState<string | null>(null);

  // Step 3 State (Guided Intake Form)
  const [intake, setIntake] = useState<IntakeResponses>({
    topWorries: '',
    currentServices: '',
    recentChanges: '',
    desiredOutcomes: '',
    attendingWith: 'Alone',
    childStrengths: '',
    requestedEvaluations: ''
  });

  // Step 4 State (AI Generation)
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStepMsg, setGenerationStepMsg] = useState('Initializing AI analysis engine...');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  // Load draft intake if present
  React.useEffect(() => {
    const draft = getDraftIntake(student.id);
    if (draft && draft.intake) {
      if (draft.meetingType) setMeetingType(draft.meetingType);
      if (draft.meetingDate) setMeetingDate(draft.meetingDate);
      if (draft.meetingTime) setMeetingTime(draft.meetingTime);
      if (draft.meetingLocation) setMeetingLocation(draft.meetingLocation);
      if (draft.noticeText) setNoticeText(draft.noticeText);
      if (draft.intake) setIntake(draft.intake);
      setHasRestoredDraft(true);
    }
  }, [student.id]);

  const handleSaveDraft = () => {
    saveDraftIntake(student.id, {
      meetingType,
      meetingDate,
      meetingTime,
      meetingLocation,
      noticeText,
      intake
    });
    onCancel();
  };

  // Quick Preset Options for Intake
  const worryPresets = [
    'District cutting therapy / service minutes',
    'Behavior plan (BIP) not being followed in class',
    'Child falling behind in reading/writing grade level',
    'Overwhelmed by noisy transitions/assemblies',
    'General education teacher not applying 504 accommodations'
  ];

  const outcomePresets = [
    'Maintain current speech/OT therapy service minutes',
    'Add explicit sensory break accommodation & quiet area option',
    'Request Independent Educational Evaluation (IEE)',
    'Update reading & writing assistive tech goals',
    'Establish 30-day review check-in for behavior plan'
  ];

  // Handle File Upload for Notice
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNoticeFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Str = (reader.result as string).split(',')[1];
        setNoticeImageBase64(base64Str);
      };
      reader.readAsDataURL(file);
    } else {
      // For text or PDF fallback reading
      const reader = new FileReader();
      reader.onload = () => {
        setNoticeText(reader.result as string || '');
      };
      reader.readAsText(file);
    }
  };

  // Trigger Notice Scan Endpoint
  const runNoticeAnalysis = async () => {
    if (!noticeText && !noticeImageBase64) return;
    setIsAnalyzingNotice(true);
    setNoticeAnalysisError(null);

    try {
      const mimeType = noticeFile?.type || 'image/png';
      const token = await getAuthToken();

      const res = await fetch('/api/ai/analyze-notice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          noticeText,
          imageBase64: noticeImageBase64,
          mimeType
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze meeting notice');
      }

      setNoticeAnalysis({
        meetingDate: data.data.meetingDate || meetingDate,
        meetingTime: data.data.meetingTime || meetingTime,
        location: data.data.location || meetingLocation,
        proposedAttendees: data.data.proposedAttendees || [],
        purposeText: data.data.purposeText || '',
        detectedAcronyms: data.data.detectedAcronyms || [],
        rawNoticeText: noticeText || 'Uploaded Document Image Notice',
        noticeFileName: noticeFile?.name
      });
    } catch (err: any) {
      console.error('Notice analysis error:', err);
      setNoticeAnalysisError(err.message || 'Notice scan failed. You can proceed manually.');
    } finally {
      setIsAnalyzingNotice(false);
    }
  };

  // Trigger Server-Side Packet Generation via Gemini
  const handleGeneratePacket = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setStep(4);

    const stepMsgs = [
      'Extracting meeting notice & district attendee roles...',
      'Mapping parent concerns against IDEA / Section 504 standards...',
      'Formulating sharp, role-targeted team questions...',
      'Decoding district acronyms and jargon into plain English...',
      'Formatting print-ready 1-page Meeting Prep Packet...'
    ];

    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % stepMsgs.length;
      setGenerationStepMsg(stepMsgs[msgIndex]);
    }, 1200);

    try {
      const token = await getAuthToken();

      const res = await fetch('/api/ai/generate-packet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          student,
          meetingType,
          meetingDate,
          noticeData: noticeAnalysis || {
            meetingDate,
            meetingTime,
            location: meetingLocation,
            proposedAttendees: [],
            detectedAcronyms: [],
            rawNoticeText: noticeText
          },
          intakeResponses: intake
        })
      });

      clearInterval(interval);

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate packet');
      }

      const generatedPacket: MeetingPacket = {
        id: 'packet_' + Date.now(),
        studentId: student.id,
        meetingType,
        meetingDate,
        version: 1,
        status: 'draft',
        content: data.packetContent,
        noticeData: noticeAnalysis || undefined,
        intakeResponses: intake,
        generatedAt: new Date().toISOString(),
        isWatermarked: false
      };

      // Send Transactional Email Summary Confirmation
      try {
        fetch('/api/email/send-packet-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            studentName: student.name,
            meetingType,
            meetingDate,
            topPriorities: data.packetContent?.topPriorities || [],
            keyQuestions: data.packetContent?.keyQuestions || [],
            rightsAtAGlance: data.packetContent?.rightsAtAGlance || [],
            legalDisclaimer: data.packetContent?.legalDisclaimer || ''
          })
        }).then(res => res.json()).then(emailRes => {
          console.log('✉️ [TRANSACTIONAL EMAIL SUMMARY]:', emailRes);
        }).catch(emailErr => {
          console.warn('✉️ [TRANSACTIONAL EMAIL NOTICE]: Non-blocking email send warning:', emailErr);
        });
      } catch (e) {
        console.warn('✉️ Could not dispatch email confirmation:', e);
      }

      clearDraftIntake(student.id);
      onPacketGenerated(generatedPacket);
    } catch (err: any) {
      clearInterval(interval);
      console.error('Packet generation error:', err);
      setGenerationError(err.message || 'Packet generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Step Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        {hasRestoredDraft && (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl p-2.5 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span><strong>Draft Intake Restored:</strong> We loaded your previous in-progress responses for {student.name}.</span>
            </div>
            <button
              onClick={() => setHasRestoredDraft(false)}
              className="text-indigo-600 font-bold hover:underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-indigo-600 font-bold' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
            <span>Meeting Setup</span>
          </div>
          <div className="h-0.5 w-8 bg-slate-200 sm:w-16"></div>
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-indigo-600 font-bold' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
            <span>Notice Scan</span>
          </div>
          <div className="h-0.5 w-8 bg-slate-200 sm:w-16"></div>
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-indigo-600 font-bold' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
            <span>Guided Intake</span>
          </div>
          <div className="h-0.5 w-8 bg-slate-200 sm:w-16"></div>
          <div className={`flex items-center gap-1.5 ${step === 4 ? 'text-indigo-600 font-bold' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 4 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>4</span>
            <span>Generate 1-Pager</span>
          </div>
        </div>
      </div>

      {/* STEP 1: Meeting Type & Basics */}
      {step === 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-semibold">
              Step 1 of 3
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Prepare Meeting for {student.name}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Select the meeting type and date as stated on your school district's official notice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                Meeting Type *
              </label>
              <select
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value as MeetingType)}
                className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="IEP_annual">IEP Annual Review</option>
                <option value="IEP_initial">IEP Initial Eligibility Meeting</option>
                <option value="IEP_reeval">IEP Triennial / Re-evaluation</option>
                <option value="504_initial">Section 504 Plan Initial Meeting</option>
                <option value="504_review">Section 504 Annual Review</option>
                <option value="manifestation_determination">Manifestation Determination Review (MDR)</option>
                <option value="other">Other Special Education Conference</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                Meeting Date *
              </label>
              <input
                type="date"
                required
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                Scheduled Time (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 10:00 AM PST"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                Location or Format (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Conference Room B / Zoom Hybrid"
                value={meetingLocation}
                onChange={(e) => setMeetingLocation(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex flex-wrap justify-between items-center gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Save Draft & Continue Later
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow flex items-center gap-2 cursor-pointer"
              >
                <span>Next: Meeting Notice Scan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Meeting Notice Upload & Scan */}
      {step === 2 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-semibold">
              Step 2 of 3 (Optional but Recommended)
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Scan School Meeting Notice
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Upload a photo or text of the official Notice of IEP/504 Meeting. Our AI scanner automatically extracts proposed attendees, acronyms, and purpose.
            </p>
          </div>

          {/* Upload / Paste Container */}
          <div className="space-y-4 text-xs">
            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center space-y-3 bg-slate-50 transition-colors">
              <Upload className="w-8 h-8 text-indigo-600 mx-auto" />
              <div>
                <span className="font-semibold text-slate-900">Upload Photo or PDF of Notice</span>
                <p className="text-slate-500 text-[11px] mt-0.5">Drag & drop or select file from device</p>
              </div>
              <input
                type="file"
                accept="image/*,.pdf,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="notice-file-input"
              />
              <label
                htmlFor="notice-file-input"
                className="inline-block bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Choose File
              </label>
              {noticeFile && (
                <div className="text-indigo-700 font-medium text-xs flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Loaded: {noticeFile.name}
                </div>
              )}
            </div>

            <div className="text-center font-mono text-[11px] text-slate-400">OR PASTE NOTICE TEXT</div>

            <div>
              <textarea
                rows={4}
                placeholder="Paste raw text from school email or notice (e.g., 'Notice of IEP Team Meeting for Maya S. Attendance requested: LEA, SLP, General Ed...')"
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {(noticeText || noticeImageBase64) && !noticeAnalysis && (
              <button
                type="button"
                onClick={runNoticeAnalysis}
                disabled={isAnalyzingNotice}
                className="w-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isAnalyzingNotice ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Extracting attendees & acronyms...</span>
                  </>
                ) : (
                  <>
                    <FileSearch className="w-4 h-4 text-indigo-600" />
                    <span>Scan Notice with AI Engine</span>
                  </>
                )}
              </button>
            )}

            {noticeAnalysisError && (
              <div className="bg-amber-50 text-amber-900 p-3 rounded-lg border border-amber-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{noticeAnalysisError}</span>
              </div>
            )}

            {/* Render Notice Scan Results */}
            {noticeAnalysis && (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 space-y-3 text-xs">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Meeting Notice Analyzed Successfully
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11.5px] text-slate-800">
                  <div>
                    <strong>Purpose:</strong> {noticeAnalysis.purposeText || 'Annual IEP / 504 Review'}
                  </div>
                  <div>
                    <strong>Attendees Found:</strong> {noticeAnalysis.proposedAttendees.join(', ') || 'Standard IEP Team'}
                  </div>
                </div>

                {noticeAnalysis.detectedAcronyms.length > 0 && (
                  <div>
                    <strong className="text-slate-900 block mb-1">Detected Acronyms:</strong>
                    <div className="flex flex-wrap gap-1.5">
                      {noticeAnalysis.detectedAcronyms.map((ac, idx) => (
                        <span key={idx} className="bg-white px-2 py-0.5 rounded border border-emerald-300 text-slate-800 font-mono text-[10.5px]">
                          <strong>{ac.term}:</strong> {ac.definition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 flex flex-wrap justify-between items-center gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Save Draft & Continue Later
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow flex items-center gap-2 cursor-pointer"
              >
                <span>Next: Guided Intake Form</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Guided Intake Form */}
      {step === 3 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-semibold">
              Step 3 of 3
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Guided Parent Intake Form
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Answer these structured questions to customize your 1-page tactical preparation packet.
            </p>
          </div>

          <div className="space-y-6 text-xs">
            {/* Question 1: Top Worries */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-900 text-sm">
                1. What are your primary worries or concerns for this meeting? *
              </label>
              <p className="text-slate-500 text-[11px]">
                Click quick presets below or type your specific concerns:
              </p>
              <div className="flex flex-wrap gap-1.5 pb-1">
                {worryPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setIntake((prev) => ({
                        ...prev,
                        topWorries: prev.topWorries ? `${prev.topWorries}; ${preset}` : preset
                      }))
                    }
                    className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                required
                placeholder="e.g., District is proposing reducing speech therapy minutes from 60 to 30 mins/wk. Maya is still struggling with articulation and loud classroom noise..."
                value={intake.topWorries}
                onChange={(e) => setIntake({ ...intake, topWorries: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Question 2: Desired Outcomes */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-900 text-sm">
                2. What outcome or specific goals are you hoping for? *
              </label>
              <div className="flex flex-wrap gap-1.5 pb-1">
                {outcomePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setIntake((prev) => ({
                        ...prev,
                        desiredOutcomes: prev.desiredOutcomes ? `${prev.desiredOutcomes}; ${preset}` : preset
                      }))
                    }
                    className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                required
                placeholder="e.g., Maintain 60 mins/wk Speech therapy; add explicit quiet space sensory break protocol..."
                value={intake.desiredOutcomes}
                onChange={(e) => setIntake({ ...intake, desiredOutcomes: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Question 3: Current Accommodations */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-900 text-sm">
                3. What services or accommodations does your child currently receive?
              </label>
              <input
                type="text"
                placeholder="e.g. 60 mins/wk Speech therapy, extra time on tests, preferred seating"
                value={intake.currentServices}
                onChange={(e) => setIntake({ ...intake, currentServices: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Question 4: Recent Changes */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-900 text-sm">
                4. What's changed recently (new diagnosis, struggling subject, behavior incident)?
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Maya started 4th grade with increased writing demands; gets frustrated during group writing tasks..."
                value={intake.recentChanges}
                onChange={(e) => setIntake({ ...intake, recentChanges: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Question 5: Child Strengths */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-900 text-sm">
                5. What child strengths or interests do you want highlighted to the team?
              </label>
              <input
                type="text"
                placeholder="e.g. Highly creative, loves science and marine biology, eager to participate with visual schedules"
                value={intake.childStrengths}
                onChange={(e) => setIntake({ ...intake, childStrengths: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Question 6: Attending With */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-900 text-sm mb-1">
                  6. Who is attending with you?
                </label>
                <select
                  value={intake.attendingWith}
                  onChange={(e) => setIntake({ ...intake, attendingWith: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="Alone">Attending Alone</option>
                  <option value="Spouse / Co-Parent">With Spouse / Co-Parent</option>
                  <option value="Special Education Advocate">With Special Education Advocate</option>
                  <option value="Private Therapist / Doctor">With Private Therapist / Doctor</option>
                  <option value="Relative / Friend">With Relative or Support Friend</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-900 text-sm mb-1">
                  7. Specific Evaluations Requested (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Assistive Technology (AT) evaluation, OT assessment"
                  value={intake.requestedEvaluations || ''}
                  onChange={(e) => setIntake({ ...intake, requestedEvaluations: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap justify-between items-center gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Save Draft & Continue Later
              </button>
              <button
                type="button"
                onClick={handleGeneratePacket}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-8 py-3 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate 1-Page Prep Packet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: AI Generation Progress Loading Screen */}
      {step === 4 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-lg text-center space-y-6 my-8">
          {isGenerating ? (
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">
                  Building Your 1-Page Meeting Prep Packet
                </h3>
                <p className="text-xs text-indigo-700 font-medium font-mono animate-pulse">
                  {generationStepMsg}
                </p>
              </div>

              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-3/4 animate-pulse rounded-full"></div>
              </div>

              <p className="text-[11px] text-slate-500">
                Formatting top 3 priorities, 5-7 team questions, jargon decoder table, and federal rights summary...
              </p>
            </div>
          ) : generationError ? (
            <div className="space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Generation Encountered an Error</h3>
              <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-200">
                {generationError}
              </p>
              <button
                onClick={() => setStep(3)}
                className="bg-indigo-600 text-white text-xs font-semibold px-6 py-2.5 rounded-xl cursor-pointer"
              >
                Return to Intake Form
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
