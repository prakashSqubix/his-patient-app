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
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useReduxAuth } from '@/hooks/useReduxAuth';
import { useTheme } from '@/contexts/ThemeContext';
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
import { Theme } from '@/types/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { profile, user } = useAuth(); // Keep for backward compatibility
  const reduxAuth = useReduxAuth();
  const { theme } = useTheme();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const styles = getStyles(theme);

  // Use Redux user data as primary, fallback to context
  const currentUser = reduxAuth.user || user;
  const currentProfile = profile; // Profile might still come from context

  console.log('HomeScreen - User Data:', {
    reduxUser: reduxAuth.user,
    contextUser: user,
    currentUser,
    profile: currentProfile,
  });

  const QUICK_ACTIONS = [
    {
      id: 'book',
      title: 'Book Appointment',
      icon: Calendar,
      color: theme.colors.primary,
      route: 'AppointmentsTab',
      params: { screen: 'AppointmentBook' }
    },
    {
      id: 'records',
      title: 'Medical Records',
      icon: FileText,
      color: theme.colors.success,
      route: 'RecordsTab',
    },
    {
      id: 'video',
      title: 'Video Consult',
      icon: Video,
      color: theme.colors.error,
      route: 'AppointmentsTab',
    },
    {
      id: 'profile',
      title: 'My Profile',
      icon: User,
      color: theme.colors.info,
      route: 'Profile',
    },
  ];

  useEffect(() => {
    loadData();
  }, [currentProfile?.tenant_id, currentUser?.id]);

  const loadData = async () => {
    try {
      if (currentProfile?.tenant_id) {
        // const bannersData = await TenantService.getBanners(currentProfile.tenant_id);
        setBanners([1, 2, 2, 2] as any);
      }

      if (currentUser?.id || currentUser?._id) {
        const userId = currentUser.id || currentUser._id;
        const appointments = await AppointmentService.getUpcoming(userId);
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
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.xs }]}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>
            {currentProfile?.first_name || currentUser?.phone || 'User'} {currentProfile?.last_name || ''}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Stethoscope size={24} color={theme.colors.primary} />
        </View>
      </View>

      {banners.length > 0 && (
        <View style={styles.section}>
          <FlatList
            data={banners}
            renderItem={renderBanner}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width - theme.spacing.xl}
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
              onPress={() => {
                if (action.params) {
                  navigation.navigate(action.route, action.params);
                } else {
                  navigation.navigate(action.route);
                }
              }}
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
              onPress={() => navigation.navigate('AppointmentsTab')}
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {upcomingAppointments.map((appointment) => (
            <Card key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentContent}>
                <View style={styles.appointmentIcon}>
                  <Calendar size={20} color={theme.colors.primary} />
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
            <ClipboardList size={24} color={theme.colors.success} />
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

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingTop: 60,
  },
  greeting: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily,
  },
  userName: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily,
  },
  headerRight: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.fontFamily,
  },
  seeAll: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.semibold as any,
    fontFamily: theme.typography.fontFamily,
  },
  bannerList: {
    paddingHorizontal: theme.spacing.md,
  },
  bannerItem: {
    width: width - (theme.spacing.lg * 1.5), // Approx width calculation
    height: 180,
    marginHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
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
    padding: theme.spacing.md,
  },
  bannerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: '#ffffff', // Keep white for overlay text
    fontFamily: theme.typography.fontFamily,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
    gap: 12,
  },
  actionCard: {
    width: (width - (theme.spacing.md * 2 + 24)) / 2, // 24 is approximate gap+padding
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
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
    marginBottom: theme.spacing.sm,
  },
  actionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeights.semibold as any,
    color: theme.colors.text.primary,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily,
  },
  appointmentCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  appointmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface, // Used surface as light background, or use primary + opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  doctorName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeights.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily,
  },
  appointmentDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: 6,
    fontFamily: theme.typography.fontFamily,
  },
  appointmentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface, // Or primary light
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.semibold as any,
    fontFamily: theme.typography.fontFamily,
  },
  healthTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  tipTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeights.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily,
  },
  tipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    fontFamily: theme.typography.fontFamily,
  },
});
