import { Bell, Search, Settings, ChevronDown, LogOut, User, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from './SidebarContext';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  title?: string;
}

function getInitials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return 'N';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const first = parts[0] ?? '';
  return first.charAt(0).toUpperCase() || 'N';
}

function normalizeAvatarUrl(raw?: string | null): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return null;
}

function loadProfile(): StoredProfile {
  const fallback: StoredProfile = {
    name: 'Võ Hào',
    email: 'hao.vo@example.com',
    joinedAt: '2024-12-01',
  };
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!parsed?.name || !parsed?.email) return fallback;
    return {
      name: String(parsed.name),
      email: String(parsed.email),
      joinedAt: String(parsed.joinedAt || fallback.joinedAt),
    };
  } catch {
    return fallback;
  }
}

export function Header({ title = 'Dashboard' }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCollapsed } = useSidebar();
  const { user, isAuthenticated, logout } = useAuth();
  const [notificationRead, setNotificationRead] = useState<Record<string, boolean>>({});

  const notifications = useMemo(() => ([
    {
      id: 'n1',
      type: 'info' as const,
      title: 'Analysis completed',
      message: 'Chapter 4 analysis is ready to view.',
      time: '2m ago',
      action: { label: 'Open', to: '/author/analysis' },
    },
    {
      id: 'n2',
      type: 'warning' as const,
      title: 'Upload processing',
      message: 'Your manuscript is still processing. Please wait.',
      time: '18m ago',
      action: { label: 'Go to Upload', to: '/author/upload' },
    },
    {
      id: 'n3',
      type: 'success' as const,
      title: 'New tip available',
      message: 'Check out best practices for chapter versioning.',
      time: '1h ago',
      action: { label: 'Support', to: '/support' },
    },
  ]), []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !notificationRead[n.id]).length,
    [notifications, notificationRead]
  );

  const iconForType = (type: 'info' | 'warning' | 'success') => {
    if (type === 'success') return <CheckCircle2 className="w-4 h-4 text-success" />;
    if (type === 'warning') return <AlertCircle className="w-4 h-4 text-warning" />;
    return <Info className="w-4 h-4 text-info" />;
  };

  const accountBase = useMemo(() => {
    if (location.pathname.startsWith('/staff')) return '/staff';
    if (location.pathname.startsWith('/author')) return '/author';
    if (location.pathname.startsWith('/admin')) return '/admin';
    return '';
  }, [location.pathname]);

  const profilePath =
    accountBase === '/staff'
      ? '/staff/profile'
      : accountBase === '/admin'
      ? '/admin/profile'
      : '/profile';

  const settingsPath =
    accountBase === '/staff'
      ? '/staff/settings'
      : accountBase === '/author'
      ? '/author/settings'
      : accountBase === '/admin'
      ? '/admin/settings'
      : '/settings';

  const displayName = isAuthenticated
    ? user?.fullName || user?.email || 'User'
    : 'Guest';

  const initials = getInitials(displayName);

  return (
    <header className={cn(
      "fixed top-0 right-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-border transition-all duration-300 ease-in-out",
      isCollapsed ? "left-20" : "left-64"
    )}>
      <div className="flex items-center justify-between h-full px-6">
        {/* Title & Breadcrumb */}
        <div>
          <h2 className="text-xl font-serif font-semibold text-foreground">{title}</h2>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search manuscripts, analysis..." 
              className="pl-10 bg-secondary/50 border-transparent focus:bg-input focus:border-border"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="px-0">Notifications</DropdownMenuLabel>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => {
                    const next: Record<string, boolean> = {};
                    notifications.forEach((n) => { next[n.id] = true; });
                    setNotificationRead(next);
                  }}
                  disabled={unreadCount === 0}
                >
                  Mark all as read
                </Button>
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-auto">
                {notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="cursor-pointer items-start gap-3 py-3"
                    onSelect={(e) => {
                      e.preventDefault();
                      setNotificationRead((prev) => ({ ...prev, [n.id]: true }));
                      navigate(n.action.to);
                    }}
                  >
                    <div className="mt-0.5 shrink-0">
                      {iconForType(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {n.title}
                        </p>
                        <span className="text-xs text-muted-foreground shrink-0">{n.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {n.message}
                      </p>
                      {!notificationRead[n.id] && (
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1 text-[11px] text-primary">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            Unread
                          </span>
                        </div>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer justify-center"
                onSelect={(e) => {
                  e.preventDefault();
                  navigate('/support');
                }}
              >
                View all
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Button variant="ghost" size="icon" onClick={() => navigate(settingsPath)}>
            <Settings className="w-5 h-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                <Avatar className="h-10 w-10">
                  {normalizeAvatarUrl(user?.avatarUrl) && (
                    <AvatarImage src={normalizeAvatarUrl(user?.avatarUrl) || ''} alt={displayName} />
                  )}
                  <AvatarFallback className="bg-gradient-to-br from-primary/80 via-primary to-amber-400 text-primary-foreground text-base font-semibold shadow-md">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{displayName}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(profilePath)}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(settingsPath)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
