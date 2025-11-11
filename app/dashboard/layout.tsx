import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - SourceCodeLelo',
  description: 'Manage your sourcecode, track progress, and communicate with professionals on your SourceCodeLelo dashboard.',
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