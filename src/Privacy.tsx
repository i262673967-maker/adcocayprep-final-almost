import React from 'react';

const Privacy: React.FC = () => {
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
          <h1 className="text-3xl font-black">Privacy Policy</h1>

          <p className="mt-2 text-sm text-slate-500">
            Effective Date: August 12, 2026
          </p>

          <div className="mt-8 space-y-8 text-sm text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-slate-900">
                1. Introduction
              </h2>

              <p className="mt-2">
                This Privacy Policy explains how AdvocacyPrep collects, uses,
                stores, and protects information when you use our website and
                application.
              </p>
            </section>

            <section className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
              <h2 className="text-lg font-bold text-indigo-900">
                Our Privacy Commitment
              </h2>

              <p className="mt-2 text-indigo-800">
                AdvocacyPrep does not sell student records, parent intake
                information, meeting preparation materials, or contact
                information to advertising networks.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                2. Information We Collect
              </h2>

              <p className="mt-2">
                Depending on how you use AdvocacyPrep, we may collect:
              </p>

              <ul className="mt-3 list-disc pl-6 space-y-2">
                <li>Email address and account information.</li>
                <li>Parent or account-holder name.</li>
                <li>
                  Student information entered by the adult account holder,
                  such as name or initials, grade, state, school district, and
                  disability category.
                </li>
                <li>
                  Meeting notices, documents, intake responses, concerns, and
                  requested outcomes submitted by the user.
                </li>
                <li>Technical and application-usage information necessary to operate the service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                3. How We Use Information
              </h2>

              <p className="mt-2">
                Information may be used to provide AdvocacyPrep, generate
                meeting preparation materials, provide AI-assisted features,
                maintain accounts, provide customer support, process
                subscriptions, maintain security, prevent abuse, and improve
                the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                4. AI Processing
              </h2>

              <p className="mt-2">
                AdvocacyPrep uses Google Gemini AI services for certain
                features. Information submitted to those features may be
                processed by Google's systems to provide the requested
                functionality.
              </p>

              <p className="mt-2">
                Users should avoid submitting information that they are not
                authorized to provide.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                5. Third-Party Service Providers
              </h2>

              <ul className="mt-3 list-disc pl-6 space-y-2">
                <li>
                  <strong>Firebase:</strong> authentication and application
                  data storage.
                </li>
                <li>
                  <strong>Google Cloud:</strong> application infrastructure
                  and hosting services.
                </li>
                <li>
                  <strong>Google Gemini:</strong> AI-assisted processing for
                  applicable features.
                </li>
                <li>
                  <strong>Paddle:</strong> payment processing and Merchant of
                  Record services for purchases processed through Paddle.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                6. Payment Information
              </h2>

              <p className="mt-2">
                Payments processed through Paddle are handled by Paddle as the
                Merchant of Record. AdvocacyPrep does not directly store
                customers' complete payment-card information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                7. Data Security
              </h2>

              <p className="mt-2">
                We use reasonable technical and organizational measures
                designed to protect information against unauthorized access,
                alteration, disclosure, or destruction. No online service can
                guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                8. Data Retention and Deletion
              </h2>

              <p className="mt-2">
                You can delete applicable information through available
                application controls or request account and data deletion by
                contacting us. Certain records may need to be retained where
                required for legal, security, tax, accounting, or transaction
                purposes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                9. Children's Privacy
              </h2>

              <p className="mt-2">
                AdvocacyPrep accounts are intended for adults acting on behalf
                of children. The service is not intended for direct account
                registration by children.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                10. Cookies and Local Storage
              </h2>

              <p className="mt-2">
                AdvocacyPrep may use essential cookies and local storage
                mechanisms necessary for authentication, security, and basic
                application functionality. We do not use third-party
                advertising cookies for targeted advertising.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                11. Your Rights
              </h2>

              <p className="mt-2">
                Depending on your location, you may have rights concerning your
                personal information, including rights to access, correct,
                delete, restrict, or object to certain processing.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                12. Changes to This Policy
              </h2>

              <p className="mt-2">
                We may update this Privacy Policy when our practices or legal
                requirements change. The latest version will be published on
                this page.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                13. Contact
              </h2>

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

export default Privacy;
