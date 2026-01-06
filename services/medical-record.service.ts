import { supabase } from '@/lib/supabase';
import { MedicalRecord, LabReport, Prescription } from '@/types/database';

export class MedicalRecordService {
  static async getPatientRecords(
    patientId: string
  ): Promise<MedicalRecord[]> {
    const { data, error } = await supabase
      .from('medical_records')
      .select(
        `
        *,
        doctor:doctors(*),
        prescriptions(*)
      `
      )
      .eq('patient_id', patientId)
      .order('visit_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<MedicalRecord | null> {
    const { data, error } = await supabase
      .from('medical_records')
      .select(
        `
        *,
        doctor:doctors(*),
        prescriptions(*)
      `
      )
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async getLabReports(patientId: string): Promise<LabReport[]> {
    const { data, error } = await supabase
      .from('lab_reports')
      .select('*')
      .eq('patient_id', patientId)
      .order('report_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getLabReportById(id: string): Promise<LabReport | null> {
    const { data, error } = await supabase
      .from('lab_reports')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async getPrescriptions(patientId: string): Promise<Prescription[]> {
    const { data, error } = await supabase
      .from('prescriptions')
      .select(
        `
        *,
        medical_record:medical_records!inner(patient_id, visit_date)
      `
      )
      .eq('medical_record.patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
