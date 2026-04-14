import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { env } from '@/app/lib/env';
import { TooltipProvider } from '@/components/ui/tooltip';
import IntlProvider from './providers/IntlProvider';

const pretendard = localFont({
  src: [
    {
      path: '../public/fonts/pretendard/Pretendard-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/pretendard/Pretendard-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/pretendard/Pretendard-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/pretendard/Pretendard-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-pretendard',
  display: 'swap',
  preload: true,
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'system-ui',
    'Roboto',
    'Helvetica Neue',
    'Segoe UI',
    'Apple SD Gothic Neo',
    'Noto Sans KR',
    'Malgun Gothic',
    'sans-serif',
  ],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pickssue.dev'),
  title: {
    default: 'Pickssue',
    template: '%s | Pickssue',
  },
  description:
    'A personalized open-source contribution curator that analyzes your GitHub activity to recommend the best issues for you.',
  openGraph: {
    title: 'Pickssue',
    description:
      'A personalized open-source contribution curator that analyzes your GitHub activity to recommend the best issues for you.',
    url: 'https://pickssue.dev',
    siteName: 'Pickssue',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Pickssue - Find beginner-friendly GitHub issues',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pickssue',
    description:
      'A personalized open-source contribution curator that analyzes your GitHub activity to recommend the best issues for you.',
    images: ['/og-image.png'],
  },
};

const webApplicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Pickssue',
  url: 'https://pickssue.dev',
  description:
    'A personalized open-source contribution curator that analyzes your GitHub activity to recommend the best issues for you.',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-9157231737129938" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationJsonLd) }}
        />
        {env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
      </head>
      <body
        className={`${pretendard.variable} ${jetbrainsMono.variable} font-sans`}
        suppressHydrationWarning
      >
        <IntlProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </IntlProvider>
      </body>
    </html>
  );
}
