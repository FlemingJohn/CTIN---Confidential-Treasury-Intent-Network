'use client';

import { SurfacePanel } from '@/source/shared/SurfacePanel';
import { StatusBadge } from '@/source/shared/StatusBadge';
import { EmptyState } from '@/source/shared/EmptyState';
import { useTreasuryBatches } from '@/source/shared/useTreasuryBatches';

export function InstitutionBatchList() {
  const { batches } = useTreasuryBatches();

  if (batches.length === 0) {
    return (
      <EmptyState
        title="No batches yet"
        description="Submit a confidential intent to join the next open batch. Batches appear here once the network registers them from Sepolia."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {batches.map((batch) => (
        <SurfacePanel key={batch.batchId} className="p-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-neutral-300">Batch {batch.batchId}</span>
            <StatusBadge status={batch.status} />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <BatchMetric label="Intents" value={String(batch.intents.length)} />
            <BatchMetric
              label="Net residual"
              value={batch.netResidualDescription ?? 'Confidential'}
            />
            <BatchMetric
              label="Settlement"
              value={batch.settlementTransactionHash ? 'Confirmed' : 'Pending'}
            />
          </div>
        </SurfacePanel>
      ))}
    </div>
  );
}

function BatchMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
        {label}
      </span>
      <span className="font-display text-lg font-bold text-white">{value}</span>
    </div>
  );
}
