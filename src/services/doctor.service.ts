
import { Doctor, DoctorWithSpecialties, Specialty } from '@/types/database';

// Mock Data
const MOCK_DOCTORS: any[] = [
  {
    id: 'doctor-1',
    first_name: 'Sarah',
    last_name: 'Connor',
    specialty: 'Cardiology',
    rating: 4.8,
    is_available: true,
    tenant_id: 'tenant-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    specialties: [{ id: 'spec-1', name: 'Cardiology', created_at: '' }],
    image_url: 'https://via.placeholder.com/150',
    bio: 'Experienced cardiologist with 10+ years of practice.',
    experience_years: 12,
    consultation_fee: 100
  },
  {
    id: 'doctor-2',
    first_name: 'James',
    last_name: 'Wilson',
    specialty: 'Dermatology',
    rating: 4.5,
    is_available: true,
    tenant_id: 'tenant-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    specialties: [{ id: 'spec-2', name: 'Dermatology', created_at: '' }],
    image_url: 'https://via.placeholder.com/150',
    bio: 'Specialist in skin care.',
    experience_years: 8,
    consultation_fee: 80
  }
];

export class DoctorService {
  static async searchBySpecialty(
    specialtyId: string,
    tenantId?: string
  ): Promise<DoctorWithSpecialties[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_DOCTORS.filter(d =>
      d.specialties.some((s: any) => s.id === specialtyId) &&
      (!tenantId || d.tenant_id === tenantId)
    );
  }

  static async searchByName(
    searchTerm: string,
    tenantId?: string
  ): Promise<DoctorWithSpecialties[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const term = searchTerm.toLowerCase();
    return MOCK_DOCTORS.filter(d =>
      (d.first_name.toLowerCase().includes(term) || d.last_name.toLowerCase().includes(term)) &&
      (!tenantId || d.tenant_id === tenantId)
    );
  }

  static async getById(id: string): Promise<DoctorWithSpecialties | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_DOCTORS.find(d => d.id === id) || null;
  }

  static async getAll(tenantId?: string): Promise<DoctorWithSpecialties[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_DOCTORS.filter(d => !tenantId || d.tenant_id === tenantId);
  }

  static async getAllSpecialties(): Promise<Specialty[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 'spec-1', name: 'Cardiology', created_at: '' },
      { id: 'spec-2', name: 'Dermatology', created_at: '' },
      { id: 'spec-3', name: 'Pediatrics', created_at: '' },
    ] as any[];
  }
}
