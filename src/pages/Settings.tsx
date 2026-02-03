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
    <DefaultLayout title="Settings" role={role}>
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
                    Settings
                  </h1>
                  <p className="text-muted-foreground">
                    Customize StoryNest for your account.
                  </p>
                </div>
                <Button variant="outline" className="gap-2">
                  <Save className="w-4 h-4" />
                  Save
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
                Appearance
              </CardTitle>
              <CardDescription>Theme and display</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Theme</Label>
                <Select
                  value={activeTheme === 'system' ? 'light' : activeTheme}
                  onValueChange={(v) => setAppTheme(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-accent" />
                Notifications
              </CardTitle>
              <CardDescription>Email notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Email notifications</p>
                  <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Product updates</p>
                  <p className="text-xs text-muted-foreground">Feature updates and release notes</p>
                </div>
                <Switch checked={productUpdates} onCheckedChange={setProductUpdates} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Security alerts</p>
                  <p className="text-xs text-muted-foreground">Login and security alerts</p>
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
                Privacy
              </CardTitle>
              <CardDescription>Basic privacy options (demo)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Allow usage analytics</p>
                  <p className="text-xs text-muted-foreground">Help improve the product with anonymous usage data</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Globe className="w-4 h-4" />
                This is demo UI only and is not saved to a server yet.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DefaultLayout>
  );
}

