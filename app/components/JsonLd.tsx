export default function JsonLd() {
  const baseUrl = 'https://willing-to-contribute.vercel.app';

  const webApplication = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Willing to Contribute',
    description:
      'Discover and contribute to beginner-friendly GitHub issues. Track repositories, get notifications, and start your open source journey.',
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
      name: 'Willing to Contribute Team',
      url: baseUrl,
    },
    featureList: [
      'Track beginner-friendly GitHub issues',
      'Cross-device syncing via GitHub Gists',
      'Browser notifications for new issues',
      'Multi-language support (English/Korean)',
      'GitHub OAuth authentication',
    ],
  };

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Willing to Contribute',
    url: baseUrl,
    logo: `${baseUrl}/og-image.png`,
    sameAs: ['https://github.com/sukjuhong/willing-to-contribute'],
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
