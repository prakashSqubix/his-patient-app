import { Profile } from '@/types/database';

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  tenantId?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Mock User Data
const MOCK_USER = {
  id: 'mock-user-id',
  email: 'user@example.com',
  created_at: new Date().toISOString(),
};

const MOCK_PROFILE: any = {
  id: 'mock-user-id',
  first_name: 'John',
  last_name: 'Doe',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  tenant_id: 'tenant-1' // Added tenant_id to be helpful
};

export class AuthService {
  static async signUp(data: SignUpData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      user: { ...MOCK_USER, email: data.email },
      session: {
        access_token: 'mock-token',
        user: { ...MOCK_USER, email: data.email },
      },
    };
  }

  static async signIn(data: SignInData) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      user: { ...MOCK_USER, email: data.email },
      session: {
        access_token: 'mock-token',
        user: { ...MOCK_USER, email: data.email },
      },
    };
  }

  static async signOut() {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  static async getCurrentUser() {
    return MOCK_USER;
  }

  static async getProfile(userId: string): Promise<Profile | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...MOCK_PROFILE, id: userId };
  }

  static async updateProfile(userId: string, updates: Partial<Profile>) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...MOCK_PROFILE, id: userId, ...updates };
  }

  static async updateTenant(userId: string, tenantId: string) {
    return this.updateProfile(userId, { tenant_id: tenantId });
  }

  static async resetPassword(email: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  static async updatePassword(newPassword: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}
