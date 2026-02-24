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
  console.log('[submitReferenceRequest] called', { inviteToken, applicantName, applicantEmail, referentCount: referents.length })

  const { data: job, error: jobError } = await supabaseAdmin
    .from('jobs')
    .select('id, title, is_active, companies(name)')
    .eq('invite_token', inviteToken)
    .maybeSingle()

  console.log('[submitReferenceRequest] job lookup:', { jobId: job?.id, title: job?.title, is_active: job?.is_active, error: jobError?.message })

  if (jobError || !job) throw new Error('Job not found')
  if (!job.is_active) throw new Error('This invite link is no longer active')

  const companyName = (job.companies as { name: string } | null)?.name ?? ''

  const applicantToken = nanoid(16)
  console.log('[submitReferenceRequest] generated applicant_token:', applicantToken)

  const { data: refRequest, error: refError } = await supabaseAdmin
    .from('reference_requests')
    .upsert(
      { job_id: job.id, applicant_name: applicantName.trim(), applicant_email: applicantEmail.trim(), applicant_token: applicantToken },
      { onConflict: 'job_id,applicant_email' }
    )
    .select('id')
    .single()

  console.log('[submitReferenceRequest] reference_request upsert:', { id: refRequest?.id, error: refError?.message })

  if (refError) throw new Error(refError.message)

  // Clear any existing referents (handles resubmission)
  const { error: deleteError } = await supabaseAdmin
    .from('referents')
    .delete()
    .eq('reference_request_id', refRequest.id)

  console.log('[submitReferenceRequest] cleared old referents:', { error: deleteError?.message })

  for (const ref of referents) {
    const confirmToken = nanoid(16)
    const revokeToken = nanoid(16)
    console.log(`[submitReferenceRequest] inserting referent: ${ref.first_name} ${ref.last_name} <${ref.email}> confirm=${confirmToken}`)

    const { error: refentError } = await supabaseAdmin.from('referents').insert({
      reference_request_id: refRequest.id,
      first_name: ref.first_name.trim(),
      last_name: ref.last_name.trim(),
      email: ref.email.trim(),
      relationship: ref.relationship,
      status: 'sent',
      confirm_token: confirmToken,
      revoke_token: revokeToken,
    })

    console.log(`[submitReferenceRequest] referent insert result:`, { error: refentError?.message })

    if (refentError) throw new Error(refentError.message)

    console.log(`[submitReferenceRequest] sending invite email to ${ref.email}`)
    sendReferentInvite({
      referentEmail: ref.email.trim(),
      referentName: `${ref.first_name} ${ref.last_name}`,
      applicantName,
      jobTitle: job.title,
      companyName,
      confirmToken,
    }).then(() => {
      console.log(`[submitReferenceRequest] email sent to ${ref.email}`)
    }).catch((err) => {
      console.error(`[submitReferenceRequest] email FAILED for ${ref.email}:`, err)
    })
  }

  console.log('[submitReferenceRequest] complete')
}
