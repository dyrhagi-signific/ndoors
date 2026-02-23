import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('first_name, last_name')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) redirect('/onboarding')

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      {/* Top nav */}
      <header className="border-b border-[#e2ddd6] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#c8763a]" />
            <span className="font-serif text-lg font-bold text-[#2d5a3d]">Ndoors</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2d5a3d] text-xs font-semibold text-white">
              {profile.first_name[0]}{profile.last_name[0]}
            </div>
            <span className="hidden text-sm text-[#777770] sm:block">
              {profile.first_name} {profile.last_name}
            </span>
            <form action={async () => { 'use server'; await signOut() }}>
              <button
                type="submit"
                className="rounded-lg border border-[#e2ddd6] px-3 py-1.5 text-xs font-medium text-[#777770] transition hover:border-[#ccc] hover:text-[#1a1a18]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {children}
      </main>
    </div>
  )
}
