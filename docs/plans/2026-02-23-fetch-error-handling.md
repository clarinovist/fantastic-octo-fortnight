# Fetch Error Handling Fix (Revised) Implementation Plan
**Goal:** Fix the `Fetch error ...: {}` console error in admin portal to show meaningful error messages.
**Architecture:** Replace `console.error(err)` with `console.error(JSON.stringify(err))` to avoid Next.js Turbopack's broken plain-object serialization. Also apply consistently across mentor and frontend services.
**Tech Stack:** Next.js 16, TypeScript

## Root Cause
The thrown error from `fetcher()` is a **plain JSON object** (from `res.json()` of the 401 response), not a native `Error`. Next.js Turbopack dev overlay serializes it as `{}`. The previous `instanceof Error` fix didn't work because the caught value is never an `Error` instance.

---

### Task 1: Fix admin/services/base.ts (Primary)
**Files:**
- Modify: `admin/services/base.ts`

**Step 1: Replace catch block error logging**
Replace lines 85-92 (the catch + logging) with:
```typescript
  } catch (error: unknown) {
    const errMessage = error instanceof Error
      ? error.message
      : JSON.stringify(error);
    console.error(`Fetch error ${url}:`, errMessage);

    const err = error instanceof Error
      ? { statusCode: 500, message: error.message, error: error.name }
      : error as { statusCode?: number; message?: string; metadata?: unknown; error?: unknown; code?: number };
```

**Step 2: Verification**
Run: `npm run dev` in admin, open `/tutors`.
Expected: Console shows `Fetch error ...: {"statusCode":401,...}` instead of `{}`.

---

### Task 2: Fix mentor/services/base.ts
**Files:**
- Modify: `mentor/services/base.ts`

**Step 1: Apply same pattern**
Apply the same catch block fix.

---

### Task 3: Fix frontend/services/base.ts
**Files:**
- Modify: `frontend/services/base.ts`

**Step 1: Apply same pattern**
Apply the same catch block fix.
