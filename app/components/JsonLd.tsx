export default function JsonLd() {
  const baseUrl = 'https://pickssue.dev';

  const webApplication = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pickssue',
    description:
      'A personalized open-source contribution curator that analyzes your GitHub activity to recommend the best issues for you.',
    url: baseUrl,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'Pickssue Team',
      url: baseUrl,
    },
    featureList: [
      'Personalized issue recommendations based on GitHub activity',
      'Track beginner-friendly GitHub issues',
      'Cloud sync across devices',
      'Browser notifications for new issues',
      'Multi-language support (English/Korean)',
      'GitHub OAuth authentication',
    ],
  };

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Pickssue',
    url: baseUrl,
    logo: `${baseUrl}/og-image.png`,
    sameAs: ['https://github.com/sukjuhong/pickssue'],
  };

  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Issues',
        item: `${baseUrl}/issues`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Repositories',
        item: `${baseUrl}/repositories`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Settings',
        item: `${baseUrl}/settings`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplication) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
      />
    </>
  );
}
