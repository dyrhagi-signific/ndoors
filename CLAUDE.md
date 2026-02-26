# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4, React 19)
- **Supabase** — Postgres + Auth (Google OAuth + email magic links)
- **Resend** — transactional email (`no-reply@mail.ndoors.se`)
- **nanoid** — generating tokens
- **Vercel** — hosting target

## Key conventions

**Supabase clients — use the right one:**
- `src/lib/supabase/client.ts` — browser only (`createBrowserClient`)
- `src/lib/supabase/server.ts` — async server client: `const supabase = await createClient()`
- `src/lib/supabase/admin.ts` — service role, bypasses RLS — server components and actions only, never client components

**RLS is enabled but policies are minimal.** All dashboard/data queries use `supabaseAdmin` to bypass RLS. Only auth checks use the server client.

**Server Actions + Next.js redirect:** `redirect()` throws a special error with `digest` starting with `NEXT_REDIRECT`. Client component catch blocks must re-throw it:
```ts
} catch (err: unknown) {
  const digest = (err as { digest?: string })?.digest ?? ''
  if (digest.startsWith('NEXT_REDIRECT')) throw err
  // handle real errors...
}
```

**Brand colours:** accent `#2d5a3d`, accent2 `#c8763a`, bg `#f7f5f0`, border `#e2ddd6`

## Architecture

All mutations are **Server Actions** (`src/lib/actions/`). Pages are **Server Components** that fetch data directly; only interactive forms are Client Components.

### Auth flow
1. `/login` → Google OAuth or email magic link → `/auth/callback` exchanges code for session
2. Callback checks for `public.users` profile row — if missing, redirects to `/onboarding`
3. Onboarding upserts company + user profile → `/dashboard`
4. Middleware (`src/middleware.ts`) protects `/dashboard`; public paths include `/onboarding`, `/ref`, `/confirm`

### URL structure
| Path | Auth | Purpose |
|---|---|---|
| `/login` | Public | Google + magic link sign-in |
| `/onboarding` | Authenticated (no profile) | First-login profile setup |
| `/dashboard` | Recruiter | Jobs list + referent statuses |
| `/dashboard/jobs/new` | Recruiter | Create job, copy invite link |
| `/ref/[invite_token]` | None | Applicant submits referent contacts |
| `/ref/status/[applicant_token]` | None | Applicant tracks referent responses |
| `/confirm/[confirm_token]` | None | Referent confirms or declines |

### Database schema

| Table | Key columns |
|---|---|
| `users` | id (FK auth.users), role, first_name, last_name, email, company_id, job_title |
| `companies` | id, name, org_number |
| `jobs` | id, recruiter_id, company_id, title, invite_token (unique), is_active |
| `reference_requests` | id, job_id, applicant_name, applicant_email, applicant_token; UNIQUE(job_id, applicant_email) |
| `referents` | id, reference_request_id, first_name, last_name, email, relationship, status (created\|sent\|confirmed\|declined), confirm_token, revoke_token, confirmed_at |

Tokens: `invite_token` = `nanoid(12)`, `confirm_token`/`revoke_token`/`applicant_token` = `nanoid(16)`

### Resubmission handling
`reference_requests` upserts on `(job_id, applicant_email)` conflict. Old referent rows are deleted before re-inserting so a resubmit replaces the previous referents cleanly.

## Env vars

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server only
RESEND_API_KEY=                   # server only
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
