import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Make Your First Open Source Contribution',
  description:
    'A comprehensive guide for beginners on making your first open source contribution — from finding the right issue to getting your pull request merged.',
};

export default function GuidePage() {
  return (
    <article className="text-gray-300">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6 font-[family-name:var(--font-mono)]">
          <span className="text-cyan-400">&gt;_</span> Your First Contribution
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          A practical, step-by-step guide to making your first open source contribution —
          even if you have never done it before.
        </p>
        <div className="mt-8">
          <Link
            href="/issues"
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors text-lg"
          >
            Find an Issue to Start
          </Link>
        </div>
      </section>

      {/* Introduction */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-3">
          Introduction: Why Read This Guide?
        </h2>
        <div className="space-y-4 leading-relaxed">
          <p>
            Contributing to open source software can feel intimidating. You look at a
            popular project with thousands of files and commits, and it is hard to know
            where to begin. You worry that your code is not good enough, that you will
            break something, or that experienced maintainers will dismiss your work. These
            fears are completely normal — and they are also completely unfounded.
          </p>
          <p>
            The open source community is, by and large, a welcoming place that actively
            wants new contributors. Maintainers label issues as{' '}
            <code className="bg-[#161b22] text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">
              good first issue
            </code>{' '}
            specifically because they want people like you to pick them up. They write
            contributing guides, answer questions, and review pull requests from
            developers at every skill level — because every project depends on a healthy
            pipeline of new contributors.
          </p>
          <p>
            This guide walks you through every step of the process: understanding what
            open source is, setting up your tools, finding the right issue, writing code,
            and submitting a pull request that maintainers will love to review. By the
            end, you will have everything you need to make your first contribution — and
            the confidence to keep going.
          </p>
        </div>
      </section>

      {/* Understanding Open Source */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-3">
          Understanding Open Source
        </h2>
        <div className="space-y-4 leading-relaxed">
          <p>
            Open source software is software whose source code is publicly available for
            anyone to read, use, modify, and distribute. Unlike proprietary software that
            is developed behind closed doors, open source projects are built
            collaboratively in the open — often by volunteers scattered across the globe
            who have never met in person.
          </p>
          <p>
            Almost every piece of software you use daily depends on open source. The Linux
            kernel powers your Android phone and most web servers. The V8 JavaScript
            engine inside Chrome and Node.js is open source. React, Vue, Django,
            TensorFlow, PostgreSQL — all open source. When you contribute to these
            projects, you are improving the tools that millions of developers and billions
            of end users rely on.
          </p>
          <p>
            Open source projects use licenses to define the rules for using and
            distributing their code. Common licenses include the MIT License (very
            permissive — do almost anything), the Apache 2.0 License (permissive with
            patent protection), and the GPL (requires derivative work to also be open
            source). You do not need to be a lawyer to contribute, but it is worth reading
            a project&apos;s{' '}
            <code className="bg-[#161b22] text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">
              LICENSE
            </code>{' '}
            file so you understand how your contributions will be used.
          </p>
          <p>
            Most projects also have a{' '}
            <code className="bg-[#161b22] text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">
              CONTRIBUTING.md
            </code>{' '}
            file that explains their specific workflow — how to report bugs, the branching
            strategy, coding style requirements, and how pull requests are reviewed.
            Always read this file before you start. It will save you a lot of time and
            prevent avoidable mistakes.
          </p>
        </div>
      </section>

      {/* Setting Up Your Environment */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-3">
          Setting Up Your Environment
        </h2>
        <div className="space-y-4 leading-relaxed">
          <p>
            Before you write a single line of code, you need the right tools in place. The
            good news is that the setup is the same for virtually every open source
            project on GitHub, so you only have to do it once.
          </p>
          <p>
            <span className="text-cyan-400 font-semibold">Git</span> is the version
            control system that almost all open source projects use. It tracks every
            change to every file over time, allows multiple people to work on the same
            codebase simultaneously, and makes it easy to propose changes without
            affecting the main codebase. Install Git from{' '}
            <a
              href="https://git-scm.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              git-scm.com
            </a>{' '}
            and configure your name and email with{' '}
            <code className="bg-[#161b22] text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">
              git config --global
            </code>
            .
          </p>
          <p>
            <span className="text-cyan-400 font-semibold">GitHub</span> is the hosting
            platform where most open source projects live. Create a free account, and then
            learn two key concepts: <em>forking</em> and <em>cloning</em>. A{' '}
            <strong className="text-gray-100">fork</strong> is your personal copy of a
            repository on GitHub — it lives under your account and you have full write
            access to it. A <strong className="text-gray-100">clone</strong> is a local
            copy of a repository on your own computer. The typical workflow is: fork the
            project on GitHub, clone your fork to your machine, make changes locally, push
            them back to your fork, and then open a pull request to propose your changes
            to the original project.
          </p>
          <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6 space-y-2">
            <p className="text-sm font-semibold text-cyan-400">Quick Setup Checklist</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400 text-sm">
              <li>Install Git and configure your name/email</li>
              <li>Create a GitHub account and set up SSH keys</li>
              <li>Install a code editor (VS Code is a great choice)</li>
              <li>Familiarize yourself with basic terminal commands</li>
              <li>
                Learn the 5 most important Git commands: clone, add, commit, push, pull
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Finding the Right Issue */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-3">
          Finding the Right Issue
        </h2>
        <div className="space-y-4 leading-relaxed">
          <p>
            Choosing the right issue for your first contribution is more important than
            writing perfect code. A well-chosen issue sets you up for success — a
            poorly-chosen one leads to frustration. Here is how to find a good match.
          </p>
          <p>
            Start by looking for issues labeled{' '}
            <code className="bg-[#161b22] text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">
              good first issue
            </code>{' '}
            or{' '}
            <code className="bg-[#161b22] text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">
              help wanted
            </code>
            . These labels are the maintainer&apos;s signal that the issue is
            well-defined, self-contained, and suitable for someone who is new to the
            codebase. That is exactly what you want for your first contribution.
          </p>
          <p>
            When you find a candidate issue, read it carefully. A good first issue will
            clearly describe what the problem is, ideally explain where in the codebase to
            look, and not require deep knowledge of the entire project. If the issue is
            vague or references a dozen interconnected systems, skip it and find something
            simpler.
          </p>
          <p>
            Check the issue&apos;s activity. Is it recent? Has the maintainer responded to
            comments? Are there any open pull requests already claiming the issue? Picking
            an issue that is already in progress or one where the maintainer has gone
            silent for months is a recipe for wasted effort.
          </p>
          <p>
            Look at the project&apos;s overall responsiveness. Check the{' '}
            <strong className="text-gray-100">Pulse</strong> tab on GitHub, look at recent
            pull requests to see how long they took to get reviewed, and check when the
            last commit was made. A project with an active maintainer who reviews PRs
            within a week is dramatically more rewarding for a first-time contributor than
            one where PRs sit open for months.
          </p>
          <p>
            Tools like{' '}
            <Link href="/issues" className="text-cyan-400 hover:text-cyan-300 underline">
              contrifit
            </Link>{' '}
            make this process much faster by aggregating beginner-friendly issues from all
            your tracked repositories and surfacing maintainer responsiveness data, so you
            can spend your time contributing rather than searching.
          </p>
        </div>
      </section>

      {/* Making Your First Contribution */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-3">
          Making Your First Contribution
        </h2>
        <p className="mb-6 leading-relaxed">
          Once you have found the right issue, follow this proven workflow. It is the same
          process used by experienced contributors on projects of all sizes.
        </p>
        <ol className="space-y-6">
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-1">
                Comment on the Issue
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Before writing any code, leave a comment on the issue saying you would
                like to work on it. This prevents duplicate effort, gives the maintainer a
                chance to clarify requirements, and starts a conversation. Something
                simple like &quot;Hi, I would like to work on this. Can you provide any
                additional context?&quot; is perfect.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-1">
                Fork the Repository
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Click the <strong className="text-gray-200">Fork</strong> button on the
                GitHub repository page. This creates a copy of the entire repository under
                your GitHub account. You now have full write access to this copy and can
                experiment freely without affecting the original project.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-1">
                Clone Your Fork Locally
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Run{' '}
                <code className="bg-[#161b22] text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">
                  git clone https://github.com/YOUR-USERNAME/REPO-NAME.git
                </code>{' '}
                to download the repository to your computer. Then run the project locally
                following the instructions in the README to confirm everything works
                before you change anything.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-1">
                Create a New Branch
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Never work directly on the{' '}
                <code className="bg-[#161b22] text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">
                  main
                </code>{' '}
                branch. Create a descriptive branch for your change:{' '}
                <code className="bg-[#161b22] text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">
                  git checkout -b fix/typo-in-readme
                </code>{' '}
                or{' '}
                <code className="bg-[#161b22] text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">
                  git checkout -b feat/add-dark-mode
                </code>
                . This keeps your work isolated and makes it easy to manage multiple
                contributions simultaneously.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              5
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-1">
                Write Your Code
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Make the smallest change that solves the problem. Read the existing code
                carefully and match the style you see — indentation, naming conventions,
                comment style. Run the existing test suite to confirm nothing is broken.
                If the project has a linter, run it before committing.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              6
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-1">
                Commit with a Clear Message
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Write a commit message that explains what you changed and why, not just
                what files you touched. Many projects follow the{' '}
                <a
                  href="https://www.conventionalcommits.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  Conventional Commits
                </a>{' '}
                format:{' '}
                <code className="bg-[#161b22] text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">
                  fix: correct off-by-one error in pagination
                </code>
                . Check the project&apos;s existing commits for the expected format.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              7
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-1">
                Push and Open a Pull Request
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Push your branch to your fork with{' '}
                <code className="bg-[#161b22] text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">
                  git push origin your-branch-name
                </code>
                , then go to the original repository on GitHub. You will see a banner
                prompting you to open a pull request. Click it, fill in the PR template,
                and submit.
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* Writing a Good Pull Request */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-3">
          Writing a Good Pull Request
        </h2>
        <div className="space-y-4 leading-relaxed">
          <p>
            The difference between a pull request that gets merged quickly and one that
            lingers unreviewed often comes down to how it is written, not the code itself.
            A well-written PR makes the reviewer&apos;s job easy and demonstrates that you
            respect their time.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                Write a Clear Title
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                The title should summarize what the PR does in one sentence.{' '}
                <span className="text-green-400">
                  &quot;Fix: resolve null pointer in user authentication flow&quot;
                </span>{' '}
                is much better than{' '}
                <span className="text-red-400">&quot;fixed bug&quot;</span>. Include the
                issue number if relevant:{' '}
                <code className="bg-gray-900 text-cyan-400 px-1 py-0.5 rounded text-xs font-mono">
                  Fixes #123
                </code>
                .
              </p>
            </div>

            <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                Describe the Problem
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Explain what problem you are solving and why your solution is correct.
                Link to the issue. If the change has any visual element, attach a
                screenshot. The reviewer should understand your intent without having to
                read every line of your diff.
              </p>
            </div>

            <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">Keep It Small</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Small pull requests get reviewed faster. If you notice other issues while
                working, open separate PRs for them. A PR that changes 50 lines in one
                logical area will be reviewed in minutes. A PR that changes 500 lines
                across twelve files will sit in the queue for days.
              </p>
            </div>

            <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                Respond to Reviews
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                When a reviewer leaves comments, respond to every one — even if just to
                say &quot;done&quot; or &quot;I see your point, but here is why I did it
                this way.&quot; Implement requested changes promptly. Push the updated
                commits and leave a note saying the review feedback has been addressed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Common Mistakes */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-3">
          Common Mistakes to Avoid
        </h2>
        <div className="space-y-4 leading-relaxed">
          <p>
            Most first-time contributors make the same handful of mistakes. Knowing them
            in advance will save you from the frustration of having a PR rejected for
            avoidable reasons.
          </p>
          <ul className="space-y-4">
            <li className="bg-[#161b22] border border-gray-700 rounded-lg p-4">
              <h3 className="text-gray-100 font-semibold mb-1">
                Not reading CONTRIBUTING.md
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Every project has its own contribution workflow, coding style, and testing
                requirements. Skipping this file is the single most common reason for a PR
                to be immediately closed or rejected. Read it. Every word.
              </p>
            </li>
            <li className="bg-[#161b22] border border-gray-700 rounded-lg p-4">
              <h3 className="text-gray-100 font-semibold mb-1">
                Opening a PR without discussing the approach first
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                For anything beyond trivial fixes, comment on the issue first and describe
                your planned approach. The maintainer might tell you the issue is already
                being handled, suggest a different solution, or provide context that saves
                you hours of work.
              </p>
            </li>
            <li className="bg-[#161b22] border border-gray-700 rounded-lg p-4">
              <h3 className="text-gray-100 font-semibold mb-1">
                Changing unrelated code
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Do not fix formatting issues, rename variables, or &quot;clean up&quot;
                code that is not directly related to the issue you are solving. These
                changes make your diff larger, harder to review, and create merge
                conflicts with other open PRs. One PR, one purpose.
              </p>
            </li>
            <li className="bg-[#161b22] border border-gray-700 rounded-lg p-4">
              <h3 className="text-gray-100 font-semibold mb-1">
                Not running tests before submitting
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Always run the full test suite before opening your PR. A PR that breaks
                existing tests signals to reviewers that you did not verify your work. If
                CI runs automatically on your PR and it fails, fix it before asking for a
                review.
              </p>
            </li>
            <li className="bg-[#161b22] border border-gray-700 rounded-lg p-4">
              <h3 className="text-gray-100 font-semibold mb-1">
                Getting discouraged by feedback
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Code review comments are not personal criticism. Every experienced
                developer gets feedback that requires changes. Treat review comments as
                free mentoring from someone who knows the codebase deeply. Thank reviewers
                for their time, ask questions if something is unclear, and iterate.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* After Your First PR */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-3">
          After Your First PR
        </h2>
        <div className="space-y-4 leading-relaxed">
          <p>
            Getting your first pull request merged is a genuine milestone. Take a moment
            to celebrate it — you have joined the global community of open source
            contributors and have your name in the commit history of a real software
            project.
          </p>
          <p>
            Now look for your next opportunity. Each contribution teaches you more about
            the codebase, the project&apos;s conventions, and the team&apos;s working
            style. Your second contribution will be faster than your first. Your tenth
            will feel natural. Over time, you may find yourself answering questions from
            other new contributors, reviewing PRs, and eventually becoming a trusted
            member of the community.
          </p>
          <p>
            Beyond code, there are many ways to deepen your involvement. Triage incoming
            issues by reproducing bugs and asking for more information. Write or improve
            documentation — every project needs it, and maintainers value it enormously.
            Help answer questions in the project&apos;s Discord, Slack, or GitHub
            Discussions. Share the project on social media or write a blog post about your
            experience. These non-code contributions are just as valuable as code
            contributions, and they are often the fastest path to building relationships
            with maintainers.
          </p>
          <p>
            If you become deeply invested in a project, you can eventually be invited as a
            collaborator with direct commit access. Some contributors go on to become core
            maintainers of projects used by millions of developers. Every maintainer of
            every major open source project started exactly where you are now — with a
            single, carefully chosen first issue.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center bg-[#161b22] border border-cyan-500/20 rounded-xl p-12">
        <h2 className="text-3xl font-bold text-gray-100 mb-4">
          Ready to Find Your First Issue?
        </h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed">
          Use contrifit to browse beginner-friendly issues from your favorite
          repositories — all in one place, with maintainer responsiveness data to help you
          pick the right project.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/issues"
            className="inline-flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-10 py-4 rounded-lg transition-colors text-lg"
          >
            Browse Issues
          </Link>
          <Link
            href="/faq"
            className="inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold px-10 py-4 rounded-lg transition-colors text-lg"
          >
            Read the FAQ
          </Link>
        </div>
      </section>
    </article>
  );
}
