import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ReminderButton } from './ReminderButton'
import { EditReferentForm } from './EditReferentForm'
import { WhatHappensNext } from './WhatHappensNext'

interface Props {
  params: Promise<{ applicant_token: string }>
}

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmed',
  sent: 'Awaiting response',
  declined: 'Declined',
  created: 'Pending',
}

const STATUS_PILL: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800',
  sent: 'bg-blue-100 text-blue-800',
  declined: 'bg-red-100 text-red-800',
  created: 'bg-gray-100 text-gray-600',
}

export default async function ApplicantStatusPage({ params }: Props) {
  const { applicant_token } = await params

  const { data: request } = await supabaseAdmin
    .from('reference_requests')
    .select(`
      id, applicant_name,
      jobs(title, companies(name)),
      referents(id, first_name, last_name, email, relationship, status)
    `)
    .eq('applicant_token', applicant_token)
    .maybeSingle()

  if (!request) notFound()

  const job = request.jobs as { title: string; companies: { name: string } | null } | null
  const referents = request.referents as { id: string; first_name: string; last_name: string; email: string; relationship: string; status: string }[] ?? []
  const companyName = (job?.companies as { name: string } | null)?.name ?? ''

  const confirmedCount = referents.filter((r) => r.status === 'confirmed').length

  return (
    <div className="min-h-screen bg-[#f7f5f0] px-4 py-12">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#c8763a]" />
            <span className="font-serif text-lg font-bold text-[#2d5a3d]">Ndoors</span>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-[#e2ddd6] bg-white px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#777770]">Your application</p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-[#1a1a18]">{job?.title ?? 'Role'}</h1>
          {companyName && (
            <p className="mt-0.5 text-sm font-medium text-[#2d5a3d]">{companyName}</p>
          )}
        </div>

        <div className="rounded-2xl border border-[#e2ddd6] bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1a1a18]">Your references</h2>
            <span className="text-xs text-[#777770]">
              {confirmedCount}/{referents.length} confirmed
            </span>
          </div>

          {referents.length === 0 ? (
            <p className="text-sm text-[#777770]">No references submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {referents.map((ref) => (
                <div key={ref.id} className="rounded-xl bg-[#f7f5f0] px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {(ref.status === 'sent' || ref.status === 'created') ? (
                        <EditReferentForm
                          referentId={ref.id}
                          initialData={{
                            first_name: ref.first_name,
                            last_name: ref.last_name,
                            email: ref.email,
                            relationship: ref.relationship,
                          }}
                        />
                      ) : (
                        <>
                          <p className="text-sm font-medium text-[#1a1a18]">
                            {ref.first_name} {ref.last_name}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-[#777770]">{ref.email}</p>
                          <p className="mt-0.5 text-xs text-[#777770]">{ref.relationship}</p>
                        </>
                      )}
                    </div>
                    <div className="flex flex-shrink-0 flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_PILL[ref.status] ?? STATUS_PILL.created}`}
                      >
                        {STATUS_LABEL[ref.status] ?? ref.status}
                      </span>
                      {(ref.status === 'sent' || ref.status === 'created') && (
                        <ReminderButton
                          referentId={ref.id}
                          referentName={`${ref.first_name} ${ref.last_name}`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {referents.length > 0 && <WhatHappensNext />}
        </div>
      </div>
    </div>
  )
}
