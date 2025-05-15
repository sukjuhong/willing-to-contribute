import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from './contexts/LanguageContext';
import JsonLd from './components/JsonLd';

const inter = Inter({ subsets: ['latin'] });

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
  openGraph: {
    title: 'Willing to Contribute - Find Beginner-Friendly GitHub Issues',
    description:
      'Discover and contribute to beginner-friendly GitHub issues. Track repositories, get notifications, and start your open source journey.',
    type: 'website',
    locale: 'en_US',
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
    maximumScale: 1,
  },
  category: 'technology',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <JsonLd />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
