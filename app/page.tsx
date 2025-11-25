import { Navigation } from '@/components/layout';
import { Hero } from '@/components/layout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SourceCodeLelo - Get Production-Ready Mobile Apps Instantly',
  description: 'Transform your app idea into reality instantly with complete source code, package ID, and keystore setup for production-ready mobile applications.',
  openGraph: {
    title: 'SourceCodeLelo - Get Production-Ready Mobile Apps Instantly',
    description: 'Transform your app idea into reality instantly with complete source code, package ID, and keystore setup for production-ready mobile applications.',
    url: 'https://sourcecodelelo.com',
    images: [
      {
        url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
        width: 1200,
        height: 630,
        alt: 'SourceCodeLelo Platform Homepage'
      }
    ]
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
    </div>
  );
}