import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Pencil, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { DefaultLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, userApi, UserProfile } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PROFILE_STORAGE_KEY = 'storynest_profile_v2';

type ProfileExtras = {
  penName?: string;
  bio?: string;
  genres?: string[];
};

type ProfileView = {
  id: number;
  name: string;
  email: string;
  joinedAt: string;
  role: string;
  isActive: boolean;
  avatarUrl?: string | null;
} & ProfileExtras;

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
  // Chỉ chấp nhận http/https, tránh text thường gây alt text xấu
  if (/^https?:\/\//i.test(value)) return value;
  return null;
}

function loadExtras(userId: number): ProfileExtras {
  const fallback: ProfileExtras = {
    penName: '',
    bio: '',
    genres: [],
  };
  try {
    const raw = localStorage.getItem(`${PROFILE_STORAGE_KEY}_${userId}`);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      penName: typeof parsed.penName === 'string' ? parsed.penName : fallback.penName,
      bio: typeof parsed.bio === 'string' ? parsed.bio : fallback.bio,
      genres: Array.isArray(parsed.genres) ? parsed.genres.map((g: unknown) => String(g)).filter(Boolean) : fallback.genres,
    };
  } catch {
    return fallback;
  }
}

function saveExtras(userId: number, extras: ProfileExtras) {
  localStorage.setItem(`${PROFILE_STORAGE_KEY}_${userId}`, JSON.stringify(extras));
  window.dispatchEvent(new CustomEvent('storynest_profile_updated', { detail: { userId, ...extras } }));
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
  const { user, isAuthenticated, updateUser } = useAuth();

  const [serverProfile, setServerProfile] = useState<UserProfile | null>(null);
  const [extras, setExtras] = useState<ProfileExtras>({ penName: '', bio: '', genres: [] });
  const [editOpen, setEditOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftPenName, setDraftPenName] = useState('');
  const [draftBio, setDraftBio] = useState('');
  const [genresInput, setGenresInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changing, setChanging] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await userApi.getProfile();
        if (cancelled) return;
        setServerProfile(res.data);
        const loadedExtras = loadExtras(res.data.userId);
        setExtras(loadedExtras);
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Không thể tải thông tin hồ sơ.';
        setLoadError(msg);
        toast({
          variant: 'destructive',
          title: 'Lỗi tải hồ sơ',
          description: msg,
        });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    const handler = () => {
      if (serverProfile) {
        setExtras(loadExtras(serverProfile.userId));
      }
    };
    window.addEventListener('storynest_profile_updated', handler);
    return () => {
      cancelled = true;
      window.removeEventListener('storynest_profile_updated', handler);
    };
  }, [isAuthenticated, user, toast]);

  const profileView: ProfileView | null = useMemo(() => {
    if (!serverProfile) return null;
    const normalizedAvatar = normalizeAvatarUrl(serverProfile.avatarUrl);
    return {
      id: serverProfile.userId,
      name: serverProfile.fullName,
      email: serverProfile.email,
      joinedAt: new Date(serverProfile.createdAt).toISOString().slice(0, 10),
      role: serverProfile.role,
      isActive: serverProfile.isActive,
      avatarUrl: normalizedAvatar,
      penName: extras.penName,
      bio: extras.bio,
      genres: extras.genres,
    };
  }, [serverProfile, extras]);

  const handleOpenEdit = () => {
    if (!profileView) return;
    setDraftName(profileView.name);
    setDraftPenName(profileView.penName || '');
    setDraftBio(profileView.bio || '');
    setGenresInput((profileView.genres || []).join(', '));
    setEditOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!profileView || !serverProfile) return;

    setIsSaving(true);
    try {
      const parsedGenres = genresInput
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean);

      // Cập nhật profile trên server (tên, avatar). Chỉ lưu URL hợp lệ, ngược lại coi như xóa avatar.
      const safeAvatar = normalizeAvatarUrl(profileView.avatarUrl ?? serverProfile.avatarUrl);
      const res = await userApi.updateProfile(
        draftName.trim() || serverProfile.fullName,
        safeAvatar
      );
      setServerProfile(res.data);

      // Cập nhật user trong AuthContext để đồng bộ tên/email/avatar
      updateUser({
        ...user!,
        fullName: res.data.fullName,
        email: res.data.email,
        avatarUrl: res.data.avatarUrl ?? undefined,
      });

      // Lưu metadata thêm (penName, bio, genres) theo userId
      const nextExtras: ProfileExtras = {
        penName: draftPenName.trim(),
        bio: draftBio.trim(),
        genres: parsedGenres,
      };
      setExtras(nextExtras);
      saveExtras(res.data.userId, nextExtras);

      setEditOpen(false);
      toast({
        title: 'Cập nhật hồ sơ thành công',
        description: 'Thông tin tài khoản của bạn đã được lưu.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể cập nhật hồ sơ. Vui lòng thử lại.';
      toast({
        variant: 'destructive',
        title: 'Lỗi cập nhật hồ sơ',
        description: msg,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setChangeError(null);
    setChanging(true);

    try {
      if (!isAuthenticated) {
        setChangeError('Bạn cần đăng nhập để đổi mật khẩu');
        return;
      }
      if (!currentPassword || !newPassword || !confirmPassword) {
        setChangeError('Vui lòng nhập đầy đủ thông tin');
        return;
      }
      if (newPassword.length < 6) {
        setChangeError('Mật khẩu mới phải có ít nhất 6 ký tự');
        return;
      }
      if (newPassword !== confirmPassword) {
        setChangeError('Mật khẩu xác nhận không khớp');
        return;
      }

      const res = await authApi.changePassword(currentPassword, newPassword);
      toast({
        title: 'Đổi mật khẩu thành công',
        description: res.message || 'Mật khẩu tài khoản của bạn đã được cập nhật.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Đổi mật khẩu thất bại. Vui lòng thử lại.';
      setChangeError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Lỗi đổi mật khẩu',
        description: errorMessage,
      });
    } finally {
      setChanging(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <DefaultLayout title="Profile" role={role}>
        <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
          <h1 className="font-serif text-3xl font-bold text-foreground">Bạn chưa đăng nhập</h1>
          <p className="text-muted-foreground">
            Vui lòng đăng nhập để xem và chỉnh sửa hồ sơ tài khoản.
          </p>
        </div>
      </DefaultLayout>
    );
  }

  if (isLoading || !profileView) {
    return (
      <DefaultLayout title="Profile" role={role}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Đang tải hồ sơ của bạn...</span>
          </div>
        </div>
      </DefaultLayout>
    );
  }

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
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/80 via-primary to-amber-400 flex items-center justify-center overflow-hidden ring-2 ring-primary/40 shadow-lg">
                    {profileView.avatarUrl && (
                      <img
                        src={profileView.avatarUrl}
                        alt={profileView.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {!profileView.avatarUrl && (
                      <span className="text-2xl font-semibold text-primary-foreground">
                        {getInitials(profileView.name)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                      {profileView.name}
                    </h1>
                    <p className="text-muted-foreground">
                      Manage your account details.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      <Badge variant="secondary" className="capitalize">
                        {profileView.role}
                      </Badge>
                      <Badge variant={profileView.isActive ? 'outline' : 'destructive'}>
                        {profileView.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">Joined {profileView.joinedAt}</Badge>
                    </div>
                    {(profileView.penName || (profileView.genres && profileView.genres.length > 0)) && (
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {profileView.penName && (
                          <Badge variant="outline">Pen name: {profileView.penName}</Badge>
                        )}
                        {(profileView.genres || []).slice(0, 3).map((g) => (
                          <Badge key={g} variant="secondary">
                            {g}
                          </Badge>
                        ))}
                        {(profileView.genres || []).length > 3 && (
                          <Badge variant="secondary">
                            +{(profileView.genres || []).length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleOpenEdit}
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
              <CardDescription>Quản lý bảo mật tài khoản</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleChangePassword} className="space-y-4">
                {changeError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{changeError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label>Mật khẩu hiện tại</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showCurrent ? 'text' : 'password'}
                      className="pl-11 pr-11"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={changing}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={changing}
                    >
                      {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Mật khẩu mới</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showNew ? 'text' : 'password'}
                      className="pl-11 pr-11"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={changing}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={changing}
                    >
                      {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Tối thiểu 6 ký tự.</p>
                </div>

                <div className="space-y-2">
                  <Label>Xác nhận mật khẩu mới</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showConfirm ? 'text' : 'password'}
                      className="pl-11 pr-11"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={changing}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={changing}
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" variant="gradient" disabled={changing}>
                  {changing ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    'Đổi mật khẩu'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profile_name">Name</Label>
                <Input
                  id="profile_name"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile_pen_name">Pen name</Label>
                <Input
                  id="profile_pen_name"
                  value={draftPenName}
                  onChange={(e) => setDraftPenName(e.target.value)}
                  placeholder="e.g. A. Writer"
                />
                <p className="text-xs text-muted-foreground">
                  Optional. Chỉ dùng để hiển thị trong UI, không thay đổi nội dung bản thảo.
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="profile_avatar">Avatar URL</Label>
                <Input
                  id="profile_avatar"
                  type="url"
                  value={profileView.avatarUrl || ''}
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    // Cập nhật tạm avatar trong view để user xem preview, thực tế sẽ lưu khi submit
                    if (serverProfile) {
                      setServerProfile({
                        ...serverProfile,
                        avatarUrl: value || '',
                      });
                    }
                  }}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                  Optional. Liên kết đến ảnh đại diện của bạn.
                </p>
              </div>
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
                Ngăn cách bằng dấu phẩy. Dùng để gợi ý và cung cấp thêm ngữ cảnh cho AI (metadata phía client).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile_bio">Bio</Label>
              <Textarea
                id="profile_bio"
                value={draftBio}
                onChange={(e) => setDraftBio(e.target.value)}
                placeholder="A short bio about you as an author..."
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={isSaving}>
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  'Save'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DefaultLayout>
  );
}

