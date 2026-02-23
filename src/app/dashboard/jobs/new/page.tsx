'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createJob } from '@/lib/actions/jobs'

export default function NewJobPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const title = searchParams.get('title')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviteUrl = token ? `${appUrl}/ref/${token}` : null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await createJob(new FormData(e.currentTarget))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!inviteUrl) return
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Post-creation state
  if (inviteUrl && title) {
    return (
      <div className="mx-auto max-w-lg">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1 text-sm text-[#777770] hover:text-[#1a1a18]">
          ← Back to jobs
        </Link>

        <div className="rounded-2xl border border-[#e2ddd6] bg-white p-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f0eb]">
            <svg className="h-6 w-6 text-[#2d5a3d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="mb-1 font-serif text-2xl font-bold text-[#1a1a18]">Job created</h1>
          <p className="mb-6 text-sm text-[#777770]">
            Share this link with <strong className="text-[#1a1a18]">{decodeURIComponent(title)}</strong> candidates. Each person who opens it can submit their references.
          </p>

          <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#e2ddd6] bg-[#f7f5f0] px-4 py-3">
            <span className="flex-1 truncate font-mono text-sm text-[#1a1a18]">{inviteUrl}</span>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 rounded-lg bg-[#2d5a3d] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#24482f]"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="flex-1 rounded-xl border border-[#e2ddd6] px-4 py-2.5 text-center text-sm font-medium text-[#1a1a18] transition hover:bg-[#f7f5f0]"
            >
              View dashboard
            </Link>
            <Link
              href="/dashboard/jobs/new"
              className="flex-1 rounded-xl bg-[#2d5a3d] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#24482f]"
            >
              Create another
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#777770] transition hover:text-[#1a1a18]">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to jobs
      </Link>

      <div className="rounded-2xl border border-[#e2ddd6] bg-white p-8">
        <h1 className="mb-1 font-serif text-2xl font-bold text-[#1a1a18]">New job</h1>
        <p className="mb-6 text-sm text-[#777770]">
          Give the role a title. We&apos;ll generate a unique invite link you can send to candidates.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#1a1a18]">
              Job title
            </label>
            <input
              name="title"
              type="text"
              required
              autoFocus
              placeholder="e.g. Senior Product Designer"
              className="w-full rounded-xl border border-[#e2ddd6] bg-[#faf8f4] px-4 py-3 text-sm text-[#1a1a18] placeholder:text-[#777770] focus:border-[#2d5a3d] focus:outline-none focus:ring-1 focus:ring-[#2d5a3d]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#2d5a3d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#24482f] disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create job & get invite link'}
          </button>
        </form>
      </div>
    </div>
  )
}
