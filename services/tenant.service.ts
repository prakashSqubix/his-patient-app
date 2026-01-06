import { supabase } from '@/lib/supabase';
import { Tenant } from '@/types/database';

export class TenantService {
  static async getAll(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async getBanners(tenantId: string) {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('display_order');

    if (error) throw error;
    return data || [];
  }
}
