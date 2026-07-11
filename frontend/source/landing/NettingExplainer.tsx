import { SectionHeading } from '@/source/shared/SectionHeading';
import { SurfacePanel } from '@/source/shared/SurfacePanel';

const incomingIntents = [
  { institution: 'Institution A', action: 'Buy 400 ETH' },
  { institution: 'Institution B', action: 'Sell 350 ETH' },
  { institution: 'Institution C', action: 'Buy 100 ETH' },
];

export function NettingExplainer() {
  return (
    <section className="py-16">
      <SectionHeading
        overline="How it works"
        title="Hide the whole strategy, not one transaction."
        description="Encrypted intents are netted homomorphically before anything touches the market. Only the residual reaches Uniswap."
      />
      <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <SurfacePanel className="p-6">
          <span className="font-mono text-xs uppercase tracking-[0.24em] text-neutral-500">
            Encrypted intents submitted
          </span>
          <div className="mt-4 flex flex-col gap-3">
            {incomingIntents.map((intent) => (
              <div
                key={intent.institution}
                className="flex items-center justify-between border border-obsidian-border bg-obsidian-raised px-4 py-3"
              >
                <span className="font-mono text-sm text-neutral-300">
                  {intent.institution}
                </span>
                <span className="font-mono text-sm text-magma-ember">{intent.action}</span>
              </div>
            ))}
          </div>
        </SurfacePanel>

        <div className="flex items-center justify-center py-4">
          <span className="font-mono text-xs uppercase tracking-[0.24em] text-magma-ember">
            Net
          </span>
        </div>

        <SurfacePanel className="border-magma-ember/40 p-6">
          <span className="font-mono text-xs uppercase tracking-[0.24em] text-neutral-500">
            Single opaque execution
          </span>
          <div className="mt-4 border border-magma-ember/40 bg-magma-ember/5 px-4 py-6 text-center">
            <span className="font-display text-4xl font-bold text-magma-glow">
              Buy 150 ETH
            </span>
            <p className="mt-3 text-sm text-neutral-400">
              850 ETH of intent becomes one on-chain footprint. Nobody sees who traded or how
              much.
            </p>
          </div>
        </SurfacePanel>
      </div>
    </section>
  );
}
