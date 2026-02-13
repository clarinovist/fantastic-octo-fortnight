# Admin Course Module Cleanup — Implementation Plan

**Goal:** Eliminate redundancy, fix visual bugs, and establish a clean admin-appropriate course management experience.
**Architecture:** Consolidate two parallel form systems into one, remove dead code, fix detail view for admin context.
**Tech Stack:** Next.js (App Router), React Hook Form + Zod, shadcn/ui, Lucide Icons.

## Audit Summary

| Issue | Files Affected | Impact |
|-------|---------------|--------|
| **Unused `course-list.tsx`** (460 lines) | `components/course/course-list.tsx` | Dead code, zero imports |
| **Duplicate form systems** (~55K wizard + ~98K management) | `wizard-steps/*` vs `management/sections/*` | Same fields, different schemas |
| **Wizard stepper icons show raw text** ("edit_document") | `course-wizard.tsx` | Broken UI, visible in screenshot |
| **`/courses/[id]/edit` is a dead link** | `detail/detail-course-action.tsx` L123 | 404 when clicked |
| **Customer-facing detail view in admin** | `detail/detail-course.tsx` | Social media SVGs, booking UX, Indonesian labels |
| **Inline SVG icons** (~200 lines of raw SVGs) | `detail-course-action.tsx`, `detail-course.tsx` | Should use Lucide |

## Proposed Changes

### Phase 1: Quick Wins — Remove Dead Code & Fix Visual Bugs

#### [DELETE] [course-list.tsx](file:///Users/nugroho/Documents/lesprivate/admin/components/course/course-list.tsx)
- 460 lines of unused DataTable-based course list. Zero imports anywhere.

#### [MODIFY] [course-wizard.tsx](file:///Users/nugroho/Documents/lesprivate/admin/components/course/course-wizard.tsx)
- Replace Material Icon text references with Lucide React icons:
```diff
-{ id: 1, title: "Basic Info", icon: "edit_document" },
-{ id: 2, title: "Pricing", icon: "payments" },
-{ id: 3, title: "Schedule", icon: "calendar_month" },
-{ id: 4, title: "Review", icon: "check_circle" },
+{ id: 1, title: "Basic Info", icon: FileText },
+{ id: 2, title: "Pricing", icon: CreditCard },
+{ id: 3, title: "Schedule", icon: CalendarDays },
+{ id: 4, title: "Review", icon: CheckCircle },
```
- Fix the stepper rendering to use `<step.icon />` instead of `<span className="material-symbols-outlined">`.

---

### Phase 2: Fix Detail View for Admin Context

#### [MODIFY] [detail-course.tsx](file:///Users/nugroho/Documents/lesprivate/admin/components/course/detail/detail-course.tsx)
- Remove social media SVGs block (~80 lines, L338-L414).
- Replace inline SVGs in location/online sections with Lucide icons (`MapPin`, `Monitor`).
- Keep approve/reject flow (admin-specific functionality).

#### [MODIFY] [detail-course-action.tsx](file:///Users/nugroho/Documents/lesprivate/admin/components/course/detail/detail-course-action.tsx)
- Replace inline SVG icons with Lucide (`Check`, `X`, `Pencil`, `Circle`).
- Replace `getStatusColor`/`getStatusIcon` with reusable `StatusBadge` component (already exists in `shared/`).
- Remove dead `/courses/${id}/edit` link (route doesn't exist).

---

### Phase 3: Consolidate Form Systems (Larger Refactor)

> [!IMPORTANT]
> This phase is substantial and can be done incrementally. The wizard is used for **creation** and management is used for **editing**. We should unify them into one system that handles both modes.

#### Strategy
1. Keep `course-wizard.tsx` + `wizard-steps/` as the **primary** form system (it's cleaner).
2. Add an `initialData?: CourseDetail` prop to `CourseWizard` for edit mode.
3. Add the `transformDetailToFormData` function from `management-form.tsx` to `course-wizard.tsx`.
4. Create `/courses/[id]/edit/page.tsx` route that renders `CourseWizard` with pre-filled data.
5. Delete `management-form.tsx` + `management/` directory after migration.

#### [NEW] `app/(dashboard)/courses/[id]/edit/page.tsx`
- Server component that fetches course detail and renders `CourseWizard` in edit mode.

#### [MODIFY] [course-wizard.tsx](file:///Users/nugroho/Documents/lesprivate/admin/components/course/course-wizard.tsx)
- Add `initialData` prop and `isEditMode` flag.
- Reuse `transformDetailToFormData` from management-form.
- Update `onSubmit` to call `updateCourseAction` when in edit mode.

#### [DELETE] After verification:
- `management-form.tsx` (412 lines)
- `management/sections/basic-info.tsx` (244 lines)
- `management/sections/pricing.tsx` (545 lines)
- `management/sections/schedule.tsx` (39K)
- `management/sections/about.tsx` (10K)
- `management/form-schema.ts`
- `management/use-schedule.ts`

**Estimated reduction: ~1,300 lines of duplicated code.**

## Verification Plan

### Phase 1
1. `npm run build` in `admin/` — confirm no broken imports
2. Visual check: stepper icons render correctly on `/courses/create`

### Phase 2
1. Visual check: `/courses/[id]` detail page clean, no social media SVGs
2. Approve/reject flow still works

### Phase 3
1. `/courses/create` — create new course end-to-end
2. `/courses/[id]/edit` — edit existing course, verify data pre-fills
3. `npm run build` — no broken imports after deletion
