import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ConfirmButtons } from './ConfirmButtons'

interface Props {
  params: Promise<{ confirm_token: string }>
}

export default async function ConfirmPage({ params }: Props) {
  const { confirm_token } = await params

  const { data: referent } = await supabaseAdmin
    .from('referents')
    .select(`
      id, first_name, status,
      reference_requests(
        applicant_name,
        jobs(
          title,
          companies(name)
        )
      )
    `)
    .eq('confirm_token', confirm_token)
    .maybeSingle()

  if (!referent) notFound()

  const rr = referent.reference_requests as {
    applicant_name: string
    jobs: { title: string; companies: { name: string } | null } | null
  } | null

  const applicantName = rr?.applicant_name ?? 'Someone'
  const jobTitle = rr?.jobs?.title ?? 'a role'
  const companyName = (rr?.jobs?.companies as { name: string } | null)?.name ?? ''

  if (referent.status === 'confirmed' || referent.status === 'declined') {
    return (
      <OutcomePage
        outcome={referent.status}
        firstName={referent.first_name}
      />
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#c8763a]" />
            <span className="font-serif text-lg font-bold text-[#2d5a3d]">Ndoors</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e2ddd6] bg-white p-8">
          <h1 className="mb-2 font-serif text-2xl font-bold text-[#1a1a18]">
            Hi {referent.first_name},
          </h1>
          <p className="mb-6 text-sm leading-relaxed text-[#777770]">
            <strong className="text-[#1a1a18]">{applicantName}</strong> is applying for{' '}
            <strong className="text-[#1a1a18]">{jobTitle}</strong>
            {companyName && (
              <> at <strong className="text-[#1a1a18]">{companyName}</strong></>
            )}{' '}
            and has listed you as a reference.
          </p>

          <div className="mb-6 rounded-xl bg-[#e8f0eb] px-4 py-3 text-xs text-[#2a4a35]">
            <strong>Privacy note:</strong> If you confirm, your name and email will only be shared with the hiring team
            {companyName ? ` at ${companyName}` : ''} for this specific role.
          </div>

          <ConfirmButtons confirmToken={confirm_token} />
        </div>
      </div>
    </div>
  )
}

function OutcomePage({ outcome, firstName }: { outcome: string; firstName: string }) {
  const confirmed = outcome === 'confirmed'
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0] px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-6 flex justify-center">
          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${confirmed ? 'bg-[#e8f0eb]' : 'bg-gray-100'}`}>
            {confirmed ? (
              <svg className="h-7 w-7 text-[#2d5a3d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        </div>
        <h1 className="mb-2 font-serif text-2xl font-bold text-[#1a1a18]">
          {confirmed ? 'Confirmed' : 'Response recorded'}
        </h1>
        <p className="text-sm text-[#777770]">
          {confirmed
            ? `Thanks ${firstName} — the recruiter has been notified and may be in touch.`
            : `No problem ${firstName} — your response has been noted.`}
        </p>
      </div>
    </div>
  )
}
