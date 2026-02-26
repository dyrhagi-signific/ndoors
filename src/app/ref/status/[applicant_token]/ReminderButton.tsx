'use client'

import { useState } from 'react'
import { remindReferent } from '@/lib/actions/referents'

interface Props {
  referentId: string
  referentName: string
}

export function ReminderButton({ referentId, referentName }: Props) {
  const [state, setState] = useState<'idle' | 'confirming' | 'loading' | 'sent' | 'error'>('idle')

  async function handleConfirm() {
    setState('loading')
    try {
      await remindReferent(referentId)
      setState('sent')
      setTimeout(() => setState('idle'), 4000)
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 4000)
    }
  }

  if (state === 'sent') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#2d5a3d]">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Reminder sent
      </span>
    )
  }

  if (state === 'error') {
    return <span className="text-xs font-medium text-red-600">Failed — try again</span>
  }

  if (state === 'confirming') {
    return (
      <div className="rounded-lg border border-[#e2ddd6] bg-white p-3 text-xs">
        <p className="mb-2.5 text-[#1a1a18]">
          Resend the confirmation email to <strong>{referentName}</strong>?
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            className="rounded-lg bg-[#2d5a3d] px-3 py-1.5 font-semibold text-white transition hover:bg-[#24482f]"
          >
            Yes, send reminder
          </button>
          <button
            onClick={() => setState('idle')}
            className="rounded-lg border border-[#e2ddd6] px-3 py-1.5 text-[#777770] transition hover:border-[#1a1a18] hover:text-[#1a1a18]"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setState('confirming')}
      disabled={state === 'loading'}
      className="rounded-lg border border-[#e2ddd6] bg-white px-3 py-1.5 text-xs font-medium text-[#777770] transition hover:border-[#2d5a3d] hover:text-[#2d5a3d] disabled:opacity-50"
    >
      Send reminder
    </button>
  )
}
