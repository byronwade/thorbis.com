/**
 * Authentication Context for Thorbis Business OS
 * 
 * This context provides authentication state management across all business
 * applications, including user authentication, role-based access control, and
 * session management. It integrates with Supabase Auth and provides a clean
 * interface for authentication operations across the entire platform.
 * 
 * Key features:
 * - User authentication state management
 * - Role-based access control for all business verticals
 * - Session persistence and management
 * - Integration with Supabase Auth
 * - Loading states and error handling
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase-client';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'employee' | 'viewer';
  permissions: string[];
  created_at: string;
}

export interface UserProfile {
  id: string;
  name?: string;
  email: string;
  avatar_url?: string;
  industry?: string;
  role?: string;
  created_at: string;
}

interface AuthContextType {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: { message: string } }>;
  signOut: () => Promise<void>;
  clearError: () => void;
  hasPermission?: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check for existing session
    checkAuth();
    
    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await checkAuth();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      // Get current session from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setUser(null);
        setUserProfile(null);
        return;
      }
      
      if (session?.user) {
        // Fetch user profile from database
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          console.error('Profile fetch error:', profileError);
          // Set basic user info from auth
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || ',
            name: session.user.user_metadata?.full_name,
            role: 'viewer', // Default role
            permissions: ['read'],
            created_at: session.user.created_at,
          };
          setUser(authUser);
          setUserProfile(null);
        } else {
          // Set user with profile data
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || ',
            name: profile.name || session.user.user_metadata?.full_name,
            avatar: profile.avatar_url,
            role: profile.role || 'viewer',
            permissions: profile.permissions || ['read'],
            created_at: session.user.created_at,
          };
          
          const userProfile: UserProfile = {
            id: profile.id,
            name: profile.name,
            email: session.user.email || ',
            avatar_url: profile.avatar_url,
            industry: profile.industry,
            role: profile.role,
            created_at: profile.created_at,
          };
          
          setUser(authUser);
          setUserProfile(userProfile);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use Supabase Auth for sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setError(error.message);
        return { error: { message: error.message } };
      }
      
      if (data.user) {
        // User authentication successful, checkAuth will be called by the auth state change listener
        await checkAuth();
      }
      
      return {};
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Sign in failed';
      setError(error);
      return { error: { message: error } };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use Supabase Auth for sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setError(error.message);
        throw new Error(error.message);
      }
      
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        isAuthenticated,
        error,
        signIn,
        signOut,
        clearError,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}