import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { TenantService } from '@/services/tenant.service';
import { AuthService } from '@/services/auth.service';
import { Tenant } from '@/types/database';
import { Card } from '@/components/Card';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Building2 } from 'lucide-react-native';

export default function TenantSelectionScreen() {
  const { user, refreshProfile } = useAuth();
  const { updateTheme, theme } = useTheme();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const data = await TenantService.getAll();
      setTenants(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load facilities');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTenant = async (tenantId: string) => {
    if (!user) return;

    setSelecting(true);
    try {
      await AuthService.updateTenant(user.id, tenantId);
      await updateTheme(tenantId);
      await refreshProfile();
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setError(err.message || 'Failed to select facility');
    } finally {
      setSelecting(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading facilities..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Select Your Facility
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          Choose the clinic or care facility you want to access
        </Text>
      </View>

      {error && <ErrorMessage message={error} />}

      <FlatList
        data={tenants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelectTenant(item.id)}
            disabled={selecting}
            activeOpacity={0.7}
          >
            <Card style={styles.tenantCard}>
              <View style={styles.tenantContent}>
                {item.logo_url ? (
                  <Image
                    source={{ uri: item.logo_url }}
                    style={styles.logo}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.logoPlaceholder,
                      {
                        backgroundColor: item.primary_color,
                        borderRadius: theme.borderRadius.md
                      },
                    ]}
                  >
                    <Building2 size={32} color="#ffffff" />
                  </View>
                )}
                <View style={styles.tenantInfo}>
                  <Text style={[styles.tenantName, { color: theme.colors.text.primary }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.tenantType, { color: theme.colors.text.secondary }]}>
                    {item.type === 'clinic' ? 'Clinic' : 'Care Facility'}
                  </Text>
                  {item.address && (
                    <Text
                      style={[styles.tenantAddress, { color: theme.colors.text.disabled }]}
                      numberOfLines={1}
                    >
                      {item.address}
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  list: {
    padding: 16,
  },
  tenantCard: {
    marginBottom: 16,
  },
  tenantContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tenantInfo: {
    flex: 1,
    marginLeft: 16,
  },
  tenantName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  tenantType: {
    fontSize: 14,
    marginBottom: 2,
  },
  tenantAddress: {
    fontSize: 12,
  },
});
