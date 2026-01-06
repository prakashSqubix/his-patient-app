import { Tenant } from '@/types/database';

// Mock Data
const MOCK_TENANTS: any[] = [
  {
    id: 'tenant-1',
    name: 'City Hospital',
    slug: 'city-hospital',
    logo_url: 'https://via.placeholder.com/150',
    primary_color: '#007bff',
    secondary_color: '#6c757d',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_BANNERS = [
  {
    id: 'banner-1',
    tenant_id: 'tenant-1',
    image_url: 'https://via.placeholder.com/800x400',
    title: 'Welcome to City Hospital',
    description: 'Providing quality care for you.',
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export class TenantService {
  static async getAll(): Promise<Tenant[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_TENANTS;
  }

  static async getById(id: string): Promise<Tenant | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_TENANTS.find(t => t.id === id) || null;
  }

  static async getBanners(tenantId: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_BANNERS.filter(b => b.tenant_id === tenantId);
  }
}
