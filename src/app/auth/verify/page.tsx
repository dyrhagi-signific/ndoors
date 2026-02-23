export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0]">
      <div className="mx-auto max-w-sm px-6 text-center">
        {/* Logo mark */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#c8763a]" />
            <span className="font-serif text-lg font-bold text-[#2d5a3d]">Ndoors</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e2ddd6] bg-white p-8">
          {/* Envelope icon */}
          <div className="mb-5 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f0eb]">
              <svg
                className="h-7 w-7 text-[#2d5a3d]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
          </div>

          <h1 className="mb-2 font-serif text-2xl font-bold text-[#1a1a18]">
            Check your email
          </h1>
          <p className="text-sm leading-relaxed text-[#777770]">
            We&apos;ve sent you a magic link. Click it to sign in — no password
            needed. The link expires in 1 hour.
          </p>
        </div>

        <p className="mt-6 text-xs text-[#777770]">
          Didn&apos;t receive it?{' '}
          <a href="/login" className="text-[#2d5a3d] underline underline-offset-2">
            Try again
          </a>
        </p>
      </div>
    </div>
  )
}
