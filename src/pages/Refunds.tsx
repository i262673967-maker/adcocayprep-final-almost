import React from 'react';

const Refunds: React.FC = () => {
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

      <main className="max-w-4xl mx-auto px-6 py-12">
        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 sm:p-10">
          <h1 className="text-3xl font-black">Refund Policy</h1>

          <p className="mt-2 text-sm text-slate-500">
            Effective Date: August 12, 2026
          </p>

          <div className="mt-8 space-y-8 text-sm text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-slate-900">
                1. Overview
              </h2>

              <p className="mt-2">
                This Refund Policy explains how refund requests for AdvocacyPrep
                purchases are handled.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                2. Payments Through Paddle
              </h2>

              <p className="mt-2">
                Purchases processed through Paddle are handled by Paddle.com as
                the Merchant of Record. Paddle may assist with payment,
                transaction, cancellation, and refund requests.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                3. Subscription Cancellation
              </h2>

              <p className="mt-2">
                Customers may cancel recurring subscriptions using the
                subscription-management options provided after purchase.
                Cancellation generally prevents future renewal charges.
              </p>

              <p className="mt-2">
                Cancelling a subscription does not automatically create a
                refund for a previous billing period.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                4. Refund Requests
              </h2>

              <p className="mt-2">
                Customers who want to request a refund should use the
                transaction-management or buyer-support options provided by
                Paddle for the applicable purchase.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                5. Consumer Rights
              </h2>

              <p className="mt-2">
                Nothing in this policy limits any mandatory refund,
                cancellation, withdrawal, or other consumer rights that apply
                under the laws of the customer's jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                6. One-Time Purchases
              </h2>

              <p className="mt-2">
                The Single Meeting Pass is a one-time purchase and does not
                automatically renew. Refund requests for one-time purchases are
                handled according to the applicable transaction terms and
                consumer rights.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                7. Contact
              </h2>

              <p className="mt-2">
                For questions regarding an AdvocacyPrep purchase or refund,
                contact:
              </p>

              <a
                href="mailto:i262673967@gmail.com"
                className="inline-block mt-2 text-indigo-600 font-semibold underline"
              >
                i262673967@gmail.com
              </a>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200 flex flex-wrap gap-5 text-sm">
            <a href="/terms" className="text-indigo-600 hover:underline">
              Terms of Service
            </a>

            <a href="/privacy" className="text-indigo-600 hover:underline">
              Privacy Policy
            </a>

            <a href="/pricing" className="text-indigo-600 hover:underline">
              Pricing
            </a>
          </div>
        </article>
      </main>
    </div>
  );
};

export default Refunds;
