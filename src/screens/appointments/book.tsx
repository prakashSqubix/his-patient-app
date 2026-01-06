import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { DoctorService } from '@/services/doctor.service';
import { AppointmentService } from '@/services/appointment.service';
import { SlotsService, DaySlots, TimeSlot } from '@/services/slots.service';
import { DoctorWithSpecialties, EncounterType } from '@/types/database';
import { Card } from '@/components/Card';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Button } from '@/components/Button';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Input } from '@/components/Input';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react-native';

const ENCOUNTER_TYPES: EncounterType[] = [
  'OPD',
  'Video Consultation',
  'Follow-up',
  'Emergency',
];

export default function BookAppointmentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { doctorId } = route.params || {};
  const { user, profile } = useAuth();
  const { theme } = useTheme();
  const [doctor, setDoctor] = useState<DoctorWithSpecialties | null>(null);
  const [daySlots, setDaySlots] = useState<DaySlots[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [encounterType, setEncounterType] = useState<EncounterType>('OPD');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (doctor) {
      loadSlots();
    }
  }, [doctor]);

  const loadDoctor = async () => {
    if (!doctorId) return;

    try {
      const data = await DoctorService.getById(doctorId);
      setDoctor(data);
    } catch (error) {
      console.error('Error loading doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async () => {
    if (!doctor) return;

    setLoadingSlots(true);
    try {
      const today = new Date();
      today.setDate(today.getDate() + 1);
      const slots = await SlotsService.getDoctorSlots(doctor.id, today);
      setDaySlots(slots);
      if (slots.length > 0) {
        setSelectedDate(slots[0].date);
      }
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!user || !doctor || !profile?.tenant_id) return;

    if (!selectedDate || !selectedSlot) {
      setError('Please select a date and time slot');
      return;
    }

    setError('');
    setBooking(true);

    try {
      await AppointmentService.create(user.id, {
        doctorId: doctor.id,
        tenantId: profile.tenant_id,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot.time,
        encounterType,
        symptoms,
      });

      // Navigate to Appointment List
      navigation.navigate('AppointmentList');
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  const getSelectedDaySlots = () => {
    return daySlots.find((day) => day.date === selectedDate);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!doctor) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text.primary }}>Doctor not found</Text>
      </View>
    );
  }

  const selectedDaySlots = getSelectedDaySlots();
  const groupedSlots = selectedDaySlots
    ? SlotsService.groupSlotsByPeriod(selectedDaySlots.slots)
    : { morning: [], afternoon: [], evening: [] };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.text.disabled + '40' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Book Appointment
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.doctorCard}>
          <Text style={[styles.doctorName, { color: theme.colors.text.primary }]}>
            Dr. {doctor.first_name} {doctor.last_name}
          </Text>
          <Text style={[styles.qualifications, { color: theme.colors.text.secondary }]}>
            {doctor.qualifications}
          </Text>
        </Card>

        {error && <ErrorMessage message={error} />}

        <Card style={styles.formCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Select Date
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.datesContainer}>
              {daySlots.map((day) => (
                <TouchableOpacity
                  key={day.date}
                  style={[
                    styles.dateCard,
                    {
                      backgroundColor: selectedDate === day.date
                        ? theme.colors.primary
                        : theme.colors.surface,
                      borderColor: selectedDate === day.date
                        ? theme.colors.primary
                        : theme.colors.text.disabled + '40'
                    },
                  ]}
                  onPress={() => {
                    setSelectedDate(day.date);
                    setSelectedSlot(null);
                  }}
                >
                  <Text
                    style={[
                      styles.dayName,
                      {
                        color: selectedDate === day.date
                          ? '#ffffff'
                          : theme.colors.text.secondary,
                      },
                    ]}
                  >
                    {day.dayName}
                  </Text>
                  <Text
                    style={[
                      styles.dateText,
                      {
                        color: selectedDate === day.date
                          ? '#ffffff'
                          : theme.colors.text.primary,
                      },
                    ]}
                  >
                    {formatDate(day.date)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Card>

        {loadingSlots ? (
          <View style={styles.loadingSlots}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
              Loading available slots...
            </Text>
          </View>
        ) : (
          <Card style={styles.formCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Select Time Slot
            </Text>

            {groupedSlots.morning.length > 0 && (
              <View style={styles.slotPeriod}>
                <Text style={[styles.periodTitle, { color: theme.colors.text.secondary }]}>
                  Morning
                </Text>
                <View style={styles.slotsGrid}>
                  {groupedSlots.morning.map((slot) => (
                    <TouchableOpacity
                      key={slot.id}
                      disabled={!slot.available}
                      style={[
                        styles.slotButton,
                        {
                          backgroundColor: selectedSlot?.id === slot.id
                            ? theme.colors.primary
                            : slot.available
                              ? theme.colors.surface
                              : theme.colors.text.disabled + '20',
                          borderColor: selectedSlot?.id === slot.id
                            ? theme.colors.primary
                            : theme.colors.text.disabled + '40',
                        },
                      ]}
                      onPress={() => setSelectedSlot(slot)}
                    >
                      <Text
                        style={[
                          styles.slotText,
                          {
                            color: selectedSlot?.id === slot.id
                              ? '#ffffff'
                              : slot.available
                                ? theme.colors.text.primary
                                : theme.colors.text.disabled,
                          },
                        ]}
                      >
                        {slot.time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {groupedSlots.afternoon.length > 0 && (
              <View style={styles.slotPeriod}>
                <Text style={[styles.periodTitle, { color: theme.colors.text.secondary }]}>
                  Afternoon
                </Text>
                <View style={styles.slotsGrid}>
                  {groupedSlots.afternoon.map((slot) => (
                    <TouchableOpacity
                      key={slot.id}
                      disabled={!slot.available}
                      style={[
                        styles.slotButton,
                        {
                          backgroundColor: selectedSlot?.id === slot.id
                            ? theme.colors.primary
                            : slot.available
                              ? theme.colors.surface
                              : theme.colors.text.disabled + '20',
                          borderColor: selectedSlot?.id === slot.id
                            ? theme.colors.primary
                            : theme.colors.text.disabled + '40',
                        },
                      ]}
                      onPress={() => setSelectedSlot(slot)}
                    >
                      <Text
                        style={[
                          styles.slotText,
                          {
                            color: selectedSlot?.id === slot.id
                              ? '#ffffff'
                              : slot.available
                                ? theme.colors.text.primary
                                : theme.colors.text.disabled,
                          },
                        ]}
                      >
                        {slot.time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {groupedSlots.evening.length > 0 && (
              <View style={styles.slotPeriod}>
                <Text style={[styles.periodTitle, { color: theme.colors.text.secondary }]}>
                  Evening
                </Text>
                <View style={styles.slotsGrid}>
                  {groupedSlots.evening.map((slot) => (
                    <TouchableOpacity
                      key={slot.id}
                      disabled={!slot.available}
                      style={[
                        styles.slotButton,
                        {
                          backgroundColor: selectedSlot?.id === slot.id
                            ? theme.colors.primary
                            : slot.available
                              ? theme.colors.surface
                              : theme.colors.text.disabled + '20',
                          borderColor: selectedSlot?.id === slot.id
                            ? theme.colors.primary
                            : theme.colors.text.disabled + '40',
                        },
                      ]}
                      onPress={() => setSelectedSlot(slot)}
                    >
                      <Text
                        style={[
                          styles.slotText,
                          {
                            color: selectedSlot?.id === slot.id
                              ? '#ffffff'
                              : slot.available
                                ? theme.colors.text.primary
                                : theme.colors.text.disabled,
                          },
                        ]}
                      >
                        {slot.time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </Card>
        )}

        <Card style={styles.formCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Encounter Type
          </Text>
          <View style={styles.encounterTypes}>
            {ENCOUNTER_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.encounterButton,
                  {
                    backgroundColor: encounterType === type
                      ? theme.colors.primary
                      : theme.colors.surface,
                    borderColor: encounterType === type
                      ? theme.colors.primary
                      : theme.colors.text.disabled + '40',
                  },
                ]}
                onPress={() => setEncounterType(type)}
              >
                <Text
                  style={[
                    styles.encounterText,
                    {
                      color: encounterType === type
                        ? '#ffffff'
                        : theme.colors.text.primary,
                    },
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
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Summary
          </Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.text.secondary }]}>
              Consultation Fee:
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
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
    marginBottom: 4,
  },
  qualifications: {
    fontSize: 14,
  },
  formCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  datesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 80,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
  },
  loadingSlots: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  slotPeriod: {
    marginBottom: 20,
  },
  periodTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  slotText: {
    fontSize: 14,
    fontWeight: '600',
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
    borderWidth: 1,
  },
  encounterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  bookButton: {
    marginBottom: 16,
  },
});
