import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { CopyButton } from './CopyButton'
import { ConfirmedReferentCard } from './ConfirmedReferentCard'

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

  const { data: jobs } = await supabaseAdmin
    .from('jobs')
    .select(`
      id, title, invite_token, is_active, created_at,
      reference_requests(
        id, applicant_name, applicant_email, applicant_token,
        referents(id, first_name, last_name, email, relationship, status, questions_sent_at)
      )
    `)
    .eq('recruiter_id', user.id)
    .order('created_at', { ascending: false })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const recruiterEmail = user.email ?? ''

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
        <div className="rounded-2xl border-2 border-dashed border-[#e2ddd6] py-16 text-center">
          <p className="mb-4 text-[#777770]">No jobs yet.</p>
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

            return (
              <div key={job.id} className="rounded-2xl border border-[#e2ddd6] bg-white p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-[#1a1a18]">{job.title}</h2>
                    <p className="mt-0.5 text-xs text-[#777770]">
                      {requests.length} applicant{requests.length !== 1 ? 's' : ''} ·{' '}
                      {allReferents.length} referent{allReferents.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <CopyButton url={`${appUrl}/ref/${job.invite_token}`} />
                </div>

                {requests.length > 0 && (
                  <div className="space-y-3">
                    {requests.map((req) => {
                      const pendingReferents = (req.referents ?? []).filter(
                        (r) => r.status === 'sent' || r.status === 'created'
                      )
                      const statusUrl = `${appUrl}/ref/status/${req.applicant_token}`
                      const mailtoSubject = encodeURIComponent(
                        `Your references for ${job.title}`
                      )
                      const mailtoBody = encodeURIComponent(
                        `Hi ${req.applicant_name},\n\nJust a quick nudge — we're still waiting on some of your references to confirm for the ${job.title} position.\n\nYou can send them a reminder directly from your reference tracking page:\n${statusUrl}\n\nBest regards`
                      )

                      return (
                      <div key={req.id} className="rounded-xl bg-[#f7f5f0] p-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-[#1a1a18]">
                            {req.applicant_name}
                          </p>
                          {pendingReferents.length > 0 && (
                            <a
                              href={`mailto:${req.applicant_email}?subject=${mailtoSubject}&body=${mailtoBody}`}
                              className="text-xs text-[#777770] transition hover:text-[#2d5a3d]"
                            >
                              Remind applicant
                            </a>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(req.referents ?? []).map((ref) =>
                            ref.status === 'confirmed' ? (
                              <ConfirmedReferentCard
                                key={ref.id}
                                referentId={ref.id}
                                firstName={ref.first_name}
                                lastName={ref.last_name}
                                email={ref.email}
                                relationship={ref.relationship}
                                applicantName={req.applicant_name}
                                jobTitle={job.title}
                                recruiterEmail={recruiterEmail}
                                questionsSentAt={ref.questions_sent_at ?? null}
                              />
                            ) : (
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
                            )
                          )}
                        </div>
                      </div>
                      )
                    })}
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
