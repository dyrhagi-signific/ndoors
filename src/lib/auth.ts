import { createClient } from '@/lib/supabase/client'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

/**
 * Trigger Google OAuth sign-in.
 * Enable Google provider in Supabase → Authentication → Providers.
 */
export async function signInWithGoogle() {
  const supabase = createClient()
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${appUrl}/auth/callback` },
  })
}

/**
 * Send a magic link to the provided email address.
 * The user clicks the link in their inbox and lands on /auth/callback.
 */
export async function signInWithEmail(email: string) {
  const supabase = createClient()
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${appUrl}/auth/callback` },
  })
}

export async function signOut() {
  const supabase = createClient()
  return supabase.auth.signOut()
}
