import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - ProjectManager',
  description: 'Manage your projects, track progress, and communicate with professionals on your ProjectManager dashboard.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}