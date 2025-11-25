import './globals.css';
import type { Metadata } from 'next';
// Viewport is automatically inferred in Next.js 13+
import { Inter } from 'next/font/google';
import { Layout } from '@/components/layout';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ['latin'] });

// Viewport configuration is automatically handled by Next.js 13+

export const metadata: Metadata = {
  title: {
    default: 'SourceCodeLelo - Get Production-Ready Mobile Apps Instantly',
    template: '%s | SourceCodeLelo - Mobile App Source Code'
  },
  description: 'Transform your app idea into reality instantly. Get production-ready mobile applications with complete source code, package ID, and keystore setup. Perfect for developers and businesses looking for quick app deployment.',
  keywords: [
    // Core Services
    'mobile app source code', 'production ready app', 'android app development', 'ios app development', 
    'app source code', 'mobile app template', 'app package ID', 'keystore setup', 'app deployment',
    'custom mobile app development', 'white label app solutions', 'affordable app source code',
    'ready to deploy app source code', 'app development services', 'cross-platform app development',
    'native app development', 'react native development', 'flutter app development', 'mobile app design',
    'app UI/UX design', 'enterprise app development', 'startup app development', 'MVP development',
    'app maintenance and support', 'app testing services', 'app store optimization',
    
    // Indian Cities
    'best source code provider in India', 'top app developers in Delhi', 'mobile app developers in Mumbai',
    'app development company in Bangalore', 'iOS app developers in Hyderabad', 'Android app development in India',
    'app development in NCR', 'app developers in Gurgaon', 'app development in Noida', 
    'best app developers in Pune', 'mobile app company in Chennai', 'app development in Kolkata',
    'app developers in Ahmedabad', 'mobile app company in Jaipur', 'app development in Chandigarh',
    'app developers in Indore', 'mobile app company in Coimbatore', 'app development in Kochi',
    'app developers in Bhubaneswar', 'mobile app company in Nagpur', 'app development in Visakhapatnam',
    
    // International
    'USA app development company', 'UK mobile app developers', 'Australia app development services',
    'app development in USA', 'app development in UK', 'app development in Australia',
    'app development in Canada', 'app development in Dubai', 'app development in Singapore',
    'app development in Europe', 'app development in Germany', 'app development in France',
    'app development in Japan', 'app development in South Korea', 'app development in China',
    'app development in Middle East', 'app development in Saudi Arabia', 'app development in UAE',
    'app development in Qatar', 'app development in South Africa', 'app development in Brazil',
    'app development in Mexico', 'app development in Russia', 'app development in Italy',
    'app development in Spain', 'app development in Netherlands', 'app development in Sweden',
    'app development in Switzerland', 'app development in New Zealand', 'app development in Malaysia',
    'app development in Indonesia', 'app development in Thailand', 'app development in Vietnam',
    'app development in Philippines', 'app development in Israel', 'app development in Turkey',
    
    // Industry Specific
    'healthcare app development', 'ecommerce app development', 'education app development',
    'finance app development', 'banking app development', 'real estate app development',
    'food delivery app development', 'grocery delivery app', 'on-demand service app',
    'social media app development', 'dating app development', 'fitness app development',
    'travel app development', 'hospitality app development', 'gaming app development',
    'blockchain app development', 'IoT app development', 'AI and ML app development',
    'AR/VR app development', 'wearable app development', 'enterprise mobility solutions',
    
    // Technical Terms
    'REST API integration', 'third-party API integration', 'payment gateway integration',
    'cloud integration services', 'database management', 'backend development',
    'frontend development', 'UI/UX design services', 'app security solutions',
    'app performance optimization', 'scalable app architecture', 'microservices architecture',
    'serverless architecture', 'CI/CD pipeline setup', 'agile app development'
  ],
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
        <Toaster />
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}