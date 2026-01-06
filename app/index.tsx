import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function Index() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!profile?.tenant_id) {
    return <Redirect href="/(auth)/tenant-selection" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
