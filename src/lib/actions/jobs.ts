'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { nanoid } from 'nanoid'

export async function createJob(formData: FormData) {
  console.log('[createJob] action called')

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  console.log('[createJob] getUser:', { userId: user?.id, error: userError?.message })

  if (!user) {
    console.log('[createJob] no user — redirecting to /login')
    redirect('/login')
  }

  const title = (formData.get('title') as string)?.trim()
  console.log('[createJob] title:', title)

  if (!title) throw new Error('Job title is required')

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  console.log('[createJob] profile lookup:', { profile, error: profileError?.message })

  if (profileError || !profile?.company_id) {
    throw new Error('Complete your profile before creating a job')
  }

  const inviteToken = nanoid(12)
  console.log('[createJob] generated invite_token:', inviteToken)

  const { data: job, error: insertError } = await supabaseAdmin
    .from('jobs')
    .insert({
      recruiter_id: user.id,
      company_id: profile.company_id,
      title,
      invite_token: inviteToken,
      is_active: true,
    })
    .select('invite_token')
    .single()

  console.log('[createJob] job insert:', { job, error: insertError?.message })

  if (insertError) throw new Error(insertError.message)

  const redirectUrl = `/dashboard/jobs/new?token=${job.invite_token}&title=${encodeURIComponent(title)}`
  console.log('[createJob] success — redirecting to:', redirectUrl)
  redirect(redirectUrl)
}
