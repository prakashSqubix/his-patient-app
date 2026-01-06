import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile } from '@/types/database';
import { AuthService } from '@/services/auth.service';

interface User {
  id: string;
  email?: string;
}

interface Session {
  user: User;
  access_token: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock initial session check
    const initAuth = async () => {
      // Simulate checking storage for session
      setTimeout(() => {
        setLoading(false);
      }, 500);
    };
    initAuth();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const profileData = await AuthService.getProfile(userId);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock sign in
      const { user, session } = await AuthService.signIn({ email, password });
      setSession(session);
      setUser(user);
      await loadProfile(user.id);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: any) => {
    setLoading(true);
    try {
      const { user, session } = await AuthService.signUp(data);
      setSession(session);
      setUser(user);
      await loadProfile(user.id);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await AuthService.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');
    const updatedProfile = await AuthService.updateProfile(user.id, updates);
    setProfile(updatedProfile);
  };

  const refreshProfile = async () => {
    if (!user) return;
    await loadProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
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
