'use client'

import { useState } from 'react'

export function WhatHappensNext() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs text-[#777770] transition hover:text-[#1a1a18]"
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] font-bold leading-none">
          ?
        </span>
        What happens next?
        <svg
          className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <p className="mt-2 text-xs text-[#777770]">
          Once your references confirm, the recruiter will be notified and may contact them directly.
        </p>
      )}
    </div>
  )
}
