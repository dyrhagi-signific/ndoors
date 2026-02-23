import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      {/* Nav */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#c8763a]" />
          <span className="font-serif text-xl font-bold text-[#2d5a3d]">Ndoors</span>
        </div>
        <Link
          href="/login"
          className="rounded-xl border border-[#e2ddd6] bg-white px-4 py-2 text-sm font-medium text-[#1a1a18] transition hover:border-[#2d5a3d]"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-20 pt-16 text-center">
        <h1 className="mb-5 font-serif text-5xl font-bold leading-tight tracking-tight text-[#1a1a18] sm:text-6xl">
          Reference checks,<br />
          <span className="text-[#2d5a3d]">without the chase.</span>
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-[#777770]">
          Ndoors makes it simple for recruiters to collect and verify references.
          Candidates submit their contacts, referents confirm in one click.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-xl bg-[#2d5a3d] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#24482f]"
        >
          Get started free
        </Link>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="mb-10 text-center font-serif text-2xl font-bold text-[#1a1a18]">
          How it works
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={i} className="rounded-2xl border border-[#e2ddd6] bg-white p-6">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f0eb] text-sm font-bold text-[#2d5a3d]">
                {i + 1}
              </div>
              <h3 className="mb-1.5 font-semibold text-[#1a1a18]">{step.title}</h3>
              <p className="text-sm leading-relaxed text-[#777770]">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={i} className="rounded-2xl bg-[#2d5a3d] p-6 text-white">
              <div className="mb-3">{f.icon}</div>
              <h3 className="mb-1.5 font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-[#a8c4b0]">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e2ddd6] bg-white px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#c8763a]" />
            <span className="font-serif text-sm font-bold text-[#2d5a3d]">Ndoors</span>
          </div>
          <p className="text-xs text-[#777770]">
            <Link href="/privacy" className="hover:text-[#2d5a3d] hover:underline underline-offset-2">
              Privacy policy
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}

const STEPS = [
  {
    title: 'Post a role',
    body: 'Create a job in seconds and share the unique invite link with your candidate.',
  },
  {
    title: 'Candidate submits referents',
    body: 'They add 1–3 people who can speak to their work. No account needed.',
  },
  {
    title: 'Referents confirm',
    body: 'Each referent gets an email and confirms or declines with a single click.',
  },
]

const FEATURES = [
  {
    title: 'GDPR-ready',
    body: "Built for the Swedish market. Contact details are only shared with the recruiter after the referent actively confirms.",
    icon: (
      <svg className="h-5 w-5 text-[#a8c4b0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 12c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286z" />
      </svg>
    ),
  },
  {
    title: 'Zero friction for candidates',
    body: 'Candidates and referents never need to create an account. Just a link and a click.',
    icon: (
      <svg className="h-5 w-5 text-[#a8c4b0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
  },
  {
    title: 'Live status tracking',
    body: 'See all your open roles and where each reference stands — sent, confirmed, or declined.',
    icon: (
      <svg className="h-5 w-5 text-[#a8c4b0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
]
