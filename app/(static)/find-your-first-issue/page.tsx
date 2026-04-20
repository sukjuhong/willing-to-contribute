import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import QuizClient from './QuizClient';

export const metadata: Metadata = {
  title: 'Find Your First Open Source Issue',
  description:
    'Answer 3 quick questions and get personalized beginner-friendly GitHub issues matched to your language, experience level, and interests.',
  openGraph: {
    title: 'Find Your First Open Source Issue | Pickssue',
    description:
      'Answer 3 quick questions and get personalized beginner-friendly GitHub issues matched to your language, experience level, and interests.',
    url: '/find-your-first-issue',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Find Your First Open Source Issue',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Your First Open Source Issue | Pickssue',
    description:
      'Answer 3 quick questions and get personalized beginner-friendly GitHub issues matched to your language, experience level, and interests.',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I find my first open source issue to work on?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Start by choosing a programming language you know, then look for issues labeled "good first issue" or "help wanted" in popular repositories. Pickssue helps you filter these by language, experience level, and type of contribution — documentation, bug fixes, features, or UI improvements.',
      },
    },
    {
      '@type': 'Question',
      name: 'What makes a good first open source contribution?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A good first contribution is well-scoped, clearly described, and in a project with responsive maintainers. Documentation fixes, small bug fixes with clear reproduction steps, and issues explicitly labeled "good first issue" are ideal starting points. The key is picking something achievable so you build momentum.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to be an expert to contribute to open source?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Many open source projects actively seek beginners. A first contribution does not need to be a complex new feature — fixing a typo, improving an error message, or adding a test case are all genuinely valuable. Projects labeled "beginner friendly" welcome contributors at all skill levels.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does Pickssue help find beginner-friendly issues?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pickssue searches GitHub for issues labeled "good first issue" across popular repositories, then scores them by maintainer responsiveness, issue quality, and community interest. You can filter by programming language, sort by relevance, and bookmark issues to track their status.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a "good first issue" label on GitHub?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The "good first issue" label is applied by project maintainers to flag issues that are suitable for new contributors. These issues are typically well-documented, relatively small in scope, and have a clear path to resolution. They are the recommended entry point for anyone making their first open source contribution.',
      },
    },
  ],
};

export default function FindYourFirstIssuePage() {
  return (
    <article className="text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-[family-name:var(--font-mono)]">
          Find Your First <span className="text-primary">Open Source Issue</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Answer three quick questions and get a personalized list of beginner-friendly
          GitHub issues matched to your language, experience, and interests.
        </p>
      </section>

      {/* Why first contributions are hard */}
      <section className="mb-10 bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-foreground mb-3">
          Why is finding your first issue so difficult?
        </h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            GitHub hosts millions of open source repositories, each with hundreds of
            issues. The signal-to-noise ratio is overwhelming for new contributors. Most
            issues assume deep context about the codebase, require specific expertise, or
            have already been claimed by someone else.
          </p>
          <p>
            Pickssue solves this by filtering for issues explicitly labeled{' '}
            <code className="bg-background text-primary px-1.5 py-0.5 rounded text-xs font-mono">
              good first issue
            </code>{' '}
            in well-maintained repositories, scoring them by maintainer responsiveness and
            issue quality, and matching them to your programming language and interests.
          </p>
        </div>
      </section>

      {/* Quiz */}
      <Suspense
        fallback={
          <div className="mt-12 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-lg bg-card border border-border animate-pulse"
              />
            ))}
          </div>
        }
      >
        <QuizClient />
      </Suspense>

      {/* How it works */}
      <section className="mt-16 mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-3">
          How the quiz works
        </h2>
        <ol className="space-y-5">
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-sm border border-primary/30">
              1
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Choose your language</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Select the programming language you know best. We search GitHub for active
                repositories in that language with open beginner-friendly issues.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-sm border border-primary/30">
              2
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Tell us your experience level
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Whether you have never contributed before or have a few pull requests
                under your belt, we calibrate recommendations to your comfort level.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-sm border border-primary/30">
              3
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Pick your area of interest
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Documentation, bug fixes, new features, or UI improvements — each type
                requires different skills and rewards different strengths.
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-3">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold text-primary mb-2">
              What makes a good first open source contribution?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A good first contribution is well-scoped, clearly described, and in a
              project with responsive maintainers. Documentation fixes, small bug fixes
              with clear reproduction steps, and issues explicitly labeled{' '}
              <code className="bg-background text-primary px-1 py-0.5 rounded text-xs font-mono">
                good first issue
              </code>{' '}
              are ideal starting points. The key is picking something achievable so you
              build momentum.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold text-primary mb-2">
              Do I need to be an expert to contribute to open source?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No. Many open source projects actively seek beginners. A first contribution
              does not need to be a complex new feature — fixing a typo, improving an
              error message, or adding a test case are all genuinely valuable.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold text-primary mb-2">
              How does Pickssue score issue quality?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Each issue is scored on body length and clarity, number of comments
              (indicating community activity), assignee status, and the presence of
              beginner-friendly labels. Maintainer responsiveness is scored separately
              based on how quickly the project team responds to and merges pull requests.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold text-primary mb-2">
              Can I share my quiz results with others?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Yes. After completing the quiz, use the Share button to copy a link that
              encodes your language, level, and interest as URL parameters. Anyone with
              the link will see the same set of recommended issues.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold text-primary mb-2">
              What is a &ldquo;good first issue&rdquo; label on GitHub?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The{' '}
              <code className="bg-background text-primary px-1 py-0.5 rounded text-xs font-mono">
                good first issue
              </code>{' '}
              label is applied by project maintainers to flag issues suitable for new
              contributors. These issues are typically well-documented, relatively small
              in scope, and have a clear path to resolution.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center bg-card border border-primary/20 rounded-xl p-10">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Ready to Make Your First Contribution?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed text-sm">
          Browse the full recommended issues feed — personalized to your GitHub activity
          after you sign in.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/issues"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Browse All Issues
          </Link>
          <Link
            href="/guide"
            className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/80 text-foreground font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Read the Contribution Guide
          </Link>
        </div>
      </section>
    </article>
  );
}
