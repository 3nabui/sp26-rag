import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, ShieldOff, Loader2 } from 'lucide-react';
import { DefaultLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminApi, AdminUserListItem } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type RoleFilter = 'all' | 'Author' | 'Staff' | 'Admin';

const roleLabels: Record<'Author' | 'Staff' | 'Admin', string> = {
  Author: 'Author',
  Staff: 'Staff',
  Admin: 'Admin',
};

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await adminApi.getUsers({
          pageNumber: 1,
          pageSize: 20,
          searchTerm: search || undefined,
          role: roleFilter === 'all' ? undefined : roleFilter,
          includeInactive: true,
        });
        setUsers(res.data);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Không thể tải danh sách người dùng.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [search, roleFilter]);

  const filtered = useMemo(() => users, [users]);

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
              <Select
                value={roleFilter}
                onValueChange={(val) => setRoleFilter(val as RoleFilter)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Author">Author</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="w-4 h-4" /> Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang tải danh sách người dùng...</span>
              </div>
            ) : error ? (
              <div className="py-6 text-sm text-destructive">{error}</div>
            ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm text-muted-foreground">User</th>
                  <th className="text-left py-3 px-2 text-sm text-muted-foreground">Email</th>
                  <th className="text-center py-3 px-2 text-sm text-muted-foreground">Role</th>
                  <th className="text-center py-3 px-2 text-sm text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-2 text-sm text-muted-foreground">Last Active</th>
                  <th className="text-center py-3 px-4 text-sm text-muted-foreground">Actions</th>
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
                    <td className="py-3 px-2 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.fullName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 align-middle text-sm text-muted-foreground">{user.email}</td>
                    <td className="py-3 px-2 align-middle text-center">
                      <Badge variant="secondary" className="capitalize inline-flex justify-center min-w-[72px]">
                        {roleLabels[user.role as 'Author' | 'Staff' | 'Admin']}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 align-middle text-center">
                      {user.isActive ? (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20 inline-flex justify-center min-w-[80px]">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border inline-flex justify-center min-w-[80px]">
                          Disabled
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-2 align-middle text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 align-middle text-center">
                      <div className="flex items-center justify-center gap-2">
                        {user.isActive ? (
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
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DefaultLayout>
  );
}

