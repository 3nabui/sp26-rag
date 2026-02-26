import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Shield, Palette, Globe, Save } from 'lucide-react';
import { DefaultLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from 'next-themes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

export default function SettingsPage() {
  const location = useLocation();
  const role = getRoleFromPath(location.pathname);
  const { theme: activeTheme = 'system', setTheme: setAppTheme } = useTheme();

  const defaults = useMemo(() => ({
    emailNotifications: true,
    productUpdates: true,
    securityAlerts: true,
  }), []);

  const [emailNotifications, setEmailNotifications] = useState(defaults.emailNotifications);
  const [productUpdates, setProductUpdates] = useState(defaults.productUpdates);
  const [securityAlerts, setSecurityAlerts] = useState(defaults.securityAlerts);

  return (
    <DefaultLayout title="Cài đặt" role={role}>
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
                    Cài đặt
                  </h1>
                  <p className="text-muted-foreground">
                    Tùy chỉnh StoryNest cho tài khoản của bạn.
                  </p>
                </div>
                <Button variant="outline" className="gap-2">
                  <Save className="w-4 h-4" />
                  Lưu
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Giao diện
              </CardTitle>
              <CardDescription>Chủ đề và hiển thị</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Chủ đề</Label>
                <Select
                  value={activeTheme === 'system' ? 'light' : activeTheme}
                  onValueChange={(v) => setAppTheme(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chủ đề" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Sáng</SelectItem>
                    <SelectItem value="dark">Tối</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-accent" />
                Thông báo
              </CardTitle>
              <CardDescription>Thông báo qua email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Thông báo email</p>
                  <p className="text-xs text-muted-foreground">Nhận thông báo qua email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Cập nhật sản phẩm</p>
                  <p className="text-xs text-muted-foreground">Cập nhật tính năng và ghi chú phát hành</p>
                </div>
                <Switch checked={productUpdates} onCheckedChange={setProductUpdates} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Cảnh báo bảo mật</p>
                  <p className="text-xs text-muted-foreground">Cảnh báo đăng nhập và bảo mật</p>
                </div>
                <Switch checked={securityAlerts} onCheckedChange={setSecurityAlerts} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-success" />
                Quyền riêng tư
              </CardTitle>
              <CardDescription>Các tùy chọn quyền riêng tư cơ bản (demo)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Cho phép thu thập thống kê sử dụng</p>
                  <p className="text-xs text-muted-foreground">Giúp cải thiện sản phẩm với dữ liệu ẩn danh</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Globe className="w-4 h-4" />
                Đây chỉ là giao diện demo, hiện chưa lưu dữ liệu lên server.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DefaultLayout>
  );
}

