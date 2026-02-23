import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ApplicantForm } from './ApplicantForm'

interface Props {
  params: Promise<{ invite_token: string }>
}

export default async function RefPage({ params }: Props) {
  const { invite_token } = await params

  const { data: job } = await supabaseAdmin
    .from('jobs')
    .select('id, title, is_active, companies(name)')
    .eq('invite_token', invite_token)
    .maybeSingle()

  if (!job) notFound()

  const companyName = (job.companies as { name: string } | null)?.name ?? ''

  if (!job.is_active) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0] px-4">
        <div className="max-w-sm text-center">
          <div className="mb-2 font-serif text-xl font-bold text-[#1a1a18]">
            This link is no longer active
          </div>
          <p className="text-sm text-[#777770]">
            The recruiter has closed this invite. If you think this is a mistake, please contact them directly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] px-4 py-12">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#c8763a]" />
            <span className="font-serif text-lg font-bold text-[#2d5a3d]">Ndoors</span>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-[#e2ddd6] bg-white px-6 py-5">
          <p className="text-sm text-[#777770]">You&apos;ve been asked to provide references for</p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-[#1a1a18]">{job.title}</h1>
          {companyName && (
            <p className="mt-0.5 text-sm font-medium text-[#2d5a3d]">{companyName}</p>
          )}
        </div>

        <ApplicantForm inviteToken={invite_token} />
      </div>
    </div>
  )
}
