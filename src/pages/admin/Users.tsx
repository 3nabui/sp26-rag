import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, ShieldCheck, ShieldOff } from 'lucide-react';
import { DefaultLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Role = 'author' | 'staff' | 'admin';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'disabled';
  lastActive: string;
}

const mockUsers: UserRow[] = [
  { id: 'U-1001', name: 'Võ Hào', email: 'hao@example.com', role: 'author', status: 'active', lastActive: '09:10' },
  { id: 'U-1002', name: 'Nguyễn An', email: 'an@example.com', role: 'staff', status: 'active', lastActive: '09:05' },
  { id: 'U-1003', name: 'Trần Minh', email: 'minh@example.com', role: 'author', status: 'disabled', lastActive: 'Yesterday' },
  { id: 'U-1004', name: 'Lê Quang', email: 'quang@example.com', role: 'author', status: 'active', lastActive: '08:40' },
  { id: 'U-1005', name: 'Admin Root', email: 'root@example.com', role: 'admin', status: 'active', lastActive: '08:10' },
];

const roleLabels: Record<Role, string> = {
  author: 'Author',
  staff: 'Staff',
  admin: 'Admin',
};

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');

  const filtered = useMemo(() => {
    return mockUsers.filter((u) => {
      const matchText = (u.name + u.email).toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' ? true : u.role === roleFilter;
      return matchText && matchRole;
    });
  }, [search, roleFilter]);

  return (
    <DefaultLayout title="User Management" role="admin">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card variant="elevated">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>User List</CardTitle>
              <CardDescription>Manage roles and account status</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All Roles</option>
                <option value="author">Author</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="w-4 h-4" /> Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm text-muted-foreground">User</th>
                  <th className="text-left py-3 px-2 text-sm text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-2 text-sm text-muted-foreground">Role</th>
                  <th className="text-left py-3 px-2 text-sm text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-2 text-sm text-muted-foreground">Last Active</th>
                  <th className="text-right py-3 px-2 text-sm text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, idx) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-border/50 hover:bg-secondary/30"
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">{user.email}</td>
                    <td className="py-3 px-2">
                      <Badge variant="secondary" className="capitalize">{roleLabels[user.role]}</Badge>
                    </td>
                    <td className="py-3 px-2">
                      {user.status === 'active' ? (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border">Disabled</Badge>
                      )}
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">{user.lastActive}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-end gap-2">
                        {user.status === 'active' ? (
                          <Button variant="ghost" size="sm" className="text-destructive gap-1">
                            <ShieldOff className="w-4 h-4" /> Disable
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-success gap-1">
                            <ShieldCheck className="w-4 h-4" /> Enable
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </motion.div>
    </DefaultLayout>
  );
}

