import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SidebarProvider, useSidebar } from './SidebarContext';
import { cn } from '@/lib/utils';

interface DefaultLayoutContentProps {
  children: ReactNode;
  title?: string;
  role?: 'author' | 'admin' | 'staff';
}

function DefaultLayoutContent({ children, title, role = 'author' }: DefaultLayoutContentProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={role} />
      <Header title={title} />
      <main className={cn(
        "pt-16 min-h-screen transition-all duration-300 ease-in-out",
        isCollapsed ? "ml-20" : "ml-64"
      )}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

interface DefaultLayoutProps {
  children: ReactNode;
  title?: string;
  role?: 'author' | 'admin' | 'staff';
}

export function DefaultLayout({ children, title, role = 'author' }: DefaultLayoutProps) {
  return (
    <SidebarProvider>
      <DefaultLayoutContent title={title} role={role}>
        {children}
      </DefaultLayoutContent>
    </SidebarProvider>
  );
}
