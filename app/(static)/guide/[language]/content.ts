export type LanguageSlug = 'javascript' | 'python' | 'go' | 'rust' | 'java';

export interface RepoExample {
  name: string;
  url: string;
  description: string;
}

export interface GuideSection {
  heading: string;
  paragraphs: string[];
}

export interface LanguageGuide {
  slug: LanguageSlug;
  displayName: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  whySection: GuideSection;
  pickingIssuesSection: GuideSection;
  repos: RepoExample[];
  issueTypes: string[];
  ctaLabel: string;
}

const guides: Record<LanguageSlug, LanguageGuide> = {
  javascript: {
    slug: 'javascript',
    displayName: 'JavaScript / TypeScript',
    tagline:
      'The language of the web — and one of the best ecosystems to start contributing to.',
    metaTitle: 'JavaScript & TypeScript Open Source Contribution Guide for Beginners',
    metaDescription:
      'A practical guide to making your first open source contribution in JavaScript or TypeScript — find good first issues in React, Next.js, ESLint, and more.',
    whySection: {
      heading: 'Why JavaScript / TypeScript Is Great for First Contributors',
      paragraphs: [
        'JavaScript is the most widely used programming language in the world, which means the ecosystem is enormous. Whether you are interested in front-end frameworks, build tools, testing libraries, or server-side Node.js projects, there is a JavaScript or TypeScript project for every interest and skill level. That breadth translates directly into opportunity: there are more open issues, more maintainers actively triaging them, and more beginner-friendly repositories than in almost any other ecosystem.',
        'TypeScript has become the dominant choice for large-scale JavaScript projects, adding static types that catch mistakes early and make large codebases navigable. If you are comfortable with JavaScript, picking up TypeScript for open source contributions is one of the most effective skill investments you can make. Many major projects — including VS Code, Next.js, and Angular — are written in TypeScript, and their issue trackers are filled with well-defined beginner tasks.',
        'The JavaScript community has also developed mature conventions around contribution: detailed CONTRIBUTING.md files, automated CI pipelines, and review cultures that value clear communication. As a first-time contributor, you will find that most maintainers are patient, provide actionable feedback, and will merge well-crafted PRs quickly.',
      ],
    },
    pickingIssuesSection: {
      heading: 'How to Pick a Good First Issue in JavaScript / TypeScript',
      paragraphs: [
        'Look for issues labeled "good first issue" combined with "documentation", "bug", or "chore" — these tend to require minimal knowledge of the entire codebase. Fixing a typo in docs, improving an error message, or adding a missing test are all excellent first contributions that maintainers genuinely appreciate.',
        "Read the repository's CONTRIBUTING.md carefully. JavaScript projects often require you to run a specific Node.js version (use nvm or fnm), install dependencies with a particular package manager (npm, yarn, or pnpm), and run a lint or type-check step before committing. Skipping these steps is the most common reason for a first PR to fail CI.",
        'For TypeScript projects, look at issues tagged "type" or "types" — adding or improving type definitions is a high-value contribution that requires only local TypeScript knowledge and no deep understanding of the runtime logic.',
      ],
    },
    repos: [
      {
        name: 'facebook/react',
        url: 'https://github.com/facebook/react',
        description:
          'The UI library powering millions of applications. Documentation improvements and test additions are classic good-first-issue targets.',
      },
      {
        name: 'eslint/eslint',
        url: 'https://github.com/eslint/eslint',
        description:
          'The standard JavaScript linter. Rule documentation and small bug fixes are regularly labeled for new contributors.',
      },
      {
        name: 'vercel/next.js',
        url: 'https://github.com/vercel/next.js',
        description:
          'The most popular React framework. Example improvements, documentation clarifications, and small bug fixes are great entry points.',
      },
      {
        name: 'prettier/prettier',
        url: 'https://github.com/prettier/prettier',
        description:
          'The opinionated code formatter. Language support edge cases and option documentation are common beginner targets.',
      },
    ],
    issueTypes: [
      'Documentation corrections and additions',
      'Adding or improving TypeScript type definitions',
      'Writing missing unit or integration tests',
      'Fixing small bugs with a clear reproduction step',
      'Improving error messages to be more descriptive',
      'Updating dependencies and resolving deprecation warnings',
    ],
    ctaLabel: 'Browse JavaScript Issues on Pickssue',
  },

  python: {
    slug: 'python',
    displayName: 'Python',
    tagline:
      'Readable, versatile, and backed by one of the friendliest open source communities.',
    metaTitle: 'Python Open Source Contribution Guide for Beginners',
    metaDescription:
      'Learn how to make your first open source contribution in Python — from finding good first issues in Flask, pandas, and requests to submitting your first pull request.',
    whySection: {
      heading: 'Why Python Is a Fantastic Starting Point for Open Source',
      paragraphs: [
        "Python's emphasis on readability makes it uniquely approachable for newcomers to open source. When you read an unfamiliar Python codebase, you can usually understand what the code does without hours of context-gathering. That lower barrier to comprehension means you can start adding value faster than in more complex languages, and you can focus your energy on understanding the project's domain rather than fighting syntax.",
        'The Python ecosystem spans an enormous range of domains — web frameworks (Django, Flask, FastAPI), scientific computing (NumPy, pandas, SciPy), machine learning (PyTorch, scikit-learn), developer tools (pip, black, mypy), and command-line utilities. No matter what you are interested in building professionally, there is a Python open source project that aligns with your goals and already has a beginner-friendly issue queue.',
        'Python\'s community has built strong cultural norms around mentorship and inclusion. Projects like CPython itself maintain a dedicated "easy" label for newcomers, and the PSF\'s community guidelines are explicitly welcoming. Many Python maintainers have been contributing to open source for decades and genuinely enjoy helping new contributors succeed.',
      ],
    },
    pickingIssuesSection: {
      heading: 'How to Pick a Good First Issue in Python',
      paragraphs: [
        'Python projects frequently tag issues with "good first issue", "easy", or "newcomer" labels. Prioritize issues that include a clear description of the expected behavior, a minimal reproduction case, and ideally a pointer to the relevant module or function. Issues in the documentation or test suite are particularly approachable because they require no changes to core logic.',
        'Set up a virtual environment (venv or conda) before you start. Most Python projects include a requirements-dev.txt or a setup with pip install -e ".[dev]" that installs everything you need, including the test runner (pytest is standard) and the linter (flake8, ruff, or pylint). Run the test suite immediately after setup to confirm you have a clean baseline before making any changes.',
        'Check whether the project uses type annotations. If it does, adding type hints to unannotated functions is a high-value and well-scoped contribution that maintainers consistently welcome — and it teaches you to read the codebase deeply.',
      ],
    },
    repos: [
      {
        name: 'pallets/flask',
        url: 'https://github.com/pallets/flask',
        description:
          'The lightweight Python web framework. Documentation improvements, small feature additions, and test coverage are regularly labeled for newcomers.',
      },
      {
        name: 'psf/requests',
        url: 'https://github.com/psf/requests',
        description:
          '"HTTP for Humans." One of the most downloaded Python packages. Documentation and edge-case bug fixes are great entry points.',
      },
      {
        name: 'pandas-dev/pandas',
        url: 'https://github.com/pandas-dev/pandas',
        description:
          'The data analysis library. The maintainers maintain a curated "good first issue" list with detailed context for each issue.',
      },
      {
        name: 'astral-sh/ruff',
        url: 'https://github.com/astral-sh/ruff',
        description:
          'The blazing-fast Python linter written in Rust. Adding new lint rules and improving documentation are common beginner tasks.',
      },
    ],
    issueTypes: [
      'Docstring improvements and corrections',
      'Adding type annotations to existing functions',
      'Writing pytest test cases for uncovered edge cases',
      'Fixing small bugs with a clear traceback or reproduction',
      'Updating outdated documentation examples',
      'Implementing small, well-specified feature requests',
    ],
    ctaLabel: 'Browse Python Issues on Pickssue',
  },

  go: {
    slug: 'go',
    displayName: 'Go',
    tagline:
      'Simple, fast, and built for production — with a toolchain that makes contributing a breeze.',
    metaTitle: 'Go (Golang) Open Source Contribution Guide for Beginners',
    metaDescription:
      'A step-by-step guide to making your first open source contribution in Go — find good first issues in popular Go projects and submit your first pull request.',
    whySection: {
      heading: 'Why Go Is an Excellent Language for Open Source Contributions',
      paragraphs: [
        'Go was designed for simplicity, and that design philosophy permeates the entire language ecosystem. The standard library is comprehensive and well-documented, the toolchain is opinionated (one formatter, one build tool, one test runner), and the language itself has a small surface area. These properties make Go codebases unusually consistent — when you move from one Go project to another, the code structure, error handling patterns, and testing conventions will feel familiar.',
        "Go's built-in tooling eliminates entire categories of friction that plague contributions in other languages. Running go fmt automatically formats your code to the community standard. Running go test ./... executes the entire test suite without any configuration. Running go vet catches common mistakes before you even push. This means you can spend more of your energy understanding the problem you are solving rather than wrestling with the project's tooling.",
        'The Go ecosystem has experienced explosive growth in infrastructure and cloud-native software — Kubernetes, Docker, Prometheus, Terraform, and etcd are all written in Go. Contributing to any of these projects is a remarkable career accelerator, and all of them maintain well-organized issue trackers with beginner labels.',
      ],
    },
    pickingIssuesSection: {
      heading: 'How to Pick a Good First Issue in Go',
      paragraphs: [
        'Go projects typically label beginner issues with "good first issue", "help wanted", or "exp/beginner". Many large Go projects (especially those under the Go organization itself) use a Gerrit-based code review workflow rather than GitHub PRs — check the CONTRIBUTING.md carefully, as the submission process is quite different from a standard pull request.',
        'Focus on issues in packages or subcommands you can understand in isolation. Go packages are intentionally designed to be self-contained, so you rarely need to understand the entire codebase to fix a bug in one package. Start by reading the package-level documentation (godoc), then the relevant functions, then the test file for the area you are changing.',
        'Write a test first. Go has a strong testing culture, and the expectation is that bug fixes come with a regression test and features come with test coverage. If an issue includes a reproduction case, your first task is to write a test that captures that case and fails before your fix.',
      ],
    },
    repos: [
      {
        name: 'golang/go',
        url: 'https://github.com/golang/go',
        description:
          'The Go programming language itself. Documentation, test improvements, and standard library contributions are labeled for newcomers — though the review process uses Gerrit.',
      },
      {
        name: 'cli/cli',
        url: 'https://github.com/cli/cli',
        description:
          "GitHub's official command-line tool, written in Go. Well-documented with a welcoming contributor community and active PR review.",
      },
      {
        name: 'gohugoio/hugo',
        url: 'https://github.com/gohugoio/hugo',
        description:
          "The world's fastest static site generator. Documentation, template improvements, and bug fixes are great starting points.",
      },
      {
        name: 'spf13/cobra',
        url: 'https://github.com/spf13/cobra',
        description:
          'The standard library for building CLI apps in Go. Small feature requests and documentation improvements are labeled regularly.',
      },
    ],
    issueTypes: [
      'Adding or improving godoc comments',
      'Writing test cases for uncovered behavior',
      'Fixing edge cases in error handling',
      'Improving CLI command help text and examples',
      'Implementing small, well-specified feature requests',
      'Updating deprecated API usages in the codebase',
    ],
    ctaLabel: 'Browse Go Issues on Pickssue',
  },

  rust: {
    slug: 'rust',
    displayName: 'Rust',
    tagline:
      'Systems programming with memory safety — and a community known for exceptional documentation.',
    metaTitle: 'Rust Open Source Contribution Guide for Beginners',
    metaDescription:
      'Learn how to make your first open source contribution in Rust — from understanding the borrow checker to finding good first issues in popular Rust projects.',
    whySection: {
      heading: 'Why Rust Is Worth Choosing for Your First Open Source Contribution',
      paragraphs: [
        'Rust has a reputation for a steep learning curve, but once you are past the fundamentals, contributing to Rust open source projects is genuinely rewarding. The borrow checker eliminates entire classes of memory bugs at compile time, which means that when your code compiles and passes the tests, it is usually correct in a deep sense that code in other languages cannot match. That reliability makes reviewing Rust PRs faster, because reviewers can focus on logic rather than memory safety.',
        'The Rust community has made documentation a first-class priority. The official Rust Book, the Reference, and the standard library documentation are models of technical writing. That same documentation culture pervades the ecosystem — crates on crates.io are expected to have rustdoc comments on every public API, and adding or improving documentation is one of the most welcomed first contributions in any Rust project.',
        'Rust is increasingly used in systems programming, WebAssembly, embedded development, and performance-critical web services. Contributing to the Rust ecosystem positions you at the frontier of modern systems programming, and maintainers of core Rust tools and libraries actively cultivate contributor communities because the ecosystem is still young and needs help.',
      ],
    },
    pickingIssuesSection: {
      heading: 'How to Pick a Good First Issue in Rust',
      paragraphs: [
        'The Rust ecosystem uses "good first issue", "E-easy", and "help wanted" labels. For the Rust compiler itself, issues are labeled with "E-mentor" when a compiler team member has volunteered to guide a new contributor through the change — these are ideal if you want deep learning paired with expert support.',
        "Focus on libraries (crates) rather than the compiler for your very first contribution. Library contributions — adding rustdoc examples, writing test cases, or implementing a small trait — require a much smaller understanding of the surrounding context. Cargo (Rust's build system and package manager) makes it straightforward to build and test a local clone with a single cargo test command.",
        "Embrace the compiler's error messages. Rust has the most helpful compiler error messages of any language, and they often suggest exactly what change you need to make. When you are exploring a new codebase, deliberately introducing type errors to see how the compiler responds is a practical way to understand the expected API shapes.",
      ],
    },
    repos: [
      {
        name: 'rust-lang/rust',
        url: 'https://github.com/rust-lang/rust',
        description:
          'The Rust compiler and standard library. Issues labeled "E-easy" and "E-mentor" are explicitly designed for newcomers with guided support.',
      },
      {
        name: 'serde-rs/serde',
        url: 'https://github.com/serde-rs/serde',
        description:
          'The de-facto serialization framework for Rust. Documentation improvements and edge-case bug fixes are great entry points.',
      },
      {
        name: 'tokio-rs/tokio',
        url: 'https://github.com/tokio-rs/tokio',
        description:
          'The async runtime for Rust. Documentation, test improvements, and small feature additions are labeled for contributors at all levels.',
      },
      {
        name: 'BurntSushi/ripgrep',
        url: 'https://github.com/BurntSushi/ripgrep',
        description:
          'The fastest line-oriented search tool. Documentation improvements and platform-specific edge cases are approachable first issues.',
      },
    ],
    issueTypes: [
      'Adding rustdoc examples to public API functions',
      'Writing unit tests for uncovered edge cases',
      'Improving error messages to be more helpful',
      'Implementing missing trait derivations',
      'Fixing clippy warnings throughout the codebase',
      'Updating documentation to reflect current API behavior',
    ],
    ctaLabel: 'Browse Rust Issues on Pickssue',
  },

  java: {
    slug: 'java',
    displayName: 'Java',
    tagline:
      'The backbone of enterprise software — with a vast ecosystem and decades of beginner-friendly projects.',
    metaTitle: 'Java Open Source Contribution Guide for Beginners',
    metaDescription:
      'A complete guide to making your first open source contribution in Java — from setting up your environment to finding good first issues in Spring, Apache, and more.',
    whySection: {
      heading: 'Why Java Is a Strong Choice for Open Source Contributions',
      paragraphs: [
        'Java powers an enormous share of enterprise software worldwide, and that reach is reflected in its open source ecosystem. The Java ecosystem includes some of the most mature and heavily used open source projects in existence — Spring Framework, Apache Kafka, Apache Hadoop, Elasticsearch, and Hibernate are all Java projects with millions of production deployments. Contributing to any of these gives you direct experience with real-world software that enterprises depend on globally.',
        "Java's strong typing and IDE tooling make navigating large codebases significantly easier than in dynamically typed languages. IntelliJ IDEA (Community Edition is free), Eclipse, and VS Code with the Java Extension Pack all provide excellent navigation, refactoring, and debugging capabilities out of the box. You can jump to a method definition, find all usages, and understand data flows without reading every file manually — a major advantage when ramping up on a new project.",
        'The Java open source community has well-established contribution workflows. Most large Java projects use Maven or Gradle for builds, JUnit for testing, and Checkstyle or SpotBugs for code quality. These tools are extensively documented, and most projects include a CONTRIBUTING guide that walks you through the exact commands to run. The process is structured and predictable, which is reassuring for a first-time contributor.',
      ],
    },
    pickingIssuesSection: {
      heading: 'How to Pick a Good First Issue in Java',
      paragraphs: [
        'Java projects often label beginner issues with "good first issue", "starter", "beginner-friendly", or "up-for-grabs". Look for issues with complete descriptions that reference specific classes or methods — Java\'s package structure makes it easy to find the relevant code once you know the class name. Issues in the documentation module or the example subproject are especially approachable.',
        "Build the project locally before reading a single issue. Java build times can be long for large projects, so start the build (mvn install -DskipTests or gradle build) while you read the project's contribution guide. Ensure all tests pass on the main branch before making any changes — this gives you a reliable baseline and confirms your local environment is set up correctly.",
        "Pay attention to the project's code style requirements. Many Java projects enforce strict formatting with tools like google-java-format, Checkstyle, or Spotless. These tools typically run during the build or as a pre-commit hook, and a PR that fails the style check will not be reviewed until it is fixed. Running the formatter locally before committing saves a round-trip.",
      ],
    },
    repos: [
      {
        name: 'spring-projects/spring-framework',
        url: 'https://github.com/spring-projects/spring-framework',
        description:
          'The foundational Java application framework. Documentation improvements, test additions, and small bug fixes are regularly labeled for contributors.',
      },
      {
        name: 'apache/kafka',
        url: 'https://github.com/apache/kafka',
        description:
          'The distributed event streaming platform. Documentation and test improvements are good entry points into one of the most widely deployed Java projects.',
      },
      {
        name: 'mockito/mockito',
        url: 'https://github.com/mockito/mockito',
        description:
          'The most popular Java mocking framework. Beginner-labeled issues often involve improving error messages, adding examples, or writing missing tests.',
      },
      {
        name: 'google/guava',
        url: 'https://github.com/google/guava',
        description:
          "Google's core Java libraries. Documentation improvements and edge-case bug fixes in well-defined utility classes are excellent first contributions.",
      },
    ],
    issueTypes: [
      'Improving Javadoc documentation and adding code examples',
      'Writing JUnit test cases for uncovered code paths',
      'Fixing deprecation warnings from updated dependencies',
      'Implementing small utility methods in existing classes',
      'Correcting or expanding user-facing error messages',
      'Adding missing null-checks and input validation',
    ],
    ctaLabel: 'Browse Java Issues on Pickssue',
  },
};

export const SUPPORTED_LANGUAGES: LanguageSlug[] = [
  'javascript',
  'python',
  'go',
  'rust',
  'java',
];

export function getGuide(slug: string): LanguageGuide | null {
  if (Object.prototype.hasOwnProperty.call(guides, slug)) {
    return guides[slug as LanguageSlug];
  }
  return null;
}

export function getAllGuides(): LanguageGuide[] {
  return SUPPORTED_LANGUAGES.map(slug => guides[slug]);
}
