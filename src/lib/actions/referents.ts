'use server'

import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendRecruiterNotification } from '@/lib/email/send'

export async function confirmReferent(confirmToken: string) {
  console.log('[confirmReferent] called, token:', confirmToken)

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

  console.log('[confirmReferent] referent lookup:', { id: referent?.id, status: referent?.status, error: error?.message })

  if (error || !referent) throw new Error('Referent not found')

  if (referent.status !== 'sent' && referent.status !== 'created') {
    console.log('[confirmReferent] already actioned, status:', referent.status)
    redirect(`/confirm/${confirmToken}`)
  }

  const { error: updateError } = await supabaseAdmin
    .from('referents')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', referent.id)

  console.log('[confirmReferent] status update:', { error: updateError?.message })

  if (updateError) throw new Error(updateError.message)

  const rr = referent.reference_requests as {
    applicant_name: string
    jobs: { title: string; recruiter_id: string; companies: { name: string } | null } | null
  } | null

  console.log('[confirmReferent] looking up recruiter id:', rr?.jobs?.recruiter_id)

  if (rr?.jobs?.recruiter_id) {
    const { data: recruiter, error: recruiterError } = await supabaseAdmin
      .from('users')
      .select('email, first_name')
      .eq('id', rr.jobs.recruiter_id)
      .maybeSingle()

    console.log('[confirmReferent] recruiter lookup:', { email: recruiter?.email, error: recruiterError?.message })

    if (recruiter) {
      console.log('[confirmReferent] sending recruiter notification to:', recruiter.email)
      sendRecruiterNotification({
        recruiterEmail: recruiter.email,
        recruiterName: recruiter.first_name,
        referentName: `${referent.first_name} ${referent.last_name}`,
        referentEmail: referent.email,
        applicantName: rr.applicant_name,
        jobTitle: rr.jobs!.title,
      }).then(() => {
        console.log('[confirmReferent] recruiter email sent')
      }).catch((err) => {
        console.error('[confirmReferent] recruiter email FAILED:', err)
      })
    }
  }

  console.log('[confirmReferent] success — redirecting')
  redirect(`/confirm/${confirmToken}`)
}

export async function declineReferent(confirmToken: string) {
  console.log('[declineReferent] called, token:', confirmToken)

  const { data: referent, error } = await supabaseAdmin
    .from('referents')
    .select('id, status')
    .eq('confirm_token', confirmToken)
    .maybeSingle()

  console.log('[declineReferent] referent lookup:', { id: referent?.id, status: referent?.status, error: error?.message })

  if (error || !referent) throw new Error('Referent not found')

  if (referent.status !== 'sent' && referent.status !== 'created') {
    console.log('[declineReferent] already actioned, status:', referent.status)
    redirect(`/confirm/${confirmToken}`)
  }

  const { error: updateError } = await supabaseAdmin
    .from('referents')
    .update({ status: 'declined' })
    .eq('id', referent.id)

  console.log('[declineReferent] status update:', { error: updateError?.message })

  if (updateError) throw new Error(updateError.message)

  console.log('[declineReferent] success — redirecting')
  redirect(`/confirm/${confirmToken}`)
}
