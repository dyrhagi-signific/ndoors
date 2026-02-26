'use server'

import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendRecruiterNotification, sendReferenceQuestions, sendReferentInvite } from '@/lib/email/send'

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

export async function remindReferent(referentId: string) {
  console.log('[remindReferent] called, referentId:', referentId)

  const { data: referent, error } = await supabaseAdmin
    .from('referents')
    .select(`
      id, first_name, last_name, email, status, confirm_token,
      reference_requests(
        applicant_name,
        jobs(title, companies(name))
      )
    `)
    .eq('id', referentId)
    .maybeSingle()

  console.log('[remindReferent] referent lookup:', { id: referent?.id, status: referent?.status, error: error?.message })

  if (error || !referent) throw new Error('Referent not found')
  if (referent.status === 'confirmed' || referent.status === 'declined') {
    throw new Error('Referent has already responded')
  }

  const rr = referent.reference_requests as {
    applicant_name: string
    jobs: { title: string; companies: { name: string } | null } | null
  } | null

  const companyName = (rr?.jobs?.companies as { name: string } | null)?.name ?? ''

  console.log('[remindReferent] sending reminder to:', referent.email)
  await sendReferentInvite({
    referentEmail: referent.email,
    referentName: `${referent.first_name} ${referent.last_name}`,
    applicantName: rr?.applicant_name ?? '',
    jobTitle: rr?.jobs?.title ?? '',
    companyName,
    confirmToken: referent.confirm_token,
  })

  console.log('[remindReferent] reminder sent')
  return { ok: true }
}

export async function updateReferent(
  referentId: string,
  fields: { first_name: string; last_name: string; email: string; relationship: string }
) {
  console.log('[updateReferent] called, referentId:', referentId, 'fields:', fields)

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('referents')
    .select('id, email, status')
    .eq('id', referentId)
    .maybeSingle()

  console.log('[updateReferent] existing lookup:', { id: existing?.id, status: existing?.status, error: fetchError?.message })

  if (fetchError || !existing) throw new Error('Referent not found')
  if (existing.status === 'confirmed' || existing.status === 'declined') {
    throw new Error('Cannot edit a referent who has already responded')
  }

  const emailChanged = existing.email.toLowerCase() !== fields.email.trim().toLowerCase()

  const updatePayload: Record<string, string> = {
    first_name: fields.first_name.trim(),
    last_name: fields.last_name.trim(),
    email: fields.email.trim(),
    relationship: fields.relationship,
  }

  // If email changed, rotate tokens so the old link is invalidated
  if (emailChanged) {
    const { nanoid } = await import('nanoid')
    updatePayload.confirm_token = nanoid(16)
    updatePayload.revoke_token = nanoid(16)
    updatePayload.status = 'sent'
    console.log('[updateReferent] email changed — rotating tokens')
  }

  const { error: updateError } = await supabaseAdmin
    .from('referents')
    .update(updatePayload)
    .eq('id', referentId)

  console.log('[updateReferent] update result:', { error: updateError?.message })

  if (updateError) throw new Error(updateError.message)

  console.log('[updateReferent] success, emailChanged:', emailChanged)
  return { ok: true, emailChanged }
}

export async function sendReferentQuestions(
  referentId: string,
  questions: string[],
  recruiterEmail: string
) {
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
    .eq('id', referentId)
    .maybeSingle()

  if (error || !referent) throw new Error('Referent not found')
  if (referent.status !== 'confirmed') throw new Error('Referent has not confirmed yet')

  const rr = referent.reference_requests as {
    applicant_name: string
    jobs: { title: string; recruiter_id: string; companies: { name: string } | null } | null
  } | null

  const companyName = (rr?.jobs?.companies as { name: string } | null)?.name ?? ''

  const { data: recruiter } = await supabaseAdmin
    .from('users')
    .select('first_name, last_name')
    .eq('id', rr?.jobs?.recruiter_id ?? '')
    .maybeSingle()

  await sendReferenceQuestions({
    referentEmail: referent.email,
    referentName: `${referent.first_name} ${referent.last_name}`,
    applicantName: rr?.applicant_name ?? '',
    jobTitle: rr?.jobs?.title ?? '',
    companyName,
    questions,
    recruiterEmail,
    recruiterName: recruiter ? `${recruiter.first_name} ${recruiter.last_name}` : 'The recruiter',
  })

  await supabaseAdmin
    .from('referents')
    .update({ questions_sent_at: new Date().toISOString() })
    .eq('id', referentId)

  return { ok: true }
}
