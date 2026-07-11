import Link from 'next/link';
import { ActionButton } from '@/source/shared/ActionButton';
import { SurfacePanel } from '@/source/shared/SurfacePanel';

export function CallToAction() {
  return (
    <section className="py-16">
      <SurfacePanel className="flex flex-col items-center gap-6 border-magma-ember/30 px-8 py-16 text-center">
        <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
          Run your treasury without showing your hand.
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-neutral-400">
          Connect a Safe on Sepolia, submit an encrypted intent, and settle it inside a
          confidential batch.
        </p>
        <Link href="/institution">
          <ActionButton variant="primary">Launch Console</ActionButton>
        </Link>
      </SurfacePanel>
    </section>
  );
}
