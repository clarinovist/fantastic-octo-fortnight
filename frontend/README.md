# Les Private - Frontend

A modern tutoring platform that connects students with qualified tutors. Built with Next.js 16, this application provides a seamless experience for finding, booking, and managing private lessons.

## Overview

Les Private is a full-featured educational platform that enables users to discover tutors, manage courses, handle subscriptions, and communicate through an integrated notification system. The platform supports Google OAuth authentication and provides a responsive, user-friendly interface.

## Architecture

### Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Authentication**: NextAuth.js with Google OAuth
- **State Management**: SWR for data fetching and caching
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Maps**: Google Maps (@vis.gl/react-google-maps)
- **Date Handling**: date-fns
- **Deployment**: Docker with standalone output

### Project Structure

```
les-private-fe/
├── actions/              # Server actions for data mutations
│   ├── account.ts
│   ├── auth.ts
│   └── file.ts
├── app/                  # Next.js App Router
│   ├── (customer)/       # Customer-facing routes (grouped)
│   │   ├── [id]/        # Dynamic tutor profile pages
│   │   ├── account/     # User account management
│   │   ├── change-password/
│   │   ├── courses/     # Course listings and details
│   │   ├── login/       # Authentication pages
│   │   ├── plans/       # Subscription plans
│   │   └── signup/      # User registration
│   ├── api/             # API routes
│   ├── auth/            # Auth-related pages
│   └── layout.tsx       # Root layout
├── components/          # Reusable UI components
│   ├── brand/          # Brand-specific components
│   └── ui/             # Generic UI components (shadcn/ui)
├── context/            # React Context providers
│   └── user-profile.tsx
├── hooks/              # Custom React hooks
│   ├── use-countdown.ts
│   ├── use-lookup.ts
│   ├── use-mobile.tsx
│   ├── use-notifications.ts
│   ├── use-unread-notifications.ts
│   └── use-visible.ts
├── lib/                # Utility libraries
│   ├── auth.ts         # NextAuth configuration
│   └── utils.ts        # Helper functions
├── services/           # API service layer
│   ├── account.ts
│   ├── auth.ts
│   ├── base.ts         # Base fetcher configuration
│   ├── client.ts       # Client-side fetcher
│   ├── course.ts
│   ├── file.ts
│   ├── notification.ts
│   └── subscription.ts
├── utils/              # Utility functions and constants
└── public/             # Static assets

```

### Key Architectural Patterns

#### 1. Route Organization
- Uses Next.js App Router with route groups `(customer)` for logical organization
- Server and client components separated for optimal performance
- Dynamic routes for tutor profiles and course details

#### 2. Data Fetching Strategy
- **SWR** for client-side data fetching with automatic revalidation
- **Server Actions** for mutations (account, auth, file operations)
- **Service Layer** abstracts API calls with typed responses
- Centralized fetcher configuration in `services/base.ts`

#### 3. Authentication Flow
- Google OAuth via NextAuth.js
- Custom callback handling for new user registration
- Token management with HTTP-only cookies
- Role-based access control during signup

#### 4. Component Architecture
- Radix UI primitives for accessible, unstyled components
- Custom hooks for reusable logic (notifications, mobile detection, visibility)
- Context providers for global state (user profile)
- Framer Motion for smooth animations

#### 5. Type Safety
- Full TypeScript coverage
- Zod schemas for runtime validation
- Type-safe API responses through service layer

## Getting Started

### Prerequisites

- Node.js 20+
- npm, yarn, pnpm, or bun
- Google OAuth credentials
- Backend API endpoint

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
NEXT_BASE_API_URL=your_backend_api_url
NEXT_GOOGLE_KEY=your_google_maps_api_key
NEXT_GOOGLE_AUTH_CLIENT_ID=your_google_oauth_client_id
NEXT_GOOGLE_AUTH_CLIENT_SECRET=your_google_oauth_client_secret
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Deployment

### Docker Deployment

The application is containerized and ready for deployment:

```bash
# Build and run with Docker Compose
docker-compose up -d
```

The application will be available on port 7002 (mapped to internal port 3000).

### Configuration
- **Output**: Standalone mode for optimized Docker images
- **Images**: Unoptimized for faster builds
- **Network**: Uses external `lesprivate` network for service communication

### Production Build

```bash
npm run build
npm start
```

The standalone output in `.next/standalone` contains everything needed for deployment.

## Features

- **User Authentication**: Google OAuth integration with role selection
- **Tutor Discovery**: Browse and search for qualified tutors
- **Course Management**: View and enroll in courses
- **Subscription Plans**: Flexible pricing and plan management
- **Account Management**: Profile editing and password changes
- **Notifications**: Real-time notification system with unread tracking
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Maps Integration**: Location-based tutor search with Google Maps
- **File Uploads**: Support for profile pictures and documents

## Development Guidelines

### Code Style
- Prettier configured for consistent formatting
- ESLint for code quality
- TypeScript strict mode enabled

### Component Development
- Use Radix UI primitives for new components
- Follow shadcn/ui patterns for consistency
- Implement proper TypeScript types
- Add proper accessibility attributes

### API Integration
- Use service layer functions from `services/`
- Implement proper error handling
- Add loading states with SWR
- Type all API responses

## Contributing

1. Follow the existing code structure and patterns
2. Ensure TypeScript types are properly defined
3. Test authentication flows thoroughly
4. Maintain responsive design principles
5. Add proper error handling and loading states

## License

Private - All rights reserved
