'use client'

import { useState } from 'react'
import { confirmReferent, declineReferent } from '@/lib/actions/referents'

export function ConfirmButtons({ confirmToken }: { confirmToken: string }) {
  const [loading, setLoading] = useState<'confirm' | 'decline' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setLoading('confirm')
    setError(null)
    console.log('[ConfirmButtons] confirm clicked, token:', confirmToken)
    try {
      await confirmReferent(confirmToken)
      console.log('[ConfirmButtons] confirmReferent returned (redirect should have fired)')
    } catch (err: unknown) {
      const digest = (err as { digest?: string })?.digest ?? ''
      if (digest.startsWith('NEXT_REDIRECT')) {
        console.log('[ConfirmButtons] redirect caught — throwing up')
        throw err
      }
      console.error('[ConfirmButtons] confirm error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(null)
    }
  }

  async function handleDecline() {
    setLoading('decline')
    setError(null)
    console.log('[ConfirmButtons] decline clicked, token:', confirmToken)
    try {
      await declineReferent(confirmToken)
      console.log('[ConfirmButtons] declineReferent returned (redirect should have fired)')
    } catch (err: unknown) {
      const digest = (err as { digest?: string })?.digest ?? ''
      if (digest.startsWith('NEXT_REDIRECT')) {
        console.log('[ConfirmButtons] redirect caught — throwing up')
        throw err
      }
      console.error('[ConfirmButtons] decline error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <button
        onClick={handleConfirm}
        disabled={loading !== null}
        className="w-full rounded-xl bg-[#2d5a3d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#24482f] disabled:opacity-50"
      >
        {loading === 'confirm' ? 'Confirming…' : "Yes, I'm happy to be a reference"}
      </button>
      <button
        onClick={handleDecline}
        disabled={loading !== null}
        className="w-full rounded-xl border border-[#e2ddd6] px-4 py-3 text-sm font-medium text-[#777770] transition hover:border-red-200 hover:text-red-600 disabled:opacity-50"
      >
        {loading === 'decline' ? 'Declining…' : "No thanks, please remove me"}
      </button>
    </div>
  )
}
