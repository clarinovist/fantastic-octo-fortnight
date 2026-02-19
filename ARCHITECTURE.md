# Lesprivate - System Architecture

Dokumentasi arsitektur lengkap platform les privat online Lesprivate.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NGINX REVERSE PROXY                                  │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐             │
│  │lesprivate.my.id │app.lesprivate│admin.lespri  │api.lesprivate│             │
│  │   :3000      │   .id:7002   │ vate.id:3001 │   .id:8082   │             │
│  └──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┘             │
└─────────┼──────────────┼──────────────┼──────────────┼──────────────────────┘
          │              │              │              │
          ▼              ▼              ▼              ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  HOMEPAGE   │  │  FRONTEND   │  │    ADMIN    │  │   BACKEND   │
│ Vite+React  │  │  Next.js    │  │  Next.js    │  │   Go+Chi    │
│Static Assets│  │  Customer   │  │  Dashboard  │  │    API      │
└─────────────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
                        │                │                │
                        └────────────────┴────────────────┘
                                         │
                        ┌────────────────┼────────────────┐
                        ▼                ▼                ▼
                ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
                │    MySQL    │  │    Redis    │  │  Linode S3  │
                │  Database   │  │    Cache    │  │   Storage   │
                └─────────────┘  └─────────────┘  └─────────────┘
                                         │
                        ┌────────────────┼────────────────┐
                        ▼                ▼                ▼
                ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
                │   Xendit    │  │Google OAuth │  │Google Maps  │
                │  Payments   │  │    Auth     │  │     API     │
                └─────────────┘  └─────────────┘  └─────────────┘
```

---

## 2. Component Details

### 2.1 Homepage (Landing Page)
| Aspect | Details |
|--------|---------|
| **Location** | `/homepage` |
| **Tech Stack** | React 18, Vite, Tailwind CSS |
| **Purpose** | Marketing & SEO landing page |
| **Deployment** | Docker + Nginx (static files) |
| **Port** | 3000 (prod), 5173 (dev) |

**Features:**
- Hero section dengan CTA
- Features showcase
- Teacher profiles grid
- Testimonials
- SEO optimized

---

### 2.2 Frontend (Customer App)
| Aspect | Details |
|--------|---------|
| **Location** | `/frontend` |
| **Tech Stack** | Next.js 16, React 19, TypeScript |
| **Purpose** | Student/Customer facing app |
| **Port** | 7002 (prod), 3001 (dev) |

**Route Structure:**
```
app/(customer)/
├── [id]/            → Halaman profil tutor dinamis
├── account/         → Manajemen akun user
├── change-password/ → Ganti password
├── courses/         → Listing & detail kursus
├── login/           → Login page
├── plans/           → Subscription plans
└── signup/          → Registrasi
```

**Key Features:**
- Google OAuth login
- Pencarian & filter tutor
- Booking les privat
- Manajemen subscription
- Notifikasi real-time
- Google Maps integration

---

### 2.3 Admin Dashboard
| Aspect | Details |
|--------|---------|
| **Location** | `/admin` |
| **Tech Stack** | Next.js 16, React 19, shadcn/ui |
| **Purpose** | Admin management interface |
| **Port** | 3000 (prod), 3000 (dev) |

**Route Structure:**
```
app/(dashboard)/
├── dashboard/      → Overview & statistik
├── tutors/         → Manajemen tutor
├── students/       → Manajemen siswa
├── courses/        → Manajemen kursus
├── bookings/       → Manajemen booking
└── subscriptions/  → Manajemen subscription
```

**Key Features:**
- Dashboard analytics dengan charts
- CRUD tutor & student
- Course approval workflow
- Booking management
- Subscription pricing

---

### 2.4 Backend API
| Aspect | Details |
|--------|---------|
| **Location** | `/backend` |
| **Tech Stack** | Go 1.24, Chi Router, GORM |
| **Purpose** | Central API server |
| **Port** | 8082 (prod), 8080 (dev) |

---

## 3. Backend Architecture (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                     HTTP Layer (Chi Router)                  │
│  transport/http/http.go                                      │
│  - Middleware (CORS, Logger, Recoverer)                     │
│  - Route registration                                        │
│  - Swagger docs                                              │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Handlers (Presentation Layer)             │
│  internal/handlers/v1/                                       │
│  ┌─────────────┬─────────────┬─────────────┬──────────────┐ │
│  │ user.go     │ course.go   │ booking.go  │ profile.go   │ │
│  │ - Auth      │ - CRUD      │ - Student   │ - Update     │ │
│  │ - Register  │ - Search    │ - Tutor     │ - Documents  │ │
│  │ - Login     │ - Approval  │ - Schedule  │ - Reviews    │ │
│  └─────────────┴─────────────┴─────────────┴──────────────┘ │
│  ┌─────────────┬─────────────┬─────────────┬──────────────┐ │
│  │notification │subscription │ webhook.go  │ lookup.go    │ │
│  │ .go         │ .go         │ - Xendit    │ - Provinces  │ │
│  │ - Push      │ - Plans     │ - Callback  │ - Categories │ │
│  └─────────────┴─────────────┴─────────────┴──────────────┘ │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Services (Business Logic)                 │
│  internal/services/                                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ UserService          - Auth, JWT, OAuth               │  │
│  │ CourseService        - CRUD, Search, Filtering        │  │
│  │ CourseDraftService   - Draft management, Approval     │  │
│  │ BookingService       - Scheduling, Reminders          │  │
│  │ StudentBookingService- Student-specific booking       │  │
│  │ TutorBookingService  - Tutor-specific booking         │  │
│  │ NotificationService  - Push, Email notifications      │  │
│  │ ProfileService       - User profiles, Documents       │  │
│  │ StudentSubscriptionService - Subscription logic       │  │
│  │ WebhookService       - Payment webhook handling       │  │
│  │ DashboardService     - Analytics & statistics         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Repositories (Data Access)                  │
│  internal/repositories/                                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ UserRepository        - users table                   │  │
│  │ CourseRepository      - courses table                 │  │
│  │ BookingRepository     - bookings table                │  │
│  │ ReviewRepository      - reviews table                 │  │
│  │ NotificationRepository- notifications table           │  │
│  │ SubscriptionRepository- subscriptions table           │  │
│  │ PaymentRepository     - payments table                │  │
│  │ TutorRepository       - tutors table                  │  │
│  │ StudentRepository     - students table                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Models (Domain)                          │
│  internal/model/                                             │
│  - User, Role, UserRole                                      │
│  - Course, CourseCategory, CourseDraft                       │
│  - Booking, ReportBooking                                    │
│  - Student, StudentReview                                    │
│  - Tutor, TutorDocument, TutorReview                        │
│  - Subscription, SubscriptionPrice, Payment                  │
│  - Notification, Location                                    │
│  - DTOs (Data Transfer Objects)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema (ERD Summary)

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│      USERS       │────<│    USER_ROLES    │>────│      ROLES       │
│ - id             │     │ - user_id        │     │ - id             │
│ - email          │     │ - role_id        │     │ - name           │
│ - password       │     └──────────────────┘     │ (student/tutor/  │
│ - google_id      │                              │  admin)          │
└────────┬─────────┘                              └──────────────────┘
         │
         ├──────────────────────────────────────────┐
         │                                          │
         ▼                                          ▼
┌──────────────────┐                      ┌──────────────────┐
│     STUDENTS     │                      │      TUTORS      │
│ - id             │                      │ - id             │
│ - user_id        │                      │ - user_id        │
│ - name           │                      │ - name           │
│ - phone          │                      │ - bio            │
│ - address        │                      │ - experience     │
└────────┬─────────┘                      │ - hourly_rate    │
         │                                └────────┬─────────┘
         │                                         │
         │    ┌────────────────────────────────────┤
         │    │                                    │
         ▼    ▼                                    ▼
┌──────────────────┐                      ┌──────────────────┐
│     BOOKINGS     │                      │     COURSES      │
│ - id             │                      │ - id             │
│ - student_id     │                      │ - tutor_id       │
│ - tutor_id       │                      │ - category_id    │
│ - course_id      │                      │ - title          │
│ - schedule_date  │                      │ - description    │
│ - status         │                      │ - price          │
│ - expired_at     │                      │ - status         │
└──────────────────┘                      │ - location       │
         │                                └──────────────────┘
         │                                         │
         ▼                                         ▼
┌──────────────────┐                      ┌──────────────────┐
│     PAYMENTS     │                      │     REVIEWS      │
│ - id             │                      │ - id             │
│ - booking_id     │                      │ - course_id      │
│ - amount         │                      │ - student_id     │
│ - status         │                      │ - rating         │
│ - xendit_id      │                      │ - comment        │
└──────────────────┘                      └──────────────────┘

┌──────────────────┐                      ┌──────────────────┐
│  SUBSCRIPTIONS   │                      │  NOTIFICATIONS   │
│ - id             │                      │ - id             │
│ - student_id     │                      │ - user_id        │
│ - plan_type      │                      │ - title          │
│ - start_date     │                      │ - message        │
│ - end_date       │                      │ - read_at        │
│ - status         │                      │ - type           │
└──────────────────┘                      └──────────────────┘
```

---

## 5. External Services Integration

### 5.1 Payment Gateway (Xendit)
```
Student → Create Payment → Backend → Xendit API
                                         │
                              ┌──────────┴──────────┐
                              ▼                     ▼
                        Invoice Created      User Pays
                              │                     │
                              └──────────┬──────────┘
                                         ▼
                              Webhook Callback → Backend
                                         │
                                         ▼
                              Update Payment Status
                              Send Notification
```

### 5.2 Google OAuth Flow
```
User → Click Login Google → Frontend
                              │
                              ▼
                     Google OAuth Screen
                              │
                              ▼
                     Callback to Frontend
                              │
                              ▼
                     Send Token to Backend
                              │
                              ▼
                     Validate & Create JWT
                              │
                              ▼
                     Return User Session
```

### 5.3 Google Maps Integration
- Location autocomplete untuk tutor address
- Distance calculation untuk search nearby tutor
- Map display untuk lokasi kursus

---

## 6. API Endpoints Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/auth/register` | Register user baru |
| POST | `/v1/auth/login` | Login dengan email/password |
| POST | `/v1/auth/google` | Login dengan Google |
| POST | `/v1/auth/refresh` | Refresh JWT token |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/courses` | List semua kursus |
| GET | `/v1/courses/:id` | Detail kursus |
| POST | `/v1/tutor/courses` | Buat kursus baru |
| PUT | `/v1/tutor/courses/:id` | Update kursus |
| DELETE | `/v1/tutor/courses/:id` | Hapus kursus |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/student/bookings` | List booking student |
| GET | `/v1/tutor/bookings` | List booking tutor |
| POST | `/v1/student/bookings` | Buat booking baru |
| PUT | `/v1/student/bookings/:id/cancel` | Cancel booking |
| PUT | `/v1/tutor/bookings/:id/accept` | Accept booking |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/subscriptions/prices` | List harga subscription |
| POST | `/v1/student/subscriptions` | Beli subscription |
| GET | `/v1/student/subscriptions/active` | Cek subscription aktif |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/admin/dashboard` | Dashboard statistics |
| GET | `/v1/admin/tutors` | List semua tutor |
| GET | `/v1/admin/students` | List semua student |
| PUT | `/v1/admin/courses/:id/approve` | Approve kursus |
| PUT | `/v1/admin/courses/:id/reject` | Reject kursus |

---

## 7. Deployment Architecture

### Production (Single VPS)
```
┌─────────────────────────────────────────────────────────┐
│                     VPS (8GB RAM)                        │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │                    Docker Network                   │ │
│  │                    (lesprivate)                     │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────┐ │ │
│  │  │Homepage  │ │Frontend  │ │  Admin   │ │Backend│ │ │
│  │  │  :3000   │ │  :7002   │ │  :3001   │ │ :8082 │ │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────┘ │ │
│  │  ┌──────────┐ ┌──────────┐                        │ │
│  │  │  MySQL   │ │  Redis   │                        │ │
│  │  │  :3306   │ │  :6379   │                        │ │
│  │  └──────────┘ └──────────┘                        │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│  ┌───────────────────────▼────────────────────────────┐ │
│  │              Nginx Reverse Proxy                    │ │
│  │              + SSL (Let's Encrypt)                  │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### CI/CD Pipeline
```
Developer Push → GitHub → GitHub Actions
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              SSH to Server       Telegram Notify
                    │
                    ▼
              git pull origin main
                    │
                    ▼
              docker compose up -d --build
                    │
                    ▼
              Service Updated ✅
```

---

## 8. Security Measures

| Layer | Security |
|-------|----------|
| **Authentication** | JWT tokens with expiry |
| **Authorization** | Role-based access control (RBAC) |
| **API** | CORS configuration, Rate limiting |
| **Database** | Parameterized queries (GORM) |
| **Transport** | HTTPS via Nginx + Let's Encrypt |
| **Secrets** | Environment variables, tidak di-commit |
| **Payment** | Xendit webhook signature validation |

---

## 9. Monitoring & Logging

- **Application Logs**: Zerolog (structured JSON logging)
- **Request Logging**: Chi middleware logger
- **Error Tracking**: Recoverer middleware
- **Database**: GORM logger
- **Swagger**: API documentation di `/swagger/index.html`
