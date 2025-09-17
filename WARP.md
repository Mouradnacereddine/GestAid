# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project summary
- Frontend: Vite + React + TypeScript + shadcn-ui, TanStack Query, React Router
- Backend: Supabase (database, auth) with Edge Functions (Deno) under supabase/functions
- Dev server: configured to run on port 8080 (vite.config.ts)
- Import alias: "@" -> ./src (vite.config.ts, tsconfig.json)

Commands
- Install dependencies
  - npm install
- Run dev server (Vite on port 8080)
  - npm run dev
- Build production bundle
  - npm run build
- Preview built bundle
  - npm run preview
- Lint
  - npm run lint
  - To auto-fix: npx eslint . --fix
- Type-check (no emit)
  - npx tsc --noEmit
- Tests
  - No test runner is configured in this repository at the moment.

Environment
- Frontend expects Vite env vars
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
- Recommended: create .env.local in the repo root for Vite, for example:
  - VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
  - VITE_SUPABASE_ANON_KEY={{VITE_SUPABASE_ANON_KEY}}
- Windows/Powershell (for a one-off session):
  - $env:VITE_SUPABASE_URL = "https://<your-project-ref>.supabase.co"
  - $env:VITE_SUPABASE_ANON_KEY = "{{VITE_SUPABASE_ANON_KEY}}"

Supabase (local and functions)
- Requires the Supabase CLI
- Start local stack (auth, db, REST, etc.)
  - supabase start
- Apply local migrations from supabase/migrations
  - supabase db reset
- Create a new migration
  - supabase migration new <name>
- Serve Edge Functions locally (examples)
  - supabase functions serve approve-admin-request
  - supabase functions serve approve-volunteer-request
  - supabase functions serve send-email
- Invoke a function locally with sample payload
  - supabase functions invoke approve-admin-request --local --data '{"request_id":"<id>"}'
  - supabase functions invoke approve-volunteer-request --local --data '{"request_id":"<id>"}'
- Deploy a function (replace with your project ref when needed)
  - supabase functions deploy approve-admin-request --project-ref mkqddyjdtpxscubgeoal
  - supabase functions deploy approve-volunteer-request --project-ref mkqddyjdtpxscubgeoal
  - supabase functions deploy send-email --project-ref mkqddyjdtpxscubgeoal

High-level architecture
- Entry and composition
  - src/main.tsx creates the React root and renders App
  - src/App.tsx sets global providers and routing:
    - QueryClientProvider (TanStack Query) with retry and window focus options
    - TooltipProvider (UI)
    - BrowserRouter (routing)
    - AuthProvider (custom auth/profile context)
    - CurrencyProvider (UI/formatting context)
- Routing and access control
  - Public routes: /auth, /update-password
  - All app pages sit under a layout (AppLayout) and are guarded by ProtectedRoute
  - src/components/ProtectedRoute.tsx
    - Redirects unauthenticated users to /auth
    - Optionally enforces allowedRoles per-route ("superadmin", "admin", "benevole")
- Authentication and profile model
  - src/hooks/useAuth.tsx integrates Supabase Auth
    - Tracks the current Session via supabase.auth.onAuthStateChange and getSession
    - Uses TanStack Query to load the current user profile from the profiles table
    - Exposes signIn, signUp, signOut via Supabase auth APIs and invalidates/clears queries appropriately
  - src/App.tsx listens for special auth states to redirect (e.g., PASSWORD_RECOVERY, first invite sign-in -> /update-password)
- Data access, typing, and organization
  - src/integrations/supabase/client.ts creates a typed Supabase client using VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and Database types from src/types/database.types.ts
  - The app’s data flows through domain-specific hooks in src/hooks (e.g., useDonors, useLoans, useBeneficiaries, etc.), consumed by feature components/pages
  - UI components largely come from shadcn-ui under src/components/ui and are composed into feature-level components under src/components and pages under src/pages
- Supabase Edge Functions (Deno)
  - supabase/functions/approve-admin-request/index.ts
    - Approves an admin signup request: invites or promotes a user, ensures agency exists, upserts profile, and marks request approved
    - Uses service role key within Supabase functions environment; verify_jwt is enabled (see supabase/config.toml)
  - supabase/functions/approve-volunteer-request/index.ts
    - Approves a volunteer signup request restricted to the admin’s agency, invites/promotes user, upserts profile, updates request, and invokes send-email
  - supabase/functions/send-email/index.ts
    - Stub that simulates sending an email; replace with your provider (SMTP/SendGrid/etc.) when ready
  - Common CORS headers in supabase/functions/_shared/cors.ts
- Database migrations and SQL
  - supabase/migrations contains schema and security/RLS updates and custom SQL (e.g., functions like get_user_id_by_email)

Notes from README
- Requires Node.js >= 18 and npm >= 9
- Install: npm install
- Run: npm run dev (note: vite.config.ts sets port 8080)

Conventions and tips
- Use the "@" alias for imports from src/ (e.g., import { useAuth } from "@/hooks/useAuth")
- The Vite dev server binds to host "::" and port 8080 (vite.config.ts) so it’s reachable on the LAN if your OS/network allows
