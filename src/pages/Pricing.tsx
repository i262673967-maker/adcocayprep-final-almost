import React from 'react';

const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <a href="/" className="font-bold text-lg">
            AdvocacyPrep
          </a>

          <a
            href="/"
            className="text-sm text-indigo-300 hover:text-white hover:underline"
          >
            Back to AdvocacyPrep
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Transparent Family Pricing
          </p>

          <h1 className="mt-2 text-4xl font-black text-slate-900">
            Choose the Plan That Fits Your Family
          </h1>

          <p className="mt-4 text-slate-600">
            Prepare for IEP and Section 504 meetings with organized,
            AI-assisted preparation tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {/* Free */}
          <section className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
            <h2 className="text-xl font-bold">Free Tier</h2>

            <div className="mt-5 text-4xl font-black">$0</div>

            <p className="mt-3 text-sm text-slate-600">
              1 free meeting packet generation to try before your upcoming
              meeting.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li>• 1 Packet Generation</li>
              <li>• 1 Student Profile</li>
              <li>• Full 1-Page Tactical Layout</li>
              <li>• 50-State PTI Center Directory Access</li>
            </ul>
          </section>

          {/* Family Plan */}
          <section className="bg-white border-2 border-indigo-600 rounded-2xl p-7 shadow-xl relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">
              Recommended for Parents
            </div>

            <h2 className="text-xl font-bold">Family Plan</h2>

            <div className="mt-5">
              <div className="text-4xl font-black">$12</div>
              <div className="text-sm text-slate-500">
                per month, billed monthly
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600">
              Unlimited preparation packets for all your children with active
              meeting tracking.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li>✓ Unlimited Packet Generations</li>
              <li>✓ Multiple Child Profiles</li>
              <li>✓ Saved Meeting History</li>
              <li>✓ Unwatermarked Clean PDF Exports</li>
              <li>✓ State-Specific PTI Guidelines</li>
            </ul>

            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="text-sm font-semibold text-slate-700">
                Annual option
              </div>
              <div className="text-2xl font-black mt-1">$79/year</div>
              <div className="text-xs text-slate-500">
                Equivalent to approximately $6.58/month
              </div>
            </div>
          </section>

          {/* Single Pass */}
          <section className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
            <h2 className="text-xl font-bold">Single Meeting Pass</h2>

            <div className="mt-5 text-4xl font-black">$15</div>

            <div className="text-sm text-slate-500">
              one-time purchase
            </div>

            <p className="mt-4 text-sm text-slate-600">
              One unwatermarked preparation packet for an upcoming IEP or 504
              meeting.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li>• 1 Unwatermarked Packet</li>
              <li>• Full PDF & Digital Export</li>
              <li>• Saved for 6 Months</li>
              <li>• No Recurring Billing</li>
            </ul>
          </section>
        </div>

        <section className="mt-10 bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-600">
          <h2 className="font-bold text-slate-900">
            Payment and subscription information
          </h2>

          <p className="mt-2">
            Prices are shown in U.S. dollars. Subscription billing frequency
            and the total amount charged are displayed before checkout.
            Applicable taxes may be calculated at checkout.
          </p>

          <p className="mt-2">
            AdvocacyPrep is a software tool for organizational and meeting
            preparation purposes. It does not provide legal advice, attorney
            representation, or professional legal services.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap justify-center gap-5 text-sm">
          <a href="/terms" className="text-indigo-600 hover:underline">
            Terms of Service
          </a>

          <a href="/privacy" className="text-indigo-600 hover:underline">
            Privacy Policy
          </a>

          <a href="/refunds" className="text-indigo-600 hover:underline">
            Refund Policy
          </a>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
