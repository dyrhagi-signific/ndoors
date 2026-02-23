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

  redirect(`/confirm/${confirmToken}/done?outcome=confirmed`)
}

export async function declineReferent(confirmToken: string) {
  const { data: referent, error } = await supabaseAdmin
    .from('referents')
    .select('id, status')
    .eq('confirm_token', confirmToken)
    .maybeSingle()

  if (error || !referent) throw new Error('Referent not found')
  if (referent.status !== 'sent' && referent.status !== 'created') {
    redirect(`/confirm/${confirmToken}/done?outcome=${referent.status}`)
  }

  await supabaseAdmin
    .from('referents')
    .update({ status: 'declined' })
    .eq('id', referent.id)

  redirect(`/confirm/${confirmToken}/done?outcome=declined`)
}
