import { supabase } from '@/lib/supabase';
import { Appointment, EncounterType } from '@/types/database';

export interface CreateAppointmentData {
  doctorId: string;
  tenantId: string;
  appointmentDate: string;
  appointmentTime: string;
  encounterType: EncounterType;
  symptoms?: string;
  notes?: string;
}

export class AppointmentService {
  static async create(
    patientId: string,
    data: CreateAppointmentData
  ): Promise<Appointment> {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: patientId,
        doctor_id: data.doctorId,
        tenant_id: data.tenantId,
        appointment_date: data.appointmentDate,
        appointment_time: data.appointmentTime,
        encounter_type: data.encounterType,
        symptoms: data.symptoms || null,
        notes: data.notes || null,
        status: 'scheduled',
      })
      .select()
      .single();

    if (error) throw error;
    return appointment;
  }

  static async getPatientAppointments(
    patientId: string
  ): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(
        `
        *,
        doctor:doctors(*)
      `
      )
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getUpcoming(patientId: string): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('appointments')
      .select(
        `
        *,
        doctor:doctors(*)
      `
      )
      .eq('patient_id', patientId)
      .eq('status', 'scheduled')
      .gte('appointment_date', today)
      .order('appointment_date')
      .order('appointment_time');

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .select(
        `
        *,
        doctor:doctors(*)
      `
      )
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async cancel(id: string): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async reschedule(
    id: string,
    newDate: string,
    newTime: string
  ): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        appointment_date: newDate,
        appointment_time: newTime,
        status: 'rescheduled',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
