# Appointment Slots & Booking Flow Guide

## Overview

The appointment booking system now includes a comprehensive slot-based booking flow that displays available time slots for doctors, organized by date and time period (Morning, Afternoon, Evening).

## Features

- Visual date selection with horizontal scroll
- Time slots organized by period (Morning, Afternoon, Evening)
- Real-time availability display
- Disabled state for unavailable slots
- 7-day availability calendar
- Automatic slot generation based on doctor schedule
- Integration with tenant theming system

## Architecture

### Slot Data Structure

```typescript
interface TimeSlot {
  id: string;
  time: string;          // HH:MM format
  available: boolean;
}

interface DaySlots {
  date: string;          // YYYY-MM-DD format
  dayName: string;       // Mon, Tue, Wed, etc.
  slots: TimeSlot[];
}
```

## Booking Flow

### Step 1: Select Doctor
User navigates to doctor profile and taps "Book Appointment"

### Step 2: Select Date
- Horizontal scrollable date picker showing next 7 days
- Each date card displays day name and date
- Selected date highlighted with primary color

### Step 3: Select Time Slot
- Slots grouped by time period:
  - **Morning**: 9:00 AM - 12:00 PM
  - **Afternoon**: 2:00 PM - 5:00 PM
  - **Evening**: 5:00 PM - 7:00 PM
- Available slots displayed in grid layout
- Unavailable slots shown grayed out and disabled
- Selected slot highlighted with primary color

### Step 4: Select Encounter Type
Choose from:
- OPD (Outpatient Department)
- Video Consultation
- Follow-up
- Emergency

### Step 5: Add Symptoms (Optional)
Free-text input for describing symptoms

### Step 6: Review & Confirm
- Summary card showing consultation fee
- Confirm booking button

## Using the Slots Service

### Load Available Slots

```typescript
import { SlotsService } from '@/services/slots.service';

const loadSlots = async () => {
  const startDate = new Date();
  const slots = await SlotsService.getDoctorSlots(doctorId, startDate);
  setDaySlots(slots);
};
```

### Group Slots by Period

```typescript
const groupedSlots = SlotsService.groupSlotsByPeriod(daySlots.slots);

// Returns:
{
  morning: TimeSlot[],
  afternoon: TimeSlot[],
  evening: TimeSlot[]
}
```

## Slot Generation Logic

The dummy slot generation considers:

1. **Weekday vs Weekend**
   - Weekdays: More slots available (70% availability)
   - Weekends: Limited slots (30% availability)

2. **Time Periods**
   - Morning: 6 slots (9:00, 9:30, 10:00, 10:30, 11:00, 11:30)
   - Afternoon: 6 slots (14:00, 14:30, 15:00, 15:30, 16:00, 16:30)
   - Evening: 5 slots (17:00, 17:30, 18:00, 18:30, 19:00)

3. **Availability**
   - Random generation for demo purposes
   - Can be replaced with real API data

## Component Integration

### Date Selection UI

```typescript
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  <View style={styles.datesContainer}>
    {daySlots.map((day) => (
      <TouchableOpacity
        key={day.date}
        style={[
          styles.dateCard,
          {
            backgroundColor: selectedDate === day.date
              ? theme.colors.primary
              : theme.colors.surface,
          },
        ]}
        onPress={() => setSelectedDate(day.date)}
      >
        <Text>{day.dayName}</Text>
        <Text>{formatDate(day.date)}</Text>
      </TouchableOpacity>
    ))}
  </View>
</ScrollView>
```

### Time Slot Grid UI

```typescript
<View style={styles.slotsGrid}>
  {morningSlots.map((slot) => (
    <TouchableOpacity
      key={slot.id}
      disabled={!slot.available}
      style={[
        styles.slotButton,
        {
          backgroundColor: selectedSlot?.id === slot.id
            ? theme.colors.primary
            : slot.available
            ? theme.colors.surface
            : theme.colors.text.disabled + '20',
        },
      ]}
      onPress={() => setSelectedSlot(slot)}
    >
      <Text>{slot.time}</Text>
    </TouchableOpacity>
  ))}
</View>
```

## Theme Integration

All slot UI elements respect the global theme:
- Date cards use `theme.colors.primary` for selection
- Time slots use theme colors for states
- Border radius follows `theme.borderRadius` values
- Spacing uses `theme.spacing` tokens

## State Management

```typescript
const [daySlots, setDaySlots] = useState<DaySlots[]>([]);
const [selectedDate, setSelectedDate] = useState('');
const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
const [encounterType, setEncounterType] = useState<EncounterType>('OPD');
const [symptoms, setSymptoms] = useState('');
```

## API Integration Points

When replacing dummy data with real API:

### 1. Fetch Doctor Slots
```typescript
// Current: services/slots.service.ts
static async getDoctorSlots(doctorId: string, startDate: Date)

// Replace with real API call to:
// GET /api/doctors/{doctorId}/slots?start_date={date}
```

### 2. Book Appointment
```typescript
// Current: services/appointment.service.ts
static async create(patientId: string, data: CreateAppointmentData)

// Posts to Supabase appointments table
// Can be extended with slot locking mechanism
```

## User Experience Features

### Visual Feedback
- Loading state while fetching slots
- Clear visual distinction between available/unavailable slots
- Smooth scrolling for date selection
- Haptic feedback on slot selection (mobile)

### Validation
- Ensures date and slot are selected before booking
- Shows error message for incomplete selections
- Confirms successful booking

### Accessibility
- Clear labels for all interactive elements
- Sufficient contrast ratios
- Touch targets sized appropriately
- Screen reader support

## Customization Options

### Modify Slot Duration
Edit slot generation in `services/slots.service.ts`:

```typescript
const morningSlots = [
  '09:00', '09:15', '09:30', '09:45',  // 15-min intervals
  // ...
];
```

### Change Availability Logic
Update the availability calculation:

```typescript
const available = Math.random() > 0.3;  // 70% available
```

### Add Booking Restrictions
Implement business rules:

```typescript
// Prevent booking within 2 hours
const twoHoursFromNow = new Date();
twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2);
```

## Error Handling

The booking flow handles:
- Doctor not found
- No slots available
- Booking conflicts
- Network errors
- Authentication issues

Example error handling:

```typescript
try {
  await AppointmentService.create(user.id, bookingData);
  router.replace('/(tabs)/appointments');
} catch (err: any) {
  setError(err.message || 'Failed to book appointment');
}
```

## Testing the Booking Flow

1. Navigate to Appointments tab
2. Tap "Book Appointment" or search for a doctor
3. Select a doctor profile
4. Tap "Book Appointment" on doctor profile
5. Select a date from the horizontal scroller
6. Choose an available time slot
7. Select encounter type
8. Optionally add symptoms
9. Review summary and confirm

## Future Enhancements

Potential improvements:
- Calendar view for date selection
- Multi-day availability overview
- Recurring appointments
- Waitlist for fully booked slots
- Price variations by time slot
- Video consultation room integration
- Appointment reminders
- Cancellation and rescheduling
- Doctor notes and preparation instructions

## Performance Considerations

- Slots are loaded on-demand per doctor
- Date range limited to 7 days for performance
- Memoize slot grouping calculations
- Optimize re-renders with React.memo
- Cache slot data locally

## Integration with Backend

When connecting to a real backend:

1. **Slot API Structure**
```json
{
  "doctor_id": "doctor_123",
  "date": "2026-01-07",
  "slots": [
    {
      "id": "slot_1",
      "time": "09:00",
      "available": true,
      "price": 50.00
    }
  ]
}
```

2. **Booking Request**
```json
{
  "patient_id": "patient_456",
  "doctor_id": "doctor_123",
  "slot_id": "slot_1",
  "date": "2026-01-07",
  "time": "09:00",
  "encounter_type": "OPD",
  "symptoms": "Headache and fever"
}
```

3. **Response Handling**
- Success: Navigate to appointments list
- Conflict: Show slot no longer available
- Error: Display error message and allow retry
