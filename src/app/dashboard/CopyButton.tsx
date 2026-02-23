'use client'

import { useState } from 'react'

export function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex-shrink-0 rounded-lg border border-[#e2ddd6] bg-[#f7f5f0] px-3 py-1.5 text-xs font-medium text-[#2d5a3d] transition hover:border-[#2d5a3d]"
    >
      {copied ? 'Copied!' : 'Copy invite link'}
    </button>
  )
}
