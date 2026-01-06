import { TenantThemeConfig } from '@/types/theme';

const TENANT_THEMES: Record<string, TenantThemeConfig> = {
  default: {
    tenantId: 'default',
    tenantName: 'Patient Portal',
    theme: {
      colors: {
        primary: '#2563EB',
        secondary: '#10B981',
        accent: '#F59E0B',
        background: '#FFFFFF',
        surface: '#F8FAFC',
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
          disabled: '#94A3B8',
        },
        error: '#DC2626',
        success: '#059669',
        warning: '#F59E0B',
        info: '#0EA5E9',
      },
      branding: {
        logo: null,
        favicon: null,
        bannerImage: null,
      },
      typography: {
        fontFamily: 'System',
        fontSize: {
          xs: 12,
          sm: 14,
          md: 16,
          lg: 18,
          xl: 20,
          xxl: 24,
        },
        fontWeights: {
          regular: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
        },
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
      },
      borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999,
      },
    },
  },
  clinic_001: {
    tenantId: 'clinic_001',
    tenantName: 'CareWell Clinic',
    theme: {
      colors: {
        primary: '#2563EB',
        secondary: '#10B981',
        accent: '#F59E0B',
        background: '#FFFFFF',
        surface: '#F3F4F6',
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          disabled: '#9CA3AF',
        },
        error: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        info: '#3B82F6',
      },
      branding: {
        logo: 'https://images.pexels.com/photos/4269492/pexels-photo-4269492.jpeg?w=200',
        favicon: null,
        bannerImage: 'https://images.pexels.com/photos/4269492/pexels-photo-4269492.jpeg?w=800',
      },
      typography: {
        fontFamily: 'System',
        fontSize: {
          xs: 12,
          sm: 14,
          md: 16,
          lg: 18,
          xl: 20,
          xxl: 24,
        },
        fontWeights: {
          regular: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
        },
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
      },
      borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999,
      },
    },
  },
  clinic_002: {
    tenantId: 'clinic_002',
    tenantName: 'HealthFirst Medical Center',
    theme: {
      colors: {
        primary: '#059669',
        secondary: '#0EA5E9',
        accent: '#F97316',
        background: '#FFFFFF',
        surface: '#F0FDF4',
        text: {
          primary: '#065F46',
          secondary: '#047857',
          disabled: '#A7F3D0',
        },
        error: '#DC2626',
        success: '#10B981',
        warning: '#F59E0B',
        info: '#0EA5E9',
      },
      branding: {
        logo: 'https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?w=200',
        favicon: null,
        bannerImage: 'https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?w=800',
      },
      typography: {
        fontFamily: 'System',
        fontSize: {
          xs: 12,
          sm: 14,
          md: 16,
          lg: 18,
          xl: 20,
          xxl: 24,
        },
        fontWeights: {
          regular: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
        },
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
      },
      borderRadius: {
        sm: 6,
        md: 10,
        lg: 14,
        xl: 18,
        full: 9999,
      },
    },
  },
  clinic_003: {
    tenantId: 'clinic_003',
    tenantName: 'Metro Care Hospital',
    theme: {
      colors: {
        primary: '#7C3AED',
        secondary: '#EC4899',
        accent: '#FBBF24',
        background: '#FFFFFF',
        surface: '#FAF5FF',
        text: {
          primary: '#581C87',
          secondary: '#7C3AED',
          disabled: '#C4B5FD',
        },
        error: '#DC2626',
        success: '#10B981',
        warning: '#F59E0B',
        info: '#8B5CF6',
      },
      branding: {
        logo: 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?w=200',
        favicon: null,
        bannerImage: 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?w=800',
      },
      typography: {
        fontFamily: 'System',
        fontSize: {
          xs: 12,
          sm: 14,
          md: 16,
          lg: 18,
          xl: 20,
          xxl: 24,
        },
        fontWeights: {
          regular: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
        },
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
      },
      borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        full: 9999,
      },
    },
  },
};

export class ThemeService {
  static async getTenantTheme(tenantId: string): Promise<TenantThemeConfig> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return TENANT_THEMES[tenantId] || TENANT_THEMES.default;
  }

  static getDefaultTheme(): TenantThemeConfig {
    return TENANT_THEMES.default;
  }
}
