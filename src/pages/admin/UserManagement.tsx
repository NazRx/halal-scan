import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Loader2, Shield, User, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';

type AppRole = 'admin' | 'moderator' | 'user';

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  roles: AppRole[];
}

const roleColors: Record<AppRole, string> = {
  admin: 'bg-red-500',
  moderator: 'bg-blue-500',
  user: 'bg-gray-500',
};

const roleIcons: Record<AppRole, typeof Shield> = {
  admin: Shield,
  moderator: Settings,
  user: User,
};

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<AppRole | ''>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Map roles to users
      const usersWithRoles: UserProfile[] = (profiles || []).map((profile) => ({
        ...profile,
        roles: (rolesData || [])
          .filter((r) => r.user_id === profile.id)
          .map((r) => r.role as AppRole),
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function addRole() {
    if (!editingUser || !newRole) return;

    // Prevent adding duplicate role
    if (editingUser.roles.includes(newRole)) {
      toast.error('User already has this role');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('user_roles').insert({
        user_id: editingUser.id,
        role: newRole,
      });

      if (error) throw error;

      toast.success(`Added ${newRole} role`);
      setNewRole('');
      fetchUsers();
      setEditingUser({
        ...editingUser,
        roles: [...editingUser.roles, newRole],
      });
    } catch (error) {
      console.error('Error adding role:', error);
      toast.error('Failed to add role');
    } finally {
      setSaving(false);
    }
  }

  async function removeRole(role: AppRole) {
    if (!editingUser) return;

    // Prevent removing own admin role
    if (editingUser.id === currentUser?.id && role === 'admin') {
      toast.error('You cannot remove your own admin role');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', editingUser.id)
        .eq('role', role);

      if (error) throw error;

      toast.success(`Removed ${role} role`);
      fetchUsers();
      setEditingUser({
        ...editingUser,
        roles: editingUser.roles.filter((r) => r !== role),
      });
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
    } finally {
      setSaving(false);
    }
  }

  const filteredUsers = users.filter((u) =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage user accounts and assign roles
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 max-w-md"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No users found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {user.full_name || 'Unnamed User'}
                      {user.id === currentUser?.id && (
                        <span className="text-muted-foreground text-sm ml-2">(you)</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {user.roles.length === 0 ? (
                      <Badge variant="outline">No roles</Badge>
                    ) : (
                      user.roles.map((role) => {
                        const Icon = roleIcons[role];
                        return (
                          <Badge key={role} className={roleColors[role]}>
                            <Icon className="h-3 w-3 mr-1" />
                            {role}
                          </Badge>
                        );
                      })
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}>
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Roles Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User Roles</DialogTitle>
            <DialogDescription>
              Add or remove roles for {editingUser?.full_name || 'this user'}
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <div className="space-y-6 py-4">
              <div>
                <h4 className="text-sm font-medium mb-3">Current Roles</h4>
                {editingUser.roles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No roles assigned</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {editingUser.roles.map((role) => {
                      const Icon = roleIcons[role];
                      const canRemove = !(editingUser.id === currentUser?.id && role === 'admin');
                      return (
                        <Badge
                          key={role}
                          className={`${roleColors[role]} ${canRemove ? 'pr-1' : ''}`}
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {role}
                          {canRemove && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1 hover:bg-white/20"
                              onClick={() => removeRole(role)}
                              disabled={saving}
                            >
                              ×
                            </Button>
                          )}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Add Role</h4>
                <div className="flex gap-2">
                  <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addRole} disabled={!newRole || saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
