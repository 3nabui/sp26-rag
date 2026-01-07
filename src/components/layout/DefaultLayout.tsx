import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DefaultLayoutProps {
  children: ReactNode;
  title?: string;
  role?: 'author' | 'admin' | 'staff';
}

export function DefaultLayout({ children, title, role = 'author' }: DefaultLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={role} />
      <Header title={title} />
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
