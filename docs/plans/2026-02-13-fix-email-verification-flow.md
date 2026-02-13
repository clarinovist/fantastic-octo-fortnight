# Fix Email Verification Flow — Implementation Plan

**Goal:** Fix the broken email verification flow so tutors (and students) who register via email/password can verify their email and access the platform.

**Architecture:** The backend already has a working `POST /v1/auth/verify-email` endpoint and the frontend already has a `verifyEmail()` service function. The core issue is that the `/verify-email` page doesn't exist in the frontend, causing a 404 when users click the verification link. We need to create this page and harden the error handling around email dispatch.

**Tech Stack:** Next.js (frontend), Go (backend), Redis (token storage), gomail (SMTP)

---

## Task 1: Create `/verify-email` Page in Frontend

**Files:**
- Create: `frontend/app/(customer)/verify-email/page.tsx`

**Step 1: Define Page Component**

Create a client component that:
1. Reads the `?token=` query parameter from the URL.
2. Calls `verifyEmail(token)` from `frontend/services/auth.ts` (already exists).
3. Displays one of three states:
   - **Loading:** Spinner with "Verifying your email..." message.
   - **Success:** Checkmark animation, "Email verified!" message, auto-redirect to `/login` after 3 seconds.
   - **Error:** Error icon, user-friendly message (e.g., "Token expired or invalid"), link to request a new verification email.

**Step 2: Style the Page**

Use the same auth page pattern as `change-password/page.tsx`:
- Purple `bg-[#6372FF]` background
- `bg-illust.png` top/bottom decorative images
- Centered card with content
- Brand colors from `design-tokens.json`: primary `#7000FE`, font Lato

**Step 3: Error Handling (from error-handling-patterns skill)**

Apply graceful degradation pattern:
- Handle missing `?token` param → show "Invalid verification link" immediately, no API call.
- Handle network errors → show "Connection error. Please try again." with retry button.
- Handle expired/invalid token → show "This link has expired. Please request a new verification email." with link to `/signup`.
- Handle success → auto-redirect via `router.push('/login')` after 3 seconds.

**Step 4: Verification**

Run: `cd frontend && npm run dev`, then open `http://localhost:3001/verify-email?token=test-token`

Expected: Page loads with a loading spinner, then shows an error (because `test-token` is invalid). No 404.

---

## Task 2: Improve Backend Email Error Visibility

**Files:**
- Modify: `backend/internal/services/user.go`

**Step 1: Log Email Dispatch Errors Properly**

Currently in `Register()` (line 135-139):
```go
go func() {
    emailCtx := context.Background()
    _ = s.notification.RegisterUser(emailCtx, user, *role)
}()
```

Change to:
```go
go func() {
    emailCtx := context.Background()
    if err := s.notification.RegisterUser(emailCtx, user, *role); err != nil {
        logger.ErrorCtx(emailCtx).
            Err(err).
            Str("userID", user.ID.String()).
            Str("email", user.Email).
            Msg("failed to send registration verification email")
    }
}()
```

**Step 2: Verification**

Run: `cd backend && go build ./...`

Expected: No compilation errors. Email failures now logged with proper context.

---

## Task 3: Add Resend Verification Email Endpoint (Optional Enhancement)

> This is an optional enhancement. The core fix (Task 1 + Task 2) is sufficient for the flow to work.

**Files:**
- Create: `backend/internal/model/dto/user.go` → add `ResendVerificationRequest` DTO
- Modify: `backend/internal/services/user.go` → add `ResendVerification()` method
- Modify: `backend/internal/handlers/v1/user.go` → add `ResendVerification` handler
- Modify: `backend/internal/handlers/v1/api.go` → register `POST /v1/auth/resend-verification` route
- Modify: `frontend/services/auth.ts` → add `resendVerification()` function

**Step 1: Backend — DTO**

Add to `dto/user.go`:
```go
type ResendVerificationRequest struct {
    Email string `json:"email" form:"email"`
}
```

**Step 2: Backend — Service**

Add `ResendVerification()` to `UserService`:
1. Look up user by email.
2. If user already verified → return error "already verified".
3. Generate new verification token (reuse `generateVerificationToken`).
4. Send verification email.
5. Return success.

**Step 3: Backend — Handler & Route**

Register `POST /v1/auth/resend-verification` (no auth required).

**Step 4: Frontend — Service**

Add to `frontend/services/auth.ts`:
```typescript
export async function resendVerification(email: string): Promise<BaseResponse<null>> {
  return fetcherBase<null>('/v1/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}
```

**Step 5: Frontend — UI**

Add a "Resend verification email" button on the verify-email error page.

**Step 6: Verification**

Run: `cd backend && go build ./...`
Manual: Register a new user, click resend, check inbox.

---

## Summary

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| 🔴 P0 | Create `/verify-email` page | ~15 min | Unblocks all email-registered users |
| 🟡 P1 | Improve email error logging | ~5 min | Better debugging, prevents silent failures |
| 🟢 P2 | Resend verification endpoint | ~30 min | Better UX for expired tokens |
