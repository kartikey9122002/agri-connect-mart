
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types';
import { Session } from '@supabase/supabase-js';

export async function fetchUserProfile(session: Session): Promise<User | null> {
  try {
    // Get user profile data
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    console.log("User profile fetched:", profile);

    // Ensure role is a valid UserRole type
    const userRole = profile.role as string;
    const validRole: UserRole = 
      userRole === 'seller' ? 'seller' :
      userRole === 'admin' ? 'admin' : 'buyer';

    // Create user object with combined auth and profile data
    return {
      id: session.user.id,
      email: session.user.email || '',
      name: profile.full_name || '',
      role: validRole,
      createdAt: session.user.created_at
    };
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
}
