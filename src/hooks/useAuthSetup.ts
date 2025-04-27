
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile } from '@/utils/profileUtils';

export function useAuthSetup(
  setUser: (user: any) => void,
  setSession: (session: any) => void,
  setIsLoading: (isLoading: boolean) => void
) {
  useEffect(() => {
    console.log("Initializing auth setup...");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state change event:", event);
        setSession(currentSession);
        
        if (currentSession?.user) {
          setIsLoading(true); // Set loading while we fetch profile data
          try {
            const userProfile = await fetchUserProfile(currentSession);
            console.log("User profile from auth state change:", userProfile);
            setUser(userProfile);
          } catch (error) {
            console.error('Error in auth state change:', error);
            setUser(null);
          } finally {
            setIsLoading(false);
          }
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log("Initial session check:", initialSession ? "Session exists" : "No session");
        setSession(initialSession);
        
        if (initialSession?.user) {
          setIsLoading(true); // Ensure loading state is set
          const userProfile = await fetchUserProfile(initialSession);
          console.log("User profile from initial session:", userProfile);
          setUser(userProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setIsLoading]);
}
