import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { DoctorService } from '@/services/doctor.service';
import { DoctorWithSpecialties, Specialty } from '@/types/database';
import { Card } from '@/components/Card';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ArrowLeft, Search, Star } from 'lucide-react-native';

export default function SearchDoctorsScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useAuth();
  const [searchMode, setSearchMode] = useState<'specialty' | 'name'>(
    'specialty'
  );
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState<DoctorWithSpecialties[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    try {
      const data = await DoctorService.getAllSpecialties();
      setSpecialties(data);
    } catch (error) {
      console.error('Error loading specialties:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchBySpecialty = async (specialtyId: string) => {
    setSearching(true);
    try {
      const data = await DoctorService.searchBySpecialty(
        specialtyId,
        profile?.tenant_id || undefined
      );
      setDoctors(data);
    } catch (error) {
      console.error('Error searching doctors:', error);
    } finally {
      setSearching(false);
    }
  };

  const searchByName = async () => {
    if (!searchTerm.trim()) return;

    setSearching(true);
    try {
      const data = await DoctorService.searchByName(
        searchTerm,
        profile?.tenant_id || undefined
      );
      setDoctors(data);
    } catch (error) {
      console.error('Error searching doctors:', error);
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Find a Doctor</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchModeToggle}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            searchMode === 'specialty' && styles.toggleButtonActive,
          ]}
          onPress={() => {
            setSearchMode('specialty');
            setDoctors([]);
          }}
        >
          <Text
            style={[
              styles.toggleText,
              searchMode === 'specialty' && styles.toggleTextActive,
            ]}
          >
            By Specialty
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            searchMode === 'name' && styles.toggleButtonActive,
          ]}
          onPress={() => {
            setSearchMode('name');
            setDoctors([]);
          }}
        >
          <Text
            style={[
              styles.toggleText,
              searchMode === 'name' && styles.toggleTextActive,
            ]}
          >
            By Name
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {searchMode === 'specialty' ? (
          <>
            <Text style={styles.sectionTitle}>Select Specialty</Text>
            {specialties.map((specialty) => (
              <TouchableOpacity
                key={specialty.id}
                onPress={() => searchBySpecialty(specialty.id)}
                activeOpacity={0.7}
              >
                <Card style={styles.specialtyCard}>
                  <View style={styles.specialtyContent}>
                    <Text style={styles.specialtyName}>{specialty.name}</Text>
                    {specialty.description && (
                      <Text style={styles.specialtyDescription}>
                        {specialty.description}
                      </Text>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <>
            <View style={styles.searchBox}>
              <Search size={20} color="#64748b" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search doctor by name"
                value={searchTerm}
                onChangeText={setSearchTerm}
                onSubmitEditing={searchByName}
                returnKeyType="search"
              />
            </View>
          </>
        )}

        {searching && (
          <View style={styles.searchingState}>
            <Text style={styles.searchingText}>Searching...</Text>
          </View>
        )}

        {doctors.length > 0 && (
          <>
            <Text style={styles.resultsTitle}>
              {doctors.length} Doctor{doctors.length > 1 ? 's' : ''} Found
            </Text>
            {doctors.map((doctor) => (
              <TouchableOpacity
                key={doctor.id}
                onPress={() =>
                  navigation.navigate('DoctorProfile', { id: doctor.id })
                }
                activeOpacity={0.7}
              >
                <Card style={styles.doctorCard}>
                  <View style={styles.doctorContent}>
                    <Image
                      source={{
                        uri:
                          doctor.photo_url ||
                          'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?w=300',
                      }}
                      style={styles.doctorPhoto}
                    />
                    <View style={styles.doctorInfo}>
                      <Text style={styles.doctorName}>
                        Dr. {doctor.first_name} {doctor.last_name}
                      </Text>
                      <Text style={styles.doctorQualification}>
                        {doctor.qualifications}
                      </Text>
                      <View style={styles.doctorMeta}>
                        <View style={styles.rating}>
                          <Star size={14} color="#f59e0b" fill="#f59e0b" />
                          <Text style={styles.ratingText}>
                            {doctor.rating.toFixed(1)}
                          </Text>
                        </View>
                        <Text style={styles.experience}>
                          {doctor.experience_years} years exp.
                        </Text>
                      </View>
                      <Text style={styles.fee}>
                        ${doctor.consultation_fee.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </>
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  searchModeToggle: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  toggleButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  specialtyCard: {
    marginBottom: 12,
  },
  specialtyContent: {
    gap: 4,
  },
  specialtyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  specialtyDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  searchingState: {
    alignItems: 'center',
    padding: 32,
  },
  searchingText: {
    fontSize: 16,
    color: '#64748b',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  doctorCard: {
    marginBottom: 12,
  },
  doctorContent: {
    flexDirection: 'row',
  },
  doctorPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  doctorQualification: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  doctorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  experience: {
    fontSize: 14,
    color: '#64748b',
  },
  fee: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },
});
