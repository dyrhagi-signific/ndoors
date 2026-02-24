'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function completeOnboarding(formData: FormData) {
  console.log('[onboarding] action called')

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  console.log('[onboarding] getUser result:', { userId: user?.id, email: user?.email, error: userError?.message })

  if (!user) {
    console.log('[onboarding] no user — redirecting to /login')
    redirect('/login')
  }

  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const jobTitle = formData.get('job_title') as string | null
  const companyName = formData.get('company_name') as string

  console.log('[onboarding] form data:', { firstName, lastName, jobTitle, companyName })

  let companyId: string | null = null
  if (companyName?.trim()) {
    const { data: existing, error: lookupError } = await supabaseAdmin
      .from('companies')
      .select('id')
      .ilike('name', companyName.trim())
      .maybeSingle()

    console.log('[onboarding] company lookup:', { existing, error: lookupError?.message })

    if (existing) {
      companyId = existing.id
      console.log('[onboarding] using existing company:', companyId)
    } else {
      const { data: newCompany, error: insertError } = await supabaseAdmin
        .from('companies')
        .insert({ name: companyName.trim() })
        .select('id')
        .single()

      console.log('[onboarding] company insert:', { newCompany, error: insertError?.message })

      if (insertError) throw new Error(insertError.message)
      companyId = newCompany.id
    }
  }

  console.log('[onboarding] upserting user with company_id:', companyId)

  const { error: upsertError } = await supabaseAdmin.from('users').upsert({
    id: user.id,
    email: user.email!,
    role: 'recruiter',
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    job_title: jobTitle?.trim() || null,
    company_id: companyId,
  })

  console.log('[onboarding] upsert result:', { error: upsertError?.message })

  if (upsertError) throw new Error(upsertError.message)

  console.log('[onboarding] success — redirecting to /dashboard')
  redirect('/dashboard')
}
