import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { User, UserRole } from '@/types';

interface ProfileData {
  id: string;
  full_name: string | null;
  role: string | null;
  is_blocked?: boolean | null;
  email: string | null;
  created_at: string | null;
}

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch profiles data first which should be more reliable
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, role, is_blocked, email, created_at');
      
      if (profilesError) throw profilesError;
      
      if (!profilesData) {
        setUsers([]);
        return;
      }
      
      // Ensure data is of correct type before mapping
      const validData = profilesData as unknown as ProfileData[];
      
      // Map profiles to the User type
      const formattedUsers: User[] = validData.map(profile => {
        // Ensure role is a valid UserRole
        const role = profile.role as string;
        const validRole: UserRole = 
          role === 'seller' ? 'seller' :
          role === 'admin' ? 'admin' : 'buyer';
          
        return {
          id: profile.id,
          email: profile.email || 'No email provided',
          name: profile.full_name || 'Unnamed User',
          role: validRole,
          createdAt: profile.created_at || new Date().toISOString(),
          isBlocked: profile.is_blocked || false
        };
      });
      
      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBlockUser = async (userId: string, isCurrentlyBlocked: boolean) => {
    try {
      // Update the is_blocked field in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_blocked: !isCurrentlyBlocked 
        })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, isBlocked: !isCurrentlyBlocked }
            : user
        )
      );

      toast({
        title: 'Success',
        description: `User ${isCurrentlyBlocked ? 'unblocked' : 'blocked'} successfully.`,
      });
    } catch (error: any) {
      console.error('Error toggling user block status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
      
      {isLoading ? (
        <div className="text-center py-8">Loading users...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {users.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500">No users found.</p>
              </CardContent>
            </Card>
          ) : (
            users.map((user) => (
              <Card key={user.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <Badge variant={user.isBlocked ? "destructive" : "outline"}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p>{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="capitalize">{user.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="truncate text-xs">{user.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Joined</p>
                      <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant={user.isBlocked ? "default" : "destructive"}
                      onClick={() => handleToggleBlockUser(user.id, !!user.isBlocked)}
                    >
                      {user.isBlocked ? 'Unblock User' : 'Block User'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
