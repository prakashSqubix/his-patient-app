import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, TenantThemeConfig } from '@/types/theme';
import { ThemeService } from '@/services/theme.service';

interface ThemeContextType {
  theme: Theme;
  tenantConfig: TenantThemeConfig;
  loading: boolean;
  updateTheme: (tenantId: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@patient_portal_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [tenantConfig, setTenantConfig] = useState<TenantThemeConfig>(
    ThemeService.getDefaultTheme()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme) {
        const parsed = JSON.parse(storedTheme);
        setTenantConfig(parsed);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = async (tenantId: string) => {
    try {
      setLoading(true);
      const newTheme = await ThemeService.getTenantTheme(tenantId);
      setTenantConfig(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newTheme));
    } catch (error) {
      console.error('Error updating theme:', error);
      setTenantConfig(ThemeService.getDefaultTheme());
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: tenantConfig.theme,
        tenantConfig,
        loading,
        updateTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
