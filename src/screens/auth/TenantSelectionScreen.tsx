import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { TenantService } from '@/services/tenant.service';
import { AuthService } from '@/services/auth.service';
import { Tenant } from '@/types/database';
import { Card } from '@/components/Card';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Building2 } from 'lucide-react-native';
import { Theme } from '@/types/theme';

export default function TenantSelectionScreen() {
  const navigation = useNavigation<any>();
  const { user, refreshProfile } = useAuth();
  const { updateTheme, theme } = useTheme();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selecting, setSelecting] = useState(false);

  const styles = getStyles(theme);

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
      navigation.navigate('Main');
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Select Your Facility
        </Text>
        <Text style={styles.subtitle}>
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
                  <Text style={styles.tenantName}>
                    {item.name}
                  </Text>
                  <Text style={styles.tenantType}>
                    {item.type === 'clinic' ? 'Clinic' : 'Care Facility'}
                  </Text>
                  {item.address && (
                    <Text
                      style={styles.tenantAddress}
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

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28, // Custom size for header, could map to xxl
    fontWeight: theme.typography.fontWeights.bold as any,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily,
  },
  list: {
    padding: theme.spacing.md,
  },
  tenantCard: {
    marginBottom: theme.spacing.md,
  },
  tenantContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.md,
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tenantInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  tenantName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeights.semibold as any,
    marginBottom: 4,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily,
  },
  tenantType: {
    fontSize: theme.typography.fontSize.sm,
    marginBottom: 2,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily,
  },
  tenantAddress: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled,
    fontFamily: theme.typography.fontFamily,
  },
});
