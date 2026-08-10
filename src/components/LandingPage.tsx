import React, { useState } from 'react';
import {
  ShieldCheck,
  FileCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Lock,
  Clock,
  Printer,
  BookOpen,
  HelpCircle,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { MANDATORY_LEGAL_DISCLAIMER } from '../data/stateData';
import { PRICING_DATA } from '../data/pricing';

interface LandingPageProps {
  onStartFree: () => void;
  onViewSamplePacket: () => void;
  onOpenPricing: () => void;
  onOpenStateRights: () => void;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartFree,
  onViewSamplePacket,
  onOpenPricing,
  onOpenStateRights,
  onOpenTerms,
  onOpenPrivacy
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Is this legal advice?",
      a: "No. AdvocacyPrep provides informational and tactical preparation materials to help parents organize their thoughts, formulate questions, and decode district jargon. For state-specific legal advice or formal representation, consult a special education attorney or advocate."
    },
    {
      q: "What if I only have a photo of the school's IEP notice?",
      a: "Our document scanner extracts dates, times, proposed attendees, and jargon directly from photos, scans, or PDFs of your school district's meeting notice."
    },
    {
      q: "How does the 1-page format help during the actual meeting?",
      a: "School team meetings are fast-paced and overwhelming. A dense 1-page printout allows you to glance down at your top 3 priorities and specific questions without shuffling through 40 pages of district paperwork."
    },
    {
      q: "Can I use this for multiple children?",
      a: "Yes! Our Family Plan supports multiple students with independent profiles, meeting histories, and custom state guidelines."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800 text-center font-medium flex items-center justify-center gap-2">
        <span className="bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded font-mono text-[11px] uppercase tracking-wider border border-indigo-800">
          Tactical IEP/504 Prep
        </span>
        <span>Includes 50-State Parent Training & Information (PTI) Center Directory & Parent Rights Guidance</span>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-indigo-950/80 border border-indigo-700/60 rounded-full px-3.5 py-1 text-xs text-indigo-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Calm &bull; Precise &bull; Non-Alarmist IEP Preparation</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
                Walk into your child’s IEP meeting with a <span className="text-indigo-400 underline decoration-indigo-500/50 underline-offset-4">1-page tactical plan</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
                No fluff, no vague therapy-speak. Turn your school's meeting notice and a 3-minute intake into a single, high-density printout featuring your top 3 priorities, tailored team questions, acronym decoder, and rights summary.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={onStartFree}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Prepare Your Free Packet Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={onViewSamplePacket}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm px-5 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span>View Interactive Sample 1-Pager</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Free First Packet</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>50-State PTI Center Data</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No Credit Card Required</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Mockup */}
            <div className="lg:col-span-5">
              <div className="bg-slate-950 border border-slate-700/80 rounded-2xl p-5 shadow-2xl relative space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center gap-2 font-mono text-indigo-400">
                    <FileText className="w-4 h-4" />
                    <span>MEETING_PREP_PACKET.pdf</span>
                  </div>
                  <span className="bg-emerald-950 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-800">
                    Print Ready &bull; 1 Page
                  </span>
                </div>

                {/* Packet Graphic Preview Card */}
                <div className="bg-white text-slate-900 rounded-lg p-4 space-y-3 font-sans shadow-inner text-xs border border-slate-200">
                  <div className="border-b pb-2 flex justify-between items-start">
                    <div>
                      <div className="font-bold text-sm text-slate-900">Maya S. &bull; 4th Grade</div>
                      <div className="text-slate-500 text-[11px]">Oakland Unified &bull; Annual IEP Review</div>
                    </div>
                    <div className="text-right text-[10px] font-mono text-slate-500">Aug 25, 2026</div>
                  </div>

                  <div className="space-y-1">
                    <div className="font-bold text-[11px] text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                      1. Top 3 Priorities
                    </div>
                    <div className="bg-indigo-50/80 p-2 rounded border border-indigo-100 text-[11px] text-slate-800">
                      <strong>Protect SLP Minutes:</strong> Require objective baseline data before accepting proposed speech cuts from 60 to 30 mins/wk.
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="font-bold text-[11px] text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                      2. Tailored Questions to Ask
                    </div>
                    <div className="bg-slate-50 p-2 rounded border text-[10.5px] text-slate-700 space-y-1">
                      <div>&bull; <em>"What specific assessment data supports removing service minutes?"</em></div>
                      <div>&bull; <em>"How are accommodations tracked in general education?"</em></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="font-bold text-[11px] text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                      3. Jargon Decoder
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <div className="bg-slate-100 p-1.5 rounded"><strong>LEA Rep:</strong> District official with authority to commit funds.</div>
                      <div className="bg-slate-100 p-1.5 rounded"><strong>PWN:</strong> Prior Written Notice required for any refusal.</div>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-1">
                  <button
                    onClick={onViewSamplePacket}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 cursor-pointer"
                  >
                    Click to inspect full high-resolution sample packet &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Workflow (3 Simple Steps) */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              How AdvocacyPrep Works
            </h2>
            <p className="text-sm text-slate-600">
              Designed for busy parents facing overwhelming district paperwork the night before a meeting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-lg">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Upload Meeting Notice</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Drop a photo or PDF of your school's official notice. Our document engine extracts attendees, location, meeting purpose, and acronyms.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-lg">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Complete 3-Min Guided Intake</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Answer 7 targeted questions regarding your primary worries, current accommodations, recent incidents, and desired outcomes.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-lg">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Export 1-Page Print Packet</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review and edit your personalized prep packet. Download as a print-ready PDF or access directly on your phone at the conference table.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Anatomy Breakdown */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs uppercase tracking-wider font-bold text-indigo-600">
              Anatomy of the 1-Page Prep Sheet
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Every section serves a tactical purpose
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-indigo-900">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                Top 3 Ranked Priorities
              </div>
              <p className="text-slate-600 leading-relaxed">
                Keeps you grounded on what truly matters most so you don't get sidetracked by minor administrative chatter.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-indigo-900">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                5-7 Role-Targeted Questions
              </div>
              <p className="text-slate-600 leading-relaxed">
                Direct questions aimed specifically at the Speech Pathologist, Gen Ed teacher, Psychologist, or LEA Administrator.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-indigo-900">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Jargon Decoder Matrix
              </div>
              <p className="text-slate-600 leading-relaxed">
                Plain-English definitions for every acronym found in your notice (LEA, PWN, BIP, FAPE, LRE, Triennial) with parent action tips.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-indigo-900">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Rights & Disagreement Strategy
              </div>
              <p className="text-slate-600 leading-relaxed">
                Clear reminders on your rights to inspect records in advance, request PWN, and take documents home before signing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Simple, transparent pricing for families
            </h2>
            <p className="text-sm text-slate-600">
              Start with a free packet generation. Upgrade when you need ongoing meeting tracking or multi-child support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Free Tier */}
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="font-bold text-slate-900 text-lg">{PRICING_DATA.free.name}</div>
                <div className="text-3xl font-bold text-slate-900">{PRICING_DATA.free.priceDisplay}</div>
                <p className="text-xs text-slate-600">{PRICING_DATA.free.description}</p>
                <ul className="text-xs space-y-2 text-slate-700">
                  {PRICING_DATA.free.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">&bull; {f}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={onStartFree}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Create Free Packet
              </button>
            </div>

            {/* Family Plan */}
            <div className="border-2 border-indigo-600 rounded-2xl p-6 bg-white shadow-xl flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] uppercase font-bold px-3 py-0.5 rounded-full tracking-wider">
                Most Popular
              </div>
              <div className="space-y-4 pt-2">
                <div className="font-bold text-slate-900 text-lg">Family Plan</div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-slate-900">${PRICING_DATA.familyAnnual.priceMonthlyEquivalent}</span>
                    <span className="text-xs font-semibold text-slate-700">/ mo</span>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">Save 45%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Billed annually (${PRICING_DATA.familyAnnual.priceTotalAnnual}/yr) or {PRICING_DATA.familyMonthly.priceDisplay}/mo billed monthly</p>
                </div>
                <p className="text-xs text-slate-600">For families navigating multiple IEP / 504 meetings yearly.</p>
                <ul className="text-xs space-y-2 text-slate-700">
                  {PRICING_DATA.familyMonthly.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 font-medium text-slate-900">&bull; {f}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={onOpenPricing}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs shadow transition-colors cursor-pointer"
              >
                Start Family Plan
              </button>
            </div>

            {/* Single Packet */}
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="font-bold text-slate-900 text-lg">{PRICING_DATA.singlePass.name}</div>
                <div className="text-3xl font-bold text-slate-900">{PRICING_DATA.singlePass.priceDisplay} <span className="text-xs font-normal text-slate-500">{PRICING_DATA.singlePass.subtext}</span></div>
                <p className="text-xs text-slate-600">{PRICING_DATA.singlePass.description}</p>
                <ul className="text-xs space-y-2 text-slate-700">
                  {PRICING_DATA.singlePass.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">&bull; {f}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={onOpenPricing}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Buy Single Pass
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-600">Clear answers for special education preparation.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-xl p-4 transition-all cursor-pointer"
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
              >
                <div className="font-semibold text-sm text-slate-900 flex justify-between items-center">
                  <span>{faq.q}</span>
                  <span className="text-slate-400 font-mono text-xs">{activeFaq === index ? '−' : '+'}</span>
                </div>
                {activeFaq === index && (
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mandatory Legal Disclaimer Banner at bottom */}
      <div className="bg-slate-900 text-slate-300 py-8 px-4 text-xs leading-relaxed border-t border-slate-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Important Legal Notice</span>
            </div>
            <p className="text-slate-400">
              {MANDATORY_LEGAL_DISCLAIMER}
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={onOpenStateRights}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline text-left cursor-pointer text-xs"
            >
              Access 50-State PTI Center Database &rarr;
            </button>
            <div className="flex items-center gap-3 text-slate-400 text-xs pt-1">
              {onOpenTerms && (
                <button onClick={onOpenTerms} className="hover:text-white hover:underline cursor-pointer">
                  Terms of Service
                </button>
              )}
              {onOpenPrivacy && (
                <button onClick={onOpenPrivacy} className="hover:text-white hover:underline cursor-pointer">
                  Privacy Policy
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
