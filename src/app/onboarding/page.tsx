'use client'

import { useState } from 'react'
import { completeOnboarding } from '@/lib/actions/onboarding'

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    console.log('[onboarding] form submitted')
    try {
      await completeOnboarding(new FormData(e.currentTarget))
      console.log('[onboarding] action returned — redirect should have fired')
    } catch (err: unknown) {
      const digest = (err as { digest?: string })?.digest ?? ''
      if (digest.startsWith('NEXT_REDIRECT')) {
        console.log('[onboarding] redirect in flight — throwing up')
        throw err
      }
      console.error('[onboarding] error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#c8763a]" />
            <span className="font-serif text-xl font-bold text-[#2d5a3d]">Ndoors</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e2ddd6] bg-white p-8">
          <h1 className="mb-1 font-serif text-2xl font-bold text-[#1a1a18]">
            Set up your profile
          </h1>
          <p className="mb-6 text-sm text-[#777770]">
            Tell us a bit about yourself so candidates know who they&apos;re working with.
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#1a1a18]">
                  First name
                </label>
                <input
                  name="first_name"
                  type="text"
                  required
                  autoFocus
                  className="w-full rounded-xl border border-[#e2ddd6] bg-[#faf8f4] px-3 py-2.5 text-sm text-[#1a1a18] placeholder:text-[#777770] focus:border-[#2d5a3d] focus:outline-none focus:ring-1 focus:ring-[#2d5a3d]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#1a1a18]">
                  Last name
                </label>
                <input
                  name="last_name"
                  type="text"
                  required
                  className="w-full rounded-xl border border-[#e2ddd6] bg-[#faf8f4] px-3 py-2.5 text-sm text-[#1a1a18] placeholder:text-[#777770] focus:border-[#2d5a3d] focus:outline-none focus:ring-1 focus:ring-[#2d5a3d]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#1a1a18]">
                Job title <span className="font-normal text-[#777770]">(optional)</span>
              </label>
              <input
                name="job_title"
                type="text"
                placeholder="e.g. Talent Acquisition Manager"
                className="w-full rounded-xl border border-[#e2ddd6] bg-[#faf8f4] px-3 py-2.5 text-sm text-[#1a1a18] placeholder:text-[#777770] focus:border-[#2d5a3d] focus:outline-none focus:ring-1 focus:ring-[#2d5a3d]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#1a1a18]">
                Company
              </label>
              <input
                name="company_name"
                type="text"
                required
                placeholder="e.g. Klarna AB"
                className="w-full rounded-xl border border-[#e2ddd6] bg-[#faf8f4] px-3 py-2.5 text-sm text-[#1a1a18] placeholder:text-[#777770] focus:border-[#2d5a3d] focus:outline-none focus:ring-1 focus:ring-[#2d5a3d]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#2d5a3d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#24482f] disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Continue to dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
