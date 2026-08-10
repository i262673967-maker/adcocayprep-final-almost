import React from 'react';
import { FileText, ShieldAlert, CheckCircle } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
        <div className="flex justify-between items-center border-b pb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Terms of Service</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 text-xs text-slate-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <p className="text-slate-500 font-medium">Effective Date: August 8, 2026 | Entity: Ismail, operating as AdvocacyPrep | Jurisdiction: Pakistan</p>

          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
            <div className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Parent Advocacy Tool Disclaimer (Non-Legal Counsel)</span>
            </div>
            <p className="text-amber-800 text-[11px]">
              AdvocacyPrep is an organizational and tactical preparation application designed exclusively for parents and family advocates navigating special education (IEP and Section 504) meetings. AdvocacyPrep is NOT a law firm and does NOT provide formal legal advice, attorney representation, or statutory guarantees.
            </p>
          </div>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">1. Acceptance of Terms</h3>
            <p>
              By accessing or using AdvocacyPrep, creating an account, uploading meeting notices, or generating meeting preparation packets, you agree to be bound by these Terms of Service. If you do not agree to all terms, you may not use the service.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">2. Eligibility & Account Representation</h3>
            <p>
              You must be at least 18 years old to create an account on AdvocacyPrep. By creating an account, you represent and warrant that you are a parent, legal guardian, or authorized advocate with legal authority to represent or act on behalf of any child whose information is submitted to the service. Account creation by individuals under 18 years of age is strictly prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">3. Service Description & AI Packet Generation</h3>
            <p>
              AdvocacyPrep utilizes artificial intelligence (including Google Gemini models) to extract details from user-provided meeting notices and summarize parent intake priorities into structured 1-page meeting prep packets. While we strive for accuracy, generated packets are AI-synthesized reference tools. Parents are responsible for reviewing and verifying all extracted information before relying on it during school district meetings.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">4. Payments, Subscriptions & Billing</h3>
            <p>
              All payments, billing transactions, and subscription management are handled securely through Lemon Squeezy as our Merchant of Record. All fees and payments are non-refundable except as required by applicable law or as determined at our sole discretion.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Free Tier:</strong> Includes 1 free packet generation to evaluate the service.</li>
              <li><strong>Single Meeting Pass:</strong> $15 one-time payment for 1 unwatermarked packet generation. Non-recurring.</li>
              <li><strong>Family Plan Subscription:</strong> $12/month or $79/year for unlimited packet generations and multi-child support. Subscriptions automatically renew until canceled in account settings or through the Lemon Squeezy billing portal.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">5. State Parent Training & Information (PTI) Centers</h3>
            <p>
              Directory details for state Parent Training and Information (PTI) Centers are provided for general informational reference under IDEA federal guidelines. AdvocacyPrep is not affiliated with state PTI centers or local school districts.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">6. Limitation of Liability</h3>
            <p>
              AdvocacyPrep shall not be held liable for administrative school district placement decisions, statutory timeline disagreements, or any legal outcomes resulting from IEP or 504 team meetings. Users are encouraged to consult licensed special education attorneys or certified advocates for formal legal representation.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">7. Governing Law</h3>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of Pakistan, without regard to conflict of law principles.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">8. Contact Information</h3>
            <p>
              If you have questions regarding these Terms of Service, please contact us at <a href="mailto:i262673967@gmail.com" className="text-indigo-600 font-semibold underline">i262673967@gmail.com</a>.
            </p>
          </section>
        </div>

        <div className="border-t pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2 rounded-xl text-xs cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
