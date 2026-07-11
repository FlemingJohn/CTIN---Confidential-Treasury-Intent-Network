import { PageShell } from '@/source/layout/PageShell';
import { LandingHero } from '@/source/landing/LandingHero';
import { ProblemStatement } from '@/source/landing/ProblemStatement';
import { NettingExplainer } from '@/source/landing/NettingExplainer';
import { FeatureGrid } from '@/source/landing/FeatureGrid';
import { CallToAction } from '@/source/landing/CallToAction';

export function LandingPage() {
  return (
    <PageShell>
      <LandingHero />
      <ProblemStatement />
      <NettingExplainer />
      <FeatureGrid />
      <CallToAction />
    </PageShell>
  );
}
