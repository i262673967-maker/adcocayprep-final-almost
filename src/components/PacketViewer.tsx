import React, { useState, useRef } from 'react';
import {
  Printer,
  Edit3,
  Copy,
  AlertTriangle,
  Download,
  ShieldCheck,
  CheckSquare,
  Save,
  Lock,
  ArrowLeft,
  Loader2,
  Mail,
  Check
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { MeetingPacket, WhatToBringItem } from '../types';
import { FooterDisclaimer } from './FooterDisclaimer';
import { getAuthToken } from '../lib/firebase';

interface PacketViewerProps {
  packet: MeetingPacket;
  onUpdatePacket: (updated: MeetingPacket) => void;
  onOpenPricing: () => void;
  onOpenStateRights: () => void;
  onBackToDashboard?: () => void;
}

export const PacketViewer: React.FC<PacketViewerProps> = ({
  packet,
  onUpdatePacket,
  onOpenPricing,
  onOpenStateRights,
  onBackToDashboard
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(packet.content);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<WhatToBringItem[]>(
    packet.content.whatToBringChecklist || []
  );

  const packetRef = useRef<HTMLDivElement>(null);

  const handleSendEmailSummary = async () => {
    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      const token = await getAuthToken();

      const res = await fetch('/api/email/send-packet-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentName: packet.content.studentHeader.studentName,
          meetingType: packet.content.studentHeader.meetingType,
          meetingDate: packet.content.studentHeader.meetingDate,
          topPriorities: packet.content.topPriorities,
          keyQuestions: packet.content.keyQuestions,
          rightsAtAGlance: packet.content.rightsAtAGlance,
          legalDisclaimer: packet.content.legalDisclaimer
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send confirmation email');
      }

      if (data.provider === 'resend') {
        setEmailStatus(`Summary sent to ${data.userEmail}!`);
      } else {
        setEmailStatus(`Summary email processed for ${data.userEmail}!`);
      }

      setTimeout(() => setEmailStatus(null), 5000);
    } catch (err: any) {
      console.error('Email send error:', err);
      setEmailStatus(`Failed: ${err.message || 'Could not send email'}`);
      setTimeout(() => setEmailStatus(null), 5000);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!packetRef.current) {
      window.print();
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const element = packetRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
      pdf.save(`AdvocacyPrep_Packet_${packet.content.studentHeader.studentName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF generation error, falling back to window.print():', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSaveEdits = () => {
    const updated: MeetingPacket = {
      ...packet,
      content: {
        ...editedContent,
        whatToBringChecklist: checklist
      }
    };
    onUpdatePacket(updated);
    setIsEditing(false);
  };

  const handleCopyText = () => {
    const { studentHeader, topPriorities, keyQuestions, jargonDecoder } = packet.content;
    const text = `ADVOCACYPREP 1-PAGE MEETING PREP PACKET
STUDENT: ${studentHeader.studentName} (${studentHeader.grade}, ${studentHeader.schoolDistrict})
MEETING: ${studentHeader.meetingType} - ${studentHeader.meetingDate}

TOP 3 PRIORITIES:
${topPriorities.map((p, i) => `${i + 1}. ${p.title}\n   Rationale: ${p.rationale}\n   Tactical Tip: ${p.tacticalTip}`).join('\n\n')}

KEY QUESTIONS TO ASK:
${keyQuestions.map((q, i) => `Q${i + 1} (${q.whoToAsk}): ${q.question}\n   Goal: ${q.goal}`).join('\n\n')}

JARGON DECODER:
${jargonDecoder.map((j) => `${j.term}: ${j.plainEnglish} (Tip: ${j.parentTip})`).join('\n')}

DISCLAIMER: General informational/organizational help only. Not legal advice. Verify state specifics with your local Parent Training and Information Center (PTI).`;

    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const { studentHeader, topPriorities, keyQuestions, jargonDecoder, rightsAtAGlance, disagreementStrategy } = packet.content;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Controls Bar (Hidden during print) */}
      <div className="print:hidden bg-slate-900 text-white p-4 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="text-slate-300 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="font-bold text-sm flex items-center gap-2">
              <span>Meeting Prep Packet</span>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-2 py-0.5 rounded uppercase font-mono font-bold">
                1-Page Print Ready
              </span>
            </div>
            <div className="text-xs text-slate-400">
              {studentHeader.studentName} &bull; {studentHeader.meetingType} ({studentHeader.meetingDate})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {isEditing ? (
            <button
              onClick={handleSaveEdits}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Edit Draft</span>
            </button>
          )}

          <button
            onClick={handleSendEmailSummary}
            disabled={isSendingEmail}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
            title="Send transactional email summary to your inbox"
          >
            {isSendingEmail ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            ) : (
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>Email Summary</span>
          </button>

          <button
            onClick={handleCopyText}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-indigo-400" />
            <span>{copiedNotice ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Email Toast Banner Notice */}
      {emailStatus && (
        <div className="print:hidden bg-indigo-950/90 border border-indigo-700 text-indigo-100 rounded-xl p-3 text-xs flex items-center justify-between gap-2 shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{emailStatus}</span>
          </div>
          <button
            onClick={() => setEmailStatus(null)}
            className="text-indigo-300 hover:text-white text-xs font-semibold px-2 py-0.5 rounded cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Free Tier Watermark Banner Notice if watermarked */}
      {packet.isWatermarked && (
        <div className="print:hidden bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span><strong>Free Tier Preview:</strong> Watermark included on exported PDFs. Upgrade to Family Plan for clean unwatermarked exports.</span>
          </div>
          <button
            onClick={onOpenPricing}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1 rounded-lg text-xs cursor-pointer shrink-0"
          >
            Remove Watermark
          </button>
        </div>
      )}

      {/* PRINTABLE 1-PAGE PACKET CONTAINER */}
      <div
        ref={packetRef}
        className="bg-white text-slate-900 border border-slate-300 rounded-2xl shadow-xl p-6 sm:p-8 font-sans space-y-5 print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none relative text-xs leading-normal"
      >
        {/* Optional Watermark Overlay for Free Tier */}
        {packet.isWatermarked && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.04] rotate-[-25deg] select-none">
            <span className="text-8xl font-black text-slate-900 font-mono tracking-widest uppercase">
              AdvocacyPrep Free
            </span>
          </div>
        )}

        {/* 1. HEADER SECTION */}
        <div className="border-b-2 border-slate-900 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded font-bold">
                1-Page Tactical Meeting Prep
              </span>
              <span className="text-[11px] font-semibold text-slate-600">
                {studentHeader.state} &bull; {studentHeader.schoolDistrict}
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 mt-1 tracking-tight">
              {studentHeader.studentName} — {studentHeader.grade}
            </h1>
            <div className="text-slate-600 font-medium text-xs">
              <strong>Meeting:</strong> {studentHeader.meetingType.replace('_', ' ')} &bull; <strong>Date:</strong> {studentHeader.meetingDate}
              {studentHeader.disabilityCategory && ` • Category: ${studentHeader.disabilityCategory}`}
            </div>
          </div>

          <div className="text-right text-[10.5px] text-slate-500 font-mono">
            <div>Generated by AdvocacyPrep</div>
            <div>AdvocacyPrep.com</div>
          </div>
        </div>

        {/* CHILD OVERVIEW SECTION (Strengths, Concerns, Current Support, Goals) */}
        {packet.content.childOverview && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="font-bold text-xs uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-1">
              Child Profile Overview
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div>
                <strong className="text-slate-900 block">Strengths & Interests:</strong>
                <p className="text-slate-700">{packet.content.childOverview.strengths || 'Not specified'}</p>
              </div>
              <div>
                <strong className="text-slate-900 block">Primary Concerns:</strong>
                <p className="text-slate-700">{packet.content.childOverview.concerns || 'Not specified'}</p>
              </div>
              <div>
                <strong className="text-slate-900 block">Current Support & Services:</strong>
                <p className="text-slate-700">{packet.content.childOverview.currentSupport || 'Not specified'}</p>
              </div>
              <div>
                <strong className="text-slate-900 block">Goals & Desired Outcomes:</strong>
                <p className="text-slate-700">{packet.content.childOverview.goalsToDiscuss || 'Not specified'}</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. TOP 3 PRIORITIES */}
        <div className="space-y-2">
          <div className="font-bold text-xs uppercase tracking-wider text-indigo-900 border-b border-indigo-200 pb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
            1. Your Top 3 Priorities for This Meeting (Ranked)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {topPriorities.map((priority, index) => (
              <div
                key={index}
                className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-3 space-y-1.5 text-[11px]"
              >
                <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center shrink-0">
                    {priority.rank || index + 1}
                  </span>
                  <span>{priority.title}</span>
                </div>
                <p className="text-slate-700 leading-snug">
                  <strong>Rationale:</strong> {priority.rationale}
                </p>
                <div className="bg-white p-1.5 rounded border border-indigo-100 font-medium text-[10.5px] text-indigo-900">
                  <strong>Tactical Tip:</strong> {priority.tacticalTip}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. KEY QUESTIONS TO ASK */}
        <div className="space-y-2">
          <div className="font-bold text-xs uppercase tracking-wider text-indigo-900 border-b border-indigo-200 pb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
            2. Tailored Team Questions (5-7 Sharp Questions)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
            {keyQuestions.map((q, idx) => (
              <div key={q.id || idx} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-indigo-700">
                  <span>Q{idx + 1} &bull; Ask: {q.whoToAsk}</span>
                </div>
                <div className="font-semibold text-slate-900">
                  "{q.question}"
                </div>
                <div className="text-slate-600 text-[10.5px]">
                  <strong>Goal:</strong> {q.goal}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. JARGON DECODER MATRIX */}
        <div className="space-y-2">
          <div className="font-bold text-xs uppercase tracking-wider text-indigo-900 border-b border-indigo-200 pb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
            3. District Jargon & Acronym Decoder
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
            {jargonDecoder.map((item, idx) => (
              <div key={idx} className="border border-slate-200 rounded p-2 bg-slate-50 space-y-0.5">
                <div className="font-bold text-slate-900 text-[11px] text-indigo-900">
                  {item.term}
                </div>
                <p className="text-slate-700 leading-tight">
                  {item.plainEnglish}
                </p>
                <div className="text-slate-500 italic text-[10px]">
                  <strong>Parent Tip:</strong> {item.parentTip}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. RIGHTS AT A GLANCE & WHAT TO BRING */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Rights at a Glance */}
          <div className="space-y-1.5 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="font-bold text-[11px] uppercase tracking-wider text-slate-900 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Your Rights at a Glance (Federal IDEA/504)
            </div>
            <ul className="space-y-1 text-[10.5px] text-slate-700">
              {rightsAtAGlance.map((r, idx) => (
                <li key={idx}>
                  <strong>{r.title}:</strong> {r.detail}
                </li>
              ))}
            </ul>
          </div>

          {/* What to Bring Checklist */}
          <div className="space-y-1.5 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="font-bold text-[11px] uppercase tracking-wider text-slate-900 flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
              What to Bring Checklist
            </div>
            <div className="space-y-1 text-[10.5px] text-slate-700">
              {checklist.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 select-none"
                >
                  <input
                    type="checkbox"
                    checked={!!item.checked}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className={item.checked ? 'line-through text-slate-400' : ''}>
                    {item.item} {item.essential && <strong className="text-indigo-700">*</strong>}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 6. IF YOU DISAGREE STRATEGY */}
        <div className="border-t border-slate-200 pt-2 space-y-1.5">
          <div className="font-bold text-[11px] uppercase tracking-wider text-rose-900 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            If You Disagree During the Meeting
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10.5px]">
            {disagreementStrategy.map((step) => (
              <div key={step.stepNumber} className="bg-rose-50/60 border border-rose-200 p-2 rounded text-slate-800">
                <strong className="text-rose-950 block">{step.stepNumber}. {step.actionTitle}</strong>
                <span className="text-slate-700">{step.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 7. IMPORTANT NOTICE & DISCLAIMER FOOTER */}
        <div className="border-t border-slate-300 pt-2 text-[9.5px] text-slate-500 leading-tight">
          <strong>Important Notice & Disclaimer:</strong> {packet.content.legalDisclaimer}
        </div>
      </div>

      {/* Screen-only state PTI resource box */}
      <div className="print:hidden bg-slate-100 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div>
          <strong className="text-slate-900">Need State-Specific Statutory Help?</strong>
          <p className="text-slate-600 text-[11px]">
            Connect with California / your state's Parent Training and Information Center (PTI) for free local advocacy guidelines.
          </p>
        </div>
        <button
          onClick={onOpenStateRights}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-xs shrink-0 cursor-pointer"
        >
          View {studentHeader.state} PTI Resource Directory
        </button>
      </div>

      <FooterDisclaimer stateCode={studentHeader.state} onOpenStateRights={onOpenStateRights} />
    </div>
  );
};
