import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CopyButton } from './CopyButton'

const STATUS_PILL: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800',
  sent: 'bg-blue-100 text-blue-800',
  declined: 'bg-red-100 text-red-800',
  created: 'bg-gray-100 text-gray-600',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      id, title, invite_token, is_active, created_at,
      reference_requests(
        id, applicant_name,
        referents(id, first_name, last_name, status)
      )
    `)
    .eq('recruiter_id', user.id)
    .order('created_at', { ascending: false })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1a1a18]">Jobs</h1>
          <p className="mt-1 text-sm text-[#777770]">
            Each job has a unique invite link you send to candidates.
          </p>
        </div>
        <Link
          href="/dashboard/jobs/new"
          className="rounded-xl bg-[#2d5a3d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#24482f]"
        >
          + New job
        </Link>
      </div>

      {!jobs?.length ? (
        <div className="rounded-2xl border-2 border-dashed border-[#e2ddd6] py-20 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f0eb]">
            <svg className="h-5 w-5 text-[#2d5a3d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="mb-1 font-semibold text-[#1a1a18]">No jobs yet</h2>
          <p className="mb-5 text-sm text-[#777770]">
            Create a job to get a shareable invite link for candidates.
          </p>
          <Link
            href="/dashboard/jobs/new"
            className="rounded-xl bg-[#2d5a3d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#24482f]"
          >
            Create your first job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const requests = job.reference_requests ?? []
            const allReferents = requests.flatMap((r) => r.referents ?? [])
            const confirmedCount = allReferents.filter((r) => r.status === 'confirmed').length
            const totalCount = allReferents.length

            return (
              <div key={job.id} className="rounded-2xl border border-[#e2ddd6] bg-white p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-[#1a1a18]">{job.title}</h2>
                    <div className="mt-1 flex items-center gap-3">
                      <p className="text-xs text-[#777770]">
                        {requests.length} applicant{requests.length !== 1 ? 's' : ''}
                      </p>
                      {totalCount > 0 && (
                        <>
                          <span className="text-xs text-[#e2ddd6]">·</span>
                          <p className={`text-xs font-medium ${confirmedCount === totalCount ? 'text-green-700' : 'text-[#777770]'}`}>
                            {confirmedCount}/{totalCount} confirmed
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <CopyButton url={`${appUrl}/ref/${job.invite_token}`} />
                </div>

                {requests.length > 0 && (
                  <div className="space-y-3">
                    {requests.map((req) => (
                      <div key={req.id} className="rounded-xl bg-[#f7f5f0] p-4">
                        <p className="mb-2 text-sm font-medium text-[#1a1a18]">
                          {req.applicant_name}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(req.referents ?? []).map((ref) => (
                            <div
                              key={ref.id}
                              className="flex items-center gap-1.5 rounded-lg border border-[#e2ddd6] bg-white px-3 py-1.5 text-xs"
                            >
                              <span className="text-[#1a1a18]">
                                {ref.first_name} {ref.last_name}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_PILL[ref.status] ?? STATUS_PILL.created}`}
                              >
                                {ref.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
