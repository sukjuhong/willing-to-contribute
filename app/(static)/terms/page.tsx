import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Willing to Contribute.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Terms of Service</h1>
        <p className="text-gray-400 mb-10">Last updated: March 23, 2026</p>

        <div className="space-y-10">
          {/* Introduction */}
          <section>
            <p className="text-gray-300 leading-relaxed">
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of{' '}
              <strong className="text-gray-100">Willing to Contribute</strong> (
              <a
                href="https://willing-to-contribute.vercel.app"
                className="text-cyan-400 hover:text-cyan-300 underline"
              >
                https://willing-to-contribute.vercel.app
              </a>
              ), a service that helps developers discover and track beginner-friendly
              GitHub issues across multiple repositories. Please read these Terms
              carefully before using our service.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing or using the Willing to Contribute service
              (&quot;Service&quot;), you agree to be bound by these Terms of Service and
              our{' '}
              <a href="/privacy" className="text-cyan-400 hover:text-cyan-300 underline">
                Privacy Policy
              </a>
              , which is incorporated into these Terms by reference. If you do not agree
              to these Terms, you may not access or use the Service.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              These Terms constitute a legally binding agreement between you and the
              operators of Willing to Contribute. If you are using the Service on behalf
              of an organization, you represent that you have the authority to bind that
              organization to these Terms.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              2. Description of Service
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Willing to Contribute is a web application that provides the following
              functionality:
            </p>
            <ul className="list-disc list-inside text-gray-300 leading-relaxed mt-3 space-y-2 ml-4">
              <li>
                Discovering beginner-friendly GitHub issues labeled with tags such as
                &quot;good first issue&quot;, &quot;help wanted&quot;, and similar labels
              </li>
              <li>Tracking multiple GitHub repositories in a single dashboard</li>
              <li>Filtering and sorting issues based on custom criteria</li>
              <li>Browser notifications for new issues in tracked repositories</li>
              <li>
                Cross-device synchronization of settings via GitHub Gists (requires GitHub
                authentication)
              </li>
              <li>Support for multiple languages (English and Korean)</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              The Service may be used without a GitHub account, but certain features
              (settings sync, higher API rate limits) require GitHub OAuth authentication.
              We reserve the right to modify, suspend, or discontinue the Service at any
              time without prior notice.
            </p>
          </section>

          {/* GitHub Account & Authentication */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              3. GitHub Account and Authentication
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  3.1 GitHub Account
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  To use the full features of the Service, you may authenticate using your
                  GitHub account. By doing so, you authorize us to access your GitHub
                  profile information and to create/read private Gists on your behalf, as
                  described in our Privacy Policy. You remain fully responsible for your
                  GitHub account and all activity conducted through it.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  3.2 OAuth Permissions
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  When you authenticate with GitHub, we request the minimum permissions
                  necessary to provide the Service. We do not access, modify, or delete
                  your GitHub repositories, code, or other content beyond what is
                  expressly required for the Service features you choose to use.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  3.3 Token Security
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Your GitHub OAuth token is stored in your browser&apos;s localStorage.
                  You are responsible for keeping your device and browser secure. You
                  should revoke our application&apos;s access if you believe your token
                  has been compromised. We are not liable for any unauthorized access
                  resulting from your failure to maintain device security.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  3.4 GitHub&apos;s Terms of Service
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Your use of GitHub through our Service is also subject to{' '}
                  <a
                    href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub&apos;s Terms of Service
                  </a>
                  . We are not affiliated with, endorsed by, or sponsored by GitHub, Inc.
                </p>
              </div>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              4. User Responsibilities
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              By using the Service, you agree to:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  4.1 Acceptable Use
                </h3>
                <ul className="list-disc list-inside text-gray-300 leading-relaxed space-y-2 ml-4">
                  <li>
                    Use the Service only for lawful purposes and in compliance with
                    applicable laws
                  </li>
                  <li>Not use the Service to abuse, harass, or harm others</li>
                  <li>
                    Not attempt to circumvent, disable, or interfere with security
                    features of the Service
                  </li>
                  <li>
                    Not use the Service to scrape, mine, or extract data in a manner that
                    violates GitHub&apos;s terms of service
                  </li>
                  <li>Not use the Service to send unsolicited communications or spam</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  4.2 Rate Limit Compliance
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  The Service uses the GitHub API, which enforces rate limits. You agree
                  not to attempt to circumvent GitHub API rate limits or use the Service
                  in ways that could cause excessive API requests. Unauthenticated use is
                  subject to lower rate limits. Using GitHub OAuth authentication provides
                  higher rate limits as per GitHub&apos;s official limits.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  4.3 Accurate Information
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  If you provide any information in connection with using the Service, you
                  agree that such information is accurate, current, and complete.
                </p>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              5. Intellectual Property
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  5.1 Our Intellectual Property
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  The Service, including its original content, features, and
                  functionality, is owned by the operators of Willing to Contribute and is
                  protected by applicable intellectual property laws. You may not copy,
                  modify, distribute, sell, or lease any part of our Service without our
                  express written permission.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  5.2 Open Source
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  The source code of Willing to Contribute may be made available under an
                  open source license. Where source code is provided under an open source
                  license, the terms of that license govern your use of the source code.
                  Please refer to our GitHub repository for the applicable license terms.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  5.3 GitHub Content
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Repository information, issues, and other content displayed through the
                  Service are sourced from GitHub and remain the intellectual property of
                  their respective owners. We display this content through GitHub&apos;s
                  official API in accordance with GitHub&apos;s terms of service and do
                  not claim ownership of any such content.
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimer of Warranties */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              6. Disclaimer of Warranties
            </h2>
            <div className="bg-[#161b22] border border-gray-700 rounded-lg p-4">
              <p className="text-gray-300 leading-relaxed">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;
                WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT
                NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p className="text-gray-300 leading-relaxed mt-3">
                WE DO NOT WARRANT THAT:
              </p>
              <ul className="list-disc list-inside text-gray-300 leading-relaxed mt-2 space-y-1 ml-4">
                <li>The Service will be uninterrupted, timely, secure, or error-free</li>
                <li>
                  The results obtained from using the Service will be accurate or reliable
                </li>
                <li>
                  The quality of any products, services, information, or other material
                  obtained through the Service will meet your expectations
                </li>
                <li>Any errors in the Service will be corrected</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3">
                THE SERVICE DEPENDS ON GITHUB&apos;S API AND OTHER THIRD-PARTY SERVICES.
                WE DO NOT GUARANTEE AVAILABILITY OR ACCURACY OF DATA FETCHED FROM THESE
                SERVICES.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              7. Limitation of Liability
            </h2>
            <div className="bg-[#161b22] border border-gray-700 rounded-lg p-4">
              <p className="text-gray-300 leading-relaxed">
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, WE SHALL NOT BE LIABLE
                FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
                INCLUDING WITHOUT LIMITATION:
              </p>
              <ul className="list-disc list-inside text-gray-300 leading-relaxed mt-2 space-y-1 ml-4">
                <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
                <li>
                  Damages resulting from unauthorized access to your account or data
                </li>
                <li>Damages resulting from service interruptions or data loss</li>
                <li>
                  Damages resulting from your reliance on any information obtained through
                  the Service
                </li>
                <li>
                  Damages resulting from your interactions with third parties (including
                  GitHub) through the Service
                </li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3">
                IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS EXCEED THE
                AMOUNT YOU PAID US (IF ANY) IN THE TWELVE MONTHS PRECEDING THE CLAIM.
                SINCE THE SERVICE IS PROVIDED FREE OF CHARGE, OUR TOTAL LIABILITY SHALL
                NOT EXCEED ZERO DOLLARS ($0).
              </p>
            </div>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              8. Third-Party Links and Services
            </h2>
            <p className="text-gray-300 leading-relaxed">
              The Service displays GitHub issues that contain links to external websites
              and resources. These links are provided for your convenience and
              informational purposes only. We have no control over the content of those
              sites and resources, and accept no responsibility for them or for any loss
              or damage that may arise from your use of them.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              When you follow links to other websites or use third-party services
              integrated with ours, those websites and services have their own privacy
              policies and terms, which govern your use of those services. We encourage
              you to review those policies before using third-party services.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              Our Service integrates with the following third-party services, each
              governed by their own terms:
            </p>
            <ul className="list-disc list-inside text-gray-300 leading-relaxed mt-3 space-y-2 ml-4">
              <li>
                <strong className="text-gray-200">GitHub:</strong> Repository data,
                issues, and OAuth authentication
              </li>
              <li>
                <strong className="text-gray-200">Google AdSense:</strong> Advertising
                services
              </li>
              <li>
                <strong className="text-gray-200">Vercel:</strong> Hosting and deployment
                platform
              </li>
            </ul>
          </section>

          {/* Advertising */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              9. Advertising
            </h2>
            <p className="text-gray-300 leading-relaxed">
              The Service displays advertisements provided by Google AdSense to support
              the operation and maintenance of the Service. By using the Service, you
              agree to the presence of these advertisements.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              Google AdSense may use cookies and similar technologies to serve
              personalized advertisements based on your interests. You can opt out of
              personalized advertising through{' '}
              <a
                href="https://www.google.com/settings/ads"
                className="text-cyan-400 hover:text-cyan-300 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Ad Settings
              </a>
              . Non-personalized ads may still be shown even after opting out.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              We do not control the content of advertisements displayed by Google AdSense
              and are not responsible for any products, services, or content advertised
              through the Service.
            </p>
          </section>

          {/* Modifications to Terms */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              10. Modifications to Terms
            </h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to modify these Terms at any time. When we make
              changes, we will update the &quot;Last updated&quot; date at the top of this
              page. For significant changes, we will make reasonable efforts to provide
              notice, such as posting a prominent notice on the Service.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              Your continued use of the Service after any changes to the Terms constitutes
              your acceptance of the new Terms. If you do not agree to the modified Terms,
              you should discontinue using the Service.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              We also reserve the right to:
            </p>
            <ul className="list-disc list-inside text-gray-300 leading-relaxed mt-3 space-y-1 ml-4">
              <li>Modify or discontinue any features of the Service</li>
              <li>Change pricing (currently free) with reasonable advance notice</li>
              <li>Restrict access to certain features or the entire Service</li>
            </ul>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              11. Governing Law and Dispute Resolution
            </h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable
              laws, without regard to conflict of law provisions. Any disputes arising
              from these Terms or your use of the Service shall be resolved through
              good-faith negotiation between the parties.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              If a dispute cannot be resolved through negotiation, you agree to submit to
              the jurisdiction of the courts applicable to the service operator&apos;s
              location for resolution of any claims arising out of or relating to these
              Terms or the Service.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              If any provision of these Terms is found to be unenforceable or invalid,
              that provision will be limited or eliminated to the minimum extent
              necessary, and the remaining provisions of these Terms will remain in full
              force and effect.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              12. Termination
            </h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to terminate or suspend your access to the Service
              immediately, without prior notice or liability, for any reason whatsoever,
              including if you breach these Terms.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              Upon termination, your right to use the Service will immediately cease.
              Since data is primarily stored client-side, you retain access to your
              locally stored data. However, you will no longer be able to use the
              Service&apos;s features.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              You may terminate your use of the Service at any time by:
            </p>
            <ul className="list-disc list-inside text-gray-300 leading-relaxed mt-3 space-y-1 ml-4">
              <li>Logging out and clearing your browser&apos;s local storage</li>
              <li>Revoking GitHub OAuth access from your GitHub account settings</li>
              <li>Simply ceasing to use the Service</li>
            </ul>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              13. Contact Information
            </h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-[#161b22] border border-gray-700 rounded-lg p-4 mt-4">
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-gray-100">Willing to Contribute</strong>
                <br />
                GitHub Issues:{' '}
                <a
                  href="https://github.com/sukjuhong/willing-to-contribute/issues"
                  className="text-cyan-400 hover:text-cyan-300 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://github.com/sukjuhong/willing-to-contribute/issues
                </a>
              </p>
            </div>
            <p className="text-gray-300 leading-relaxed mt-4">
              By using the Service, you acknowledge that you have read these Terms of
              Service, understand them, and agree to be bound by them.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
