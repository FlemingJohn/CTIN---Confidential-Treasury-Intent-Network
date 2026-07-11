import { PageShell } from '@/source/layout/PageShell';
import { SectionHeading } from '@/source/shared/SectionHeading';
import { IntentComposer } from '@/source/institution/IntentComposer';
import { InstitutionBatchList } from '@/source/institution/InstitutionBatchList';
import { MyIntents } from '@/source/institution/MyIntents';

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

      <div className="mt-12">
        <SectionHeading
          overline="Your confidential intents"
          title="Decrypt what only you can read."
          description="Each submitted amount is encrypted on-chain. You can decrypt your own figures here through the Nox access control list."
        />
        <MyIntents />
      </div>
    </PageShell>
  );
}
