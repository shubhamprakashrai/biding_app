import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register - ProjectManager',
  description: 'Create your ProjectManager account and start connecting with top-tier professionals for your projects.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}