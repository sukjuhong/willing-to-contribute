import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy for Willing to Contribute - Learn how we handle your data.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Privacy Policy</h1>
        <p className="text-gray-400 mb-10">Last updated: March 23, 2026</p>

        <div className="space-y-10">
          {/* Introduction */}
          <section>
            <p className="text-gray-300 leading-relaxed">
              Welcome to <strong className="text-gray-100">Willing to Contribute</strong>{' '}
              (
              <a
                href="https://willing-to-contribute.vercel.app"
                className="text-cyan-400 hover:text-cyan-300 underline"
              >
                https://willing-to-contribute.vercel.app
              </a>
              ). We are committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, and safeguard your information when you use our
              service, which helps developers discover and track beginner-friendly GitHub
              issues.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              By using our service, you agree to the collection and use of information as
              described in this policy. If you do not agree with this policy, please do
              not use our service.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              1. Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  1.1 GitHub Profile Information
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  When you authenticate using GitHub OAuth, we receive the following
                  information from GitHub:
                </p>
                <ul className="list-disc list-inside text-gray-300 leading-relaxed mt-2 space-y-1 ml-4">
                  <li>Your GitHub username</li>
                  <li>Your GitHub profile avatar (profile picture)</li>
                  <li>Your GitHub user ID</li>
                  <li>
                    An OAuth access token granting us permission to act on your behalf
                  </li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-2">
                  We only request the minimum permissions necessary to provide the
                  service, specifically the ability to read and write GitHub Gists for
                  settings synchronization.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  1.2 Repository Tracking Preferences
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  We store your application preferences, which include:
                </p>
                <ul className="list-disc list-inside text-gray-300 leading-relaxed mt-2 space-y-1 ml-4">
                  <li>List of GitHub repositories you choose to track</li>
                  <li>Label filter preferences for issue discovery</li>
                  <li>Notification frequency settings</li>
                  <li>Display preferences (language, theme)</li>
                  <li>Options to hide closed issues</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-2">
                  This data is stored in your browser&apos;s localStorage. If you are
                  logged in with GitHub, you may optionally sync these preferences to a
                  private GitHub Gist stored in your own GitHub account.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  1.3 Usage Data and Analytics
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  We may collect anonymized usage data to improve our service, including:
                </p>
                <ul className="list-disc list-inside text-gray-300 leading-relaxed mt-2 space-y-1 ml-4">
                  <li>Pages visited and features used</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Referring URLs</li>
                  <li>General geographic location (country/region level)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              2. How We Use Your Information
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  2.1 Service Provision
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  We use your information primarily to provide and improve the service:
                </p>
                <ul className="list-disc list-inside text-gray-300 leading-relaxed mt-2 space-y-1 ml-4">
                  <li>Displaying GitHub issues from your tracked repositories</li>
                  <li>Filtering issues based on your label preferences</li>
                  <li>
                    Sending browser notifications for new issues (with your permission)
                  </li>
                  <li>Authenticating your identity to enable personalized features</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  2.2 Cross-Device Synchronization
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  If you choose to enable Gist sync, we use your GitHub OAuth token to
                  save and retrieve your settings from a private Gist in your own GitHub
                  account. This allows your preferences to be available across multiple
                  devices. The Gist is created under your GitHub account and is under your
                  full control.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  2.3 Service Improvement
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Aggregated, anonymized usage data helps us understand how the service is
                  used so we can improve features, fix bugs, and enhance user experience.
                </p>
              </div>
            </div>
          </section>

          {/* Data Storage */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              3. Data Storage
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  3.1 Client-Side Storage (Your Browser)
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  The following data is stored exclusively in your browser&apos;s
                  localStorage:
                </p>
                <ul className="list-disc list-inside text-gray-300 leading-relaxed mt-2 space-y-1 ml-4">
                  <li>GitHub OAuth access token</li>
                  <li>GitHub user profile information (username, avatar URL)</li>
                  <li>Application settings and preferences</li>
                  <li>Tracked repository list</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-2">
                  This data is stored only on your device and is never transmitted to our
                  servers except when syncing via GitHub Gist.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  3.2 Server-Side Storage
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  We do not maintain a server-side database of user data. Our servers
                  (hosted on Vercel) process requests but do not persistently store
                  personal information. The only server-side operation involving your data
                  is the GitHub OAuth token exchange, which is processed in real time and
                  not stored.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  3.3 GitHub Gist Sync
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  If you enable settings synchronization, your preferences are stored in a
                  private GitHub Gist associated with your GitHub account. This Gist is:
                </p>
                <ul className="list-disc list-inside text-gray-300 leading-relaxed mt-2 space-y-1 ml-4">
                  <li>Set to private by default (not publicly accessible)</li>
                  <li>Stored under your GitHub account, not ours</li>
                  <li>Deletable by you at any time from your GitHub settings</li>
                  <li>Subject to GitHub&apos;s own Privacy Policy</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              4. Third-Party Services
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We use several third-party services that may collect information about you:
            </p>
            <div className="space-y-4">
              <div className="bg-[#161b22] border border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-200 mb-2">4.1 GitHub</h3>
                <p className="text-gray-300 leading-relaxed">
                  We use the GitHub API to fetch repository and issue data, and GitHub
                  OAuth for authentication. Your use of GitHub features is subject to{' '}
                  <a
                    href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub&apos;s Privacy Policy
                  </a>
                  .
                </p>
              </div>

              <div className="bg-[#161b22] border border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  4.2 Google AdSense
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  We use Google AdSense to display advertisements on our service. Google
                  AdSense uses cookies and similar tracking technologies to serve ads
                  based on your prior visits to our website and other websites on the
                  internet. Google&apos;s use of advertising cookies enables it and its
                  partners to serve ads based on your visit to our site and/or other sites
                  on the internet.
                </p>
                <p className="text-gray-300 leading-relaxed mt-2">
                  You may opt out of personalized advertising by visiting{' '}
                  <a
                    href="https://www.google.com/settings/ads"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google Ad Settings
                  </a>
                  . For more information on how Google uses data when you use our site,
                  please visit{' '}
                  <a
                    href="https://policies.google.com/technologies/partner-sites"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google&apos;s Privacy & Terms
                  </a>
                  .
                </p>
              </div>

              <div className="bg-[#161b22] border border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-200 mb-2">4.3 Vercel</h3>
                <p className="text-gray-300 leading-relaxed">
                  Our service is hosted on Vercel, which may collect standard web server
                  logs including IP addresses and request information. This is subject to{' '}
                  <a
                    href="https://vercel.com/legal/privacy-policy"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Vercel&apos;s Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* Cookies & Tracking */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              5. Cookies and Tracking Technologies
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  5.1 localStorage (Not Cookies)
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  We use browser localStorage (not traditional cookies) to store your
                  settings and authentication token locally. localStorage data does not
                  expire automatically and is not transmitted to servers with each
                  request. You can clear this data at any time by clearing your
                  browser&apos;s local storage or using our built-in &quot;Clear All
                  Data&quot; feature in the settings.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  5.2 Advertising Cookies
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Google AdSense sets cookies to serve personalized advertisements. These
                  cookies allow Google and its partners to:
                </p>
                <ul className="list-disc list-inside text-gray-300 leading-relaxed mt-2 space-y-1 ml-4">
                  <li>Remember your past visits to our site and other sites</li>
                  <li>Show you ads relevant to your interests</li>
                  <li>Measure the effectiveness of advertising campaigns</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  5.3 Opting Out of Ad Personalization
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  You can opt out of personalized advertising in several ways:
                </p>
                <ul className="list-disc list-inside text-gray-300 leading-relaxed mt-2 space-y-1 ml-4">
                  <li>
                    Visit{' '}
                    <a
                      href="https://www.google.com/settings/ads"
                      className="text-cyan-400 hover:text-cyan-300 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Google Ad Settings
                    </a>
                  </li>
                  <li>
                    Use the{' '}
                    <a
                      href="https://optout.networkadvertising.org/"
                      className="text-cyan-400 hover:text-cyan-300 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Network Advertising Initiative opt-out page
                    </a>
                  </li>
                  <li>Configure your browser to block third-party cookies</li>
                  <li>Use browser extensions that block advertising trackers</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              6. Data Security
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We take the security of your data seriously and implement appropriate
              measures to protect it:
            </p>
            <ul className="list-disc list-inside text-gray-300 leading-relaxed space-y-2 ml-4">
              <li>
                <strong className="text-gray-200">HTTPS Encryption:</strong> All data
                transmitted between your browser and our service is encrypted using
                TLS/HTTPS.
              </li>
              <li>
                <strong className="text-gray-200">Client-Side Token Storage:</strong> Your
                GitHub OAuth token is stored only in your browser&apos;s localStorage and
                is never sent to or stored on our servers.
              </li>
              <li>
                <strong className="text-gray-200">No Server Database:</strong> We do not
                maintain a server-side database of user credentials or personal
                information, minimizing the risk of data breaches on our end.
              </li>
              <li>
                <strong className="text-gray-200">OAuth Security:</strong> We use
                GitHub&apos;s secure OAuth 2.0 protocol for authentication. We never see
                or store your GitHub password.
              </li>
              <li>
                <strong className="text-gray-200">Minimal Permissions:</strong> We request
                only the minimum GitHub OAuth scopes required for the service to function
                (Gist read/write access).
              </li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              However, no method of transmission over the internet or electronic storage
              is 100% secure. While we strive to use commercially acceptable means to
              protect your personal information, we cannot guarantee its absolute
              security.
            </p>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              7. Your Rights and Controls
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You have full control over your data. Here is what you can do:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  7.1 Delete Local Data
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  You can delete all locally stored data at any time by:
                </p>
                <ul className="list-disc list-inside text-gray-300 leading-relaxed mt-2 space-y-1 ml-4">
                  <li>
                    Using the &quot;Clear All Data&quot; button available in the Settings
                    panel of the application
                  </li>
                  <li>
                    Clearing your browser&apos;s localStorage through browser developer
                    tools
                  </li>
                  <li>
                    Clearing all site data through your browser&apos;s privacy/security
                    settings
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  7.2 Revoke GitHub OAuth Access
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  You can revoke our application&apos;s access to your GitHub account at
                  any time by visiting your{' '}
                  <a
                    href="https://github.com/settings/applications"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub OAuth Application Settings
                  </a>{' '}
                  and revoking access for &quot;Willing to Contribute&quot;. After
                  revocation, you will be logged out and no further API calls will be made
                  on your behalf.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  7.3 Delete Synced Settings (Gist)
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  If you have enabled Gist sync, you can delete the settings Gist directly
                  from your{' '}
                  <a
                    href="https://gist.github.com"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub Gists page
                  </a>
                  . The Gist is titled &quot;Willing to Contribute Settings&quot; and can
                  be identified and deleted from your GitHub account at any time.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  7.4 Data Portability
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Since your settings are stored in your own browser and optionally in
                  your own GitHub Gist, you already have full access to and ownership of
                  your data. You can view, export, or delete it directly without needing
                  to request it from us.
                </p>
              </div>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              8. Children&apos;s Privacy (COPPA)
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Our service is not directed to children under the age of 13 (or 16 in the
              European Union). We do not knowingly collect personal information from
              children. If you are a parent or guardian and believe that your child has
              provided us with personal information, please contact us so we can take
              appropriate action.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              GitHub itself requires users to be at least 13 years old to create an
              account. Since our service requires a GitHub account for full functionality,
              this requirement inherently applies to our service as well.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              9. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in
              our practices, technology, legal requirements, or other factors. When we
              make changes, we will update the &quot;Last updated&quot; date at the top of
              this page.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              We encourage you to review this Privacy Policy periodically to stay informed
              about how we are protecting your information. Your continued use of the
              service after any changes to this Privacy Policy constitutes your acceptance
              of those changes.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">
              10. Contact Information
            </h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy
              Policy or our data practices, please contact us:
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
              We will respond to privacy-related inquiries within a reasonable timeframe,
              generally within 30 days.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
