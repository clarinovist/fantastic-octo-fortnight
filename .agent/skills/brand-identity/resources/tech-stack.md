# Preferred Tech Stack & Implementation Rules

When generating code or UI components for this brand, you **MUST** strictly adhere to the following technology choices.

## Core Stack
### Frontend
* **Framework:** Next.js 15+ (React 19), Vite (for Homepage)
* **Styling Engine:** Tailwind CSS 4 (Mandatory. Use `@import "tailwindcss"` pattern.)
* **Component Library:** shadcn/ui
* **Icons:** Lucide React
* **Key Fonts:** 
    - **Headings:** Gochi Hand (Frontend/Homepage), Geist Sans (Admin)
    - **Body:** Lato (Frontend/Homepage), Geist Sans (Admin)

### Backend
* **Language:** Go 1.24
* **Router:** Chi Router
* **ORM:** GORM
* **Architecture:** Clean Architecture

## Implementation Guidelines

### 1. Directory Structure
* `/homepage`: Vite + React static landing page. Uses unified design tokens in `src/index.css`.
* `/frontend`: Next.js Customer-facing application. Uses unified design tokens in `app/globals.css`.
* `/admin`: Next.js Admin dashboard. Uses unified design tokens in `app/globals.css`.
* `/backend`: Go API server.

### 2. Tailwind Usage
* Use utility classes directly in JSX.
* Utilize the color tokens defined in `design-tokens.json` (e.g., use `bg-primary text-primary-foreground`).
* **Main Brand Color:** `--color-main` (RGBA 112, 0, 254) or `bg-primary`.
* **Dark Mode:** Support dark mode using Tailwind's `dark:` variant.

### 3. Component Patterns
* **Buttons:** Primary actions must use the solid Primary color (`#7000FE`).
* **Forms:** Labels must always be placed *above* input fields. Use standard Tailwind spacing.
* **Layout:** Use Flexbox and CSS Grid.

### 4. Forbidden Patterns
* Do NOT use jQuery or Bootstrap.
* Do NOT create new CSS files; use Tailwind within components.
