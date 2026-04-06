import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
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

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://contrifit.vercel.app'),
  keywords: 'GitHub, open source, beginner friendly, contribution, issues, programming, personalized, recommendation',
  authors: [{ name: 'contrifit Team' }],
  creator: 'contrifit Team',
  publisher: 'contrifit Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
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
    <html suppressHydrationWarning>
      <head>
        <JsonLd />
        <meta name="google-adsense-account" content="ca-pub-9157231737129938" />
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body
        className={`${pretendard.variable} ${jetbrainsMono.variable} font-sans`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
