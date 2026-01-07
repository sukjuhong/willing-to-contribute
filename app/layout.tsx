import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { LanguageProvider } from './contexts/LanguageContext';
import JsonLd from './components/JsonLd';

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

export const metadata: Metadata = {
  metadataBase: new URL('https://willing-to-contribute.vercel.app'),
  title: {
    default: 'Willing to Contribute - Find Beginner-Friendly GitHub Issues',
    template: '%s | Willing to Contribute',
  },
  description:
    'Discover and contribute to beginner-friendly GitHub issues. Track repositories, get notifications, and start your open source journey.',
  keywords: 'GitHub, open source, beginner friendly, contribution, issues, programming',
  authors: [{ name: 'Willing to Contribute Team' }],
  creator: 'Willing to Contribute Team',
  publisher: 'Willing to Contribute Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://willing-to-contribute.vercel.app',
    languages: {
      'en-US': 'https://willing-to-contribute.vercel.app',
      'ko-KR': 'https://willing-to-contribute.vercel.app?lang=ko',
    },
  },
  openGraph: {
    title: 'Willing to Contribute - Find Beginner-Friendly GitHub Issues',
    description:
      'Discover and contribute to beginner-friendly GitHub issues. Track repositories, get notifications, and start your open source journey.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['ko_KR'],
    siteName: 'Willing to Contribute',
    url: 'https://willing-to-contribute.vercel.app',
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
    card: 'summary_large_image',
    title: 'Willing to Contribute - Find Beginner-Friendly GitHub Issues',
    description:
      'Discover and contribute to beginner-friendly GitHub issues. Track repositories, get notifications, and start your open source journey.',
    images: ['/og-image.png'],
    creator: '@willing2contribute',
    site: '@willing2contribute',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'v48wQTUeuTGTvIYIAGEUtLnvtaqMaxcwJ45YtP0-3xc',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  category: 'technology',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <JsonLd />
      </head>
      <body className={pretendard.className} suppressHydrationWarning>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
