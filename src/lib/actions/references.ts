'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendReferentInvite } from '@/lib/email/send'
import { nanoid } from 'nanoid'

interface ReferentInput {
  first_name: string
  last_name: string
  email: string
  relationship: string
}

export async function submitReferenceRequest({
  inviteToken,
  applicantName,
  applicantEmail,
  referents,
}: {
  inviteToken: string
  applicantName: string
  applicantEmail: string
  referents: ReferentInput[]
}) {
  // Verify job exists and is active
  const { data: job, error: jobError } = await supabaseAdmin
    .from('jobs')
    .select('id, title, is_active, companies(name)')
    .eq('invite_token', inviteToken)
    .maybeSingle()

  if (jobError || !job) throw new Error('Job not found')
  if (!job.is_active) throw new Error('This invite link is no longer active')

  const companyName = (job.companies as { name: string } | null)?.name ?? ''

  // Create reference request
  const { data: refRequest, error: refError } = await supabaseAdmin
    .from('reference_requests')
    .insert({ job_id: job.id, applicant_name: applicantName.trim(), applicant_email: applicantEmail.trim() })
    .select('id')
    .single()

  if (refError) throw new Error(refError.message)

  // Create referent rows and send emails
  for (const ref of referents) {
    const confirmToken = nanoid(16)

    const { error: refentError } = await supabaseAdmin.from('referents').insert({
      reference_request_id: refRequest.id,
      first_name: ref.first_name.trim(),
      last_name: ref.last_name.trim(),
      email: ref.email.trim(),
      relationship: ref.relationship,
      status: 'sent',
      confirm_token: confirmToken,
    })

    if (refentError) throw new Error(refentError.message)

    // Fire and forget — don't block on email errors
    sendReferentInvite({
      referentEmail: ref.email.trim(),
      referentName: `${ref.first_name} ${ref.last_name}`,
      applicantName,
      jobTitle: job.title,
      companyName,
      confirmToken,
    }).catch(console.error)
  }
}
