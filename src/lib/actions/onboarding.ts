'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const jobTitle = formData.get('job_title') as string | null
  const companyName = formData.get('company_name') as string

  // Find or create company
  let companyId: string | null = null
  if (companyName?.trim()) {
    const { data: existing } = await supabaseAdmin
      .from('companies')
      .select('id')
      .ilike('name', companyName.trim())
      .maybeSingle()

    if (existing) {
      companyId = existing.id
    } else {
      const { data: newCompany, error } = await supabaseAdmin
        .from('companies')
        .insert({ name: companyName.trim() })
        .select('id')
        .single()
      if (error) throw new Error(error.message)
      companyId = newCompany.id
    }
  }

  // Upsert user profile
  const { error } = await supabaseAdmin.from('users').upsert({
    id: user.id,
    email: user.email!,
    role: 'recruiter',
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    job_title: jobTitle?.trim() || null,
    company_id: companyId,
  })

  if (error) throw new Error(error.message)

  redirect('/dashboard')
}
