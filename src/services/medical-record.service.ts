import { MedicalRecord, LabReport, Prescription } from '@/types/database';

// Mock Data
const MOCK_RECORDS: any[] = [
  {
    id: 'record-1',
    patient_id: 'mock-user-id',
    doctor_id: 'doctor-1',
    visit_date: new Date().toISOString(),
    diagnosis: 'Common Cold',
    symptoms: 'Cough, Fever',
    notes: 'Rest and fluids prescribed.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export class MedicalRecordService {
  static async getPatientRecords(patientId: string): Promise<MedicalRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_RECORDS.filter(r => r.patient_id === patientId);
  }

  static async getById(id: string): Promise<MedicalRecord | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const record = MOCK_RECORDS.find(r => r.id === id);
    if (!record) return null;
    return { ...record, doctor: { first_name: 'Jane', last_name: 'Smith' }, prescriptions: [] } as any;
  }

  static async getLabReports(patientId: string): Promise<LabReport[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [];
  }

  static async getLabReportById(id: string): Promise<LabReport | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return null;
  }

  static async getPrescriptions(patientId: string): Promise<Prescription[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [];
  }
}
