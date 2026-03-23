import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const baseUrl = 'https://willing-to-contribute.vercel.app';

  return {
    title: {
      default:
        locale === 'ko'
          ? 'Willing to Contribute - 초보자 친화적 GitHub 이슈 찾기'
          : 'Willing to Contribute - Find Beginner-Friendly GitHub Issues',
      template: '%s | Willing to Contribute',
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
      title:
        locale === 'ko'
          ? 'Willing to Contribute - 초보자 친화적 GitHub 이슈 찾기'
          : 'Willing to Contribute - Find Beginner-Friendly GitHub Issues',
      description: t('description'),
      type: 'website',
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      alternateLocale: [locale === 'ko' ? 'en_US' : 'ko_KR'],
      siteName: 'Willing to Contribute',
      url: `${baseUrl}/${locale}`,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Willing to Contribute',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title:
        locale === 'ko'
          ? 'Willing to Contribute - 초보자 친화적 GitHub 이슈 찾기'
          : 'Willing to Contribute - Find Beginner-Friendly GitHub Issues',
      description: t('description'),
      images: ['/og-image.png'],
      creator: '@willing2contribute',
      site: '@willing2contribute',
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
