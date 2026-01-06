import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { DoctorService } from '@/services/doctor.service';
import { AppointmentService } from '@/services/appointment.service';
import { DoctorWithSpecialties, EncounterType } from '@/types/database';
import { Card } from '@/components/Card';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Button } from '@/components/Button';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Input } from '@/components/Input';
import { ArrowLeft } from 'lucide-react-native';

const ENCOUNTER_TYPES: EncounterType[] = [
  'OPD',
  'Video Consultation',
  'Follow-up',
  'Emergency',
];

export default function BookAppointmentScreen() {
  const { doctorId } = useLocalSearchParams();
  const { user, profile } = useAuth();
  const [doctor, setDoctor] = useState<DoctorWithSpecialties | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [encounterType, setEncounterType] = useState<EncounterType>('OPD');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDoctor();
    const today = new Date();
    today.setDate(today.getDate() + 1);
    setSelectedDate(today.toISOString().split('T')[0]);
    setSelectedTime('09:00');
  }, [doctorId]);

  const loadDoctor = async () => {
    if (typeof doctorId !== 'string') return;

    try {
      const data = await DoctorService.getById(doctorId);
      setDoctor(data);
    } catch (error) {
      console.error('Error loading doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!user || !doctor || !profile?.tenant_id) return;

    if (!selectedDate || !selectedTime) {
      setError('Please select date and time');
      return;
    }

    setError('');
    setBooking(true);

    try {
      await AppointmentService.create(user.id, {
        doctorId: doctor.id,
        tenantId: profile.tenant_id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        encounterType,
        symptoms,
      });

      router.replace('/(tabs)/appointments');
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!doctor) {
    return (
      <View style={styles.container}>
        <Text>Doctor not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.doctorCard}>
          <Text style={styles.doctorName}>
            Dr. {doctor.first_name} {doctor.last_name}
          </Text>
          <Text style={styles.qualifications}>{doctor.qualifications}</Text>
        </Card>

        {error && <ErrorMessage message={error} />}

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Select Date & Time</Text>

          <Input
            label="Date"
            value={selectedDate}
            onChangeText={setSelectedDate}
            placeholder="YYYY-MM-DD"
          />

          <Input
            label="Time"
            value={selectedTime}
            onChangeText={setSelectedTime}
            placeholder="HH:MM"
          />
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Encounter Type</Text>
          <View style={styles.encounterTypes}>
            {ENCOUNTER_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.encounterButton,
                  encounterType === type && styles.encounterButtonActive,
                ]}
                onPress={() => setEncounterType(type)}
              >
                <Text
                  style={[
                    styles.encounterText,
                    encounterType === type && styles.encounterTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.formCard}>
          <Input
            label="Symptoms (Optional)"
            value={symptoms}
            onChangeText={setSymptoms}
            placeholder="Describe your symptoms"
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Consultation Fee:</Text>
            <Text style={styles.summaryValue}>
              ${doctor.consultation_fee.toFixed(2)}
            </Text>
          </View>
        </Card>

        <Button
          title="Confirm Booking"
          onPress={handleBookAppointment}
          loading={booking}
          style={styles.bookButton}
        />
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  content: {
    padding: 16,
  },
  doctorCard: {
    marginBottom: 16,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  qualifications: {
    fontSize: 14,
    color: '#64748b',
  },
  formCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  encounterTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  encounterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  encounterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  encounterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  encounterTextActive: {
    color: '#ffffff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  summaryCard: {
    marginBottom: 16,
    backgroundColor: '#f8fafc',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563eb',
  },
  bookButton: {
    marginBottom: 16,
  },
});
