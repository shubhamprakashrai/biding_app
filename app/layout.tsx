import './globals.css';
import type { Metadata } from 'next';
// Viewport is automatically inferred in Next.js 13+
import { Inter } from 'next/font/google';
import Layout from '@/components/Layout';

const inter = Inter({ subsets: ['latin'] });

// Viewport configuration is automatically handled by Next.js 13+

export const metadata: Metadata = {
  title: {
    default: 'SourceCodeLelo - Get Production-Ready Mobile Apps Instantly',
    template: '%s | SourceCodeLelo - Mobile App Source Code'
  },
  description: 'Transform your app idea into reality instantly. Get production-ready mobile applications with complete source code, package ID, and keystore setup. Perfect for developers and businesses looking for quick app deployment.',
  keywords: ['mobile app source code', 'production ready app', 'android app development', 'ios app development', 'app source code', 'mobile app template', 'app package ID', 'keystore setup', 'app deployment'],
  authors: [{ name: 'SourceCodeLelo Team' }],
  creator: 'SourceCodeLelo',
  metadataBase: new URL('https://sourcecodelelo.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sourcecodelelo.com',
    siteName: 'SourceCodeLelo',
    title: 'SourceCodeLelo - Get Production-Ready Mobile Apps Instantly',
    description: 'Transform your app idea into reality instantly with complete source code, package ID, and keystore setup for production-ready mobile applications.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'SourceCodeLelo - Mobile App Source Code Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SourceCodeLelo - Production-Ready Mobile Apps',
    description: 'Get complete mobile app source code with package ID and keystore setup. Launch your app faster with our production-ready solutions.',
    images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80']
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
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
  // Additional SEO optimizations
  applicationName: 'SourceCodeLelo',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: true,
    address: false,
    telephone: true,
  },
  // PWA support
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SourceCodeLelo',
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="canonical" href="https://sourcecodelelo.com" />
        
        {/* Preconnect to important domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/_next/static/css/app/layout.css"
          as="style"
          // Using onLoad with type assertion to avoid TypeScript error
          {...{ onLoad: "this.onload=null;this.rel='stylesheet'" } as any}
        />
      </head>
      <body className={inter.className}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}