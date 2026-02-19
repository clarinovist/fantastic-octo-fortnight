# Troubleshooting & Development Guide

This document maintains a list of known issues, their fixes, and development patterns used in the **Lesprivate** project. Please refer to this before starting new tasks or debugging similar issues.

## 1. Authentication & Middleware (Admin)

### Issue: 401 Unauthorized loops or "proxy is missing expected function export name"
**Context:** Next.js in this project environment prefers `proxy.ts` over `middleware.ts` for edge middleware logic.

**Solution:**
- **Filename:** Use `admin/proxy.ts` instead of `admin/middleware.ts`.
- **Export:** You MUST use a **default export** for the function.
  ```typescript
  // ✅ Correct
  export default function proxy(request: NextRequest) { ... }

  // ❌ Incorrect
  export function proxy(request: NextRequest) { ... }
  ```
- **Redirect Logic:** Ensure the proxy handles redirects for both unauthenticated users (to `/login`) and authenticated users visiting public pages (to `/dashboard`).

### Issue: 401 Error on Logout
**Symptoms:** Console errors showing 401 unauthorized requests to dashboard APIs immediately after clicking logout.
**Cause:** The logout Server Action (`logoutAction`) deleted cookies but relied on the client to redirect. React Server Components (RSC) would attempt to re-render the protected page before the client-side redirect occurred.
**Fix:** Always include a `redirect()` call within the Server Action itself.
```typescript
// admin/actions/auth.ts
export async function logoutAction() {
  const cookiesStore = await cookies()
  cookiesStore.delete(TOKEN_KEY)
  cookiesStore.delete(ID_TOKEN)
  redirect("/login") // <--- Critical
}
```

### Issue: API Client sending "Bearer " with empty token
**Symptoms:** Backend logs showing "invalid authorization header format" or 401 errors.
**Cause:** The `fetcherBase` utility was sending `authorization: Bearer ` when no token was present.
**Fix:** Conditionally add the header in `admin/services/base.ts`.
```typescript
...(cookiesStore.get(TOKEN_KEY)?.value
  ? { authorization: `Bearer ${cookiesStore.get(TOKEN_KEY)?.value}` }
  : {}),
```

---

## 2. Google Maps Integration

### Issue: "google api is already presented"
**Symptoms:** Error occurs when logging out and logging back in without a page refresh.
**Cause:** The `LoadScript` component from `@react-google-maps/api` attempts to inject the `<script>` tag every time it mounts. If the script is already in the DOM (from a previous session), it throws an error.
**Fix:** Use the `useJsApiLoader` hook instead.
- **File:** `admin/contexts/google-maps.tsx`
- **Directive:** Must use `"use client";` at the top of the file.
```typescript
"use client";
import { useJsApiLoader } from "@react-google-maps/api";

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}
```

---

## 3. Local Development Setup

### Service Startup
- Use `./start-dev.sh` to start all services (Backend, Admin, Frontend, Homepage, MySQL, Redis).
- **Backend:** Starts on port `8080`.
- **Admin:** Starts on port `3000`.
- **Frontend:** Starts on port `3001`.
- **Homepage:** Starts on port `5173`.

### Database & Seeding
- **Seed Admin User:** Run `seed_admin.sql` to create the initial super admin.
  - Email: `admin@lesprivate.my.id`
  - Password: `password`
