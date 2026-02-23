import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Browser / client-side Supabase instance
// Uses NEXT_PUBLIC_* env vars which are safe to expose to the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // In development we prefer to fail fast so missing envs are obvious.
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment')
}

export const supabase: SupabaseClient = createClient(supabaseUrl!, supabaseAnonKey!)

export function createSupabaseBrowserClient(): SupabaseClient {
  return createClient(supabaseUrl!, supabaseAnonKey!)
}

export default supabase
