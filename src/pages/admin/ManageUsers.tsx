
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserWithProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone: string | null;
  address: string | null;
  is_blocked: boolean;
}

const ManageUsers = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToToggle, setUserToToggle] = useState<UserWithProfile | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, user, navigate, toast]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get users with profiles joined
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            role,
            phone,
            address,
            is_blocked
          `);

        if (error) throw error;

        // Get emails from auth.users - in a real app, this would be done on the backend
        // This is a simplified approach for demo purposes
        const usersWithEmails: UserWithProfile[] = await Promise.all(
          (data || []).map(async (profile) => {
            // In a real app, you'd fetch this from your own users table that mirrors auth.users
            // or use a Supabase function with admin privileges
            const email = `${profile.full_name?.toLowerCase().replace(/\s+/g, '.')}@example.com`;

            return {
              ...profile,
              email: email || 'N/A',
            };
          })
        );

        setUsers(usersWithEmails);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: `Failed to fetch users: ${error.message}`,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, user, toast]);

  const handleToggleUserBlock = async () => {
    if (!userToToggle) return;

    try {
      const newBlockStatus = !userToToggle.is_blocked;
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: newBlockStatus })
        .eq('id', userToToggle.id);

      if (error) throw error;

      // Update local state
      setUsers(users.map(u => 
        u.id === userToToggle.id ? { ...u, is_blocked: newBlockStatus } : u
      ));

      toast({
        title: newBlockStatus ? 'User Blocked' : 'User Unblocked',
        description: `${userToToggle.full_name || 'User'} has been ${newBlockStatus ? 'blocked' : 'unblocked'}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to update user status: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setShowConfirmDialog(false);
      setUserToToggle(null);
    }
  };

  if (isLoading || loading) {
    return <div className="container mx-auto p-8 text-center">Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-agrigreen-900">Manage Users</h1>
        <p className="text-gray-600">View and manage platform users</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableCaption>A list of all registered users on the platform</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'seller' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'
                    }>
                      {user.role || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.phone || 'N/A'}</TableCell>
                  <TableCell>{user.address || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={user.is_blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                      {user.is_blocked ? 'Blocked' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {user.role !== 'admin' && (
                      <AlertDialog open={showConfirmDialog && userToToggle?.id === user.id} onOpenChange={setShowConfirmDialog}>
                        <AlertDialogTrigger asChild>
                          <div className="inline-flex items-center">
                            <span className="mr-2 text-sm text-gray-500">
                              {user.is_blocked ? 'Unblock' : 'Block'}
                            </span>
                            <Switch 
                              checked={!user.is_blocked} 
                              onClick={() => {
                                setUserToToggle(user);
                                setShowConfirmDialog(true);
                              }}
                            />
                          </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{user.is_blocked ? 'Unblock User' : 'Block User'}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {user.is_blocked 
                                ? `Are you sure you want to unblock ${user.full_name || 'this user'}? They will regain access to the platform.` 
                                : `Are you sure you want to block ${user.full_name || 'this user'}? They will not be able to access the platform.`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleToggleUserBlock}
                              className={user.is_blocked ? "bg-green-600" : "bg-red-600"}
                            >
                              {user.is_blocked ? 'Unblock' : 'Block'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">No users found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ManageUsers;
