export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  error: string;
  success: string;
  warning: string;
  info: string;
}

export interface ThemeBranding {
  logo: string | null;
  favicon: string | null;
  bannerImage: string | null;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  fontWeights: {
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
  };
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeBorderRadius {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface Theme {
  colors: ThemeColors;
  branding: ThemeBranding;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
}

export interface TenantThemeConfig {
  tenantId: string;
  tenantName: string;
  theme: Theme;
}
