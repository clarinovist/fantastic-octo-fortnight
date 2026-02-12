# Lesprivate Admin Dashboard

Admin dashboard for managing the Lesprivate tutoring platform. Built with Next.js 16, React 19, and TypeScript.

## Overview

Lesprivate Admin is a comprehensive administrative interface for managing tutors, students, courses, bookings, and subscriptions. The application provides a modern, responsive UI with real-time data management capabilities.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI, shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: SWR
- **Charts**: Recharts
- **Maps**: Google Maps API
- **Icons**: Lucide React, Tabler Icons
- **Drag & Drop**: dnd-kit
- **Notifications**: Sonner

## Architecture

### Project Structure

```
├── actions/              # Server actions for data mutations
│   ├── auth.ts          # Authentication actions
│   ├── booking.ts       # Booking management
│   ├── course.ts        # Course CRUD operations
│   ├── student.ts       # Student management
│   ├── tutor.ts         # Tutor management
│   └── subscription.ts  # Subscription pricing
│
├── app/                 # Next.js App Router
│   ├── (dashboard)/     # Dashboard routes (grouped layout)
│   │   ├── bookings/    # Booking management
│   │   ├── courses/     # Course management
│   │   ├── dashboard/   # Main dashboard
│   │   ├── students/    # Student management
│   │   ├── subscriptions/ # Subscription management
│   │   └── tutors/      # Tutor management
│   ├── api/             # API routes
│   ├── login/           # Authentication pages
│   └── layout.tsx       # Root layout
│
├── components/          # React components
│   ├── base/           # Base UI components
│   ├── booking/        # Booking-specific components
│   ├── course/         # Course-specific components
│   ├── layout/         # Layout components
│   ├── shared/         # Shared components
│   ├── statistic/      # Statistics & charts
│   ├── student/        # Student-specific components
│   ├── subscription/   # Subscription components
│   ├── tutor/          # Tutor-specific components
│   └── ui/             # shadcn/ui components
│
├── services/           # API service layer
│   ├── base.ts        # Base fetcher with auth
│   ├── auth.ts        # Authentication service
│   ├── booking.ts     # Booking API calls
│   ├── course.ts      # Course API calls
│   ├── student.ts     # Student API calls
│   ├── tutor.ts       # Tutor API calls
│   └── subscription.tsx # Subscription API calls
│
├── contexts/          # React contexts
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
└── utils/             # Helper functions & types
```

### Architecture Patterns

#### 1. Server Actions Pattern
The application uses Next.js Server Actions for data mutations, providing type-safe server-side operations:

```typescript
// actions/course.ts
"use server"
export async function updateCourseAction(id: string, payload: CoursePayload) {
  const result = await updateCourse(id, payload)
  updateTag("courses") // Cache invalidation
  return { success: true, data: result.data }
}
```

#### 2. Service Layer
API calls are abstracted into a service layer with a base fetcher that handles:
- Authentication (Bearer token from cookies)
- Error handling
- Response normalization
- Binary data handling (PDFs, images)

```typescript
// services/base.ts
export async function fetcherBase<T>(input: RequestInfo, options?: RequestInit): Promise<BaseResponse<T>>
```

#### 3. Component Organization
- **Feature-based**: Components organized by domain (booking, course, student, tutor)
- **Shared components**: Reusable UI components in `components/shared`
- **UI primitives**: shadcn/ui components in `components/ui`

#### 4. Data Flow
```
User Interaction → Component → Server Action → Service Layer → External API
                                      ↓
                              Cache Invalidation (updateTag)
                                      ↓
                              UI Re-render (SWR)
```

## Key Features

### Dashboard
- Overview statistics and analytics
- Interactive charts and visualizations
- Real-time data updates

### Tutor Management
- Create, update, and delete tutors
- Document upload and verification
- Role management
- Review management
- Profile management with location mapping

### Student Management
- Student CRUD operations
- Role conversion (student ↔ tutor)
- Review management
- Profile management

### Course Management
- Course creation and editing
- Course approval/rejection workflow
- Review notes system
- Course deletion

### Booking Management
- View and manage bookings
- Send reminders to students and tutors
- Booking status tracking

### Subscription Management
- Update subscription pricing
- Manage subscription tiers

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Environment Variables
Create a `.env.local` file:

```env
NEXT_BASE_API_URL=your_api_url
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application will be available at `http://localhost:3000`

### Docker Deployment

```bash
# Build Docker image
docker build -t lesprivate-admin .

# Run container
docker run -p 3000:3000 lesprivate-admin
```

## Authentication

The application uses cookie-based authentication:
- Login credentials are validated via the `/services/auth` endpoint
- Access tokens are stored in HTTP-only cookies
- Tokens expire after 20 hours
- Protected routes redirect to `/login` if unauthenticated

## Development

### Code Style
- TypeScript strict mode enabled
- ESLint for code quality
- Path aliases configured (`@/*` → root)

### Key Technologies

**UI/UX**
- Radix UI primitives for accessible components
- Tailwind CSS for styling
- Dark mode support via next-themes
- Responsive design

**Forms & Validation**
- React Hook Form for form state management
- Zod for schema validation
- Type-safe form submissions

**Data Management**
- SWR for client-side data fetching and caching
- Server Actions for mutations
- Next.js cache tags for granular invalidation

**Interactive Features**
- Drag & drop with dnd-kit
- Google Maps integration
- Interactive charts with Recharts
- Toast notifications with Sonner

## Build Configuration

- **Output**: Standalone (optimized for Docker)
- **Images**: Unoptimized (for flexibility)
- **Target**: ES2017
- **Module Resolution**: Bundler

## License

Private - All rights reserved
