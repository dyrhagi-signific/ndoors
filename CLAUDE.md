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

## Core product principle — Trust
The whole point of Ndoors is that a recruiter can **trust** the references they receive without having to call every person. A reference from an unverified email address is little better than the applicant writing the text themselves. Verified identity is therefore the product's core differentiator.

Trust is earned progressively. The key insight is that **verification comes after the reference is saved**, so it never blocks the primary flow.

### Referent verification levels (ascending trust)
| Level | Method | How |
|---|---|---|
| `none` | — | Reference saved, identity unknown |
| `email` | Email OTP | 6-digit code sent to referent's email; confirms they own it |
| `phone` | SMS OTP | 6-digit code via SMS; confirms phone ownership |
| `linkedin` | Self-asserted URL | Referent pastes their LinkedIn URL — social proof, not OAuth |
| `bankid` | Swedish BankID | Cryptographic national identity — highest trust, GDPR-sensitive |

### Verification UX rule
1. Referent fills in reference → **answer is saved immediately** (status → `confirmed`)
2. Final screen: *"Do you want to help [applicant first name] stand out? Verify who you are."*
3. Each method is independent and optional — a referent can do all, some, or none
4. The recruiter dashboard shows badges per method so trust is visible at a glance

This framing means verification is a gift to the applicant, not a hurdle for the referent.

### Dashboard trust display
Each referent chip shows small method badges (email ✓, phone ✓, LinkedIn ✓, BankID ✓). The recruiter can decide how much trust they require — e.g. BankID for senior roles, email for junior ones.

## Database schema (5 tables)
| Table | Key columns |
|---|---|
| `users` | id (FK auth.users), role (recruiter\|applicant\|referent), first_name, last_name, email, company_id, job_title |
| `companies` | id, name, org_number |
| `jobs` | id, recruiter_id, company_id, title, invite_token (unique), is_active |
| `reference_requests` | id, job_id, applicant_name, applicant_email |
| `referents` | id, reference_request_id, first_name, last_name, email, relationship, status (created\|sent\|confirmed\|declined), confirm_token, confirmed_at, **email_verified**, **email_verified_at**, **phone**, **phone_verified**, **phone_verified_at**, **linkedin_url**, **bankid_verified**, **bankid_verified_at** |

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
- [x] `/dashboard` — recruiter overview (jobs list + referent statuses)
- [x] `/dashboard/jobs/new` — create job, generate + copy invite link
- [x] `/ref/[invite_token]` — applicant flow (no auth, submit referent contacts)
- [ ] `/confirm/[confirm_token]` — 2-step referent flow: (1) answer + confirm/decline, (2) optional verification upsell
- [ ] Email OTP verification for referents (Resend → 6-digit code, store in short-lived table)
- [ ] SMS OTP (Twilio or Vonage) for phone verification
- [ ] BankID integration (Freja eID or Signicat API — requires BankID partner agreement)
- [ ] Verification badges on dashboard referent chips
- [ ] Profile/onboarding step for new users after first login
- [ ] RLS policies enabled in Supabase (see spec for SQL)
- [ ] `ALTER TABLE referents ADD COLUMN ...` migration for verification fields (see types/database.ts)

## Env vars
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server only
RESEND_API_KEY=                   # server only
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Verification (future)
TWILIO_ACCOUNT_SID=               # SMS OTP — server only
TWILIO_AUTH_TOKEN=                # server only
TWILIO_FROM_NUMBER=               # server only
BANKID_API_URL=                   # BankID partner endpoint — server only
BANKID_CLIENT_CERT=               # mTLS cert required by BankID — server only
```

## Spec file
Full technical spec: `files_agentz/ndoors-spec_1.html` — attach this when starting a new session for full context on data model, user flows, and GDPR notes.
