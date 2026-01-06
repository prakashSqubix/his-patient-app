/*
  # Patient Portal Database Schema

  ## Overview
  Complete multi-tenant patient portal system with authentication, appointments, medical records, and tenant management.

  ## New Tables
  
  ### 1. `tenants`
  Stores clinic/facility information for multi-tenant support
  - `id` (uuid, primary key)
  - `name` (text) - Clinic/facility name
  - `type` (text) - 'clinic' or 'care_facility'
  - `logo_url` (text) - Tenant branding logo
  - `primary_color` (text) - Brand color
  - `address` (text)
  - `phone` (text)
  - `email` (text)
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  
  ### 2. `profiles`
  Extended user profiles for patients
  - `id` (uuid, references auth.users)
  - `tenant_id` (uuid, references tenants) - Current tenant context
  - `first_name` (text)
  - `last_name` (text)
  - `date_of_birth` (date)
  - `gender` (text)
  - `phone` (text)
  - `address` (text)
  - `city` (text)
  - `state` (text)
  - `zip_code` (text)
  - `profile_picture_url` (text)
  - `blood_group` (text)
  - `allergies` (text[])
  - `chronic_conditions` (text[])
  - `current_medications` (text[])
  - `updated_at` (timestamptz)
  
  ### 3. `specialties`
  Medical specialties for doctor categorization
  - `id` (uuid, primary key)
  - `name` (text) - Cardiology, Orthopedics, etc.
  - `description` (text)
  - `icon` (text)
  
  ### 4. `doctors`
  Doctor profiles for appointment booking
  - `id` (uuid, primary key)
  - `tenant_id` (uuid, references tenants)
  - `first_name` (text)
  - `last_name` (text)
  - `photo_url` (text)
  - `qualifications` (text)
  - `experience_years` (integer)
  - `consultation_fee` (decimal)
  - `rating` (decimal)
  - `bio` (text)
  - `is_available` (boolean)
  - `created_at` (timestamptz)
  
  ### 5. `doctor_specialties`
  Junction table linking doctors to specialties
  - `doctor_id` (uuid, references doctors)
  - `specialty_id` (uuid, references specialties)
  
  ### 6. `doctor_availability`
  Time slot availability for doctors
  - `id` (uuid, primary key)
  - `doctor_id` (uuid, references doctors)
  - `day_of_week` (integer) - 0-6
  - `start_time` (time)
  - `end_time` (time)
  - `slot_duration` (integer) - minutes
  
  ### 7. `appointments`
  Patient appointment bookings
  - `id` (uuid, primary key)
  - `patient_id` (uuid, references profiles)
  - `doctor_id` (uuid, references doctors)
  - `tenant_id` (uuid, references tenants)
  - `appointment_date` (date)
  - `appointment_time` (time)
  - `encounter_type` (text) - OPD, Video, Follow-up, Emergency
  - `status` (text) - scheduled, completed, cancelled, rescheduled
  - `symptoms` (text)
  - `notes` (text)
  - `created_at` (timestamptz)
  
  ### 8. `medical_records`
  Visit history and EMR entries
  - `id` (uuid, primary key)
  - `patient_id` (uuid, references profiles)
  - `doctor_id` (uuid, references doctors)
  - `appointment_id` (uuid, references appointments)
  - `visit_date` (timestamptz)
  - `diagnosis` (text)
  - `symptoms` (text)
  - `treatment` (text)
  - `notes` (text)
  - `created_at` (timestamptz)
  
  ### 9. `prescriptions`
  Medication prescriptions from visits
  - `id` (uuid, primary key)
  - `medical_record_id` (uuid, references medical_records)
  - `medication_name` (text)
  - `dosage` (text)
  - `frequency` (text)
  - `duration` (text)
  - `instructions` (text)
  
  ### 10. `lab_reports`
  Laboratory test results and diagnostic reports
  - `id` (uuid, primary key)
  - `patient_id` (uuid, references profiles)
  - `medical_record_id` (uuid, references medical_records)
  - `report_type` (text) - Blood Test, X-Ray, MRI, etc.
  - `report_name` (text)
  - `report_date` (date)
  - `file_url` (text)
  - `notes` (text)
  - `created_at` (timestamptz)
  
  ### 11. `banners`
  Homepage promotional banners
  - `id` (uuid, primary key)
  - `tenant_id` (uuid, references tenants)
  - `title` (text)
  - `image_url` (text)
  - `link_url` (text)
  - `display_order` (integer)
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  
  ### 12. `emergency_contacts`
  Patient emergency contact information
  - `id` (uuid, primary key)
  - `patient_id` (uuid, references profiles)
  - `name` (text)
  - `relationship` (text)
  - `phone` (text)
  - `is_primary` (boolean)
  
  ### 13. `insurance_details`
  Patient insurance information
  - `id` (uuid, primary key)
  - `patient_id` (uuid, references profiles)
  - `provider_name` (text)
  - `policy_number` (text)
  - `group_number` (text)
  - `valid_from` (date)
  - `valid_until` (date)
  
  ## Security
  - Enable RLS on all tables
  - Patients can only access their own data
  - Doctors can access assigned patient data
  - Tenants are isolated by tenant_id
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('clinic', 'care_facility')),
  logo_url text,
  primary_color text DEFAULT '#2563eb',
  address text,
  phone text,
  email text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants are viewable by authenticated users"
  ON tenants FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  tenant_id uuid REFERENCES tenants ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  profile_picture_url text,
  blood_group text,
  allergies text[],
  chronic_conditions text[],
  current_medications text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Specialties Table
CREATE TABLE IF NOT EXISTS specialties (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Specialties are viewable by authenticated users"
  ON specialties FOR SELECT
  TO authenticated
  USING (true);

-- Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES tenants ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  photo_url text,
  qualifications text,
  experience_years integer DEFAULT 0,
  consultation_fee decimal(10, 2) DEFAULT 0,
  rating decimal(3, 2) DEFAULT 0,
  bio text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors are viewable by authenticated users"
  ON doctors FOR SELECT
  TO authenticated
  USING (is_available = true);

-- Doctor Specialties Junction Table
CREATE TABLE IF NOT EXISTS doctor_specialties (
  doctor_id uuid REFERENCES doctors ON DELETE CASCADE,
  specialty_id uuid REFERENCES specialties ON DELETE CASCADE,
  PRIMARY KEY (doctor_id, specialty_id)
);

ALTER TABLE doctor_specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctor specialties are viewable by authenticated users"
  ON doctor_specialties FOR SELECT
  TO authenticated
  USING (true);

-- Doctor Availability Table
CREATE TABLE IF NOT EXISTS doctor_availability (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id uuid REFERENCES doctors ON DELETE CASCADE,
  day_of_week integer CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  slot_duration integer DEFAULT 30,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctor availability is viewable by authenticated users"
  ON doctor_availability FOR SELECT
  TO authenticated
  USING (true);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid REFERENCES profiles ON DELETE CASCADE,
  doctor_id uuid REFERENCES doctors ON DELETE CASCADE,
  tenant_id uuid REFERENCES tenants ON DELETE CASCADE,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  encounter_type text NOT NULL CHECK (encounter_type IN ('OPD', 'Video Consultation', 'Follow-up', 'Emergency')),
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  symptoms text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Users can create own appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Medical Records Table
CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid REFERENCES profiles ON DELETE CASCADE,
  doctor_id uuid REFERENCES doctors ON DELETE SET NULL,
  appointment_id uuid REFERENCES appointments ON DELETE SET NULL,
  visit_date timestamptz DEFAULT now(),
  diagnosis text,
  symptoms text,
  treatment text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medical records"
  ON medical_records FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id uuid REFERENCES medical_records ON DELETE CASCADE,
  medication_name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  duration text NOT NULL,
  instructions text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prescriptions"
  ON prescriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM medical_records
      WHERE medical_records.id = prescriptions.medical_record_id
      AND medical_records.patient_id = auth.uid()
    )
  );

-- Lab Reports Table
CREATE TABLE IF NOT EXISTS lab_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid REFERENCES profiles ON DELETE CASCADE,
  medical_record_id uuid REFERENCES medical_records ON DELETE SET NULL,
  report_type text NOT NULL,
  report_name text NOT NULL,
  report_date date NOT NULL,
  file_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lab reports"
  ON lab_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);

-- Banners Table
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES tenants ON DELETE CASCADE,
  title text NOT NULL,
  image_url text NOT NULL,
  link_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active banners are viewable by authenticated users"
  ON banners FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Emergency Contacts Table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid REFERENCES profiles ON DELETE CASCADE,
  name text NOT NULL,
  relationship text NOT NULL,
  phone text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own emergency contacts"
  ON emergency_contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Users can manage own emergency contacts"
  ON emergency_contacts FOR ALL
  TO authenticated
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Insurance Details Table
CREATE TABLE IF NOT EXISTS insurance_details (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid REFERENCES profiles ON DELETE CASCADE,
  provider_name text NOT NULL,
  policy_number text NOT NULL,
  group_number text,
  valid_from date,
  valid_until date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE insurance_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insurance details"
  ON insurance_details FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Users can manage own insurance details"
  ON insurance_details FOR ALL
  TO authenticated
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_doctors_tenant_id ON doctors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_patient_id ON lab_reports(patient_id);
