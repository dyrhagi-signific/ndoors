'use server'

import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendRecruiterNotification } from '@/lib/email/send'

export async function confirmReferent(confirmToken: string) {
  const { data: referent, error } = await supabaseAdmin
    .from('referents')
    .select(`
      id, first_name, last_name, email, status,
      reference_requests(
        applicant_name,
        jobs(
          title,
          recruiter_id,
          companies(name)
        )
      )
    `)
    .eq('confirm_token', confirmToken)
    .maybeSingle()

  if (error || !referent) throw new Error('Referent not found')
  if (referent.status !== 'sent' && referent.status !== 'created') {
    redirect(`/confirm/${confirmToken}/done?outcome=${referent.status}`)
  }

  // Update status
  await supabaseAdmin
    .from('referents')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', referent.id)

  // Notify recruiter
  const rr = referent.reference_requests as {
    applicant_name: string
    jobs: { title: string; recruiter_id: string; companies: { name: string } | null } | null
  } | null

  if (rr?.jobs?.recruiter_id) {
    const { data: recruiter } = await supabaseAdmin
      .from('users')
      .select('email, first_name')
      .eq('id', rr.jobs.recruiter_id)
      .maybeSingle()

    if (recruiter) {
      sendRecruiterNotification({
        recruiterEmail: recruiter.email,
        recruiterName: recruiter.first_name,
        referentName: `${referent.first_name} ${referent.last_name}`,
        referentEmail: referent.email,
        applicantName: rr.applicant_name,
        jobTitle: rr.jobs.title,
      }).catch(console.error)
    }
  }

  // After confirming, take the referent to the optional verification step.
  redirect(`/confirm/${confirmToken}/verify`)
}

export async function declineReferent(confirmToken: string) {
  const { data: referent, error } = await supabaseAdmin
    .from('referents')
    .select('id, status')
    .eq('confirm_token', confirmToken)
    .maybeSingle()

  if (error || !referent) throw new Error('Referent not found')
  if (referent.status !== 'sent' && referent.status !== 'created') {
    // Already answered — just show the outcome screen on the base page.
    redirect(`/confirm/${confirmToken}`)
  }

  await supabaseAdmin
    .from('referents')
    .update({ status: 'declined' })
    .eq('id', referent.id)

  redirect(`/confirm/${confirmToken}`)
}

export async function saveLinkedIn(confirmToken: string, linkedinUrl: string) {
  const { data: referent, error } = await supabaseAdmin
    .from('referents')
    .select('id, status')
    .eq('confirm_token', confirmToken)
    .maybeSingle()

  if (error || !referent) throw new Error('Referent not found')
  if (referent.status !== 'confirmed') throw new Error('Reference not confirmed')

  // Basic URL sanity check — must contain linkedin.com
  if (!linkedinUrl.includes('linkedin.com')) throw new Error('Please enter a valid LinkedIn URL')

  await supabaseAdmin
    .from('referents')
    .update({ linkedin_url: linkedinUrl })
    .eq('id', referent.id)
}
