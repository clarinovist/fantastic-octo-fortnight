# Mentor Migration Plan: Frontend → Mentor Portal

**Goal:** Migrate all mentor-specific features from `/frontend` to `/mentor` portal, harmonize UI/UX, then remove mentor flow from frontend so it becomes purely a student/customer app.

**Architecture:** The `/mentor` portal is a standalone Next.js app with its own auth, services, and components. We will port frontend mentor components into the mentor portal's structure, adapting them to use `fetcherBase` + SWR patterns. After migration, dead mentor code in frontend will be pruned.

**Tech Stack:** Next.js 16, React, SWR, shadcn/ui, Tailwind CSS 4, Zod, Lucide Icons

---

## Gap Analysis

| Feature | Frontend | Mentor Portal | Action |
|---------|----------|---------------|--------|
| Login / Signup + Role Selection | ✅ Full | ✅ Own login | Keep as-is |
| Dashboard | ❌ | ✅ | No action |
| **Course Management (CRUD)** | ✅ 95KB wizard + list | ❌ Read-only list | **MIGRATE** |
| **Booking Accept/Reject** | ✅ Full | ❌ | **MIGRATE** |
| **Document Upload** | ✅ (upload, list, delete) | ❌ | **MIGRATE** |
| **Tutor Level / Predikat** | ✅ Progress bar | ❌ | **MIGRATE** |
| **Reviews (Tutor view)** | ✅ (list, rating dialog) | ❌ | **MIGRATE** |
| Profile Edit | ✅ Full (name, gender, DOB, phone, social media, photo) | ✅ Basic (name, phone, address) | **ENHANCE** |
| Location Map | ✅ Google Maps | ❌ | **MIGRATE** |
| Sessions | ❌ | ✅ | No action |
| Finance | ❌ | ✅ | No action |
| Withdrawals | ❌ | ✅ | No action |
| Students | ❌ | ✅ | No action |
| Notifications | ✅ | ✅ | No action |

---

## UI Harmonization Audit

### Current State Issues

#### 1. Sidebar Structure — Needs Restructuring
**Current sidebar** (6 flat items):
```
Dashboard | Sessions | Students | Finance | Withdrawals | Profile
```

**Problem:** Adding Courses, Bookings, Reviews, and Documents creates a long flat list (10+ items). Need grouped sections for discoverability.

**Proposed sidebar** (grouped by purpose):
```
── OVERVIEW ──
   Dashboard

── TEACHING ──
   Kelas Saya          [NEW] (BookOpen icon)
   Sesi Mengajar
   Booking Masuk       [NEW] (ClipboardList icon)
   Murid Saya

── FINANCE ──
   Saldo & Keuangan
   Penarikan Dana

── ACCOUNT ──
   Profil
   Dokumen             [NEW] (FileCheck icon)
   Ulasan              [NEW] (Star icon)
```

**Files:**
- Modify: `mentor/components/app-sidebar.tsx`

#### 2. Color Token Mismatch
**Problem:** Sidebar uses hardcoded `violet-600` extensively, but brand design tokens define primary as `#7000FE` (which IS violet-ish but should use `bg-primary` token for consistency).

**Action:** Verify `mentor/app/globals.css` has `--color-primary: #7000FE` defined. Replace hardcoded `violet-600` references with `primary` tokens where appropriate, or confirm `violet-600` maps close enough. Low priority — violet-600 (`#7c3aed`) is close but not exact.

**Files:**
- Audit: `mentor/app/globals.css` (check CSS custom properties)
- Potentially modify: `mentor/components/app-sidebar.tsx`, `mentor/app/(mentor)/profile/page.tsx`

#### 3. Page Header Pattern — Not Standardized
**Problem:** Each page (Dashboard, Sessions, Profile, Finance) manually duplicates the same breadcrumb + notification dropdown header. This leads to inconsistency and duplicated code.

**Current pattern (repeated in every page):**
```tsx
<header className="h-16 bg-background border-b flex items-center justify-between px-8">
  <nav>/* breadcrumb */</nav>
  <div><NotificationDropdown /></div>
</header>
```

**Action:** Extract a reusable `PageHeader` component to ensure all pages (including new ones) share an identical top bar.

**Files:**
- Create: `mentor/components/layout/page-header.tsx`
- Modify: All existing pages to use `PageHeader` component

#### 4. Mobile Responsiveness
**Problem:** Current mentor portal sidebar uses `shadcn/ui SidebarProvider` but mobile behavior hasn't been tested with the expanded menu. Adding 4+ new items requires testing the mobile hamburger menu behavior.

**Action:** Test and verify mobile sidebar works with 10+ menu items after restructure.

---

## API Compatibility Analysis

### Backend Route Architecture

The backend has **two separate route groups** for tutor/mentor features:

| Route Group | Package | Used By | Endpoints |
|-------------|---------|---------|-----------|
| `/v1/tutors/*` | `handlers/v1` (tutor_course, tutor_booking, tutor_document, tutor_review) | Frontend | 14 endpoints |
| `/v1/mentor/*` | `handlers/v1/mentor` | Mentor Portal | 11 endpoints |

Both use the same JWT auth middleware (`middleware.JWTAuth`), so the **same auth token works for both groups**.

### `/v1/tutors/*` Endpoints (Must Work from Mentor Portal)

| Endpoint | Method | Response DTO | Currently Used By |
|----------|--------|-------------|-------------------|
| `/v1/tutors/courses` | GET | `dto.TutorCourseListResponse[]` | Frontend + Mentor (already cross-calling!) |
| `/v1/tutors/courses` | POST | `dto.CourseCreateResponse` | Frontend only |
| `/v1/tutors/courses/{id}` | GET | `dto.CourseDetailSaved` (full detail + draft) | Frontend only |
| `/v1/tutors/courses/{id}` | PUT | `dto.CourseCreateResponse` | Frontend only |
| `/v1/tutors/courses/{id}` | DELETE | `"success"` | Frontend only |
| `/v1/tutors/courses/{id}/submit` | POST | `"success"` | Frontend only |
| `/v1/tutors/courses/{id}/publish` | PUT | `"success"` | Frontend only |
| `/v1/tutors/booking` | GET | `dto.Booking[]` | Frontend only |
| `/v1/tutors/booking/{id}` | GET | `dto.BookingDetail` | Frontend only |
| `/v1/tutors/booking/{id}/approve` | PUT | `"success"` | Frontend only |
| `/v1/tutors/booking/{id}/decline` | PUT | `"success"` | Frontend only |
| `/v1/tutors/documents` | GET | `TutorDocument[]` | Frontend only |
| `/v1/tutors/documents` | POST | Upload (multipart) | Frontend only |
| `/v1/tutors/documents/{id}` | DELETE | `"success"` | Frontend only |
| `/v1/tutors/reviews` | GET | `dto.Review[]` | Frontend only |
| `/v1/tutors/reviews/{id}` | PUT | `"success"` | Frontend only |

### Response Shape Differences

> [!WARNING]
> Frontend types use **camelCase** in some fields, while backend DTOs typically use **snake_case**. Verify JSON struct tags in Go DTOs match what the frontend expects.

| Feature | Frontend Type | Key Fields | Mentor Type | Mismatch? |
|---------|--------------|------------|-------------|-----------|
| Course List | `MyCourseResponse` | `id, title, description, isPublished, status` | `MentorCourse` | ⚠️ `isPublished` vs `is_published` — depends on Go JSON tag |
| Course Detail | `CourseDetailSaved` | Full schedule, pricing, draft | N/A | Must create in mentor |
| Course Create | `CourseCreateResponse` | All fields + nested draft | N/A | Must create in mentor |
| Booking List | `Booking` (frontend) | `id, bookingDate, bookingTime, courseTitle, status, expiredAt` | N/A (only `Session` exists in mentor) | ⚠️ Different shape: `Session` has `student_name`, `class_type`, `code` |
| Booking Detail | `BookingDetail` (dto) | Full nested objects | N/A | Must create in mentor |
| Documents | `TutorDocumentResponse` | `id, url, status, created_at, updated_at` | N/A | Must create in mentor |
| Reviews | `dto.Review` | `id, name, email, courseTitle, photoProfile, rate, review` | N/A | Must create in mentor |
| Profile (`/v1/me`) | `MeResponse` | `level_point, level, gender, date_of_birth, social_media_link` | `User` (auth service) | ⚠️ Mentor `User` type is simpler, missing `level_point` etc. |

### API Call Pattern Differences

| Aspect | Frontend | Mentor Portal |
|--------|----------|---------------|
| **Base URL** | Proxied via Next.js: `/api/v1/tutors/...` | Direct to backend: `fetcherBase("/v1/tutors/...")` |
| **Auth** | Server-side cookie → Next.js API route → backend | Client-side JWT cookie → `fetcherBase` adds token header |
| **File Upload** | Server action (`uploadTutorDocumentAction`) | Must use `fetcherBase` with FormData |
| **Data Fetching** | `clientFetch` + SWR (some), server components (some) | `fetcherBase` + SWR (all client-side) |

### Action Items Per Phase

#### Phase 1 (Course Management)
- ✅ `/v1/tutors/courses` GET already works from mentor portal (proven by existing `getMentorCourses()`)
- 🔧 Create TypeScript types for `CourseDetailSaved`, `CourseCreateResponse` in mentor's `utils/types/`
- 🔧 Create `mentor/services/course.ts` with: `createCourse`, `updateCourse`, `getCourseDetail`, `deleteCourse`, `submitCourse`, `publishCourse`
- ⚠️ Verify `isPublished` JSON casing — check Go struct tag `json:"isPublished"` vs `json:"is_published"`

#### Phase 2 (Booking)
- 🔧 Create `mentor/services/booking.ts` calling `/v1/tutors/booking/*` endpoints
- 🔧 Create TypeScript types matching `dto.Booking` and `dto.BookingDetail` response shapes
- ⚠️ Distinct from existing `Session` — bookings are incoming requests from students; sessions are created by mentor

#### Phase 3 (Documents + Reviews)
- 🔧 Create `mentor/services/document.ts` for file upload via `fetcherBase` with `FormData`
- 🔧 Create `mentor/services/review.ts` calling `/v1/tutors/reviews`
- ⚠️ Document upload currently uses Next.js server action in frontend — must convert to client-side `FormData` approach

#### Phase 4 (Profile Enhancement)
- ⚠️ Mentor portal's `User` type (from auth service) may not include `level_point`, `level`, `gender`, `date_of_birth`, `social_media_link`
- 🔧 Verify `/v1/me` returns full `MeResponse` fields regardless of calling app
- 🔧 Extend mentor's `User` interface to include missing fields
- 🔧 Location update endpoint: verify `/v1/profile` PUT supports `latitude`/`longitude` updates

---

## Phased Migration Plan

### Phase 0: UI Foundation (Do First)
> Sets up the infrastructure that all subsequent phases depend on.

#### Task 0A: Reusable Page Header Component
**Files:**
- Create: `mentor/components/layout/page-header.tsx`

**Steps:**
1. Create `PageHeader` component with props: `title`, `breadcrumbs`, `actions` (slot for buttons)
2. Include `NotificationDropdown`, `GlobalSearch` in header
3. Verify: Component renders correctly in isolation

#### Task 0B: Sidebar Restructure with Grouped Sections
**Files:**
- Modify: `mentor/components/app-sidebar.tsx`

**Steps:**
1. Define menu groups: `OVERVIEW`, `TEACHING`, `FINANCE`, `ACCOUNT`
2. Use `SidebarGroup` + `SidebarGroupLabel` from shadcn/ui sidebar
3. Add placeholder hrefs for `/courses`, `/bookings`, `/documents`, `/reviews`
4. Verify: Sidebar renders with grouped sections and correct active states

#### Task 0C: Color Token Alignment
**Files:**
- Audit/Modify: `mentor/app/globals.css`
- Modify: `mentor/tailwind.config.ts` (if token mapping needed)

**Steps:**
1. Verify `--color-primary` is set to `#7000FE` in globals.css
2. Decide: keep `violet-600` as-is (close enough) or switch to `primary` token
3. If switching, update sidebar + profile page accent colors
4. Verify: No visual regressions

#### Task 0D: Migrate Existing Pages to PageHeader
**Files:**
- Modify: `mentor/app/(mentor)/dashboard/page.tsx`
- Modify: `mentor/app/(mentor)/sessions/page.tsx`
- Modify: `mentor/app/(mentor)/finance/page.tsx`
- Modify: `mentor/app/(mentor)/profile/page.tsx`
- Modify: `mentor/app/(mentor)/students/page.tsx`
- Modify: `mentor/app/(mentor)/withdrawals/page.tsx`

**Steps:**
1. Replace duplicated header JSX with `<PageHeader>` component
2. Verify: All 6 existing pages look identical before/after

---

### Phase 1: Course Management (Highest Priority)
> The most complex feature (management-form.tsx alone is 95KB). Without it, mentors cannot create or edit courses.

#### Task 1: Course Management Services
**Files:**
- Create: `mentor/services/course.ts`
- Reference: `frontend/services/account.ts` (publishCourse), `frontend/services/course.ts` (getCourseSavedById)

**Steps:**
1. Create service with: `getMyCourses`, `getCourseSaved`, `createCourse`, `updateCourse`, `publishCourse`, `getCourseCategories`
2. Add types to `mentor/utils/types/index.ts`
3. Verify: `npm run build` passes

#### Task 2: Course List Page
**Files:**
- Create: `mentor/app/(mentor)/courses/page.tsx`
- Create: `mentor/components/mentor/course/course-list.tsx`
- Create: `mentor/components/mentor/course/course-item.tsx`

**Steps:**
1. Port `CourseList` and `CourseItem`, adapt to SWR + fetcherBase
2. Use `PageHeader` with breadcrumb "Dashboard / Kelas Saya"
3. Add "BUAT" button linking to `/courses/create`
4. Verify: Page renders with real API data

#### Task 3: Course Create/Edit Wizard
**Files:**
- Create: `mentor/app/(mentor)/courses/create/page.tsx`
- Create: `mentor/app/(mentor)/courses/[id]/edit/page.tsx`
- Create: `mentor/components/mentor/course/management/` (6 files)

**Steps:**
1. Port multi-step wizard container with step context
2. Port management form (audience, about, pricing, schedule)
3. Port stepper UI and preview components
4. Adapt API calls to `fetcherBase` pattern
5. Style wizard stepper using `primary` token instead of hardcoded `bg-main`
6. Verify: Full create-edit flow works end-to-end

---

### Phase 2: Booking Management

#### Task 4: Booking Services
**Files:**
- Create: `mentor/services/booking.ts`

**Steps:**
1. Create service: `getBookings`, `getBookingDetail`, `approveBooking`, `rejectBooking`
2. Add `Booking`, `BookingDetail` types
3. Verify: Types compile cleanly

#### Task 5: Booking List Page
**Files:**
- Create: `mentor/app/(mentor)/bookings/page.tsx`
- Create: `mentor/components/mentor/booking/` (booking-list, booking-item, booking-detail)

**Steps:**
1. Port booking list with infinite scroll
2. Use `PageHeader` with actions slot for filter buttons
3. Port booking detail dialog with accept/reject actions
4. Verify: Can view, accept, and reject bookings from portal

---

### Phase 3: Documents, Tutor Level & Reviews

#### Task 6: Document Upload
**Files:**
- Create: `mentor/services/document.ts`
- Create: `mentor/app/(mentor)/documents/page.tsx` (or embed in profile)
- Create: `mentor/components/mentor/document/document-list.tsx`
- Create: `mentor/components/mentor/document/document-card.tsx`

**Steps:**
1. Create document service: `getDocuments`, `uploadDocument`, `deleteDocument`
2. Port document list and card components, style with shadcn Card
3. Verify: Upload, view, and delete documents work

#### Task 7: Tutor Level / Predikat
**Files:**
- Create: `mentor/components/mentor/tutor-level.tsx`
- Modify: `mentor/app/(mentor)/dashboard/page.tsx` (add as dashboard widget)

**Steps:**
1. Port tutor level component, restyle progress bar to use mentor portal design (shadcn Card, `primary` tokens)
2. Add to dashboard as a prominent widget
3. Verify: Renders with correct point data from `/v1/me`

#### Task 8: Reviews Page
**Files:**
- Create: `mentor/app/(mentor)/reviews/page.tsx`
- Create: `mentor/components/mentor/review/review-list.tsx`
- Create: `mentor/components/mentor/review/review-item.tsx`

**Steps:**
1. Create review list fetching from `/v1/tutors/reviews`
2. Show student name, rating stars, comment, date
3. Use `PageHeader` component
4. Verify: Reviews display correctly

---

### Phase 4: Profile Enhancement

#### Task 9: Enhance Profile Page
**Files:**
- Modify: `mentor/app/(mentor)/profile/page.tsx`

**Steps:**
1. Add missing fields: gender, date of birth, social media links, photo upload
2. Add location map (Google Maps with marker drag — `GoogleMapsProvider` already in layout!)
3. Verify: Full profile editing matches frontend capability

---

### Phase 5: Frontend Cleanup (After All Migrations Verified)

#### Task 10: Remove Mentor-Only Code from Frontend
**Files to delete:**
- `frontend/components/brand/account/tutor-level.tsx`
- `frontend/components/brand/account/document/` (entire directory)
- `frontend/components/brand/account/course/course-list.tsx`
- `frontend/components/brand/account/course/course-item.tsx`
- `frontend/components/brand/course/management/` (entire directory)
- `frontend/components/brand/account/course/booking/booking-course-accept-action.tsx`
- `frontend/components/brand/account/course/booking/booking-course-reject-action.tsx`

**Files to modify:**
- `frontend/components/brand/account/account-container.tsx` → Remove `isTutor` conditionals
- `frontend/components/brand/account/course/booking/booking-list.tsx` → Remove tutor paths
- `frontend/services/account.ts` → Remove tutor-only functions
- `frontend/services/course.ts` → Remove `getCourseSavedById`

**Steps:**
1. Remove all tutor-conditional UI from `account-container.tsx`
2. Delete tutor-only components and services
3. Run `npm run build` to verify no broken imports
4. Run `npm run lint` for dead code

#### Task 11: Redirect Tutor Logins to Mentor Portal
**Files:**
- Modify: `frontend/components/brand/auth/login-form.tsx`
- Modify: `frontend/middleware.ts` (if exists)

**Steps:**
1. After login, check user role
2. If `role === "tutor"`, redirect to mentor portal URL
3. Verify: Tutor login → redirected to mentor portal

---

## Verification Plan

### Automated Tests
```bash
# After each phase
cd mentor && npm run build
cd frontend && npm run build
cd mentor && npm run lint
cd frontend && npm run lint
```

### Manual Verification
- **Phase 0:** Sidebar groups render, PageHeader consistent across all pages
- **Phase 1:** Create course from mentor portal → verify in admin
- **Phase 2:** Accept/reject booking from mentor portal
- **Phase 3:** Upload document, check tutor level, view reviews
- **Phase 4:** Edit full profile including location map
- **Phase 5:** Tutor login from frontend → redirected to mentor portal

---

## Estimated Effort

| Phase | Focus | Tasks | Complexity | Est. Sessions |
|-------|-------|-------|-----------|---------------|
| Phase 0 | UI Foundation | 0A-0D | 🟡 Medium | 1 session |
| Phase 1 | Course Management | 1-3 | 🔴 High (95KB) | 3-4 sessions |
| Phase 2 | Booking Management | 4-5 | 🟡 Medium | 1-2 sessions |
| Phase 3 | Docs + Level + Reviews | 6-8 | � Medium | 1-2 sessions |
| Phase 4 | Profile Enhancement | 9 | � Low | 1 session |
| Phase 5 | Frontend Cleanup | 10-11 | 🟡 Medium | 1 session |
| **Total** | | **11 tasks** | | **8-11 sessions** |

> [!IMPORTANT]
> Phase 0 (UI Foundation) MUST be completed first — all subsequent pages depend on the `PageHeader` component and sidebar restructure.

> [!CAUTION]
> Phase 5 (Frontend Cleanup) should ONLY be executed after ALL migration phases are verified working. This ensures no mentor functionality is lost during the transition.
