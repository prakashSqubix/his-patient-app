# Global Theming System Guide

## Overview

The Patient Portal app now includes a comprehensive global theming system that supports dynamic tenant-based themes. Each tenant can have its own unique color palette, typography, spacing, and branding.

## Features

- Dynamic tenant-based theming
- Real-time theme switching without app restart
- Persistent theme storage using AsyncStorage
- Comprehensive theme configuration (colors, typography, spacing, border radius)
- Tenant branding support (logos, banners)
- Fallback to default theme if tenant theme fails

## Architecture

### Theme Structure

```typescript
interface Theme {
  colors: {
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
  };
  branding: {
    logo: string | null;
    favicon: string | null;
    bannerImage: string | null;
  };
  typography: {
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
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
}
```

## Using the Theme System

### 1. Access Theme in Components

```typescript
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text.primary }}>
        Hello World
      </Text>
    </View>
  );
}
```

### 2. Switch Themes Programmatically

```typescript
import { useTheme } from '@/contexts/ThemeContext';

function TenantSwitcher() {
  const { updateTheme } = useTheme();

  const switchToClinic = async () => {
    await updateTheme('clinic_001');
  };

  return <Button title="Switch Theme" onPress={switchToClinic} />;
}
```

### 3. Access Tenant Configuration

```typescript
import { useTheme } from '@/contexts/ThemeContext';

function Header() {
  const { tenantConfig } = useTheme();

  return (
    <View>
      <Text>{tenantConfig.tenantName}</Text>
      {tenantConfig.theme.branding.logo && (
        <Image source={{ uri: tenantConfig.theme.branding.logo }} />
      )}
    </View>
  );
}
```

## Pre-configured Themes

The app includes 4 pre-configured tenant themes:

### 1. Default Theme
- Primary: Blue (#2563EB)
- Clean, professional design
- Default for new tenants

### 2. CareWell Clinic (clinic_001)
- Primary: Blue (#2563EB)
- Secondary: Green (#10B981)
- Modern healthcare aesthetic

### 3. HealthFirst Medical Center (clinic_002)
- Primary: Green (#059669)
- Secondary: Sky Blue (#0EA5E9)
- Nature-inspired, calming palette

### 4. Metro Care Hospital (clinic_003)
- Primary: Purple (#7C3AED)
- Secondary: Pink (#EC4899)
- Bold, vibrant appearance

## Creating Custom Themes

Add new themes to `services/theme.service.ts`:

```typescript
const TENANT_THEMES: Record<string, TenantThemeConfig> = {
  my_clinic: {
    tenantId: 'my_clinic',
    tenantName: 'My Clinic',
    theme: {
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        // ... rest of colors
      },
      // ... rest of theme config
    },
  },
};
```

## Component Library

All core UI components have been updated to use the theme system:

### Button Component
```typescript
<Button
  title="Click Me"
  variant="primary"  // primary, secondary, outline
  size="medium"      // small, medium, large
/>
```

### Input Component
```typescript
<Input
  label="Email"
  placeholder="Enter email"
  error="Invalid email"
/>
```

### Card Component
```typescript
<Card>
  <Text>Card content</Text>
</Card>
```

### ErrorMessage Component
```typescript
<ErrorMessage message="Something went wrong" />
```

### LoadingScreen Component
```typescript
<LoadingScreen message="Loading..." />
```

## Best Practices

1. **Always use theme values**: Never hardcode colors, spacing, or typography
   ```typescript
   // Good
   style={{ color: theme.colors.primary }}

   // Bad
   style={{ color: '#2563eb' }}
   ```

2. **Use semantic color names**: Use appropriate color tokens for context
   ```typescript
   // Good - text colors
   { color: theme.colors.text.primary }
   { color: theme.colors.text.secondary }

   // Good - status colors
   { color: theme.colors.error }
   { color: theme.colors.success }
   ```

3. **Leverage spacing system**: Use theme spacing for consistency
   ```typescript
   // Good
   { padding: theme.spacing.md }
   { gap: theme.spacing.sm }

   // Bad
   { padding: 16 }
   ```

4. **Apply border radius**: Use theme border radius values
   ```typescript
   // Good
   { borderRadius: theme.borderRadius.lg }

   // Bad
   { borderRadius: 12 }
   ```

## Theme Demo Screen

A theme demo screen is available at `/theme-demo` to:
- Preview all theme colors
- Test theme switching
- View component variants
- Inspect typography scales

Access it by navigating to the theme-demo route in development.

## Persistence

- Themes are automatically saved to AsyncStorage
- Persisted theme loads on app restart
- Falls back to default theme if stored theme fails

## Testing Themes

1. Navigate to tenant selection screen
2. Select different facilities
3. Observe theme changes in real-time
4. Check that theme persists after app reload

## Troubleshooting

### Theme not updating
- Ensure `updateTheme()` is awaited
- Check AsyncStorage permissions
- Verify tenant ID is valid

### Components not themed
- Ensure component uses `useTheme()` hook
- Check that ThemeProvider wraps entire app
- Verify component references theme values

### Theme loading slowly
- Themes are cached in AsyncStorage
- First load may take longer
- Consider preloading tenant themes

## Migration Guide

To migrate existing components to use the theme system:

1. Import the useTheme hook
2. Replace hardcoded values with theme values
3. Test component with different themes
4. Verify accessibility and contrast

Example migration:

```typescript
// Before
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
  },
  text: {
    color: '#1e293b',
    fontSize: 16,
  }
});

// After
function MyComponent() {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
    },
    text: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSize.md,
    }
  });
}
```

## Future Enhancements

Potential additions to the theming system:
- Light/dark mode support per tenant
- Custom font loading per tenant
- Theme animations and transitions
- Theme preview before selection
- Admin UI for theme customization
