import { SectionHeading } from '@/source/shared/SectionHeading';
import { SurfacePanel } from '@/source/shared/SurfacePanel';

const problemPoints = [
  {
    title: 'Strategy leakage',
    detail:
      'Every treasury rebalance is public. Competitors read positions, runway, and counterparties directly from the chain.',
  },
  {
    title: 'Extractable value',
    detail:
      'Sandwich attacks extracted more than 289 million dollars in the first half of 2025 by watching trade size before execution.',
  },
  {
    title: 'Copy trading',
    detail:
      'Large intents are front-run and mirrored, pushing price away before an institution finishes its order.',
  },
];

export function ProblemStatement() {
  return (
    <section className="py-16">
      <SectionHeading
        overline="The problem"
        title="Public treasuries are a glass house."
        description="Institutions avoid moving treasury operations fully on-chain because transparency exposes their entire strategy."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {problemPoints.map((point) => (
          <SurfacePanel key={point.title} className="p-6">
            <h3 className="font-display text-lg font-bold text-white">{point.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">{point.detail}</p>
          </SurfacePanel>
        ))}
      </div>
    </section>
  );
}
