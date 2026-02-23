import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { VerifyForm } from './VerifyForm'

interface Props {
  params: Promise<{ confirm_token: string }>
}

export default async function VerifyPage({ params }: Props) {
  const { confirm_token } = await params

  const { data: referent } = await supabaseAdmin
    .from('referents')
    .select(`
      id, first_name, status, linkedin_url,
      reference_requests(
        applicant_name
      )
    `)
    .eq('confirm_token', confirm_token)
    .maybeSingle()

  if (!referent) notFound()

  // Only confirmed referents land here; anyone else goes back to the base page.
  if (referent.status !== 'confirmed') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0] px-4">
        <div className="text-center">
          <p className="text-sm text-[#777770]">
            This link is no longer valid.{' '}
            <Link href={`/confirm/${confirm_token}`} className="text-[#2d5a3d] underline">
              Go back
            </Link>
          </p>
        </div>
      </div>
    )
  }

  const rr = referent.reference_requests as { applicant_name: string } | null
  const applicantFirstName = (rr?.applicant_name ?? 'your contact').split(' ')[0]

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#c8763a]" />
            <span className="font-serif text-lg font-bold text-[#2d5a3d]">Ndoors</span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2d5a3d] text-[10px] font-bold text-white">1</div>
          <div className="h-px w-8 bg-[#2d5a3d]" />
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2d5a3d] text-[10px] font-bold text-white ring-2 ring-[#2d5a3d] ring-offset-2">2</div>
        </div>

        <div className="rounded-2xl border border-[#e2ddd6] bg-white p-8">
          {/* Confirmed banner */}
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-[#e8f0eb] px-4 py-3">
            <svg className="h-4 w-4 flex-shrink-0 text-[#2d5a3d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-xs font-medium text-[#2a4a35]">
              Your reference for {applicantFirstName} has been saved.
            </p>
          </div>

          <h1 className="mb-1 font-serif text-2xl font-bold text-[#1a1a18]">
            Help {applicantFirstName} stand out
          </h1>
          <p className="mb-6 text-sm text-[#777770]">
            Verifying who you are takes under a minute and gives the recruiter confidence in your
            reference — no account needed.
          </p>

          <VerifyForm
            confirmToken={confirm_token}
            applicantFirstName={applicantFirstName}
            existingLinkedIn={referent.linkedin_url ?? null}
          />
        </div>

        <div className="mt-5 text-center">
          <Link
            href={`/confirm/${confirm_token}`}
            className="text-sm text-[#aaa8a2] transition hover:text-[#777770]"
          >
            Skip for now
          </Link>
        </div>
      </div>
    </div>
  )
}
