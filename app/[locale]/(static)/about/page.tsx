import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about contrifit - a platform that helps developers discover beginner-friendly GitHub issues and start their open source journey.',
};

export default function AboutPage() {
  return (
    <article className="text-gray-300">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6 font-[family-name:var(--font-mono)]">
          <span className="text-cyan-400">&gt;_</span> contrifit
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Your gateway to meaningful open source contributions. Discover beginner-friendly
          GitHub issues, track your favorite repositories, and take your first step into
          the world of open source development.
        </p>
        <div className="mt-8">
          <Link
            href="/issues"
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors text-lg"
          >
            Start Contributing
          </Link>
        </div>
      </section>

      {/* What is contrifit */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-3">
          What is contrifit?
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            contrifit is a free, open source tool designed to bridge the gap between
            developers who want to contribute to open source and the projects that need
            their help. Whether you are a student writing your first lines of code, a
            self-taught developer looking to build your portfolio, or an experienced
            engineer wanting to give back to the community, this platform is built for
            you.
          </p>
          <p>
            Every day, thousands of open source maintainers label issues as{' '}
            <code className="bg-[#161b22] text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">
              good first issue
            </code>
            ,{' '}
            <code className="bg-[#161b22] text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">
              help wanted
            </code>
            , or{' '}
            <code className="bg-[#161b22] text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">
              beginner friendly
            </code>{' '}
            — but finding those issues across dozens of repositories is time-consuming and
            frustrating. contrifit aggregates those opportunities in one place, so you can
            spend less time searching and more time building.
          </p>
          <p>
            The platform is entirely free to use. Sign in with your GitHub account to
            unlock features like cross-device synchronization, browser notifications for
            new issues, and personalized repository tracking. Or use it anonymously — no
            account required to browse curated open source opportunities.
          </p>
        </div>
      </section>

      {/* Key Features */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-3">
          Key Features
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">
              Repository Tracking
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Add any public GitHub repository to your personal tracking list. Willing to
              Contribute continuously monitors those repositories and surfaces new
              beginner-friendly issues as soon as maintainers create them. Never miss an
              opportunity to contribute to a project you care about.
            </p>
          </div>

          <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Smart Filtering</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Filter issues by programming language, difficulty level, custom labels, and
              maintainer responsiveness. If you are learning Python, focus on Python
              projects. If you prefer fast-response maintainers, filter by repositories
              where issues get reviewed quickly. Find exactly the contribution that fits
              your schedule and skill level.
            </p>
          </div>

          <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">
              Browser Notifications
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Enable browser notifications to get alerted when new beginner-friendly
              issues are opened in your tracked repositories. You can configure the
              notification frequency — get notified every 30 minutes, hourly, or at
              whatever cadence suits your workflow. Be the first to claim a great issue
              before others.
            </p>
          </div>

          <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">
              Cross-Device Cloud Sync
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your repository list and preferences automatically sync across all your
              devices via secure cloud storage. Start tracking a repository on your
              laptop, and it instantly appears on your phone or work computer. No separate
              account needed — your GitHub login is everything you need.
            </p>
          </div>

          <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">
              Maintainer Responsiveness Score
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              One of the most discouraging experiences for new contributors is submitting
              a pull request and receiving no response for weeks or months. Our maintainer
              responsiveness scoring helps you identify projects with engaged, active
              maintainers who will review your contribution, give feedback, and help you
              grow as a developer.
            </p>
          </div>

          <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">
              Recommended Issues
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Not sure where to start? Our curated recommendations surface high-quality
              beginner issues from popular, well-maintained open source projects across a
              wide range of technologies and languages. Get personalized suggestions based
              on the repositories you already track and the labels you prefer.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-3">
          How It Works
        </h2>
        <ol className="space-y-6">
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-1">
                Sign in with GitHub
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Connect your GitHub account to unlock the full feature set including
                cross-device sync, notifications, and personalized tracking. Signing in
                uses GitHub OAuth — we never store your password, and you can revoke
                access at any time from your GitHub settings.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-1">
                Add Repositories
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Paste a GitHub repository URL or type the owner and repository name to add
                it to your tracking list. You can add as many repositories as you want —
                from small personal projects to large frameworks like React, Vue, or
                Django. The app immediately fetches all open beginner-friendly issues.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-1">Browse Issues</h3>
              <p className="text-gray-400 leading-relaxed">
                Explore the aggregated list of beginner-friendly issues from all your
                tracked repositories. Use filters to narrow down by language, label, or
                maintainer responsiveness. Click any issue to open it directly on GitHub
                where you can read the full description, ask questions, and claim the
                issue.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-1">
                Start Contributing
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Fork the repository, create a branch, make your changes, and open a pull
                request. Many maintainers who label issues as beginner-friendly are happy
                to mentor new contributors through the process. Your first merged pull
                request is a milestone worth celebrating — and it gets easier every time.
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* Why Open Source */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-3">
          Why Contribute to Open Source?
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            Open source software powers the modern world. The tools you use to write code,
            deploy applications, browse the web, and run servers are largely built and
            maintained by volunteers who contribute their time and expertise freely. By
            contributing, you join a global community of millions of developers who share
            knowledge, build together, and make technology more accessible to everyone.
          </p>
          <p>
            Beyond the community impact, open source contributions offer concrete career
            benefits. Your pull requests become a public portfolio that demonstrates
            real-world coding skills far more convincingly than any resume bullet point.
            Recruiters and engineering managers increasingly look at GitHub profiles when
            evaluating candidates. A history of meaningful contributions signals that you
            can read unfamiliar codebases, communicate with a team, follow coding
            conventions, and ship working code.
          </p>
          <p>
            Contributing also accelerates your own learning in ways that personal projects
            cannot. Real production codebases expose you to architecture decisions,
            testing practices, code review culture, and documentation standards that are
            difficult to replicate alone. Getting your code reviewed by experienced
            maintainers is like having a free mentor who pushes your skills forward.
          </p>
          <p>
            The barrier to entry is lower than you might think. A good first contribution
            does not have to be a complex algorithm or a new feature. Fixing a typo in
            documentation, adding a test case, improving an error message, or updating a
            dependency are all valuable contributions that maintainers genuinely
            appreciate. Every project started somewhere, and the open source ecosystem
            grows one small pull request at a time.
          </p>
        </div>
      </section>

      {/* Open Source Project */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-3">
          contrifit is Open Source
        </h2>
        <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6 space-y-4">
          <p className="text-gray-300 leading-relaxed">
            We practice what we preach. contrifit is itself an open source project, built
            with Next.js 15, React 19, TypeScript, and TailwindCSS. The full source code
            is available on GitHub, and we actively welcome contributions from developers
            of all skill levels.
          </p>
          <p className="text-gray-300 leading-relaxed">
            If you find a bug, have a feature request, or want to improve the platform,
            open an issue or submit a pull request. The project itself is a great place to
            make your first open source contribution — and how fitting would that be?
          </p>
          <a
            href="https://github.com/sukjuhong/willing-to-contribute"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-100 px-5 py-2.5 rounded-md transition-colors text-sm font-medium"
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center bg-[#161b22] border border-cyan-500/20 rounded-xl p-12">
        <h2 className="text-3xl font-bold text-gray-100 mb-4">
          Ready to Make Your First Contribution?
        </h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed">
          Hundreds of open source projects are waiting for contributors like you. Add your
          favorite repositories and start browsing beginner-friendly issues today.
        </p>
        <Link
          href="/issues"
          className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-10 py-4 rounded-lg transition-colors text-lg"
        >
          Browse Issues Now
        </Link>
      </section>
    </article>
  );
}
