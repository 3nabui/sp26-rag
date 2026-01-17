import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  LayoutDashboard, 
  Upload, 
  BarChart3, 
  MessageSquare, 
  Settings,
  Users,
  FileSearch,
  Folder,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSidebar } from './SidebarContext';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  role?: 'author' | 'admin' | 'staff';
}

const authorNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/author/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Upload Manuscript', path: '/author/upload', icon: <Upload className="w-5 h-5" /> },
  { label: 'Analysis', path: '/author/analysis', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Ask AI', path: '/author/chatbot', icon: <MessageSquare className="w-5 h-5" /> },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Configuration', path: '/admin/config', icon: <Settings className="w-5 h-5" /> },
];

const staffNavItems: NavItem[] = [
  { label: 'Review', path: '/staff/review', icon: <FileSearch className="w-5 h-5" /> },
  { label: 'Content', path: '/staff/cms', icon: <Folder className="w-5 h-5" /> },
];

export function Sidebar({ role = 'author' }: SidebarProps) {
  const location = useLocation();
  const { isCollapsed, toggleSidebar } = useSidebar();
  
  const navItems = role === 'author' 
    ? authorNavItems 
    : role === 'admin' 
      ? adminNavItems 
      : staffNavItems;

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Logo & Toggle Button */}
      <div className={cn(
        "flex items-center justify-between border-b border-sidebar-border transition-all duration-300",
        isCollapsed ? "px-4 py-4" : "px-6 py-4"
      )}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img 
                src="/logo-storynest.png" 
                alt="StoryNest Logo" 
                className="w-10 h-10 object-contain shrink-0"
              />
              <div className="overflow-hidden">
                <h1 className="font-serif font-bold text-lg text-foreground whitespace-nowrap">StoryNest</h1>
                <p className="text-xs text-muted-foreground whitespace-nowrap">Analysis System</p>
              </div>
            </div>
            {/* Toggle Button - Right side */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="shrink-0 hover:bg-sidebar-accent transition-colors"
              title="Collapse sidebar"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </>
        ) : (
          /* When collapsed, show toggle button centered */
          <div className="w-full flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hover:bg-sidebar-accent transition-colors"
              title="Expand sidebar"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4">
        {!isCollapsed && (
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Menu
          </p>
        )}
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              variant={isActive ? 'sidebar-active' : 'sidebar'}
              size="lg"
              className={cn(
                "gap-3 transition-all duration-200",
                isCollapsed ? "justify-center px-3" : "justify-start px-3",
                isActive && "bg-sidebar-accent border-l-2 border-primary"
              )}
              asChild
              title={isCollapsed ? item.label : undefined}
            >
              <Link to={item.path}>
                <span className="shrink-0">{item.icon}</span>
                {!isCollapsed && (
                  <span className="whitespace-nowrap overflow-hidden">{item.label}</span>
                )}
              </Link>
            </Button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
        {isCollapsed ? (
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              size="icon" 
              className="w-full"
              title="Support Center"
            >
              <BookOpen className="w-5 h-5" />
            </Button>
          </div>
        ) : (
          <div className="glass rounded-lg p-4">
            <p className="text-sm font-medium text-foreground mb-1">Need Help?</p>
            <p className="text-xs text-muted-foreground mb-3">
              Contact us for assistance.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Support Center
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
