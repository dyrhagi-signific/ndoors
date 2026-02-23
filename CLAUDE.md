# Ndoors — Claude Code Context

Ndoors is a reference management app for hiring. Recruiters create job invite links, applicants add their referents, referents confirm via email. Swedish market — GDPR applies.

## Stack
- **Next.js** (App Router, TypeScript, Tailwind CSS v4)
- **Supabase** — Postgres + Auth (Google OAuth + email magic links)
- **Resend** — transactional email
- **nanoid** — generating invite/confirm tokens
- **Vercel** — hosting target

## Key conventions
- Use `@supabase/ssr` (`createBrowserClient` / `createServerClient`) — never the bare `createClient` from `@supabase/supabase-js` for auth-aware queries
- Server client is async: `const supabase = await createClient()`
- **Never** import `src/lib/supabase/admin.ts` in client components — service role key is server-only
- Tokens (invite, confirm) generated with `nanoid()`
- Brand colours: accent `#2d5a3d`, accent2 `#c8763a`, bg `#f7f5f0`, border `#e2ddd6`

## Project structure
```
src/
├── app/
│   ├── (auth)/login/page.tsx       # Login UI (Google + magic link)
│   ├── auth/callback/route.ts      # OAuth + magic link code exchange
│   ├── auth/verify/page.tsx        # "Check your inbox" screen
│   ├── dashboard/                  # Recruiter dashboard (TODO)
│   ├── ref/[invite_token]/         # Applicant landing page (TODO)
│   └── confirm/[confirm_token]/    # Referent confirmation page (TODO)
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client (createBrowserClient)
│   │   ├── server.ts               # Server client with cookies (async)
│   │   └── admin.ts                # Service role client — server only
│   ├── auth.ts                     # signInWithGoogle, signInWithEmail, signOut
│   └── email/
│       └── send.ts                 # sendReferentInvite, sendRecruiterNotification
├── middleware.ts                   # Session refresh + route protection
└── types/
    └── database.ts                 # TypeScript types for all DB tables
```

## Database schema (5 tables)
| Table | Key columns |
|---|---|
| `users` | id (FK auth.users), role (recruiter\|applicant\|referent), first_name, last_name, email, company_id, job_title |
| `companies` | id, name, org_number |
| `jobs` | id, recruiter_id, company_id, title, invite_token (unique), is_active |
| `reference_requests` | id, job_id, applicant_name, applicant_email |
| `referents` | id, reference_request_id, first_name, last_name, email, relationship, status (created\|sent\|confirmed\|declined), confirm_token, confirmed_at |

## Auth flow
1. User clicks Google or submits email on `/login`
2. Supabase redirects to `/auth/callback?code=...` (OAuth) or `?token_hash=...&type=email` (magic link)
3. Route handler exchanges code → session → redirect to `/dashboard`
4. Middleware protects all routes under `/dashboard`; redirects authed users away from `/login`

## URL structure
| Path | Who | Purpose |
|---|---|---|
| `/` | Everyone | Landing page |
| `/login` | Everyone | Sign in (Google + magic link) |
| `/dashboard` | Recruiter | Jobs + reference status overview |
| `/dashboard/jobs/new` | Recruiter | Create job, get invite link |
| `/ref/[invite_token]` | Applicant | Add referents (no login required) |
| `/confirm/[confirm_token]` | Referent | Confirm or decline |

## What's built
- [x] Supabase SSR client helpers (browser / server / admin)
- [x] TypeScript DB types (`src/types/database.ts`)
- [x] Auth — Google OAuth + email magic link
- [x] Auth callback route handler
- [x] Middleware — session refresh + route protection
- [x] Login page UI
- [x] Email helpers (Resend)

## What's next
- [ ] `/dashboard` — recruiter overview (jobs list + referent statuses)
- [ ] `/dashboard/jobs/new` — create job, generate + copy invite link
- [ ] `/ref/[invite_token]` — applicant flow (no auth, submit referent contacts)
- [ ] `/confirm/[confirm_token]` — referent confirm/decline page
- [ ] Profile/onboarding step for new users after first login
- [ ] RLS policies enabled in Supabase (see spec for SQL)

## Env vars
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server only
RESEND_API_KEY=                   # server only
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Spec file
Full technical spec: `files_agentz/ndoors-spec_1.html` — attach this when starting a new session for full context on data model, user flows, and GDPR notes.
