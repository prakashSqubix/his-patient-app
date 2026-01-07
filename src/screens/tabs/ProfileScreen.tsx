import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Building2,
  LogOut,
  ChevronRight,
  Shield,
  FileText,
} from 'lucide-react-native';
import { Theme } from '@/types/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { profile, user, signOut } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const styles = getStyles(theme);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      // AppNavigator handles navigation via session state
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.xs }]}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {profile?.profile_picture_url ? (
            <Image
              source={{ uri: profile.profile_picture_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={40} color={theme.colors.primary} />
            </View>
          )}
        </View>
        <Text style={styles.name}>
          {profile?.first_name} {profile?.last_name}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Phone size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{profile?.phone || 'Not set'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Calendar size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>
                {formatDate(profile?.date_of_birth || null)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <User size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>
                {profile?.gender
                  ? profile.gender.charAt(0).toUpperCase() +
                  profile.gender.slice(1)
                  : 'Not set'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <MapPin size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>
                {profile?.address || 'Not set'}
              </Text>
            </View>
          </View>

          {profile?.blood_group && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Heart size={20} color={theme.colors.error} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Blood Group</Text>
                  <Text style={styles.infoValue}>{profile.blood_group}</Text>
                </View>
              </View>
            </>
          )}
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Information</Text>

        <Card>
          {profile?.allergies && profile.allergies.length > 0 && (
            <View>
              <Text style={styles.healthLabel}>Allergies</Text>
              {profile.allergies.map((allergy, index) => (
                <Text key={index} style={styles.healthItem}>
                  {allergy}
                </Text>
              ))}
            </View>
          )}

          {profile?.chronic_conditions &&
            profile.chronic_conditions.length > 0 && (
              <View style={styles.healthSection}>
                <Text style={styles.healthLabel}>Chronic Conditions</Text>
                {profile.chronic_conditions.map((condition, index) => (
                  <Text key={index} style={styles.healthItem}>
                    {condition}
                  </Text>
                ))}
              </View>
            )}

          {(!profile?.allergies || profile.allergies.length === 0) &&
            (!profile?.chronic_conditions ||
              profile.chronic_conditions.length === 0) && (
              <Text style={styles.noHealthInfo}>
                No health information recorded
              </Text>
            )}
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>

        <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
          <View style={styles.actionLeft}>
            <Shield size={20} color={theme.colors.text.secondary} />
            <Text style={styles.actionText}>Change Password</Text>
          </View>
          <ChevronRight size={20} color={theme.colors.text.disabled} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('TenantSwitch')}
        >
          <View style={styles.actionLeft}>
            <Building2 size={20} color={theme.colors.text.secondary} />
            <Text style={styles.actionText}>Switch Facility</Text>
          </View>
          <ChevronRight size={20} color={theme.colors.text.disabled} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
          <View style={styles.actionLeft}>
            <FileText size={20} color={theme.colors.text.secondary} />
            <Text style={styles.actionText}>Privacy Policy</Text>
          </View>
          <ChevronRight size={20} color={theme.colors.text.disabled} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          loading={loading}
          variant="secondary"
          style={styles.signOutButton}
        />
      </View>
    </ScrollView>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: 60,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface, // Use surface for slightly darker border or specific border color
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  avatarContainer: {
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily,
  },
  email: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily,
  },
  section: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeights.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.fontFamily,
  },
  infoCard: {
    padding: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeights.medium as any,
    fontFamily: theme.typography.fontFamily,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.surface,
    marginVertical: theme.spacing.md,
  },
  healthSection: {
    marginTop: theme.spacing.md,
  },
  healthLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeights.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily,
  },
  healthItem: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    paddingLeft: theme.spacing.md,
    fontFamily: theme.typography.fontFamily,
  },
  noHealthInfo: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.disabled,
    fontStyle: 'italic',
    fontFamily: theme.typography.fontFamily,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  actionText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeights.medium as any,
    fontFamily: theme.typography.fontFamily,
  },
  signOutButton: {
    width: '100%',
  },
});
