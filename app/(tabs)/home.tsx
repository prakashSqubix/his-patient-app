import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { TenantService } from '@/services/tenant.service';
import { AppointmentService } from '@/services/appointment.service';
import { Banner, Appointment } from '@/types/database';
import { Card } from '@/components/Card';
import { LoadingScreen } from '@/components/LoadingScreen';
import {
  Calendar,
  FileText,
  Stethoscope,
  Video,
  ClipboardList,
  User,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
  {
    id: 'book',
    title: 'Book Appointment',
    icon: Calendar,
    color: '#2563eb',
    route: '/(tabs)/appointments',
  },
  {
    id: 'records',
    title: 'Medical Records',
    icon: FileText,
    color: '#059669',
    route: '/(tabs)/records',
  },
  {
    id: 'video',
    title: 'Video Consult',
    icon: Video,
    color: '#dc2626',
    route: '/(tabs)/appointments',
  },
  {
    id: 'profile',
    title: 'My Profile',
    icon: User,
    color: '#7c3aed',
    route: '/(tabs)/profile',
  },
];

export default function HomeScreen() {
  const { profile, user } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [profile?.tenant_id, user?.id]);

  const loadData = async () => {
    try {
      if (profile?.tenant_id) {
        const bannersData = await TenantService.getBanners(profile.tenant_id);
        setBanners(bannersData);
      }

      if (user?.id) {
        const appointments = await AppointmentService.getUpcoming(user.id);
        setUpcomingAppointments(appointments.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBanner = ({ item }: { item: Banner }) => (
    <View style={styles.bannerItem}>
      <Image source={{ uri: item.image_url }} style={styles.bannerImage} />
      <View style={styles.bannerOverlay}>
        <Text style={styles.bannerTitle}>{item.title}</Text>
      </View>
    </View>
  );

  const formatAppointmentDate = (date: string, time: string) => {
    const dateObj = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };
    return `${dateObj.toLocaleDateString('en-US', options)} at ${time}`;
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>
            {profile?.first_name} {profile?.last_name}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Stethoscope size={24} color="#2563eb" />
        </View>
      </View>

      {banners.length > 0 && (
        <View style={styles.section}>
          <FlatList
            data={banners}
            renderItem={renderBanner}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width - 32}
            decelerationRate="fast"
            contentContainerStyle={styles.bannerList}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: action.color + '20' },
                ]}
              >
                <action.icon size={28} color={action.color} />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {upcomingAppointments.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/appointments')}
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {upcomingAppointments.map((appointment) => (
            <Card key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentContent}>
                <View style={styles.appointmentIcon}>
                  <Calendar size={20} color="#2563eb" />
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.doctorName}>
                    Dr. {appointment.doctor?.first_name}{' '}
                    {appointment.doctor?.last_name}
                  </Text>
                  <Text style={styles.appointmentDate}>
                    {formatAppointmentDate(
                      appointment.appointment_date,
                      appointment.appointment_time
                    )}
                  </Text>
                  <View style={styles.appointmentBadge}>
                    <Text style={styles.badgeText}>
                      {appointment.encounter_type}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Card>
          <View style={styles.healthTip}>
            <ClipboardList size={24} color="#059669" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Health Tip</Text>
              <Text style={styles.tipText}>
                Stay hydrated and maintain a balanced diet for better health
              </Text>
            </View>
          </View>
        </Card>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 16,
    color: '#64748b',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  headerRight: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  bannerList: {
    paddingHorizontal: 16,
  },
  bannerItem: {
    width: width - 32,
    height: 180,
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  actionCard: {
    width: (width - 56) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  appointmentCard: {
    marginHorizontal: 24,
    marginBottom: 12,
  },
  appointmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
  },
  appointmentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#dbeafe',
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  healthTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});
