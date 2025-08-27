import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard - ProjectManager',
  description: 'Admin panel for managing project requests, proposals, and client communications.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}