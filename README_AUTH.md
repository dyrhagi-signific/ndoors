Supabase Authentication setup for Ndoors
=====================================

This file explains the minimal steps to enable Google OAuth and email (magic link) authentication for the Ndoors app.

1) Required environment variables

- NEXT_PUBLIC_SUPABASE_URL — your Supabase project URL (already present in `.env.local`).
- NEXT_PUBLIC_SUPABASE_ANON_KEY — your Supabase anon/public key (already present).
- SUPABASE_SERVICE_ROLE_KEY — service role key (server-only) for privileged operations.
- NEXT_PUBLIC_APP_URL — the app base URL (e.g. `http://localhost:3000` for local dev).

2) Enable providers in Supabase

- Open your Supabase project dashboard -> Authentication -> Providers.
- Enable Google. You'll need a Google OAuth client ID and secret (create these in Google Cloud Console).

  - Set the Authorized redirect URI in the Google Cloud Console to:
    - `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback`

- In the Supabase dashboard, enter the Google Client ID and Secret.

3) Redirect / callback handling

The helper `signInWithGoogle()` in `src/lib/auth.ts` calls Supabase's OAuth flow and expects the user to eventually be redirected back to
`/auth/callback`. You can create a simple page at `app/auth/callback/page.tsx` (or `pages/auth/callback.js`) to read the session from Supabase client and finish sign-in.

4) Email sign-in (magic link)

The `signInWithEmail(email)` helper will send a magic link to the provided email. The magic link will redirect to the `emailRedirectTo` URL we set:
`/auth/verify`. Create a page to show a verification message and read the session.

5) Testing locally

1. Ensure `.env.local` contains the variables above.
2. Run the app: `npm run dev`
3. Visit a page where you call `signInWithGoogle()` or `signInWithEmail(email)` from the client (e.g., a Sign In button).

6) Notes & security

- Never expose the `SUPABASE_SERVICE_ROLE_KEY` to the browser. Use it only in server code (API routes, server actions) via `src/lib/supabaseServer.ts`.
- For production, set `NEXT_PUBLIC_APP_URL` to your deployed domain and update OAuth redirect URIs accordingly.

If you'd like, I can add example sign-in pages under `app/` and a server API route to exchange/validate sessions — tell me which UX you'd prefer (app router pages or classic pages API routes) and I'll scaffold them.
