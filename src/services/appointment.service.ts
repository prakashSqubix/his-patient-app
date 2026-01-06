
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

// Mock Data
let MOCK_APPOINTMENTS: any[] = [
  {
    id: 'apt-1',
    patient_id: 'mock-user-id',
    doctor_id: 'doctor-1',
    tenant_id: 'tenant-1',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '10:00:00',
    encounter_type: 'video',
    status: 'scheduled',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    doctor: { first_name: 'Sarah', last_name: 'Connor' }
  }
];

export class AppointmentService {
  static async create(
    patientId: string,
    data: CreateAppointmentData
  ): Promise<Appointment> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newAppointment: any = {
      id: `apt-${Date.now()}`,
      patient_id: patientId,
      doctor_id: data.doctorId,
      tenant_id: data.tenantId,
      appointment_date: data.appointmentDate,
      appointment_time: data.appointmentTime,
      encounter_type: data.encounterType,
      symptoms: data.symptoms || null,
      notes: data.notes || null,
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    MOCK_APPOINTMENTS.push(newAppointment);
    return newAppointment;
  }

  static async getPatientAppointments(
    patientId: string
  ): Promise<Appointment[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_APPOINTMENTS.filter(a => a.patient_id === patientId).sort((a, b) =>
      new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
    );
  }

  static async getUpcoming(patientId: string): Promise<Appointment[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const today = new Date().toISOString().split('T')[0];
    return MOCK_APPOINTMENTS.filter(a =>
      a.patient_id === patientId &&
      a.status === 'scheduled' &&
      a.appointment_date >= today
    );
  }

  static async getById(id: string): Promise<Appointment | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_APPOINTMENTS.find(a => a.id === id) || null;
  }

  static async cancel(id: string): Promise<Appointment> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const apt = MOCK_APPOINTMENTS.find(a => a.id === id);
    if (!apt) throw new Error('Appointment not found');
    apt.status = 'cancelled';
    return apt;
  }

  static async reschedule(
    id: string,
    newDate: string,
    newTime: string
  ): Promise<Appointment> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const apt = MOCK_APPOINTMENTS.find(a => a.id === id);
    if (!apt) throw new Error('Appointment not found');
    apt.appointment_date = newDate;
    apt.appointment_time = newTime;
    apt.status = 'rescheduled';
    return apt;
  }
}
