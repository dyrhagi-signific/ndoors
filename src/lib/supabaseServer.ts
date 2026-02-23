import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Server-side Supabase client using the Service Role key.
// Use this only in trusted server environments (API routes, server actions).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRole) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
}

export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl!, supabaseServiceRole!, {
  // Do not persist sessions when using service role
  auth: { persistSession: false },
})

export default supabaseAdmin
