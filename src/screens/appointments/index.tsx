import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppointmentService } from '@/services/appointment.service';
import { Appointment } from '@/types/database';
import { Card } from '@/components/Card';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Button } from '@/components/Button';
import { Calendar, Clock, MapPin, Plus } from 'lucide-react-native';
import { Theme } from '@/types/theme';

export default function AppointmentsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const styles = getStyles(theme);

  useEffect(() => {
    loadAppointments();
  }, [user?.id]);

  const loadAppointments = async () => {
    if (!user?.id) return;

    try {
      const data = await AppointmentService.getPatientAppointments(user.id);
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return theme.colors.primary;
      case 'completed':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      case 'rescheduled':
        return theme.colors.warning;
      default:
        return theme.colors.text.secondary;
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Appointments</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AppointmentSearch')}
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {appointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={64} color={theme.colors.text.disabled} />
            <Text style={styles.emptyTitle}>No Appointments</Text>
            <Text style={styles.emptyText}>
              You don't have any appointments yet
            </Text>
            <Button
              title="Book Appointment"
              onPress={() => navigation.navigate('AppointmentSearch')}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <Text style={styles.doctorName}>
                  Dr. {appointment.doctor?.first_name}{' '}
                  {appointment.doctor?.last_name}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        getStatusColor(appointment.status) + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(appointment.status) },
                    ]}
                  >
                    {appointment.status.charAt(0).toUpperCase() +
                      appointment.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.appointmentDetails}>
                <View style={styles.detailRow}>
                  <Calendar size={16} color={theme.colors.text.secondary} />
                  <Text style={styles.detailText}>
                    {formatDate(appointment.appointment_date)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Clock size={16} color={theme.colors.text.secondary} />
                  <Text style={styles.detailText}>
                    {appointment.appointment_time}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <MapPin size={16} color={theme.colors.text.secondary} />
                  <Text style={styles.detailText}>
                    {appointment.encounter_type}
                  </Text>
                </View>
              </View>

              {appointment.status === 'scheduled' && (
                <View style={styles.actions}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    size="small"
                    onPress={() => { }}
                    style={styles.actionButton}
                  />
                  <Button
                    title="Reschedule"
                    size="small"
                    onPress={() => { }}
                    style={styles.actionButton}
                  />
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </View>
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
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeights.semibold as any,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    fontFamily: theme.typography.fontFamily,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    fontFamily: theme.typography.fontFamily,
  },
  emptyButton: {
    paddingHorizontal: theme.spacing.xl,
  },
  appointmentCard: {
    marginBottom: theme.spacing.md,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  doctorName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeights.semibold as any,
    color: theme.colors.text.primary,
    flex: 1,
    fontFamily: theme.typography.fontFamily,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.lg,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeights.semibold as any,
    fontFamily: theme.typography.fontFamily,
  },
  appointmentDetails: {
    gap: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  detailText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
