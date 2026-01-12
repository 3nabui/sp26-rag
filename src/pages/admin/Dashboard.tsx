import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Server,
  HardDrive,
  ShieldAlert,
  Clock3,
  Terminal,
  RefreshCw,
  Database,
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const systemLogs = [
  { id: 1, level: 'info', message: 'RAG worker started new batch', time: '09:21' },
  { id: 2, level: 'warn', message: 'Chunker latency elevated (p95=420ms)', time: '09:17' },
  { id: 3, level: 'error', message: 'Vector DB retry on shard-3 (2/3)', time: '09:12' },
  { id: 4, level: 'info', message: 'User admin enabled account writer-014', time: '08:58' },
  { id: 5, level: 'info', message: 'Storage cleanup job finished', time: '08:40' },
];

const storageUsage = [
  { label: 'Raw uploads', value: 62 },
  { label: 'Preprocessed chunks', value: 48 },
  { label: 'Vector index', value: 71 },
];

export default function AdminDashboard() {
  const stats = useMemo(() => ([
    { title: 'Daily Requests', value: '1,248', icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Running Jobs', value: '12', icon: RefreshCw, color: 'text-info', bg: 'bg-info/10' },
    { title: 'Alerts', value: '3', icon: ShieldAlert, color: 'text-destructive', bg: 'bg-destructive/10' },
  ]), []);

  return (
    <DefaultLayout title="Admin Dashboard" role="admin">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Top stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((item, idx) => (
            <Card key={idx} variant="metric" className="hover-lift">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{item.title}</p>
                  <p className="text-3xl font-bold text-foreground font-serif">{item.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Logs + capacity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card variant="elevated" className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>Latest system logs</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-2">
                <Terminal className="w-4 h-4" /> View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {systemLogs.map((log) => {
                const levelColor = log.level === 'error'
                  ? 'bg-destructive/10 text-destructive border-destructive/20'
                  : log.level === 'warn'
                    ? 'bg-warning/10 text-warning border-warning/20'
                    : 'bg-info/10 text-info border-info/20';
                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg border border-border/50 bg-secondary/30 flex items-start justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${levelColor} capitalize`}>{log.level}</Badge>
                      <p className="text-sm text-foreground">{log.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{log.time}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Storage & System</CardTitle>
              <CardDescription>Monitor usage and resources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-secondary/30 flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                  <p className="text-base font-medium text-foreground">5.2 TB / 7 TB</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30 flex items-center gap-3">
                <Database className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Vector DB shards</p>
                  <p className="text-base font-medium text-foreground">5 shards • 2 standby</p>
                </div>
              </div>
              <div className="space-y-3">
                {storageUsage.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-foreground font-medium">{item.value}%</span>
                    </div>
                    <Progress value={item.value} />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Clock3 className="w-4 h-4" /> Schedule Cleanup
                </Button>
                <Button variant="gradient" size="sm" className="gap-2">
                  <Server className="w-4 h-4" /> Increase Storage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </DefaultLayout>
  );
}

