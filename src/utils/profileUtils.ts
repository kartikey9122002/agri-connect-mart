
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types';
import { Session } from '@supabase/supabase-js';

export async function fetchUserProfile(session: Session): Promise<User | null> {
  try {
    if (!session?.user?.id) {
      console.error('No user ID in session');
      return null;
    }
    
    console.log("Fetching user profile for ID:", session.user.id);
    
    // Get user profile data
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      
      // If profile not found, create one from user metadata
      if (error.code === 'PGRST116') {
        console.log("Profile not found, creating from user metadata");
        
        // Extract metadata from user
        const role = session.user.user_metadata?.role || 'buyer';
        const name = session.user.user_metadata?.full_name || '';
        
        // Try to create a profile if it doesn't exist
        try {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              full_name: name,
              role: role
            });
            
          if (insertError) {
            console.error('Error creating profile:', insertError);
            return null;
          } else {
            console.log('Profile created successfully');
            
            // Return user object based on the data we just inserted
            return {
              id: session.user.id,
              email: session.user.email || '',
              name: name,
              role: role as UserRole,
              createdAt: session.user.created_at || new Date().toISOString()
            };
          }
        } catch (insertErr) {
          console.error('Exception creating profile:', insertErr);
          return null;
        }
      }
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
      createdAt: session.user.created_at || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
}
