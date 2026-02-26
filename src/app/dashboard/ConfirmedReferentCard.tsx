'use client'

import { useState } from 'react'
import { sendReferentQuestions } from '@/lib/actions/referents'

const DEFAULT_QUESTIONS = (name: string) => [
  `How long did you work with ${name} and in what capacity?`,
  `What were ${name}'s key strengths?`,
  `Are there areas where ${name} could grow or improve?`,
  `How did ${name} handle pressure or challenging situations?`,
  `Would you recommend ${name} for this type of role?`,
]

interface Props {
  referentId: string
  firstName: string
  lastName: string
  email: string
  relationship: string
  applicantName: string
  jobTitle: string
  recruiterEmail: string
  questionsSentAt: string | null
}

type Mode = 'idle' | 'expanded' | 'questions' | 'sending' | 'sent'

export function ConfirmedReferentCard({
  referentId,
  firstName,
  lastName,
  email,
  relationship,
  applicantName,
  jobTitle,
  recruiterEmail,
  questionsSentAt,
}: Props) {
  const [mode, setMode] = useState<Mode>('idle')
  const [selected, setSelected] = useState<Set<number>>(() => new Set([0, 1, 2, 3, 4]))
  const [customQuestion, setCustomQuestion] = useState('')
  const [error, setError] = useState<string | null>(null)

  const defaultQs = DEFAULT_QUESTIONS(applicantName)

  function toggleQ(i: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  async function handleSendQuestions() {
    const questions = [
      ...defaultQs.filter((_, i) => selected.has(i)),
      ...(customQuestion.trim() ? [customQuestion.trim()] : []),
    ]
    if (!questions.length) return
    setMode('sending')
    setError(null)
    try {
      await sendReferentQuestions(referentId, questions, recruiterEmail)
      setMode('sent')
    } catch {
      setError('Failed to send — please try again.')
      setMode('questions')
    }
  }

  const bookCallSubject = encodeURIComponent(`Reference call for ${applicantName} – ${jobTitle}`)
  const bookCallBody = encodeURIComponent(
    `Hi ${firstName},\n\nI'm reaching out regarding ${applicantName}'s application for ${jobTitle}.\n\nWould you be available for a short call to share your thoughts?\n\nBest regards`
  )

  if (mode === 'idle') {
    return (
      <div
        className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#e2ddd6] bg-white px-3 py-1.5 text-xs transition hover:border-[#2d5a3d]"
        onClick={() => setMode('expanded')}
      >
        <span className="text-[#1a1a18]">{firstName} {lastName}</span>
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-800">
          confirmed
        </span>
        {questionsSentAt && (
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-purple-800">
            questions sent
          </span>
        )}
        <svg className="ml-0.5 h-3 w-3 text-[#777770]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    )
  }

  if (mode === 'sent') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs">
        <p className="font-medium text-green-800">Questions sent to {firstName} {lastName}</p>
        <p className="mt-0.5 text-green-700">They&apos;ll reply directly to your email ({recruiterEmail}).</p>
        <button
          onClick={() => setMode('expanded')}
          className="mt-2 text-[#777770] transition hover:text-[#1a1a18]"
        >
          ← Back
        </button>
      </div>
    )
  }

  if (mode === 'questions' || mode === 'sending') {
    const busy = mode === 'sending'
    return (
      <div className="rounded-xl border border-[#e2ddd6] bg-white p-4 text-xs">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-medium text-[#1a1a18]">Questions for {firstName} {lastName}</p>
          <button
            onClick={() => setMode('expanded')}
            disabled={busy}
            className="text-lg leading-none text-[#777770] transition hover:text-[#1a1a18] disabled:opacity-50"
          >
            ×
          </button>
        </div>
        <p className="mb-3 text-[#777770]">
          Select questions to include. {firstName} will reply directly to your email.
        </p>

        <div className="mb-3 space-y-2">
          {defaultQs.map((q, i) => (
            <label key={i} className="flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                checked={selected.has(i)}
                onChange={() => toggleQ(i)}
                disabled={busy}
                className="mt-0.5 accent-[#2d5a3d]"
              />
              <span className={selected.has(i) ? 'text-[#1a1a18]' : 'text-[#aaa] line-through'}>
                {q}
              </span>
            </label>
          ))}
        </div>

        <div className="mb-3">
          <label className="mb-1 block font-medium text-[#1a1a18]">Add your own question</label>
          <textarea
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            disabled={busy}
            placeholder="e.g. How did they handle conflict within the team?"
            rows={2}
            className="w-full resize-none rounded-lg border border-[#e2ddd6] bg-white px-2.5 py-1.5 text-xs text-[#1a1a18] placeholder:text-[#777770] focus:border-[#2d5a3d] focus:outline-none focus:ring-1 focus:ring-[#2d5a3d] disabled:opacity-50"
          />
        </div>

        {error && <p className="mb-2 text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={handleSendQuestions}
            disabled={busy || (selected.size === 0 && !customQuestion.trim())}
            className="rounded-lg bg-[#2d5a3d] px-3 py-1.5 font-semibold text-white transition hover:bg-[#24482f] disabled:opacity-50"
          >
            {busy ? 'Sending…' : 'Send questions'}
          </button>
          <button
            onClick={() => setMode('expanded')}
            disabled={busy}
            className="rounded-lg border border-[#e2ddd6] px-3 py-1.5 text-[#777770] transition hover:border-[#1a1a18] hover:text-[#1a1a18] disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // expanded
  return (
    <div className="rounded-xl border border-[#e2ddd6] bg-white p-4 text-xs">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-[#1a1a18]">{firstName} {lastName}</p>
          <a
            href={`mailto:${email}`}
            className="truncate text-[#2d5a3d] underline underline-offset-2 hover:text-[#24482f]"
          >
            {email}
          </a>
          <p className="mt-0.5 text-[#777770]">{relationship}</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-800">
            confirmed
          </span>
          <button
            onClick={() => setMode('idle')}
            className="text-lg leading-none text-[#777770] transition hover:text-[#1a1a18]"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={`mailto:${email}?subject=${bookCallSubject}&body=${bookCallBody}`}
          className="rounded-lg border border-[#e2ddd6] bg-[#f7f5f0] px-3 py-1.5 font-medium text-[#1a1a18] transition hover:border-[#2d5a3d] hover:text-[#2d5a3d]"
        >
          Book a call
        </a>
        {questionsSentAt ? (
          <span className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 font-medium text-purple-700 cursor-default">
            Questions sent
          </span>
        ) : (
          <button
            onClick={() => setMode('questions')}
            className="rounded-lg border border-[#e2ddd6] bg-[#f7f5f0] px-3 py-1.5 font-medium text-[#1a1a18] transition hover:border-[#2d5a3d] hover:text-[#2d5a3d]"
          >
            Send questions first
          </button>
        )}
      </div>
    </div>
  )
}
