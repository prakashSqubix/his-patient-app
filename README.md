# Patient Portal - Healthcare Mobile Application

A production-ready React Native mobile application for multi-tenant healthcare systems, built with Expo and Supabase.

## Features

### Authentication & User Management
- Email/password authentication with Supabase
- Multi-tenant support (clinic/care facility selection)
- Secure user profile management
- Password reset functionality

### Core Modules

#### 1. Home Dashboard
- Personalized greeting and quick stats
- Banner carousel for promotional content
- Quick action cards for common tasks
- Upcoming appointments overview
- Health tips and notifications

#### 2. Appointments
- Search doctors by specialty or name
- View doctor profiles with ratings and experience
- Book appointments with multiple encounter types (OPD, Video, Follow-up, Emergency)
- View appointment history
- Cancel and reschedule appointments
- Real-time appointment status tracking

#### 3. Medical Records
- Visit history timeline
- EMR viewer with secure access
- Lab reports gallery
- Prescription history
- Downloadable medical documents

#### 4. Profile Management
- Personal information management
- Health information (allergies, chronic conditions, medications)
- Blood group and emergency contacts
- Insurance details
- Switch between facilities
- Security settings

## Tech Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Navigation**: Expo Router v6
- **State Management**: React Context API
- **UI Components**: Custom component library
- **Icons**: Lucide React Native

## Project Structure

```
project/
├── app/                          # Application routes
│   ├── (auth)/                   # Authentication flow
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── tenant-selection.tsx
│   ├── (tabs)/                   # Main app tabs
│   │   ├── home.tsx              # Home dashboard
│   │   ├── appointments/         # Appointments module
│   │   ├── records/              # Medical records
│   │   └── profile.tsx           # User profile
│   └── index.tsx                 # Root navigation
├── components/                   # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── LoadingScreen.tsx
│   └── ErrorMessage.tsx
├── contexts/                     # React contexts
│   └── AuthContext.tsx           # Authentication state
├── services/                     # API service layer
│   ├── auth.service.ts
│   ├── tenant.service.ts
│   ├── doctor.service.ts
│   ├── appointment.service.ts
│   └── medical-record.service.ts
├── lib/                          # Library configurations
│   └── supabase.ts               # Supabase client
├── types/                        # TypeScript types
│   ├── database.ts               # Database types
│   └── env.d.ts                  # Environment types
└── hooks/                        # Custom React hooks
    └── useFrameworkReady.ts

```

## Database Schema

The application uses a comprehensive PostgreSQL database with the following main tables:

- **tenants**: Multi-tenant facility information
- **profiles**: Extended user profiles with patient demographics
- **specialties**: Medical specialties
- **doctors**: Doctor profiles with qualifications and availability
- **doctor_specialties**: Junction table for doctor-specialty relationships
- **appointments**: Patient appointment bookings
- **medical_records**: Visit history and EMR entries
- **prescriptions**: Medication prescriptions
- **lab_reports**: Laboratory test results
- **banners**: Homepage promotional banners
- **emergency_contacts**: Patient emergency contacts
- **insurance_details**: Patient insurance information

All tables have Row Level Security (RLS) enabled with proper policies to ensure data privacy.

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Expo CLI
- Supabase account

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Getting Supabase Credentials:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select existing one
3. Go to Settings > API
4. Copy the Project URL and anon/public key

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Setup

The database schema has been automatically created via migrations. The schema includes:
- All necessary tables with proper relationships
- Row Level Security policies
- Sample data (tenants, specialties, doctors, banners)

### 5. Run the Application

For web development:
```bash
npm run dev
```

For iOS simulator (requires macOS):
```bash
npm run dev
# Then press 'i' in the terminal
```

For Android emulator:
```bash
npm run dev
# Then press 'a' in the terminal
```

### 6. Build for Production

For web:
```bash
npm run build:web
```

For mobile apps, create a production build using EAS:
```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

## Usage Guide

### First Time Setup

1. **Sign Up**: Create a new account with email and password
2. **Complete Profile**: Fill in patient demographic information
3. **Select Facility**: Choose your clinic or care facility
4. **Start Using**: Access all features from the home dashboard

### Booking an Appointment

1. Tap "Book Appointment" from home or go to Appointments tab
2. Choose to search by specialty or doctor name
3. Select a doctor from the search results
4. Choose date, time, and encounter type
5. Add symptoms (optional)
6. Confirm booking

### Viewing Medical Records

1. Go to Records tab
2. Switch between "Visit History" and "Lab Reports"
3. Tap on any record to view details
4. Download or share reports as needed

### Managing Profile

1. Go to Profile tab
2. Update personal information
3. Add health information (allergies, conditions)
4. Switch facilities if needed
5. Sign out when done

## Security Features

- **JWT-based Authentication**: Secure token management with automatic refresh
- **Row Level Security**: Database-level access control
- **Encrypted Storage**: Secure storage for sensitive data
- **HTTPS Only**: All API calls over secure connections
- **Input Validation**: Client and server-side validation
- **HIPAA Compliance**: Following healthcare data protection standards

## API Services

All API interactions are abstracted through service classes:

- `AuthService`: User authentication and profile management
- `TenantService`: Facility information and banners
- `DoctorService`: Doctor search and profiles
- `AppointmentService`: Appointment CRUD operations
- `MedicalRecordService`: Medical records and lab reports

## Customization

### Theming

Each tenant can have custom branding:
- Logo URL
- Primary color
- Facility name

Update in the `tenants` table via Supabase dashboard.

### Banners

Add promotional banners via Supabase:
1. Go to Supabase dashboard
2. Open `banners` table
3. Add new banner with image URL, title, and display order

### Feature Flags

Enable/disable features per tenant by modifying tenant configuration.

## Troubleshooting

### Common Issues

**Issue**: App won't start
- Solution: Clear Metro bundler cache: `npx expo start --clear`

**Issue**: Authentication errors
- Solution: Verify Supabase credentials in `.env` file

**Issue**: Database connection failed
- Solution: Check Supabase project is active and credentials are correct

**Issue**: Images not loading
- Solution: Ensure internet connection and valid image URLs

## Support

For issues, questions, or feature requests:
- Check existing issues in the repository
- Review Supabase documentation
- Check Expo documentation

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [Expo](https://expo.dev)
- Database by [Supabase](https://supabase.com)
- Icons from [Lucide](https://lucide.dev)
- Images from [Pexels](https://pexels.com)
