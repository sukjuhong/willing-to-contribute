import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Pickssue - Learn how we handle your data.',
  openGraph: {
    title: 'Privacy Policy | Pickssue',
    description: 'Privacy Policy for Pickssue - Learn how we handle your data.',
    url: 'https://pickssue.dev/privacy',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Pickssue Privacy Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Pickssue',
    description: 'Privacy Policy for Pickssue - Learn how we handle your data.',
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: March 23, 2026</p>

        <div className="space-y-10">
          {/* Introduction */}
          <section>
            <p className="text-foreground leading-relaxed">
              Welcome to <strong className="text-foreground">Pickssue</strong> (
              <a
                href="https://pickssue.dev"
                className="text-primary hover:text-primary/80 underline"
              >
                https://pickssue.dev
              </a>
              ). We are committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, and safeguard your information when you use our
              service, which helps developers discover and track beginner-friendly GitHub
              issues.
            </p>
            <p className="text-foreground leading-relaxed mt-4">
              By using our service, you agree to the collection and use of information as
              described in this policy. If you do not agree with this policy, please do
              not use our service.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">
              1. Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  1.1 GitHub Profile Information
                </h3>
                <p className="text-foreground leading-relaxed">
                  When you authenticate using GitHub OAuth, we receive the following
                  information from GitHub:
                </p>
                <ul className="list-disc list-inside text-foreground leading-relaxed mt-2 space-y-1 ml-4">
                  <li>Your GitHub username</li>
                  <li>Your GitHub profile avatar (profile picture)</li>
                  <li>Your GitHub user ID</li>
                  <li>
                    An OAuth access token granting us permission to act on your behalf
                  </li>
                </ul>
                <p className="text-foreground leading-relaxed mt-2">
                  We only request the minimum permissions necessary to provide the
                  service, specifically the ability to read your public profile for
                  authentication and to sync settings via cloud storage.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  1.2 Repository Tracking Preferences
                </h3>
                <p className="text-foreground leading-relaxed">
                  We store your application preferences, which include:
                </p>
                <ul className="list-disc list-inside text-foreground leading-relaxed mt-2 space-y-1 ml-4">
                  <li>List of GitHub repositories you choose to track</li>
                  <li>Label filter preferences for issue discovery</li>
                  <li>Notification frequency settings</li>
                  <li>Display preferences (language, theme)</li>
                  <li>Options to hide closed issues</li>
                </ul>
                <p className="text-foreground leading-relaxed mt-2">
                  This data is stored in your browser&apos;s localStorage. If you are
                  logged in with GitHub, your preferences are automatically synced to a
                  secure cloud database tied to your account.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  1.3 Usage Data and Analytics
                </h3>
                <p className="text-foreground leading-relaxed">
                  We may collect anonymized usage data to improve our service, including:
                </p>
                <ul className="list-disc list-inside text-foreground leading-relaxed mt-2 space-y-1 ml-4">
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
            <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">
              2. How We Use Your Information
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  2.1 Service Provision
                </h3>
                <p className="text-foreground leading-relaxed">
                  We use your information primarily to provide and improve the service:
                </p>
                <ul className="list-disc list-inside text-foreground leading-relaxed mt-2 space-y-1 ml-4">
                  <li>Displaying GitHub issues from your tracked repositories</li>
                  <li>Filtering issues based on your label preferences</li>
                  <li>
                    Sending browser notifications for new issues (with your permission)
                  </li>
                  <li>Authenticating your identity to enable personalized features</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  2.2 Cross-Device Synchronization
                </h3>
                <p className="text-foreground leading-relaxed">
                  When you sign in, your settings are automatically synced to a secure
                  cloud database. This allows your preferences to be available across
                  multiple devices. The data is tied to your authenticated account and
                  accessible only by you.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  2.3 Service Improvement
                </h3>
                <p className="text-foreground leading-relaxed">
                  Aggregated, anonymized usage data helps us understand how the service is
                  used so we can improve features, fix bugs, and enhance user experience.
                </p>
              </div>
            </div>
          </section>

          {/* Data Storage */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">
              3. Data Storage
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  3.1 Client-Side Storage (Your Browser)
                </h3>
                <p className="text-foreground leading-relaxed">
                  The following data is stored exclusively in your browser&apos;s
                  localStorage:
                </p>
                <ul className="list-disc list-inside text-foreground leading-relaxed mt-2 space-y-1 ml-4">
                  <li>GitHub OAuth access token</li>
                  <li>GitHub user profile information (username, avatar URL)</li>
                  <li>Application settings and preferences</li>
                  <li>Tracked repository list</li>
                </ul>
                <p className="text-foreground leading-relaxed mt-2">
                  This data is stored only on your device and is never transmitted to our
                  servers except when syncing via cloud storage.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  3.2 Server-Side Storage
                </h3>
                <p className="text-foreground leading-relaxed">
                  When you sign in with GitHub, your profile and preferences are stored in
                  a secure cloud database (Supabase) tied to your account. This enables
                  cross-device sync. If you use the service without signing in, no
                  personal information or preferences are stored on our servers. Row-level
                  security ensures only you can read or write your own data.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  3.3 Cloud Sync
                </h3>
                <p className="text-foreground leading-relaxed">
                  If you are signed in, your preferences are stored in a secure cloud
                  database associated with your account. This data is:
                </p>
                <ul className="list-disc list-inside text-foreground leading-relaxed mt-2 space-y-1 ml-4">
                  <li>Not publicly accessible</li>
                  <li>Tied to your authenticated account</li>
                  <li>Deletable upon request through our GitHub Issues page</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Chrome Extension */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">
              4. Chrome Extension
            </h2>
            <p className="text-foreground leading-relaxed mb-4">
              The Pickssue Chrome Extension stores and manages data locally within your
              browser using Chrome&apos;s built-in storage APIs. No data is transmitted to
              any external server operated by us.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  4.1 Data Stored by the Extension
                </h3>
                <p className="text-foreground leading-relaxed">
                  The extension stores the following data on your device:
                </p>
                <ul className="list-disc list-inside text-foreground leading-relaxed mt-2 space-y-1 ml-4">
                  <li>
                    <strong className="text-foreground">GitHub API Token</strong> — stored
                    in{' '}
                    <code className="bg-card px-1 rounded text-primary">
                      chrome.storage.local
                    </code>{' '}
                    on your device only
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Settings &amp; Preferences
                    </strong>{' '}
                    — stored in{' '}
                    <code className="bg-card px-1 rounded text-primary">
                      chrome.storage.sync
                    </code>{' '}
                    and synced across your Google account-linked Chrome instances
                  </li>
                  <li>
                    <strong className="text-foreground">Issue Cache</strong> — stored in{' '}
                    <code className="bg-card px-1 rounded text-primary">
                      chrome.storage.local
                    </code>{' '}
                    to reduce redundant GitHub API calls
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  4.2 Cross-Device Settings Sync
                </h3>
                <p className="text-foreground leading-relaxed">
                  Extension settings (tracked repositories, label filters, notification
                  preferences) are stored using{' '}
                  <code className="bg-card px-1 rounded text-primary">
                    chrome.storage.sync
                  </code>
                  . Chrome automatically synchronizes this data across devices where you
                  are signed in to the same Google account. This sync is handled entirely
                  by Google Chrome and is subject to{' '}
                  <a
                    href="https://policies.google.com/privacy"
                    className="text-primary hover:text-primary/80 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google&apos;s Privacy Policy
                  </a>
                  .
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  4.3 GitHub API Calls
                </h3>
                <p className="text-foreground leading-relaxed">
                  All GitHub API requests made by the extension use only the API token you
                  provide directly. The extension calls the GitHub API on your behalf to
                  fetch repository and issue data. No requests pass through our servers —
                  all API calls are made directly from your browser to{' '}
                  <code className="bg-card px-1 rounded text-primary">
                    api.github.com
                  </code>
                  .
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  4.4 No External Data Transmission
                </h3>
                <p className="text-foreground leading-relaxed">
                  The extension does not send any data to our servers or any third-party
                  services other than GitHub (via direct API calls). Your GitHub token,
                  repository list, and issue cache remain on your device.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  4.5 Deleting Extension Data
                </h3>
                <p className="text-foreground leading-relaxed">
                  You can remove all data stored by the extension at any time:
                </p>
                <ul className="list-disc list-inside text-foreground leading-relaxed mt-2 space-y-1 ml-4">
                  <li>
                    Uninstalling the extension automatically clears all locally stored
                    data
                  </li>
                  <li>
                    You can clear individual data items through the extension&apos;s
                    Settings panel
                  </li>
                  <li>
                    Chrome&apos;s &quot;Clear browsing data&quot; settings can also remove
                    extension storage
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">
              5. Third-Party Services
            </h2>
            <p className="text-foreground leading-relaxed mb-4">
              We use several third-party services that may collect information about you:
            </p>
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-lg font-medium text-foreground mb-2">5.1 GitHub</h3>
                <p className="text-foreground leading-relaxed">
                  We use the GitHub API to fetch repository and issue data, and GitHub
                  OAuth for authentication. Your use of GitHub features is subject to{' '}
                  <a
                    href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                    className="text-primary hover:text-primary/80 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub&apos;s Privacy Policy
                  </a>
                  .
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  5.2 Google AdSense
                </h3>
                <p className="text-foreground leading-relaxed">
                  We use Google AdSense to display advertisements on our service. Google
                  AdSense uses cookies and similar tracking technologies to serve ads
                  based on your prior visits to our website and other websites on the
                  internet. Google&apos;s use of advertising cookies enables it and its
                  partners to serve ads based on your visit to our site and/or other sites
                  on the internet.
                </p>
                <p className="text-foreground leading-relaxed mt-2">
                  You may opt out of personalized advertising by visiting{' '}
                  <a
                    href="https://www.google.com/settings/ads"
                    className="text-primary hover:text-primary/80 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google Ad Settings
                  </a>
                  . For more information on how Google uses data when you use our site,
                  please visit{' '}
                  <a
                    href="https://policies.google.com/technologies/partner-sites"
                    className="text-primary hover:text-primary/80 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google&apos;s Privacy & Terms
                  </a>
                  .
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-lg font-medium text-foreground mb-2">5.3 Vercel</h3>
                <p className="text-foreground leading-relaxed">
                  Our service is hosted on Vercel, which may collect standard web server
                  logs including IP addresses and request information. This is subject to{' '}
                  <a
                    href="https://vercel.com/legal/privacy-policy"
                    className="text-primary hover:text-primary/80 underline"
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
            <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">
              6. Cookies and Tracking Technologies
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  6.1 localStorage (Not Cookies)
                </h3>
                <p className="text-foreground leading-relaxed">
                  We use browser localStorage (not traditional cookies) to store your
                  settings and authentication token locally. localStorage data does not
                  expire automatically and is not transmitted to servers with each
                  request. You can clear this data at any time by clearing your
                  browser&apos;s local storage or using our built-in &quot;Clear All
                  Data&quot; feature in the settings.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  6.2 Advertising Cookies
                </h3>
                <p className="text-foreground leading-relaxed">
                  Google AdSense sets cookies to serve personalized advertisements. These
                  cookies allow Google and its partners to:
                </p>
                <ul className="list-disc list-inside text-foreground leading-relaxed mt-2 space-y-1 ml-4">
                  <li>Remember your past visits to our site and other sites</li>
                  <li>Show you ads relevant to your interests</li>
                  <li>Measure the effectiveness of advertising campaigns</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  6.3 Opting Out of Ad Personalization
                </h3>
                <p className="text-foreground leading-relaxed">
                  You can opt out of personalized advertising in several ways:
                </p>
                <ul className="list-disc list-inside text-foreground leading-relaxed mt-2 space-y-1 ml-4">
                  <li>
                    Visit{' '}
                    <a
                      href="https://www.google.com/settings/ads"
                      className="text-primary hover:text-primary/80 underline"
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
                      className="text-primary hover:text-primary/80 underline"
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
            <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">
              7. Data Security
            </h2>
            <p className="text-foreground leading-relaxed mb-4">
              We take the security of your data seriously and implement appropriate
              measures to protect it:
            </p>
            <ul className="list-disc list-inside text-foreground leading-relaxed space-y-2 ml-4">
              <li>
                <strong className="text-foreground">HTTPS Encryption:</strong> All data
                transmitted between your browser and our service is encrypted using
                TLS/HTTPS.
              </li>
              <li>
                <strong className="text-foreground">Client-Side Token Storage:</strong>{' '}
                Your GitHub OAuth token is stored only in your browser&apos;s localStorage
                and is never sent to or stored on our servers.
              </li>
              <li>
                <strong className="text-foreground">Row-Level Security:</strong> Our cloud
                database enforces row-level security so only you can access your own data.
                Anonymous usage stores no personal information server-side.
              </li>
              <li>
                <strong className="text-foreground">OAuth Security:</strong> We use
                GitHub&apos;s secure OAuth 2.0 protocol for authentication. We never see
                or store your GitHub password.
              </li>
              <li>
                <strong className="text-foreground">Minimal Permissions:</strong> We
                request only the minimum GitHub OAuth scopes required for the service to
                function (public profile read access).
              </li>
            </ul>
            <p className="text-foreground leading-relaxed mt-4">
              However, no method of transmission over the internet or electronic storage
              is 100% secure. While we strive to use commercially acceptable means to
              protect your personal information, we cannot guarantee its absolute
              security.
            </p>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">
              8. Your Rights and Controls
            </h2>
            <p className="text-foreground leading-relaxed mb-4">
              You have full control over your data. Here is what you can do:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  8.1 Delete Local Data
                </h3>
                <p className="text-foreground leading-relaxed">
                  You can delete all locally stored data at any time by:
                </p>
                <ul className="list-disc list-inside text-foreground leading-relaxed mt-2 space-y-1 ml-4">
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
                <h3 className="text-lg font-medium text-foreground mb-2">
                  8.2 Revoke GitHub OAuth Access
                </h3>
                <p className="text-foreground leading-relaxed">
                  You can revoke our application&apos;s access to your GitHub account at
                  any time by visiting your{' '}
                  <a
                    href="https://github.com/settings/applications"
                    className="text-primary hover:text-primary/80 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub OAuth Application Settings
                  </a>{' '}
                  and revoking access for &quot;Pickssue&quot;. After revocation, you will
                  be logged out and no further API calls will be made on your behalf.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  8.3 Delete Synced Settings
                </h3>
                <p className="text-foreground leading-relaxed">
                  Your settings are stored in a secure cloud database tied to your
                  account. When you log out, your local data is cleared. To request
                  deletion of your cloud-stored settings, please contact us through our
                  GitHub Issues page.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  8.4 Data Portability
                </h3>
                <p className="text-foreground leading-relaxed">
                  Since your settings are stored in your own browser and optionally in
                  cloud storage, you already have full access to and ownership of your
                  data. You can view, export, or delete it directly without needing to
                  request it from us.
                </p>
              </div>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">
              9. Children&apos;s Privacy (COPPA)
            </h2>
            <p className="text-foreground leading-relaxed">
              Our service is not directed to children under the age of 13 (or 16 in the
              European Union). We do not knowingly collect personal information from
              children. If you are a parent or guardian and believe that your child has
              provided us with personal information, please contact us so we can take
              appropriate action.
            </p>
            <p className="text-foreground leading-relaxed mt-4">
              GitHub itself requires users to be at least 13 years old to create an
              account. Since our service requires a GitHub account for full functionality,
              this requirement inherently applies to our service as well.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">
              10. Changes to This Privacy Policy
            </h2>
            <p className="text-foreground leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in
              our practices, technology, legal requirements, or other factors. When we
              make changes, we will update the &quot;Last updated&quot; date at the top of
              this page.
            </p>
            <p className="text-foreground leading-relaxed mt-4">
              We encourage you to review this Privacy Policy periodically to stay informed
              about how we are protecting your information. Your continued use of the
              service after any changes to this Privacy Policy constitutes your acceptance
              of those changes.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">
              11. Contact Information
            </h2>
            <p className="text-foreground leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy
              Policy or our data practices, please contact us:
            </p>
            <div className="bg-card border border-border rounded-lg p-4 mt-4">
              <p className="text-foreground leading-relaxed">
                <strong className="text-foreground">Pickssue</strong>
                <br />
                GitHub Issues:{' '}
                <a
                  href="https://github.com/sukjuhong/pickssue/issues"
                  className="text-primary hover:text-primary/80 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://github.com/sukjuhong/pickssue/issues
                </a>
              </p>
            </div>
            <p className="text-foreground leading-relaxed mt-4">
              We will respond to privacy-related inquiries within a reasonable timeframe,
              generally within 30 days.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
