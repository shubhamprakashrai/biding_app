import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ProjectManager - Professional Project Management Platform',
  description: 'Connect with top-tier professionals and freelancers. Submit project requirements, receive expert proposals, and collaborate seamlessly to achieve exceptional results.',
  openGraph: {
    title: 'ProjectManager - Professional Project Management Platform',
    description: 'Connect with top-tier professionals and freelancers. Submit project requirements, receive expert proposals, and collaborate seamlessly.',
    url: 'https://projectmanager.com',
    images: [
      {
        url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
        width: 1200,
        height: 630,
        alt: 'ProjectManager Platform Homepage'
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