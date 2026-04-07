import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { env } from '@/app/lib/env';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const baseUrl = env.NEXT_PUBLIC_BASE_URL || 'https://pickssue.dev';

  const pageTitle = t('pageTitle');

  return {
    title: {
      default: pageTitle,
      template: '%s | Pickssue',
    },
    description: t('description'),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'en-US': `${baseUrl}/en`,
        'ko-KR': `${baseUrl}/ko`,
      },
    },
    openGraph: {
      title: pageTitle,
      description: t('description'),
      type: 'website',
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      alternateLocale: [locale === 'ko' ? 'en_US' : 'ko_KR'],
      siteName: 'Pickssue',
      url: `${baseUrl}/${locale}`,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Pickssue',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: pageTitle,
      description: t('description'),
      images: ['/og-image.png'],
      creator: '@pickssue',
      site: '@pickssue',
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'en' | 'ko')) {
    notFound();
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
