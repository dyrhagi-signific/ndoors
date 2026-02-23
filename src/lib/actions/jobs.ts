'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { nanoid } from 'nanoid'

export async function createJob(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const title = (formData.get('title') as string)?.trim()
  if (!title) throw new Error('Job title is required')

  // Get recruiter profile to find company_id
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.company_id) {
    throw new Error('Complete your profile before creating a job')
  }

  const inviteToken = nanoid(12)

  const { data: job, error } = await supabaseAdmin
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

  if (error) throw new Error(error.message)

  redirect(`/dashboard/jobs/new?token=${job.invite_token}&title=${encodeURIComponent(title)}`)
}
