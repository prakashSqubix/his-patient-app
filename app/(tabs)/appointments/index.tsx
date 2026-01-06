import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { AppointmentService } from '@/services/appointment.service';
import { Appointment } from '@/types/database';
import { Card } from '@/components/Card';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Button } from '@/components/Button';
import { Calendar, Clock, MapPin, Plus } from 'lucide-react-native';

export default function AppointmentsScreen() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

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
        return '#2563eb';
      case 'completed':
        return '#059669';
      case 'cancelled':
        return '#dc2626';
      case 'rescheduled':
        return '#f59e0b';
      default:
        return '#64748b';
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
          onPress={() => router.push('/(tabs)/appointments/search')}
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {appointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Appointments</Text>
            <Text style={styles.emptyText}>
              You don't have any appointments yet
            </Text>
            <Button
              title="Book Appointment"
              onPress={() => router.push('/(tabs)/appointments/search')}
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
                  <Calendar size={16} color="#64748b" />
                  <Text style={styles.detailText}>
                    {formatDate(appointment.appointment_date)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Clock size={16} color="#64748b" />
                  <Text style={styles.detailText}>
                    {appointment.appointment_time}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <MapPin size={16} color="#64748b" />
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
                    onPress={() => {}}
                    style={styles.actionButton}
                  />
                  <Button
                    title="Reschedule"
                    size="small"
                    onPress={() => {}}
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 32,
  },
  appointmentCard: {
    marginBottom: 16,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
});
