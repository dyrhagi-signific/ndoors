'use client'

import { useState } from 'react'
import { updateReferent, remindReferent } from '@/lib/actions/referents'

const RELATIONSHIPS = [
  'Former manager',
  'Current manager',
  'Direct report',
  'Colleague',
  'Client',
  'Mentor',
  'Other',
]

interface Props {
  referentId: string
  initialData: {
    first_name: string
    last_name: string
    email: string
    relationship: string
  }
}

type Mode = 'view' | 'editing' | 'email_changed' | 'saving' | 'resending'

export function EditReferentForm({ referentId, initialData }: Props) {
  const [mode, setMode] = useState<Mode>('view')
  const [data, setData] = useState(initialData)
  const [draft, setDraft] = useState(initialData)
  const [error, setError] = useState<string | null>(null)

  function startEdit() {
    setDraft(data)
    setError(null)
    setMode('editing')
  }

  function cancelEdit() {
    setMode('view')
    setError(null)
  }

  async function handleSave() {
    setMode('saving')
    setError(null)
    try {
      const result = await updateReferent(referentId, draft)
      setData(draft)
      if (result.emailChanged) {
        setMode('email_changed')
      } else {
        setMode('view')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setMode('editing')
    }
  }

  async function handleResend() {
    setMode('resending')
    try {
      await remindReferent(referentId)
      setMode('view')
    } catch {
      setMode('view')
    }
  }

  // Email changed prompt
  if (mode === 'email_changed') {
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium text-[#1a1a18]">
          {data.first_name} {data.last_name}
        </p>
        <p className="truncate text-xs text-[#777770]">{data.email}</p>
        <p className="text-xs text-[#777770]">{data.relationship}</p>
        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs">
          <p className="mb-2.5 font-medium text-amber-900">
            Email changed — resend the invite to the new address?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleResend}
              className="rounded-lg bg-[#2d5a3d] px-3 py-1.5 font-semibold text-white transition hover:bg-[#24482f]"
            >
              Yes, resend invite
            </button>
            <button
              onClick={() => setMode('view')}
              className="rounded-lg border border-[#e2ddd6] px-3 py-1.5 text-[#777770] transition hover:border-[#1a1a18] hover:text-[#1a1a18]"
            >
              No thanks
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Edit form
  if (mode === 'editing' || mode === 'saving') {
    const busy = mode === 'saving'
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={draft.first_name}
            onChange={(e) => setDraft((d) => ({ ...d, first_name: e.target.value }))}
            placeholder="First name"
            disabled={busy}
            className="rounded-lg border border-[#e2ddd6] bg-white px-2.5 py-1.5 text-xs text-[#1a1a18] placeholder:text-[#777770] focus:border-[#2d5a3d] focus:outline-none focus:ring-1 focus:ring-[#2d5a3d] disabled:opacity-50"
          />
          <input
            type="text"
            value={draft.last_name}
            onChange={(e) => setDraft((d) => ({ ...d, last_name: e.target.value }))}
            placeholder="Last name"
            disabled={busy}
            className="rounded-lg border border-[#e2ddd6] bg-white px-2.5 py-1.5 text-xs text-[#1a1a18] placeholder:text-[#777770] focus:border-[#2d5a3d] focus:outline-none focus:ring-1 focus:ring-[#2d5a3d] disabled:opacity-50"
          />
        </div>
        <input
          type="email"
          value={draft.email}
          onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
          placeholder="Email"
          disabled={busy}
          className="w-full rounded-lg border border-[#e2ddd6] bg-white px-2.5 py-1.5 text-xs text-[#1a1a18] placeholder:text-[#777770] focus:border-[#2d5a3d] focus:outline-none focus:ring-1 focus:ring-[#2d5a3d] disabled:opacity-50"
        />
        <select
          value={draft.relationship}
          onChange={(e) => setDraft((d) => ({ ...d, relationship: e.target.value }))}
          disabled={busy}
          className="w-full rounded-lg border border-[#e2ddd6] bg-white px-2.5 py-1.5 text-xs text-[#1a1a18] focus:border-[#2d5a3d] focus:outline-none focus:ring-1 focus:ring-[#2d5a3d] disabled:opacity-50"
        >
          {RELATIONSHIPS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2 pt-0.5">
          <button
            onClick={handleSave}
            disabled={busy}
            className="rounded-lg bg-[#2d5a3d] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#24482f] disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={cancelEdit}
            disabled={busy}
            className="rounded-lg border border-[#e2ddd6] px-3 py-1.5 text-xs text-[#777770] transition hover:border-[#1a1a18] hover:text-[#1a1a18] disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // View mode
  return (
    <div className="group/edit space-y-0.5">
      <div className="flex items-baseline gap-2">
        <p className="text-sm font-medium text-[#1a1a18]">
          {data.first_name} {data.last_name}
        </p>
        <button
          onClick={startEdit}
          className="text-[10px] font-medium text-[#777770] opacity-0 transition group-hover/edit:opacity-100 hover:text-[#2d5a3d]"
        >
          Edit
        </button>
      </div>
      <p className="truncate text-xs text-[#777770]">{data.email}</p>
      <p className="text-xs text-[#777770]">{data.relationship}</p>
    </div>
  )
}
