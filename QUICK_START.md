# Quick Start Guide

## New Features Overview

This guide provides quick access to the newly implemented features.

## 1. Using the Theme System

### Access Theme in Any Component

```typescript
import { useTheme } from '@/contexts/ThemeContext';

export default function MyScreen() {
  const { theme, updateTheme, tenantConfig } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text.primary }}>
        {tenantConfig.tenantName}
      </Text>
    </View>
  );
}
```

### Common Theme Values

```typescript
// Colors
theme.colors.primary           // Primary brand color
theme.colors.secondary         // Secondary color
theme.colors.accent           // Accent highlights
theme.colors.background       // Page background
theme.colors.surface          // Card backgrounds
theme.colors.text.primary     // Main text
theme.colors.text.secondary   // Secondary text
theme.colors.text.disabled    // Disabled/muted text
theme.colors.error            // Error states
theme.colors.success          // Success states
theme.colors.warning          // Warning states

// Typography
theme.typography.fontSize.xs   // 12
theme.typography.fontSize.sm   // 14
theme.typography.fontSize.md   // 16
theme.typography.fontSize.lg   // 18
theme.typography.fontSize.xl   // 20
theme.typography.fontSize.xxl  // 24

// Spacing
theme.spacing.xs    // 4
theme.spacing.sm    // 8
theme.spacing.md    // 16
theme.spacing.lg    // 24
theme.spacing.xl    // 32
theme.spacing.xxl   // 48

// Border Radius
theme.borderRadius.sm    // 4
theme.borderRadius.md    // 8
theme.borderRadius.lg    // 12
theme.borderRadius.xl    // 16
theme.borderRadius.full  // 9999
```

### Switch Theme

```typescript
await updateTheme('clinic_001');  // CareWell Clinic
await updateTheme('clinic_002');  // HealthFirst Medical
await updateTheme('clinic_003');  // Metro Care Hospital
await updateTheme('default');     // Default theme
```

## 2. Using the Appointment Slots

### Load Doctor Slots

```typescript
import { SlotsService } from '@/services/slots.service';

const loadSlots = async (doctorId: string) => {
  const startDate = new Date();
  const slots = await SlotsService.getDoctorSlots(doctorId, startDate);
  setDaySlots(slots);
};
```

### Group Slots by Period

```typescript
const daySlots = daySlots[0]; // First day
const grouped = SlotsService.groupSlotsByPeriod(daySlots.slots);

// Access slots by period
const morningSlots = grouped.morning;
const afternoonSlots = grouped.afternoon;
const eveningSlots = grouped.evening;
```

### Slot Data Structure

```typescript
interface TimeSlot {
  id: string;           // "2026-01-07_09:00"
  time: string;         // "09:00"
  available: boolean;   // true/false
}

interface DaySlots {
  date: string;         // "2026-01-07"
  dayName: string;      // "Mon"
  slots: TimeSlot[];
}
```

## 3. Theme-Aware Components

All base components are theme-aware:

```typescript
// Button
<Button
  title="Click Me"
  variant="primary"    // Uses theme.colors.primary
  size="medium"        // Uses theme.spacing values
/>

// Input
<Input
  label="Email"
  placeholder="Enter email"
  // Automatically uses theme colors for borders, focus, text
/>

// Card
<Card>
  {/* Automatically uses theme.colors.surface */}
  <Text style={{ color: theme.colors.text.primary }}>
    Content
  </Text>
</Card>
```

## 4. Testing New Features

### Test Theme Switching
1. Navigate to Profile tab
2. Tap "Switch Facility"
3. Select different facilities
4. Observe theme changes

Or access the theme demo:
```typescript
import { router } from 'expo-router';
router.push('/theme-demo');
```

### Test Slot Booking
1. Go to Appointments tab
2. Tap search icon or "Book Appointment"
3. Search for a doctor
4. Select doctor profile
5. Tap "Book Appointment"
6. Experience the slot-based flow

## 5. Pre-configured Themes

| Theme ID | Name | Primary Color | Style |
|----------|------|---------------|-------|
| `default` | Patient Portal | Blue (#2563EB) | Professional |
| `clinic_001` | CareWell Clinic | Blue (#2563EB) | Modern Healthcare |
| `clinic_002` | HealthFirst Medical | Green (#059669) | Nature-inspired |
| `clinic_003` | Metro Care Hospital | Purple (#7C3AED) | Bold & Vibrant |

## 6. Adding a New Theme

Edit `services/theme.service.ts`:

```typescript
const TENANT_THEMES: Record<string, TenantThemeConfig> = {
  my_new_clinic: {
    tenantId: 'my_new_clinic',
    tenantName: 'My New Clinic',
    theme: {
      colors: {
        primary: '#YOUR_COLOR',
        secondary: '#YOUR_COLOR',
        accent: '#YOUR_COLOR',
        // ... rest of colors
      },
      // ... rest of theme config
    },
  },
};
```

## 7. Common Patterns

### Themed Container

```typescript
<View style={{
  backgroundColor: theme.colors.background,
  padding: theme.spacing.md,
  borderRadius: theme.borderRadius.lg
}}>
  {/* Content */}
</View>
```

### Themed Text

```typescript
<Text style={{
  color: theme.colors.text.primary,
  fontSize: theme.typography.fontSize.lg,
  fontWeight: theme.typography.fontWeights.bold
}}>
  Title Text
</Text>
```

### Themed Button/Touchable

```typescript
<TouchableOpacity
  style={{
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md
  }}
>
  <Text style={{ color: '#ffffff' }}>
    Action
  </Text>
</TouchableOpacity>
```

## 8. File Locations

```
📁 types/
  └── theme.ts                    # Theme type definitions

📁 contexts/
  └── ThemeContext.tsx            # Theme provider & hook

📁 services/
  ├── theme.service.ts            # Theme data (dummy JSON)
  └── slots.service.ts            # Slots data (dummy JSON)

📁 components/
  ├── Button.tsx                  # Themed button
  ├── Card.tsx                    # Themed card
  ├── Input.tsx                   # Themed input
  ├── LoadingScreen.tsx           # Themed loading
  └── ErrorMessage.tsx            # Themed error

📁 app/
  ├── theme-demo.tsx              # Theme demonstration
  └── (tabs)/appointments/book.tsx # Slot-based booking
```

## 9. Troubleshooting

### Theme not updating
```typescript
// Ensure updateTheme is awaited
await updateTheme('clinic_001');

// Check tenant ID is valid
console.log(Object.keys(TENANT_THEMES));
```

### Slots not loading
```typescript
// Verify doctor ID
console.log('Loading slots for:', doctorId);

// Check date range
const slots = await SlotsService.getDoctorSlots(doctorId, new Date());
console.log('Loaded slots:', slots);
```

### Component not themed
```typescript
// Always import useTheme
import { useTheme } from '@/contexts/ThemeContext';

// Access theme
const { theme } = useTheme();

// Apply theme values
style={{ color: theme.colors.text.primary }}
```

## 10. Documentation Links

- **[THEMING_GUIDE.md](./THEMING_GUIDE.md)** - Complete theming documentation
- **[SLOTS_BOOKING_GUIDE.md](./SLOTS_BOOKING_GUIDE.md)** - Booking flow details
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Implementation overview
- **[README.md](./README.md)** - Main project documentation

## 11. Next Steps

1. Test all features in development
2. Replace dummy data with real API calls
3. Add more tenant themes as needed
4. Customize slot availability logic
5. Add error tracking and analytics

---

For detailed documentation, see:
- Theme System: [THEMING_GUIDE.md](./THEMING_GUIDE.md)
- Booking Flow: [SLOTS_BOOKING_GUIDE.md](./SLOTS_BOOKING_GUIDE.md)
