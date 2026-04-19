import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/app/components/Footer';

export const metadata: Metadata = {
  title: 'Pickssue - Personalized Open Source Contribution Curator',
  description:
    'A personalized open-source contribution curator that analyzes your GitHub activity to recommend the best issues for you.',
  alternates: {
    canonical: 'https://pickssue.dev',
  },
};

const FEATURES = [
  {
    title: 'Repository Tracking',
    description:
      'Add any public GitHub repository to your personal list. The app continuously monitors those projects and surfaces new beginner-friendly issues the moment maintainers create them. Never miss a chance to contribute to a project you care about.',
    icon: '📦',
  },
  {
    title: 'Smart Filtering',
    description:
      'Filter issues by label, programming language, or custom keywords. Whether you are looking for documentation fixes, bug reports, or new feature work, you can narrow the list to exactly the kind of contribution that fits your current skill level.',
    icon: '🔍',
  },
  {
    title: 'Browser Notifications',
    description:
      'Enable browser notifications and get alerted when new issues appear in your tracked repositories. Configure the notification frequency — every 30 minutes, hourly, or whatever cadence suits your workflow. Be first to claim a great issue.',
    icon: '🔔',
  },
  {
    title: 'Cross-Device Sync',
    description:
      'Your repository list and preferences sync across all devices via cloud sync. Start tracking a repo on your laptop and it instantly appears on your phone or work computer. No separate account needed — your GitHub login is enough.',
    icon: '🔄',
  },
];

const STEPS = [
  {
    number: 1,
    title: 'Browse or Sign In',
    description:
      'Use the app anonymously right away, or sign in with GitHub to unlock cross-device sync, browser notifications, and personalized repository tracking. OAuth only — we never touch your password.',
  },
  {
    number: 2,
    title: 'Add Repositories',
    description:
      'Paste a GitHub URL or type an owner/repo name to add it to your tracking list. Add as many as you want — from small hobby projects to large frameworks like React, Vue, or Django.',
  },
  {
    number: 3,
    title: 'Browse Issues',
    description:
      'Explore all beginner-friendly issues aggregated from your tracked repositories in one clean dashboard. Apply filters to find the right issue, then click through to GitHub to claim it.',
  },
  {
    number: 4,
    title: 'Open a Pull Request',
    description:
      'Fork, branch, code, and submit. Many maintainers who label issues as beginner-friendly are happy to mentor you through the process. Your first merged pull request is a milestone worth celebrating.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      {/* Navigation */}
      <header className="bg-card border-b border-border py-4 px-6 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            aria-label="Pickssue"
          >
            <Image
              src="/logo.png"
              alt="Pickssue logo"
              width={32}
              height={32}
              priority
              className="dark:invert"
            />
            <span className="text-2xl font-bold text-foreground font-[family-name:var(--font-mono)]">
              Pickssue
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/about"
              className="text-muted-foreground hover:text-primary transition-colors text-sm hidden sm:inline"
            >
              About
            </Link>
            <Link
              href="/issues"
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Browse Issues
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="inline-block bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-xs px-3 py-1 rounded-full mb-6">
            BETA — free &amp; open source
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight font-[family-name:var(--font-mono)]">
            Your Gateway to <span className="text-primary">Open Source</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover beginner-friendly GitHub issues across all your favorite repositories
            in one place. Stop searching, start contributing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/issues"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-lg transition-colors text-lg"
            >
              Browse Issues
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 bg-transparent border border-border hover:border-primary text-foreground hover:text-primary font-semibold px-8 py-3 rounded-lg transition-colors text-lg"
            >
              Learn More
            </Link>
          </div>
          {/* Stats bar */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">100%</p>
              <p className="text-muted-foreground text-sm mt-1">Free to Use</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">Opt-In</p>
              <p className="text-muted-foreground text-sm mt-1">Cloud Sync</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">Open</p>
              <p className="text-muted-foreground text-sm mt-1">Source Code</p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-background border-y border-border py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Everything You Need to Start Contributing
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Pickssue bundles the tools that remove the friction between wanting to
                contribute and actually opening your first pull request.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map(feature => (
                <div
                  key={feature.title}
                  className="bg-card border border-border rounded-xl p-6 hover:border-primary/40 transition-colors"
                >
                  <div className="text-3xl mb-4" aria-hidden="true">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              From zero to merged pull request in four simple steps.
            </p>
          </div>
          <ol className="max-w-3xl mx-auto space-y-8">
            {STEPS.map(step => (
              <li key={step.number} className="flex gap-5">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Why Open Source */}
        <section className="bg-card border-y border-border py-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
              Why Contribute to Open Source?
            </h2>
            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <p>
                Open source software powers the modern world. The frameworks, libraries,
                and tools you rely on every day are largely built and maintained by
                volunteer developers who share their work freely. By contributing, you
                join a global community of millions who build together and make technology
                more accessible for everyone.
              </p>
              <p>
                Beyond community impact, open source contributions create a public
                portfolio that demonstrates real-world skills more convincingly than any
                resume bullet point. Your pull requests are living proof that you can read
                unfamiliar codebases, communicate with a team, and ship working code — all
                qualities that engineering managers and recruiters actively look for.
              </p>
              <p>
                Contributing also accelerates learning in ways that personal projects
                cannot. Production codebases expose you to architectural decisions,
                testing practices, code review culture, and documentation standards that
                are difficult to replicate alone. Getting your code reviewed by
                experienced maintainers is like having a free mentor who pushes your
                skills forward every single session.
              </p>
              <p>
                The barrier to entry is lower than you might think. A good first
                contribution does not have to be a complex algorithm or a sweeping new
                feature. Fixing a typo in documentation, adding a missing test, improving
                an error message, or updating a dependency are all genuine contributions
                that maintainers appreciate. Every project started somewhere, and the open
                source ecosystem grows one small pull request at a time.
              </p>
            </div>
          </div>
        </section>

        {/* Open Source Project callout */}
        <section className="container mx-auto px-4 py-20 max-w-3xl">
          <div className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Pickssue is Itself Open Source
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
              We practice what we preach. The full source code is available on GitHub and
              we actively welcome contributions from developers of all skill levels. Found
              a bug? Have a feature idea? This project is a great place to make your very
              first open source contribution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <a
                href="https://github.com/sukjuhong/pickssue"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/80 text-foreground px-6 py-2.5 rounded-lg transition-colors text-sm font-medium"
              >
                View on GitHub
              </a>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 text-primary hover:text-primary/80 underline underline-offset-4 text-sm font-medium transition-colors"
              >
                Learn more about the project
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 pb-24">
          <div className="bg-card border border-primary/20 rounded-2xl p-12 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ready to Make Your First Contribution?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
              Hundreds of open source projects are looking for contributors like you right
              now. Add your favorite repositories and start browsing beginner-friendly
              issues today — no account required.
            </p>
            <Link
              href="/issues"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-10 py-4 rounded-xl transition-colors text-lg"
            >
              Browse Issues Now
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
