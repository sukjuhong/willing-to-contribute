import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllGuides, getGuide, SUPPORTED_LANGUAGES } from './content';

type Props = {
  params: Promise<{ language: string }>;
};

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map(language => ({ language }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const guide = getGuide(language);
  if (!guide) return {};

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://pickssue.com';
  const canonical = `${baseUrl}/guide/${guide.slug}`;

  // TODO(i18n): Once a next-intl server request config is wired up,
  // localize title/description from guide.<slug>.title / intro.
  const title = guide.metaTitle;
  const description = guide.metaDescription;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `/guide/${guide.slug}`,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function LanguageGuidePage({ params }: Props) {
  const { language } = await params;
  const guide = getGuide(language);
  if (!guide) notFound();

  const allGuides = getAllGuides();

  return (
    <article className="text-foreground">
      {/* Hero */}
      <section className="text-center mb-16">
        <p className="text-sm text-muted-foreground uppercase tracking-widest mb-3 font-mono">
          Language Guide
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-[family-name:var(--font-mono)]">
          <span className="text-primary">&gt;_</span> {guide.displayName}
        </h1>
        <p className="text-xl text-foreground max-w-2xl mx-auto leading-relaxed">
          {guide.tagline}
        </p>
        <div className="mt-8">
          <Link
            href={`/issues?language=${guide.slug}`}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-lg transition-colors text-lg"
          >
            {guide.ctaLabel}
          </Link>
        </div>
      </section>

      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-10 flex gap-2 items-center">
        <Link href="/guide" className="text-primary hover:text-primary/80 underline">
          Open Source Guide
        </Link>
        <span>/</span>
        <span>{guide.displayName}</span>
      </nav>

      {/* Why section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-3">
          {guide.whySection.heading}
        </h2>
        <div className="space-y-4 leading-relaxed">
          {guide.whySection.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* Picking issues section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-3">
          {guide.pickingIssuesSection.heading}
        </h2>
        <div className="space-y-4 leading-relaxed">
          {guide.pickingIssuesSection.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* Recommended repositories */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-3">
          Recommended Repositories to Start With
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {guide.repos.map(repo => (
            <a
              key={repo.url}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors group"
            >
              <h3 className="font-mono text-primary font-semibold mb-2 group-hover:underline">
                {repo.name}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {repo.description}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* Good issue types */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-3">
          Issue Types That Are Great for First Contributors
        </h2>
        <ul className="space-y-3">
          {guide.issueTypes.map((type, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                {i + 1}
              </span>
              <span className="leading-relaxed">{type}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="bg-card border border-primary/20 rounded-xl p-10 mb-16 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Ready to Find Your First {guide.displayName} Issue?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto leading-relaxed">
          Pickssue surfaces beginner-friendly {guide.displayName} issues from active
          repositories — filtered and ranked so you can spend time contributing, not
          searching.
        </p>
        <Link
          href={`/issues?language=${guide.slug}`}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-10 py-4 rounded-lg transition-colors text-lg"
        >
          {guide.ctaLabel}
        </Link>
      </section>

      {/* Other language guides */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-3">
          Guides for Other Languages
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {allGuides
            .filter(g => g.slug !== guide.slug)
            .map(g => (
              <Link
                key={g.slug}
                href={`/guide/${g.slug}`}
                className="bg-card border border-border rounded-lg px-4 py-3 text-sm font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-colors text-center"
              >
                {g.displayName}
              </Link>
            ))}
          <Link
            href="/guide"
            className="bg-card border border-border rounded-lg px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors text-center"
          >
            General Guide
          </Link>
        </div>
      </section>
    </article>
  );
}
