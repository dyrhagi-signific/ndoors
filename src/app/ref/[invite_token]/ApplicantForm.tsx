'use client'

import { useState } from 'react'
import { submitReferenceRequest } from '@/lib/actions/references'

interface Referent {
  first_name: string
  last_name: string
  email: string
  relationship: string
}

const RELATIONSHIPS = [
  'Former manager',
  'Current manager',
  'Direct report',
  'Colleague',
  'Client',
  'Mentor',
  'Other',
]

const emptyReferent = (): Referent => ({
  first_name: '',
  last_name: '',
  email: '',
  relationship: '',
})

export function ApplicantForm({ inviteToken }: { inviteToken: string }) {
  const [applicantName, setApplicantName] = useState('')
  const [applicantEmail, setApplicantEmail] = useState('')
  const [referents, setReferents] = useState<Referent[]>([emptyReferent()])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function updateReferent(index: number, field: keyof Referent, value: string) {
    setReferents((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    )
  }

  function addReferent() {
    if (referents.length < 3) setReferents((prev) => [...prev, emptyReferent()])
  }

  function removeReferent(index: number) {
    if (referents.length > 1) setReferents((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const filled = referents.filter((r) => r.first_name && r.last_name && r.email && r.relationship)
    console.log('[ApplicantForm] submit', { applicantName, applicantEmail, filledReferents: filled.length })

    if (!filled.length) {
      setError('Please add at least one referent.')
      setLoading(false)
      return
    }

    try {
      await submitReferenceRequest({
        inviteToken,
        applicantName,
        applicantEmail,
        referents: filled,
      })
      console.log('[ApplicantForm] success')
      setSubmitted(true)
    } catch (err) {
      console.error('[ApplicantForm] error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-[#e2ddd6] bg-white p-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f0eb]">
            <svg className="h-7 w-7 text-[#2d5a3d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="mb-2 font-serif text-xl font-bold text-[#1a1a18]">All done!</h2>
        <p className="text-sm text-[#777770]">
          We&apos;ve sent a confirmation request to your references. The recruiter will be notified once they confirm.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-2xl border border-[#e2ddd6] bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-[#1a1a18]">Your details</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First name"
              value={applicantName.split(' ')[0] ?? ''}
              onChange={(e) => {
                const parts = applicantName.split(' ')
                parts[0] = e.target.value
                setApplicantName(parts.join(' ').trim())
              }}
              required
              className="rounded-xl border border-[#e2ddd6] bg-[#faf8f4] px-3 py-2.5 text-sm placeholder:text-[#777770] focus:border-[#2d5a3d] focus:outline-none focus:ring-1 focus:ring-[#2d5a3d]"
            />
            <input
              type="text"
              placeholder="Last name"
              onChange={(e) => {
                const firstName = applicantName.split(' ')[0] ?? ''
                setApplicantName(`${firstName} ${e.target.value}`.trim())
              }}
              required
              className="rounded-xl border border-[#e2ddd6] bg-[#faf8f4] px-3 py-2.5 text-sm placeholder:text-[#777770] focus:border-[#2d5a3d] focus:outline-none focus:ring-1 focus:ring-[#2d5a3d]"
            />
          </div>
          <input
            type="email"
            placeholder="Your email"
            value={applicantEmail}
            onChange={(e) => setApplicantEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-[#e2ddd6] bg-[#faf8f4] px-3 py-2.5 text-sm placeholder:text-[#777770] focus:border-[#2d5a3d] focus:outline-none focus:ring-1 focus:ring-[#2d5a3d]"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#e2ddd6] bg-white p-6">
        <h2 className="mb-1 text-sm font-semibold text-[#1a1a18]">Your references</h2>
        <p className="mb-4 text-xs text-[#777770]">Add 1–3 people who can speak to your work.</p>

        <div className="space-y-4">
          {referents.map((ref, i) => (
            <div key={i} className="relative rounded-xl bg-[#f7f5f0] p-4">
              {referents.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeReferent(i)}
                  className="absolute right-3 top-3 text-[#777770] hover:text-[#1a1a18]"
                  aria-label="Remove"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#777770]">
                Reference {i + 1}
              </p>
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="First name"
                    value={ref.first_name}
                    onChange={(e) => updateReferent(i, 'first_name', e.target.value)}
                    required
                    className="rounded-xl border border-[#e2ddd6] bg-white px-3 py-2.5 text-sm placeholder:text-[#777770] focus:border-[#2d5a3d] focus:outline-none focus:ring-1 focus:ring-[#2d5a3d]"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={ref.last_name}
                    onChange={(e) => updateReferent(i, 'last_name', e.target.value)}
                    required
                    className="rounded-xl border border-[#e2ddd6] bg-white px-3 py-2.5 text-sm placeholder:text-[#777770] focus:border-[#2d5a3d] focus:outline-none focus:ring-1 focus:ring-[#2d5a3d]"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={ref.email}
                  onChange={(e) => updateReferent(i, 'email', e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#e2ddd6] bg-white px-3 py-2.5 text-sm placeholder:text-[#777770] focus:border-[#2d5a3d] focus:outline-none focus:ring-1 focus:ring-[#2d5a3d]"
                />
                <select
                  value={ref.relationship}
                  onChange={(e) => updateReferent(i, 'relationship', e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#e2ddd6] bg-white px-3 py-2.5 text-sm text-[#1a1a18] focus:border-[#2d5a3d] focus:outline-none focus:ring-1 focus:ring-[#2d5a3d]"
                >
                  <option value="" disabled>Relationship</option>
                  {RELATIONSHIPS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        {referents.length < 3 && (
          <button
            type="button"
            onClick={addReferent}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#e2ddd6] py-2.5 text-sm text-[#777770] transition hover:border-[#2d5a3d] hover:text-[#2d5a3d]"
          >
            + Add another reference
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#2d5a3d] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#24482f] disabled:opacity-50"
      >
        {loading ? 'Submitting…' : 'Submit my references'}
      </button>

      <p className="text-center text-xs text-[#777770]">
        Your references will receive an email asking them to confirm. Their contact details are only shared with the recruiter once they confirm.
      </p>
    </form>
  )
}
