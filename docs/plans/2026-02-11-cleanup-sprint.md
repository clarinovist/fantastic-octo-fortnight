# Clean-up Sprint Implementation Plan

**Goal:** Fix all lint errors, standardize header design across all mentor pages, and replace/label hardcoded data in Finance sidebar.
**Architecture:** Frontend-only changes across ~15 files. No backend changes. Follows existing shadcn/ui patterns and Next.js app router conventions.
**Tech Stack:** Next.js 15, TypeScript, shadcn/ui, lucide-react, Tailwind CSS, SWR.

---

## Task 1: Fix `any` Types — Service Layer (auth.ts)

**Files:**
- Modify: `mentor/services/auth.ts`

**Step 1: Define proper types for updateProfile and changePassword**

Replace `any` with concrete types:

```typescript
// Add above `updateProfile`
interface UpdateProfilePayload {
    name?: string;
    phoneNumber?: string;
    address?: string;
}

interface ChangePasswordPayload {
    oldPassword: string;
    newPassword: string;
}

export async function updateProfile(body: UpdateProfilePayload): Promise<BaseResponse<User>> {
    return fetcherBase<User>('/v1/profile', {
        method: 'PUT',
        body: JSON.stringify(body),
    });
}

export async function changePassword(body: ChangePasswordPayload): Promise<BaseResponse<null>> {
    return fetcherBase<null>('/v1/auth/password', {
        method: 'PUT',
        body: JSON.stringify(body),
    });
}
```

**Step 2: Verification**
Run: `npx tsc --noEmit` — should pass with no type errors in `auth.ts`.

---

## Task 2: Fix `any` Types — Utility Files (csv-export.ts, hooks.ts)

**Files:**
- Modify: `mentor/utils/csv-export.ts`
- Modify: `mentor/utils/hooks.ts`

**Step 1: csv-export.ts — Replace `Record<string, any>`**

```diff
-export function exportToCSV<T extends Record<string, any>>(
+export function exportToCSV<T extends Record<string, unknown>>(
```

**Step 2: hooks.ts — Replace `any[]` and fix useEffect dependency warning**

```typescript
import { useEffect, useRef } from 'react';

export function useDebounce(callback: () => void, delay: number, dependencies: unknown[]) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callback();
        }, delay);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencies, delay]);
}
```

**Step 3: Verification**
Run: `npx tsc --noEmit`

---

## Task 3: Fix `any` Types — Actions & Components

**Files:**
- Modify: `mentor/actions/mentor.ts`
- Modify: `mentor/components/sessions/create-session-dialog.tsx`
- Modify: `mentor/app/(mentor)/profile/page.tsx`
- Modify: `mentor/app/(mentor)/withdrawals/page.tsx`
- Modify: `mentor/app/(mentor)/finance/page.tsx`

**Step 1: actions/mentor.ts — Fix catch + remove unused `toast`**

```diff
-import { toast } from "sonner";

-    } catch (err: any) {
-        return { success: false, error: err.message || "Terjadi kesalahan sistem" };
+    } catch (err: unknown) {
+        const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem";
+        return { success: false, error: message };
```

**Step 2: create-session-dialog.tsx — Suppress `zodResolver as any`**

The `zodResolver` cast is a known incompatibility between `react-hook-form` and `zod`. Suppress with inline comment:

```diff
-        resolver: zodResolver(formSchema) as any,
+        // eslint-disable-next-line @typescript-eslint/no-explicit-any
+        resolver: zodResolver(formSchema) as any,
```

**Step 3: page components — Replace `catch (err: any)` pattern**

In `profile/page.tsx`, `withdrawals/page.tsx`, `finance/page.tsx`:

```diff
-        } catch (err: any) {
-            toast.error(err.message || "Terjadi kesalahan");
+        } catch (err: unknown) {
+            toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
```

Apply to all `catch` blocks in these files.

**Step 4: Verification**
Run: `npx tsc --noEmit`

---

## Task 4: Fix Unescaped Entities (search/page.tsx, finance/page.tsx)

**Files:**
- Modify: `mentor/app/(mentor)/search/page.tsx`
- Modify: `mentor/app/(mentor)/finance/page.tsx`

**Step 1: search/page.tsx — Escape curly quotes around `{query}`**

Line 58 and 76: Replace `"` with `&quot;` or use `{'"'}`:

```diff
-                    Hasil Pencarian: "{query}"
+                    Hasil Pencarian: &quot;{query}&quot;

-                Kami tidak dapat menemukan hasil untuk "{query}". Coba kata kunci
+                Kami tidak dapat menemukan hasil untuk &quot;{query}&quot;. Coba kata kunci
```

**Step 2: finance/page.tsx — Escape quotes**

Line 373: Replace `"Matematika Dasar"` with `&quot;Matematika Dasar&quot;`.

**Step 3: Verification**
Run: `npm run lint -- --quiet` (errors only, no warnings)

---

## Task 5: Remove Unused Imports (~12 files)

**Files:**
- Modify: `mentor/app/(mentor)/dashboard/page.tsx` — remove `MoreVertical`, `Bell`, `Search`
- Modify: `mentor/app/(mentor)/students/page.tsx` — remove `Filter`, `Mail` (if unused)
- Modify: `mentor/app/(mentor)/finance/page.tsx` — remove `Filter`, `Home` (check usage), `ArrowDownRight`
- Modify: `mentor/components/mentor/global-search.tsx` — remove unused
- Modify: `mentor/components/mentor/filter-dropdown.tsx` — remove unused
- Modify: `mentor/components/mentor/notification-dropdown.tsx` — remove unused
- Modify: `mentor/components/sessions/session-detail-dialog.tsx` — remove unused
- Modify: `mentor/components/students/student-actions.tsx` — remove unused

**Step 1: Run lint to get exact list**

Run: `npm run lint 2>&1 | grep "is defined but never used"`

**Step 2: Remove each unused import one file at a time**

For each file, remove the listed unused import. Example for `dashboard/page.tsx`:

```diff
 import {
     Users,
     Wallet,
     TrendingUp,
     Clock,
     ArrowUpRight,
     ChevronRight,
     BookOpen,
     Calendar,
-    MoreVertical,
-    Bell,
-    Search,
     Loader2,
 } from "lucide-react";
```

**Step 3: Verification**
Run: `npm run lint` — should have 0 errors, 0 warnings.

---

## Task 6: Standardize Page Headers

**Files:**
- Modify: `mentor/app/(mentor)/sessions/page.tsx`
- Modify: `mentor/app/(mentor)/students/page.tsx`
- Modify: `mentor/app/(mentor)/messages/page.tsx`
- Modify: `mentor/app/(mentor)/search/page.tsx`

**Step 1: Create consistent header pattern**

All pages already have breadcrumb-style or title headers. Standardize to this pattern (matching Finance/Withdrawals/Profile):

```tsx
<header className="h-16 bg-background border-b flex items-center justify-between px-8 flex-shrink-0">
    <nav aria-label="Breadcrumb" className="flex">
        <ol className="flex items-center space-x-2">
            <li>
                <a href="/dashboard" className="text-muted-foreground hover:text-foreground">
                    <Home className="h-5 w-5" />
                </a>
            </li>
            <li><span className="text-muted-foreground">/</span></li>
            <li><span className="text-sm font-medium">[Page Title]</span></li>
        </ol>
    </nav>
    <div className="flex items-center gap-4">
        <NotificationDropdown />
    </div>
</header>
```

Replace existing raw `Bell` buttons with `<NotificationDropdown />` on Finance, Withdrawals, Profile, Sessions, Students.

**Step 2: Messages page — Fix height**

Change `h-14` → `h-16` and add breadcrumb.

**Step 3: Dashboard — Keep unique gradient title but replace raw icons**

Dashboard header already uses `GlobalSearch` + `NotificationDropdown` — this is the most complete. Keep as-is.

**Step 4: Verification**

Run: `npm run dev` — visually verify all page headers are consistent.

---

## Task 7: Replace/Label Hardcoded Data on Finance Page

**Files:**
- Modify: `mentor/app/(mentor)/finance/page.tsx`

**Step 1: Balance card growth badge — derive from real data**

Replace hardcoded `+12.5%` on line 133 with `stats?.income_change_pct`:

```diff
-                                    <span className="flex items-center bg-white/20 px-2 py-1 rounded-full">
-                                        <ArrowUpRight className="h-3 w-3 mr-1" />
-                                        +12.5%
-                                    </span>
+                                    <span className="flex items-center bg-white/20 px-2 py-1 rounded-full">
+                                        <ArrowUpRight className="h-3 w-3 mr-1" />
+                                        {stats?.income_change_pct ? `+${stats.income_change_pct}%` : "—"}
+                                    </span>
```

**Step 2: "Detail Pendapatan" sidebar — use real stats**

Replace the hardcoded sidebar with values derived from `stats`:

```diff
-                                        <span className="font-bold">Rp 16.500.000</span>
+                                        <span className="font-bold">{formatCurrency(stats?.gross_income_30d || "0")}</span>
```

If these fields don't exist in the backend response yet, add a subtle `(Estimasi)` label:

```tsx
<CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
    Detail Pendapatan <span className="text-[10px] text-amber-500 ml-1">(Estimasi)</span>
</CardTitle>
```

**Step 3: "Insight Keuangan" card — label as insight**

Add a note or keep but mark as simulated:

```diff
-                                        <p className="text-sm text-slate-400 leading-relaxed mb-6">
-                                            Pendapatan Anda meningkat sebesar <span className="text-white font-medium">15%</span> dibandingkan bulan lalu. Kursus "Matematika Dasar" memberikan kontribusi terbesar.
+                                        <p className="text-sm text-slate-400 leading-relaxed mb-6">
+                                            {stats?.income_change_pct && stats.income_change_pct > 0
+                                                ? <>Pendapatan Anda meningkat sebesar <span className="text-white font-medium">{stats.income_change_pct}%</span> dibandingkan bulan lalu.</>
+                                                : <>Lihat tren pendapatan Anda dan optimalkan jadwal mengajar.</>
+                                            }
```

**Step 4: Verification**

Run: `npm run dev` — finance page should display real or clearly labeled data.

---

## Verification Plan

### Automated Tests
1. `npx tsc --noEmit` — no TypeScript errors
2. `npm run lint` — 0 errors, 0 warnings
3. `npm run build` — successful build

### Manual Verification
1. Open each page — verify headers are visually consistent
2. Finance page — verify no hardcoded numbers visible
3. All pages — verify no visual regressions
