import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Service role client — server-side only, never expose to the browser.
// Use this for operations that bypass RLS (e.g. sending emails, admin tasks).
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
