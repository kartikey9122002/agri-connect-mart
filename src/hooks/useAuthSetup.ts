
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
    
    setIsLoading(true); // Start in loading state

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state change event:", event, currentSession?.user?.id);
        
        // Always update session first
        setSession(currentSession);
        
        // Handle user profile separately with setTimeout to avoid potential deadlock
        if (currentSession?.user) {
          // Use setTimeout to break potential deadlock in auth state changes
          setTimeout(async () => {
            try {
              const userProfile = await fetchUserProfile(currentSession);
              console.log("User profile from auth state change:", userProfile);
              
              if (userProfile) {
                setUser(userProfile);
              } else {
                setUser(null);
                console.error("Failed to get user profile during auth state change");
              }
            } catch (error) {
              console.error('Error in auth state change:', error);
              setUser(null);
            } finally {
              setIsLoading(false);
            }
          }, 0);
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
        
        // Always update session first
        setSession(initialSession);
        
        if (initialSession?.user) {
          // Use setTimeout to break potential deadlock
          setTimeout(async () => {
            try {
              const userProfile = await fetchUserProfile(initialSession);
              console.log("User profile from initial session:", userProfile);
              
              if (userProfile) {
                setUser(userProfile);
              } else {
                console.error("Failed to get user profile during initialization");
                setUser(null);
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
              setUser(null);
            } finally {
              setIsLoading(false);
            }
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setIsLoading(false);
      }
    };

    // Initialize auth after setting up the listener
    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setIsLoading]);
}
