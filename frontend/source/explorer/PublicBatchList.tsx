'use client';

import { useTreasuryStore } from '@/source/shared/treasuryStore';
import { SurfacePanel } from '@/source/shared/SurfacePanel';
import { StatusBadge } from '@/source/shared/StatusBadge';
import { EmptyState } from '@/source/shared/EmptyState';

export function PublicBatchList() {
  const batches = useTreasuryStore((state) => state.batches);

  if (batches.length === 0) {
    return (
      <EmptyState
        title="No public activity yet"
        description="Settled batches show only their single opaque on-chain footprint here. Per-party detail stays confidential."
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
          <div className="mt-4 flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              Public footprint
            </span>
            <span className="font-display text-lg font-bold text-magma-glow">
              {batch.netResidualDescription ?? 'Confidential residual'}
            </span>
            <span className="font-mono text-xs text-neutral-500">
              {batch.settlementTransactionHash
                ? batch.settlementTransactionHash
                : 'Awaiting settlement'}
            </span>
          </div>
        </SurfacePanel>
      ))}
    </div>
  );
}
