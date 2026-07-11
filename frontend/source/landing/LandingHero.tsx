import Link from 'next/link';
import { ActionButton } from '@/source/shared/ActionButton';

export function LandingHero() {
  return (
    <section className="flex flex-col items-start gap-8 py-16 md:py-24">
      <span className="border border-magma-ember/30 bg-magma-ember/5 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.28em] text-magma-ember">
        Confidential Treasury Intent Network
      </span>
      <h1 className="max-w-4xl font-display text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">
        The confidential execution layer for institutional treasuries.
      </h1>
      <p className="max-w-2xl text-base leading-relaxed text-neutral-400 md:text-lg">
        Institutions submit encrypted intents. The network nets them privately, executes a
        single opaque trade on Uniswap, and returns confidential receipts. Strategy stays
        hidden. Custody stays in Safe. Auditors keep full visibility on demand.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/institution">
          <ActionButton variant="primary">Open Institution Console</ActionButton>
        </Link>
        <Link href="/explorer">
          <ActionButton variant="outline">View Batch Explorer</ActionButton>
        </Link>
      </div>
    </section>
  );
}
