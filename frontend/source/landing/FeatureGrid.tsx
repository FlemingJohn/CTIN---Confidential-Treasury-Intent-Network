import { SectionHeading } from '@/source/shared/SectionHeading';
import { SurfacePanel } from '@/source/shared/SurfacePanel';
import { featureDefinitions } from '@/source/landing/featureDefinitions';

export function FeatureGrid() {
  return (
    <section className="py-16">
      <SectionHeading
        overline="Capabilities"
        title="Confidential, composable, auditable."
        description="Built on unmodified Safe and Uniswap. Nox provides the confidential compute layer."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {featureDefinitions.map((feature) => {
          const Icon = feature.icon;
          return (
            <SurfacePanel key={feature.title} className="p-6">
              <div className="flex h-10 w-10 items-center justify-center border border-magma-ember/30 bg-magma-ember/5">
                <Icon size={18} className="text-magma-ember" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{feature.detail}</p>
            </SurfacePanel>
          );
        })}
      </div>
    </section>
  );
}
