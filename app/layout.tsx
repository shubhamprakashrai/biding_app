import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'ProjectManager - Professional Project Management Platform',
    template: '%s | ProjectManager'
  },
  description: 'Connect with top-tier professionals and freelancers. Submit project requirements, receive expert proposals, and collaborate seamlessly.',
  keywords: ['project management', 'freelancers', 'proposals', 'collaboration', 'professional services'],
  authors: [{ name: 'ProjectManager Team' }],
  creator: 'ProjectManager',
  metadataBase: new URL('https://projectmanager.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://projectmanager.com',
    siteName: 'ProjectManager',
    title: 'ProjectManager - Professional Project Management Platform',
    description: 'Connect with top-tier professionals and freelancers. Submit project requirements, receive expert proposals, and collaborate seamlessly.',
    images: [
      {
        url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
        width: 1200,
        height: 630,
        alt: 'ProjectManager Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProjectManager - Professional Project Management Platform',
    description: 'Connect with top-tier professionals and freelancers. Submit project requirements, receive expert proposals, and collaborate seamlessly.',
    images: ['https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg']
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
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://projectmanager.com" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}