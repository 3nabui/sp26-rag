import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Pencil } from 'lucide-react';
import { DefaultLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';

const PROFILE_STORAGE_KEY = 'storynest_profile';

type Profile = {
  name: string;
  email: string;
  joinedAt: string;
  penName?: string;
  bio?: string;
  genres?: string[];
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
  return initials || 'NA';
}

function loadProfile(): Profile {
  const fallback: Profile = {
    name: 'Võ Hào',
    email: 'hao.vo@example.com',
    joinedAt: '2024-12-01',
    penName: '',
    bio: '',
    genres: [],
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
      penName: typeof parsed.penName === 'string' ? parsed.penName : fallback.penName,
      bio: typeof parsed.bio === 'string' ? parsed.bio : fallback.bio,
      genres: Array.isArray(parsed.genres) ? parsed.genres.map((g: unknown) => String(g)).filter(Boolean) : fallback.genres,
    };
  } catch {
    return fallback;
  }
}

function saveProfile(profile: Profile) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent('storynest_profile_updated', { detail: profile }));
}

function getRoleFromPath(pathname: string): 'author' | 'admin' | 'staff' {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/staff')) return 'staff';
  return 'author';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ProfilePage() {
  const location = useLocation();
  const role = getRoleFromPath(location.pathname);
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile>(() => loadProfile());
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<Profile>(() => loadProfile());
  const [genresInput, setGenresInput] = useState('');

  useEffect(() => {
    const handler = () => setProfile(loadProfile());
    window.addEventListener('storynest_profile_updated', handler);
    return () => window.removeEventListener('storynest_profile_updated', handler);
  }, []);

  const profileView = useMemo(() => ({
    ...profile,
    role,
  }), [profile, role]);

  return (
    <DefaultLayout title="Profile" role={role}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-6"
      >
        <motion.div variants={itemVariants}>
          <Card variant="gradient" className="overflow-hidden">
            <CardContent className="p-8 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                    {profileView.name}
                  </h1>
                  <p className="text-muted-foreground">
                    Manage your account details.
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant="secondary" className="capitalize">{profileView.role}</Badge>
                    <Badge variant="outline">Joined {profileView.joinedAt}</Badge>
                  </div>
                  {(profileView.penName || (profileView.genres && profileView.genres.length > 0)) && (
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {profileView.penName && (
                        <Badge variant="outline">Pen name: {profileView.penName}</Badge>
                      )}
                      {(profileView.genres || []).slice(0, 3).map((g) => (
                        <Badge key={g} variant="secondary">{g}</Badge>
                      ))}
                      {(profileView.genres || []).length > 3 && (
                        <Badge variant="secondary">+{(profileView.genres || []).length - 3}</Badge>
                      )}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    const current = loadProfile();
                    setDraft(current);
                    setGenresInput((current.genres || []).join(', '));
                    setEditOpen(true);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Basic information
              </CardTitle>
              <CardDescription>Details shown in the app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm font-medium text-foreground">{profileView.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {profileView.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                <span className="text-sm font-medium text-foreground capitalize flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  {profileView.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Joined</span>
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {profileView.joinedAt}
                </span>
              </div>
              <div className="pt-2 border-t border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pen name</span>
                  <span className="text-sm font-medium text-foreground">
                    {profileView.penName || '—'}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-muted-foreground shrink-0">Genres</span>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {(profileView.genres || []).length === 0 ? (
                      <span className="text-sm font-medium text-foreground">—</span>
                    ) : (
                      (profileView.genres || []).map((g) => (
                        <Badge key={g} variant="secondary">{g}</Badge>
                      ))
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Bio</span>
                  <p className="text-sm text-foreground">
                    {profileView.bio?.trim() ? profileView.bio : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage basic security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Password</p>
                  <p className="text-xs text-muted-foreground">Change your account password</p>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Two-factor</p>
                  <p className="text-xs text-muted-foreground">Enable 2FA (coming soon)</p>
                </div>
                <Button variant="ghost" size="sm" disabled>Enable</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile_name">Name</Label>
              <Input
                id="profile_name"
                value={draft.name}
                onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile_pen_name">Pen name</Label>
              <Input
                id="profile_pen_name"
                value={draft.penName || ''}
                onChange={(e) => setDraft((p) => ({ ...p, penName: e.target.value }))}
                placeholder="e.g. A. Writer"
              />
              <p className="text-xs text-muted-foreground">
                Optional. Used for display/export. Does not change your manuscript content.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile_email">Email</Label>
              <Input
                id="profile_email"
                type="email"
                value={profile.email}
                disabled
                placeholder="you@example.com"
              />
              <p className="text-xs text-muted-foreground">
                Email changes require verification and are disabled in this demo.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile_genres">Genres / tags</Label>
              <Input
                id="profile_genres"
                value={genresInput}
                onChange={(e) => setGenresInput(e.target.value)}
                placeholder="e.g. Fantasy, Romance, Thriller"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated. Used to improve recommendations and AI context (UI metadata only).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile_bio">Bio</Label>
              <Textarea
                id="profile_bio"
                value={draft.bio || ''}
                onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))}
                placeholder="A short bio about you as an author..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={() => {
                const parsedGenres = genresInput
                  .split(',')
                  .map((g) => g.trim())
                  .filter(Boolean);

                const next: Profile = {
                  name: draft.name.trim() || 'Unnamed',
                  email: profile.email,
                  joinedAt: profile.joinedAt,
                  penName: (draft.penName || '').trim(),
                  bio: (draft.bio || '').trim(),
                  genres: parsedGenres,
                };
                saveProfile(next);
                setProfile(next);
                setEditOpen(false);
                toast({
                  title: 'Profile updated',
                  description: 'Your changes have been saved.',
                });
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DefaultLayout>
  );
}

