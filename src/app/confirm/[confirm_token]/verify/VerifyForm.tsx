'use client'

import { useState } from 'react'
import { saveLinkedIn } from '@/lib/actions/referents'

interface Props {
  confirmToken: string
  applicantFirstName: string
  existingLinkedIn: string | null
}

export function VerifyForm({ confirmToken, applicantFirstName, existingLinkedIn }: Props) {
  const [linkedinUrl, setLinkedinUrl] = useState(existingLinkedIn ?? '')
  const [linkedinSaved, setLinkedinSaved] = useState(!!existingLinkedIn)
  const [linkedinLoading, setLinkedinLoading] = useState(false)
  const [linkedinError, setLinkedinError] = useState<string | null>(null)

  async function handleLinkedIn(e: React.FormEvent) {
    e.preventDefault()
    setLinkedinLoading(true)
    setLinkedinError(null)
    try {
      await saveLinkedIn(confirmToken, linkedinUrl)
      setLinkedinSaved(true)
    } catch (err) {
      setLinkedinError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLinkedinLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Email */}
      <VerifyOption
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        }
        title="Email"
        description="Confirm you own this email address"
        comingSoon
      />

      {/* LinkedIn */}
      <div className="rounded-xl border border-[#e2ddd6] bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#e8f0eb] text-[#2d5a3d]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-medium text-[#1a1a18]">LinkedIn</p>
              {linkedinSaved && (
                <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </span>
              )}
            </div>
            <p className="text-xs text-[#777770]">Paste your LinkedIn profile URL</p>
            <form onSubmit={handleLinkedIn} className="mt-3 flex gap-2">
              <input
                type="url"
                placeholder="https://linkedin.com/in/your-name"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                required
                className="min-w-0 flex-1 rounded-lg border border-[#e2ddd6] bg-[#faf8f4] px-3 py-2 text-xs placeholder:text-[#aaa] focus:border-[#2d5a3d] focus:outline-none focus:ring-1 focus:ring-[#2d5a3d]"
              />
              <button
                type="submit"
                disabled={linkedinLoading || linkedinSaved}
                className="flex-shrink-0 rounded-lg bg-[#2d5a3d] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#24482f] disabled:opacity-50"
              >
                {linkedinLoading ? '…' : linkedinSaved ? 'Saved' : 'Save'}
              </button>
            </form>
            {linkedinError && (
              <p className="mt-1.5 text-xs text-red-600">{linkedinError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Phone */}
      <VerifyOption
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 9h3" />
          </svg>
        }
        title="Phone"
        description="Verify via SMS code"
        comingSoon
      />

      {/* BankID */}
      <VerifyOption
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        }
        title="BankID"
        description="Verify your national identity — highest trust level"
        badge="Swedish BankID"
        comingSoon
      />

      <p className="pt-1 text-center text-xs text-[#aaa8a2]">
        Helping {applicantFirstName} stand out takes under a minute. Skip if you prefer.
      </p>
    </div>
  )
}

function VerifyOption({
  icon,
  title,
  description,
  badge,
  comingSoon,
}: {
  icon: React.ReactNode
  title: string
  description: string
  badge?: string
  comingSoon?: boolean
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#e2ddd6] bg-white p-4 opacity-60">
      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#f7f5f0] text-[#777770]">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[#1a1a18]">{title}</p>
          {badge && (
            <span className="rounded-full bg-[#e8f0eb] px-2 py-0.5 text-[10px] font-semibold text-[#2d5a3d]">
              {badge}
            </span>
          )}
          {comingSoon && (
            <span className="rounded-full bg-[#f0ede8] px-2 py-0.5 text-[10px] font-semibold text-[#777770]">
              Coming soon
            </span>
          )}
        </div>
        <p className="text-xs text-[#777770]">{description}</p>
      </div>
    </div>
  )
}
