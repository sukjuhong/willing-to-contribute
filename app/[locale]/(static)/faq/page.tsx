import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Answers to common questions about Willing to Contribute and open source contribution — from getting started to advancing your career.',
};

type FAQItem = {
  question: string;
  answer: React.ReactNode;
};

const serviceQuestions: FAQItem[] = [
  {
    question: 'What is Willing to Contribute?',
    answer: (
      <>
        Willing to Contribute is a free tool that helps developers discover
        beginner-friendly GitHub issues across multiple repositories in one place. You add
        the repositories you care about, and the platform surfaces open issues labeled{' '}
        <code className="bg-gray-900 text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">
          good first issue
        </code>
        ,{' '}
        <code className="bg-gray-900 text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">
          help wanted
        </code>
        , and similar tags — so you spend time contributing, not searching.{' '}
        <Link href="/about" className="text-cyan-400 hover:text-cyan-300 underline">
          Learn more on the About page.
        </Link>
      </>
    ),
  },
  {
    question: 'Is Willing to Contribute free to use?',
    answer:
      'Yes, completely free. There are no paid plans, no premium tiers, and no hidden costs. The platform is itself an open source project, so the code is publicly available for anyone to inspect, fork, or self-host.',
  },
  {
    question: 'Do I need to log in with GitHub to use the app?',
    answer: (
      <>
        No. You can browse issues without signing in. Anonymous usage is fully supported,
        though you will be subject to GitHub API rate limits, which means the number of
        repositories you can track at once is lower. Signing in with GitHub unlocks{' '}
        <Link href="/about" className="text-cyan-400 hover:text-cyan-300 underline">
          additional features
        </Link>{' '}
        including cross-device sync, browser notifications, and a higher API rate limit.
      </>
    ),
  },
  {
    question: 'What data does Willing to Contribute collect?',
    answer:
      "Willing to Contribute does not operate a database of user data. When you sign in with GitHub, your access token is stored only in your browser's localStorage. Your repository list and preferences are saved either in localStorage (anonymous mode) or in a private GitHub Gist under your own account (authenticated mode). The server never stores your personal information.",
  },
  {
    question: 'How does cross-device settings sync work?',
    answer:
      'When you are signed in with GitHub, your repository list and preferences are automatically saved to a private GitHub Gist. This means your settings are stored in your own GitHub account, not on our servers. When you open the app on another device and sign in, your settings are loaded from that Gist. If there is a conflict between local and remote settings, the app will prompt you to choose which version to keep.',
  },
  {
    question: 'How do browser notifications work?',
    answer:
      'If you enable browser notifications in the Settings panel, the app will periodically check your tracked repositories for new beginner-friendly issues and send a browser notification when it finds any. You can configure how often the check runs — from every 30 minutes to several hours. Notifications require browser permission and only work while the app is open in a browser tab.',
  },
];

const contributionQuestions: FAQItem[] = [
  {
    question: 'Can beginners with no professional experience contribute to open source?',
    answer: (
      <>
        Absolutely. Many of the most welcoming open source projects actively seek
        contributors who are just learning to code. A first contribution does not need to
        be a complex new feature — fixing a typo in documentation, improving an error
        message, or adding a test case are all genuinely valuable. Read our{' '}
        <Link href="/guide" className="text-cyan-400 hover:text-cyan-300 underline">
          beginner&apos;s guide
        </Link>{' '}
        to learn the full process step by step.
      </>
    ),
  },
  {
    question: 'How do I choose which project to contribute to?',
    answer:
      "Start with software you already use and care about. If you use a tool every day, you understand its purpose, which makes it easier to judge whether a change is correct and valuable. Also consider the project's maintainer responsiveness — look at how quickly recent pull requests were reviewed. A project with engaged maintainers is much more rewarding for new contributors than one where PRs sit open for months.",
  },
  {
    question: 'What should I do if my pull request is ignored?',
    answer:
      "Wait at least one to two weeks before following up, since maintainers are often volunteers managing their time across many responsibilities. If there is still no response after a polite follow-up comment, it is reasonable to move on to another project. Not every PR gets merged — sometimes the project is in maintenance mode, the issue was already resolved differently, or the approach does not fit the project's direction. It is not a reflection of your skill.",
  },
  {
    question: "Can I contribute to open source if my English isn't strong?",
    answer:
      'Yes. Most open source communication happens in writing, which gives you time to look up words, use translation tools, and compose your thoughts carefully. Maintainers are generally patient with non-native speakers. Clear intent matters far more than perfect grammar. Code itself is a universal language — a well-written patch often speaks louder than any comment.',
  },
  {
    question: 'Does open source contribution help with getting a job?',
    answer:
      'Yes, significantly. Open source contributions create a public, verifiable portfolio of real-world work that goes far beyond what a resume can convey. Recruiters and engineering managers look at GitHub profiles when evaluating candidates. A history of merged pull requests demonstrates that you can read unfamiliar codebases, communicate with a team, follow conventions, and ship working code — skills that are difficult to prove any other way.',
  },
  {
    question: 'Are there ways to contribute to open source without writing code?',
    answer: (
      <>
        Many. Writing and improving documentation is one of the highest-impact
        contributions you can make — nearly every project needs it. You can also triage
        issues (reproducing bugs and asking for more information), translate content into
        other languages, design UI/UX improvements, answer questions in community forums
        or GitHub Discussions, or simply star and share projects you find valuable. The
        open source ecosystem depends on all of these contributions, not just code.
      </>
    ),
  },
];

function FAQSection({ title, items }: { title: string; items: FAQItem[] }) {
  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-3">
        {title}
      </h2>
      <div className="space-y-4">
        {items.map(item => (
          <div
            key={item.question}
            className="bg-[#161b22] border border-gray-700 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">{item.question}</h3>
            <p className="text-gray-300 leading-relaxed text-sm">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function FAQPage() {
  return (
    <article className="text-gray-300">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6 font-[family-name:var(--font-mono)]">
          <span className="text-cyan-400">&gt;_</span> FAQ
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Answers to the most common questions about Willing to Contribute and open source
          contribution in general.
        </p>
      </section>

      <FAQSection title="About the Service" items={serviceQuestions} />

      <FAQSection title="About Open Source Contribution" items={contributionQuestions} />

      {/* CTA */}
      <section className="text-center bg-[#161b22] border border-cyan-500/20 rounded-xl p-12">
        <h2 className="text-3xl font-bold text-gray-100 mb-4">Still Have Questions?</h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed">
          Check out the full beginner&apos;s guide for a step-by-step walkthrough, or head
          straight to the issues page to start exploring open source opportunities.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/guide"
            className="inline-flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-10 py-4 rounded-lg transition-colors text-lg"
          >
            Read the Guide
          </Link>
          <Link
            href="/issues"
            className="inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold px-10 py-4 rounded-lg transition-colors text-lg"
          >
            Browse Issues
          </Link>
        </div>
      </section>
    </article>
  );
}
