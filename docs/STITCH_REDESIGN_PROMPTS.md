# Stitch Redesign Prompts for Lesprivate Admin

This document contains a set of prompts you can use with **Stitch** to redesign the Lesprivate Admin Dashboard.

## 🌟 1. System Prompt (Set the Baseline)

**Copy and paste this first to set the context and design system for the entire session.**

```markdown
You are an expert UI/UX Engineer specializing in building modern, high-quality SaaS Admin Dashboards.
We are redesigning the "Lesprivate" Admin Dashboard.

**Tech Stack:**
- Framework: Next.js 14+ (App Router)
- Styling: Tailwind CSS
- UI Library: Shadcn UI (Radix Primitives)
- Icons: Lucide React
- Charts: Recharts
- Forms: React Hook Form + Zod
- Tables: TanStack Table

**Design Philosophy ("Modern SaaS" meets "Lesprivate Brand"):**
- **Brand Identity:**
  - **Primary Color:** Deep Purple/Indigo (Reference: `rgba(112, 0, 254, 1)` or OKLCH `0.205 0 0`). Use this for primary buttons, active states, and key highlights.
  - **Fonts:** Keep the Admin professional with **Inter** or **Geist** for UI text, but you may use **Lato** for headings to align with the homepage. Avoid "Gochi Hand" (handwritten) for data tables, but it can be used sparingly for empty states or "fun" accents.
  - **Radius:** Rounded corners (approx `0.625rem` or `rounded-xl`) to match the soft, friendly vibe of the homepage.
- **Visual Style:**
  - **Clean & Airy:** Generous whitespace.
  - **Card-Based:** Use cards with soft borders (`border-border`) and very subtle shadows.
  - **Glassmorphism:** Use `bg-white/50 backdrop-blur` for sticky headers to give a modern feel.
- **Color Palette (Tailwind approximation):**
  - Primary: `violet-600` or `indigo-600`.
  - Surface: `zinc-50` (Light) / `zinc-950` (Dark).
  - Borders: `zinc-200` (Light) / `zinc-800` (Dark).
```

---

## 📄 2. Page-Specific Prompts

Use these prompts to generate specific pages. You can customize them further based on your specific needs.

### A. Login Page (`/admin/login`)
```markdown
Create a modern, elegant **Login Page** for the admin portal.
- **Layout:** Split screen. Left side is a high-quality abstract image or branding element with a testimonial/quote. Right side is the login form.
- **Form:**
  - "Email" and "Password" fields.
  - "Remember me" checkbox.
  - "Forgot password?" link.
  - "Sign In" button (Primary, full width).
- **Validation:** Use Zod schema for email format and required password.
- **Style:** Minimalist, centered on the right panel.
```

### B. App Layout / Sidebar (`layout.tsx`)
```markdown
Create the **Main Layout** with a collapsible Sidebar using Shadcn's `Sidebar` component.
- **Sidebar:**
  - **Header:** Lesprivate Logo (Text + Icon).
  - **Navigation Groups:**
    - *Overview:* Dashboard
    - *Management:* Tutors, Students, Courses
    - *Operations:* Bookings
    - *Settings:* Premium Settings (Subscriptions)
  - **Footer:** User profile dropdown (Avatar, Name, Email) with "Logout" option.
- **Header:** Top bar with Breadcrumbs, Global Search, and Theme Toggle.
```

### C. Dashboard Overview (`/admin/dashboard`)
```markdown
Create a comprehensive **Dashboard Overview** page.
- **KPI Cards (Top Row):** 4 Cards showing Total Revenue, Active Tutors, Active Students, and Total Bookings. Include a percentage change indicator (e.g., "+12% from last month") and a small sparkline chart.
- **Main Chart:** A large Area Chart showing "Revenue vs. Bookings" over time (last 30 days).
- **Recent Activity:** A list/feed of recent actions (e.g., "New Student Registered", "Booking Confirmed").
- **Bar Chart:** A smaller bar chart showing "Top Course Categories".
```

### D. Tutors List (`/admin/tutors`)
```markdown
Create a **Tutors Management** page with a sophisticated data table.
- **Header:** Title "Tutors", Description, and an "Add Tutor" button (links to `/admin/tutors/form`).
- **Filters:** Search bar (by name/email), Status Filter (Active/Inactive), Subject Filter.
- **Table Columns:**
  - **Tutor:** Avatar + Name + Email (stacked).
  - **Status:** Badge (Green for Active, Gray for Pending).
  - **Subjects:** A list of pill badges (limit to 2, show "+X more").
  - **Joined Date:** Formatted date.
  - **Actions:** Dropdown menu (View Profile, Edit, Suspend).
- **Pagination:** Standard Previous/Next + Page numbers.
```

### E. Students List (`/admin/students`)
```markdown
Create a **Students Management** page similar to the Tutors page but tailored for students.
- **Table Columns:**
  - **Student:** Avatar + Name + Email.
  - **Status:** Active/Inactive Badge.
  - **School/Grade:** Text.
  - **Total Bookings:** Number.
  - **Last Active:** Relative time (e.g., "2 hours ago").
  - **Actions:** View Details, Edit (links to `/admin/students/form`).
```

### F. Courses Management (`/admin/courses`)
```markdown
Create a **Courses Management** page.
- **Layout:** Use a Grid of Cards architecture instead of a table.
- **Course Card:**
  - Thumbnail image.
  - Title and Category badge.
  - Stats: Number of Tutors, Number of Students enrolled.
  - Status toggle (Active/Draft).
  - "Edit" button.
- **Header:** "Create Course" button (links to `/admin/courses/create`).
```

### G. Bookings / Work Orders (`/admin/bookings`)
```markdown
Create a **Bookings Operations** page.
- **View Options:** Toggle between "List View" (Table) and "Kanban View" (Board).
- **Kanban Columns:** Pending, Confirmed, In Progress, Completed, Cancelled.
- **Booking Card (Kanban):**
  - Student Name & Tutor Name.
  - Subject/Course Title.
  - Date & Time.
  - Status Badge.
```

### H. Premium/Subscription Settings (`/admin/subscriptions`)
```markdown
Create a **Subscription Settings** page.
- **Layout:** A settings form layout.
- **Pricing Plans:** A section to configure base rates for Tutors/Students.
- **Feature Toggles:** Switches to enable/disable specific premium features.
- **Payment History:** A sub-section showing recent platform transaction logs.
```

---

## 📝 3. Form & Create Page Prompts (NEW)

### I. Create/Edit Tutor Form (`/admin/tutors/form`)
```markdown
Create a high-quality **Tutor Registration Form**.
- **Layout:** Two-column grid layout for form fields, with a section header for each group.
- **Sections:**
  - **Account:** Name, Email, Password (optional in edit), Phone Number.
  - **Personal:** Gender (Radio), Date of Birth (DatePicker), Profile Photo (File Upload).
  - **Professional:** Tutor Level (Select: Guru Aktif/Favorit).
  - **Location:** A map interface to select the tutor's teaching area or home base (Latitude/Longitude).
  - **Social Media:** Dynamic list of social media links (Platform & URL).
- **Actions:** "Cancel" (Ghost button) and "Save Tutor" (Primary button) at the bottom right.
```

### J. Create/Edit Student Form (`/admin/students/form`)
```markdown
Create a **Student Registration Form**.
- **Layout:** Single column, centered, max-width 2xl for focus.
- **Fields:**
  - **Account:** Name, Email, Password (optional in edit), Phone Number.
  - **Personal:** Gender (Radio), Date of Birth (DatePicker), Profile Photo (File Upload).
  - **Location:** A map interface to select the student's home address (Latitude/Longitude).
  - **Social Media:** Dynamic list of social media links.
  - **Premium:** Premium Valid Until (DatePicker, optional).
- **Style:** Clean, grouped card layout.
```

### K. Create Course Wizard (`/admin/courses/create`)
```markdown
Create a **Course Creation Wizard** with a stepper.
- **Stepper Header:** Steps: 1. Basic Info, 2. Pricing & Plans, 3. Schedule, 4. Review.
- **Step 1 (Basic Info):**
  - **Core:** Title, Description (Rich Text).
  - **Classification:** Course Function/Category (Select), Sub-Categories (Multi-select), Education Level (Multi-select).
  - **Tutor:** Select Tutor (Searchable).
- **Step 2 (Pricing & Plans):**
  - **Class Type:** Online / Offline / Hybrid.
  - **Pricing Tiers:** Dynamic list of Price Packages (Duration in Hours vs Price).
  - **Options:** "Free First Course" trial toggle.
- **Step 3 (Schedule):**
  - **Availability:** Weekly schedule selector (Days of Week -> Time Slots).
- **Step 4 (Review):**
  - Summary of all entered data.
  - "Publish Course" button.
```

### L. Create/Edit Booking Form (`/admin/bookings/form`)
```markdown
Create a **Booking / Work Order Form**.
- **Layout:** Two-column grid.
- **Sections:**
  - **Participants:** Student & Tutor (Searchable Comboboxes).
  - **Session:** Course Title (Select/Input), Date Picker, Time Input.
  - **Status:** Dropdown (Pending, Confirmed, Cancelled, Completed).
  - **Notes:** Student Notes (Optional), Tutor Notes (Optional).
- **Actions:** "Cancel" and "Save Booking".
```
