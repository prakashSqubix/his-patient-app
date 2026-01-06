export type TenantType = 'clinic' | 'care_facility';
export type Gender = 'male' | 'female' | 'other';
export type EncounterType = 'OPD' | 'Video Consultation' | 'Follow-up' | 'Emergency';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface Tenant {
  id: string;
  name: string;
  type: TenantType;
  logo_url: string | null;
  primary_color: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  tenant_id: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: Gender | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  profile_picture_url: string | null;
  blood_group: string | null;
  allergies: string[] | null;
  chronic_conditions: string[] | null;
  current_medications: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Specialty {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface Doctor {
  id: string;
  tenant_id: string | null;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  qualifications: string | null;
  experience_years: number;
  consultation_fee: number;
  rating: number;
  bio: string | null;
  is_available: boolean;
  created_at: string;
}

export interface DoctorWithSpecialties extends Doctor {
  specialties: Specialty[];
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  tenant_id: string;
  appointment_date: string;
  appointment_time: string;
  encounter_type: EncounterType;
  status: AppointmentStatus;
  symptoms: string | null;
  notes: string | null;
  created_at: string;
  doctor?: Doctor;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  appointment_id: string | null;
  visit_date: string;
  diagnosis: string | null;
  symptoms: string | null;
  treatment: string | null;
  notes: string | null;
  created_at: string;
  doctor?: Doctor;
  prescriptions?: Prescription[];
}

export interface Prescription {
  id: string;
  medical_record_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
  created_at: string;
}

export interface LabReport {
  id: string;
  patient_id: string;
  medical_record_id: string | null;
  report_type: string;
  report_name: string;
  report_date: string;
  file_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface Banner {
  id: string;
  tenant_id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface EmergencyContact {
  id: string;
  patient_id: string;
  name: string;
  relationship: string;
  phone: string;
  is_primary: boolean;
  created_at: string;
}

export interface InsuranceDetail {
  id: string;
  patient_id: string;
  provider_name: string;
  policy_number: string;
  group_number: string | null;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
}
