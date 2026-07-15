export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-black/[0.06] px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <p className="text-[17px] font-semibold tracking-tight text-[var(--label)]">
            Universal Rating
          </p>
          <p className="text-[13px] text-[var(--secondary-label)]">Mock auth ready</p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16">
        <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-[var(--secondary-label)]">
          Phase 0
        </p>
        <h1 className="mt-3 text-[34px] font-semibold leading-tight tracking-tight text-[var(--label)]">
          Universal Rating
        </h1>
        <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-[var(--secondary-label)]">
          Evaluate any instance anonymously in public. Every write is attributed
          with a real identity in the audit trail. Development environment is
          ready — waiting for your next instruction.
        </p>
        <ul className="mt-10 space-y-3 text-[15px] text-[var(--label)]">
          <li className="flex gap-3">
            <span className="text-[var(--system-blue)]">✓</span>
            Next.js + TypeScript + Tailwind
          </li>
          <li className="flex gap-3">
            <span className="text-[var(--system-blue)]">✓</span>
            AGENT.md / CLAUDE.md / initial plan
          </li>
          <li className="flex gap-3">
            <span className="text-[var(--system-blue)]">✓</span>
            Local mock accounts (Supabase deferred)
          </li>
        </ul>
      </main>
    </div>
  );
}
