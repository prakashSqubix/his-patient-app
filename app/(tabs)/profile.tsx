import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
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

export default function ProfileScreen() {
  const { profile, user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      router.replace('/(auth)/login');
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
      <View style={styles.header}>
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
              <User size={40} color="#2563eb" />
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
              <Phone size={20} color="#2563eb" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{profile?.phone || 'Not set'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Calendar size={20} color="#2563eb" />
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
              <User size={20} color="#2563eb" />
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
              <MapPin size={20} color="#2563eb" />
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
                  <Heart size={20} color="#dc2626" />
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
            <Shield size={20} color="#64748b" />
            <Text style={styles.actionText}>Change Password</Text>
          </View>
          <ChevronRight size={20} color="#cbd5e1" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          activeOpacity={0.7}
          onPress={() => router.push('/(auth)/tenant-selection')}
        >
          <View style={styles.actionLeft}>
            <Building2 size={20} color="#64748b" />
            <Text style={styles.actionText}>Switch Facility</Text>
          </View>
          <ChevronRight size={20} color="#cbd5e1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
          <View style={styles.actionLeft}>
            <FileText size={20} color="#64748b" />
            <Text style={styles.actionText}>Privacy Policy</Text>
          </View>
          <ChevronRight size={20} color="#cbd5e1" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#ffffff',
  },
  avatarContainer: {
    marginBottom: 16,
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
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#64748b',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  infoCard: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  healthSection: {
    marginTop: 16,
  },
  healthLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  healthItem: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
    paddingLeft: 12,
  },
  noHealthInfo: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  signOutButton: {
    width: '100%',
  },
});
