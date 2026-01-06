import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { DoctorService } from '@/services/doctor.service';
import { DoctorWithSpecialties } from '@/types/database';
import { Card } from '@/components/Card';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Button } from '@/components/Button';
import { ArrowLeft, Star, Calendar, DollarSign } from 'lucide-react-native';

export default function DoctorProfileScreen() {
  const { id } = useLocalSearchParams();
  const [doctor, setDoctor] = useState<DoctorWithSpecialties | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctor();
  }, [id]);

  const loadDoctor = async () => {
    if (typeof id !== 'string') return;

    try {
      const data = await DoctorService.getById(id);
      setDoctor(data);
    } catch (error) {
      console.error('Error loading doctor:', error);
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>Doctor Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image
              source={{
                uri:
                  doctor.photo_url ||
                  'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?w=300',
              }}
              style={styles.doctorPhoto}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.doctorName}>
                Dr. {doctor.first_name} {doctor.last_name}
              </Text>
              <Text style={styles.qualifications}>{doctor.qualifications}</Text>
              <View style={styles.rating}>
                <Star size={16} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.ratingText}>
                  {doctor.rating.toFixed(1)} Rating
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.specialties}>
            {doctor.specialties.map((specialty) => (
              <View key={specialty.id} style={styles.specialtyBadge}>
                <Text style={styles.specialtyText}>{specialty.name}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{doctor.bio}</Text>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <View style={styles.infoRow}>
            <Calendar size={20} color="#2563eb" />
            <Text style={styles.infoText}>
              {doctor.experience_years} years of experience
            </Text>
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Consultation Fee</Text>
          <View style={styles.infoRow}>
            <DollarSign size={20} color="#2563eb" />
            <Text style={styles.feeText}>
              ${doctor.consultation_fee.toFixed(2)}
            </Text>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Book Appointment"
          onPress={() =>
            router.push({
              pathname: '/(tabs)/appointments/book',
              params: { doctorId: doctor.id },
            })
          }
          style={styles.bookButton}
        />
      </View>
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
    paddingBottom: 100,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  doctorPhoto: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  qualifications: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dbeafe',
    borderRadius: 16,
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  infoCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
  },
  feeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563eb',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  bookButton: {
    width: '100%',
  },
});
