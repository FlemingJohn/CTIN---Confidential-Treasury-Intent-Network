import { PageShell } from '@/source/layout/PageShell';
import { SectionHeading } from '@/source/shared/SectionHeading';
import { IntentComposer } from '@/source/institution/IntentComposer';
import { InstitutionBatchList } from '@/source/institution/InstitutionBatchList';

export function InstitutionConsole() {
  return (
    <PageShell>
      <SectionHeading
        overline="Institution console"
        title="Submit and track confidential intents."
        description="Compose an encrypted intent, join the next open batch, and follow settlement without exposing your position."
      />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <IntentComposer />
        <div className="flex flex-col gap-4">
          <InstitutionBatchList />
        </div>
      </div>
    </PageShell>
  );
}
