import React from 'react';
import { ShieldCheck, Lock, EyeOff } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
        <div className="flex justify-between items-center border-b pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Privacy Policy</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 text-xs text-slate-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <p className="text-slate-500 font-medium">Effective Date: August 8, 2026 | Operator: Ismail, operating as AdvocacyPrep | Hosting: Google Cloud Run</p>

          <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
            <div className="font-bold text-indigo-900 flex items-center gap-1.5 text-xs">
              <Lock className="w-4 h-4 text-indigo-700 shrink-0" />
              <span>Our Strict Privacy Commitment to Families</span>
            </div>
            <p className="text-indigo-800 text-[11px]">
              Your family's privacy and your child's educational data protection are paramount. We NEVER sell student records, parent intake notes, or contact details to third parties or advertising networks.
            </p>
          </div>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">1. Information We Collect</h3>
            <p>We collect only the minimum necessary information required to generate meeting prep packets:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Account Information:</strong> Email address and parent name for account login and billing receipts.</li>
              <li><strong>Student Profiles:</strong> Student name/initials, grade, state, school district, and disability category provided by parents.</li>
              <li><strong>Notice Uploads & Intake Inputs:</strong> Document text/images uploaded for meeting notice analysis, plus parent concerns and requested outcomes.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">2. How We Use Information</h3>
            <p>
              Information is used exclusively to generate customized 1-page meeting prep packets, decode special education acronyms, answer parent guidance questions via our AI assistant, and manage account subscriptions.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">3. Data Security & Storage</h3>
            <p>
              All user records are protected using industry-standard HTTPS encryption in transit and stored securely in Firebase Firestore with security rules isolation. Only authenticated account owners can access their children's saved meeting packets and history.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">4. Third-Party Service Providers</h3>
            <p>We integrate with trusted service providers strictly to perform essential functions:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Firebase:</strong> For secure Firestore database storage and user authentication via Firebase Auth.</li>
              <li><strong>Lemon Squeezy:</strong> For Merchant-of-Record payment processing and subscription billing.</li>
              <li><strong>Google Cloud Run:</strong> For secure cloud container hosting and application execution.</li>
              <li><strong>Google Gemini AI:</strong> We use Google's Gemini API to process the information you submit (meeting notices, intake responses, and related content) for the sole purpose of generating your meeting prep packet. We are currently using Google's standard API tier; under Google's terms, submitted content may be used by Google to improve its products. We plan to move to a paid API tier with stricter data-use guarantees as the service grows — check this page for updates, or contact us with questions about current data handling.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">5. Parental Rights & Data Deletion</h3>
            <p>
              Parents have full control over their data. You can edit student profiles, delete individual meeting packets, or request full account and data deletion at any time in the Settings menu or by contacting <a href="mailto:i262673967@gmail.com" className="text-indigo-600 font-semibold underline">i262673967@gmail.com</a>. Upon receiving a deletion request, your personal data, student profiles, and associated packet records will be permanently deleted within 30 days, except where certain transaction records must be retained for legal or accounting purposes (such as payment records maintained by Lemon Squeezy).
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">6. Children's Privacy</h3>
            <p>
              AdvocacyPrep accounts are intended for adults (parents, legal guardians, and authorized advocates) acting on behalf of a child — not for direct use by children. The service does not knowingly collect account registration information directly from children under 13. Information about a child (such as name or initials, grade, school district, and disability category) is provided solely by the adult account holder for the purpose of generating meeting preparation materials.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">7. Cookies & Local Storage</h3>
            <p>
              We use only essential session cookies and local storage tokens necessary for user authentication, security, and basic application functionality (such as maintaining your login session with Firebase Auth). We do not use third-party advertising or tracking cookies.
            </p>
          </section>
        </div>

        <div className="border-t pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2 rounded-xl text-xs cursor-pointer"
          >
            Close Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
};
