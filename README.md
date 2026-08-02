# RPMS — Rental Property Management System

Stage 2 of the full RPMS build: **Auth module** (login, signup, forgot/reset password, protected
routes) + the Property module from stage 1 (Supabase-backed CRUD, search, filter, pagination).

## 1. Install

```bash
npm install
```

## 2. Configure Supabase

1. In your Supabase project, open **SQL Editor → New query**, paste the contents of
   `supabase/schema.sql`, and run it. This creates all tables (Properties, Tenants,
   MeterReadings, Maintenance, Bills, Payments, Expenses, Settings, ActivityLogs), indexes, and
   Row Level Security policies (each signed-in user only sees their own rows).
2. Copy `.env.example` to `.env` and fill in your project's URL and anon key (Project Settings →
   API):

   ```bash
   cp .env.example .env
   ```
3. (Optional but recommended for testing) In Supabase → **Authentication → Providers → Email**,
   you can turn off "Confirm email" while developing, so new signups can log in immediately
   without clicking an email link.

## 3. Run locally

```bash
npm run dev
```

Visit the app — you'll land on **Sign In**. Click "Create one" to sign up, then log in. Once
signed in, everything you create in the Property module is automatically tied to your account via
Row Level Security — no more manual workarounds needed.

## 4. Deploy

See the in-chat instructions for either:
- **GitHub Actions** (`.github/workflows/deploy.yml`, auto-deploys on every push to `main`), or
- **Deploy from a branch** (`npm run deploy` via `gh-pages`, manual redeploy each time)

Either way, remember: Supabase credentials must be available at build time (GitHub secrets for
Actions, or your local `.env` for the branch method).

## What's implemented so far

- **Auth**: login, signup, forgot password (email link), reset password, logout, protected routes,
  shared `AuthContext` exposing the current user app-wide
- **Property module**: list (search/filter/pagination), add, edit, delete with confirmation
  dialog, React Hook Form + Zod validation, toast notifications, loading skeletons — now fully
  wired to the logged-in user
- Vite + React 18 + React Router scaffold, lazy-loaded routes, error boundary
- Bootstrap 5 admin layout (sidebar + header with user email + logout)
- Centralized service layer (`src/services/propertyService.js`)
- Full Supabase schema for **all** RPMS tables with RLS, ready for the next modules

## What's next

Tenant module → Meter Readings → Maintenance → Billing engine → Payments/Expenses → Dashboard
(KPIs + charts) → Reports/Export → Settings.
