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
  Folder
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
  { label: 'Upload Bản Thảo', path: '/author/upload', icon: <Upload className="w-5 h-5" /> },
  { label: 'Phân Tích', path: '/author/analysis', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Hỏi AI', path: '/author/chatbot', icon: <MessageSquare className="w-5 h-5" /> },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Người Dùng', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Cấu Hình', path: '/admin/config', icon: <Settings className="w-5 h-5" /> },
];

const staffNavItems: NavItem[] = [
  { label: 'Xét Duyệt', path: '/staff/review', icon: <FileSearch className="w-5 h-5" /> },
  { label: 'Nội Dung', path: '/staff/cms', icon: <Folder className="w-5 h-5" /> },
];

export function Sidebar({ role = 'author' }: SidebarProps) {
  const location = useLocation();
  
  const navItems = role === 'author' 
    ? authorNavItems 
    : role === 'admin' 
      ? adminNavItems 
      : staffNavItems;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <img 
          src="/logo-storynest.png" 
          alt="StoryNest Logo" 
          className="w-10 h-10 object-contain"
        />
        <div>
          <h1 className="font-serif font-bold text-lg text-foreground">StoryNest</h1>
          <p className="text-xs text-muted-foreground">Analysis System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              variant={isActive ? 'sidebar-active' : 'sidebar'}
              size="lg"
              className={cn(
                "justify-start gap-3 px-3",
                isActive && "bg-sidebar-accent border-l-2 border-primary"
              )}
              asChild
            >
              <Link to={item.path}>
                {item.icon}
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
        <div className="glass rounded-lg p-4">
          <p className="text-sm font-medium text-foreground mb-1">Cần hỗ trợ?</p>
          <p className="text-xs text-muted-foreground mb-3">
            Liên hệ với chúng tôi để được giúp đỡ.
          </p>
          <Button variant="outline" size="sm" className="w-full">
            Trung tâm hỗ trợ
          </Button>
        </div>
      </div>
    </aside>
  );
}
