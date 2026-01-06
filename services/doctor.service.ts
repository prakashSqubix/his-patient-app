import { supabase } from '@/lib/supabase';
import { Doctor, DoctorWithSpecialties, Specialty } from '@/types/database';

export class DoctorService {
  static async searchBySpecialty(
    specialtyId: string,
    tenantId?: string
  ): Promise<DoctorWithSpecialties[]> {
    let query = supabase
      .from('doctors')
      .select(
        `
        *,
        doctor_specialties!inner(specialty_id),
        specialties:doctor_specialties(specialty:specialties(*))
      `
      )
      .eq('is_available', true)
      .eq('doctor_specialties.specialty_id', specialtyId);

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((doc: any) => ({
      ...doc,
      specialties: doc.specialties?.map((s: any) => s.specialty) || [],
    }));
  }

  static async searchByName(
    searchTerm: string,
    tenantId?: string
  ): Promise<DoctorWithSpecialties[]> {
    let query = supabase
      .from('doctors')
      .select(
        `
        *,
        specialties:doctor_specialties(specialty:specialties(*))
      `
      )
      .eq('is_available', true)
      .or(
        `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`
      );

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((doc: any) => ({
      ...doc,
      specialties: doc.specialties?.map((s: any) => s.specialty) || [],
    }));
  }

  static async getById(id: string): Promise<DoctorWithSpecialties | null> {
    const { data, error } = await supabase
      .from('doctors')
      .select(
        `
        *,
        specialties:doctor_specialties(specialty:specialties(*))
      `
      )
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!data) return null;

    return {
      ...data,
      specialties: data.specialties?.map((s: any) => s.specialty) || [],
    };
  }

  static async getAll(tenantId?: string): Promise<DoctorWithSpecialties[]> {
    let query = supabase
      .from('doctors')
      .select(
        `
        *,
        specialties:doctor_specialties(specialty:specialties(*))
      `
      )
      .eq('is_available', true);

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query.order('rating', { ascending: false });

    if (error) throw error;

    return (data || []).map((doc: any) => ({
      ...doc,
      specialties: doc.specialties?.map((s: any) => s.specialty) || [],
    }));
  }

  static async getAllSpecialties(): Promise<Specialty[]> {
    const { data, error } = await supabase
      .from('specialties')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }
}
