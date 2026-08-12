import React from 'react';

const Terms: React.FC = () => {
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
          <h1 className="text-3xl font-black">Terms of Service</h1>

          <p className="mt-2 text-sm text-slate-500">
            Effective Date: August 12, 2026
          </p>

          <div className="mt-8 space-y-8 text-sm text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-slate-900">
                1. About AdvocacyPrep
              </h2>

              <p className="mt-2">
                AdvocacyPrep is an organizational and tactical preparation
                application designed for parents, guardians, and authorized
                advocates preparing for special education meetings, including
                IEP and Section 504 meetings.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                2. Acceptance of Terms
              </h2>

              <p className="mt-2">
                By accessing or using AdvocacyPrep, creating an account,
                uploading meeting information, or generating meeting
                preparation materials, you agree to these Terms of Service.
                If you do not agree with these terms, you may not use the
                service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                3. Eligibility
              </h2>

              <p className="mt-2">
                You must be at least 18 years old to create an account.
                Accounts are intended for parents, legal guardians, and
                authorized advocates acting on behalf of a child.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                4. Service and AI-Generated Content
              </h2>

              <p className="mt-2">
                AdvocacyPrep uses software and artificial intelligence to
                organize information supplied by users and generate meeting
                preparation materials. AI-generated information may contain
                errors or omissions. Users are responsible for reviewing and
                verifying generated information before relying on it.
              </p>
            </section>

            <section className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h2 className="text-lg font-bold text-amber-900">
                5. No Legal or Professional Advice
              </h2>

              <p className="mt-2 text-amber-800">
                AdvocacyPrep is not a law firm and does not provide formal
                legal advice, attorney representation, legal representation,
                or statutory guarantees. The service is an organizational and
                preparation tool. Users should consult an appropriately
                qualified professional when they need legal or professional
                advice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                6. User Content
              </h2>

              <p className="mt-2">
                Users are responsible for information and documents they
                submit to AdvocacyPrep and represent that they have the
                necessary rights and permissions to provide that information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                7. Payments and Subscriptions
              </h2>

              <p className="mt-2">
                Paid products and subscriptions are offered at the prices
                displayed on our pricing page. Billing frequency and the
                applicable amount are displayed before checkout.
              </p>

              <p className="mt-2">
                For purchases processed through Paddle, Paddle.com acts as the
                Merchant of Record and handles applicable payment processing,
                sales taxes, and transaction-related requirements.
              </p>

              <p className="mt-2">
                Subscriptions automatically renew according to the billing
                frequency selected at checkout until cancelled.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                8. Cancellation
              </h2>

              <p className="mt-2">
                Customers may cancel recurring subscriptions using the
                available subscription-management functionality. Cancellation
                prevents future renewal charges but does not automatically
                create a refund for a previous billing period.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                9. Refunds
              </h2>

              <p className="mt-2">
                Refund requests are handled according to our Refund Policy,
                the applicable transaction terms, and any mandatory consumer
                rights that apply to the customer.
              </p>

              <a
                href="/refunds"
                className="inline-block mt-3 text-indigo-600 font-semibold underline"
              >
                View Refund Policy
              </a>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                10. Intellectual Property
              </h2>

              <p className="mt-2">
                AdvocacyPrep, including its software, design, branding, and
                original content, is protected by applicable intellectual
                property laws. You may not copy, distribute, modify, or
                commercially exploit the service except as permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                11. Service Availability
              </h2>

              <p className="mt-2">
                We aim to maintain reliable access to AdvocacyPrep but do not
                guarantee uninterrupted or error-free operation.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                12. Limitation of Liability
              </h2>

              <p className="mt-2">
                To the maximum extent permitted by applicable law, AdvocacyPrep
                is not responsible for indirect, incidental, special, or
                consequential losses arising from use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                13. Governing Law
              </h2>

              <p className="mt-2">
                These Terms are governed by the laws applicable to the operator
                of AdvocacyPrep, subject to any mandatory consumer protection
                laws that apply to users in their jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                14. Changes to These Terms
              </h2>

              <p className="mt-2">
                We may update these Terms from time to time. The latest version
                will be published on this page with an updated effective date.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                15. Contact
              </h2>

              <p className="mt-2">
                For questions regarding these Terms, contact:
              </p>

              <a
                href="mailto:i262673967@gmail.com"
                className="inline-block mt-2 text-indigo-600 font-semibold underline"
              >
                i262673967@gmail.com
              </a>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
};

export default Terms;
