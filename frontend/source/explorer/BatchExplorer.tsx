import { PageShell } from '@/source/layout/PageShell';
import { SectionHeading } from '@/source/shared/SectionHeading';
import { PublicBatchList } from '@/source/explorer/PublicBatchList';

export function BatchExplorer() {
  return (
    <PageShell>
      <SectionHeading
        overline="Batch explorer"
        title="One opaque footprint, many private intents."
        description="The public sees only the netted residual and its settlement transaction. Attribution, size, and strategy remain confidential."
      />
      <PublicBatchList />
    </PageShell>
  );
}
