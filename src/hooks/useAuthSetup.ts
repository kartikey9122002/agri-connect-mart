
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
        
        // Always update session first
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
      setIsLoading(true); // Ensure loading state is set at the start
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log("Initial session check:", initialSession ? "Session exists" : "No session");
        
        // Always update session first
        setSession(initialSession);
        
        if (initialSession?.user) {
          const userProfile = await fetchUserProfile(initialSession);
          console.log("User profile from initial session:", userProfile);
          setUser(userProfile);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
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
