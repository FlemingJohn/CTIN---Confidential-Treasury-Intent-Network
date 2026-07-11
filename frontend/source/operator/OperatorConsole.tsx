'use client';

import { useAccount } from 'wagmi';
import { PageShell } from '@/source/layout/PageShell';
import { SectionHeading } from '@/source/shared/SectionHeading';
import { SurfacePanel } from '@/source/shared/SurfacePanel';
import { ActionButton } from '@/source/shared/ActionButton';
import { StatusBadge } from '@/source/shared/StatusBadge';
import { EmptyState } from '@/source/shared/EmptyState';
import { useTreasuryBatches } from '@/source/shared/useTreasuryBatches';
import { useIsOperator } from '@/source/operator/useIsOperator';
import { useOperatorActions } from '@/source/operator/useOperatorActions';

export function OperatorConsole() {
  const { isConnected } = useAccount();
  const { isOperator, operatorAddress } = useIsOperator();
  const { batches, refresh } = useTreasuryBatches();
  const { openBatch, closeBatch, settleBatch, pendingAction, errorMessage } =
    useOperatorActions();

  const handleOpen = async () => {
    await openBatch();
    await refresh();
  };

  const handleClose = async (batchId: bigint) => {
    await closeBatch(batchId);
    await refresh();
  };

  const handleSettle = async (batchId: bigint) => {
    await settleBatch(batchId);
    await refresh();
  };

  return (
    <PageShell>
      <SectionHeading
        overline="Operator console"
        title="Drive the batch lifecycle."
        description="The network operator opens batches for institutions to join, closes them to start netting, and settles them once the residual is executed."
      />

      <SurfacePanel className="mb-6 flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
            Operator
          </span>
          <span className="font-mono text-sm text-white">
            {operatorAddress ?? 'Unknown'}
          </span>
          {isConnected && !isOperator ? (
            <span className="font-mono text-[11px] text-signal-pending">
              Connect the operator wallet to enable actions
            </span>
          ) : null}
        </div>
        <ActionButton variant="primary" disabled={!isOperator || pendingAction === 'open'} onClick={handleOpen}>
          {pendingAction === 'open' ? 'Opening batch' : 'Open new batch'}
        </ActionButton>
      </SurfacePanel>

      {errorMessage ? (
        <p className="mb-4 font-mono text-[11px] text-signal-reverted">{errorMessage}</p>
      ) : null}

      {batches.length === 0 ? (
        <EmptyState
          title="No batches yet"
          description="Open the first batch to let institutions submit confidential intents."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {batches.map((batch) => {
            const batchId = BigInt(batch.batchId);
            return (
              <SurfacePanel
                key={batch.batchId}
                className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-neutral-300">
                    Batch {batch.batchId}
                  </span>
                  <StatusBadge status={batch.status} />
                  <span className="font-mono text-[11px] text-neutral-500">
                    {batch.intents.length} intents
                  </span>
                </div>
                <div className="flex gap-2">
                  <ActionButton
                    variant="outline"
                    disabled={!isOperator || batch.status !== 'open' || pendingAction === 'close'}
                    onClick={() => handleClose(batchId)}
                  >
                    {pendingAction === 'close' ? 'Closing' : 'Close'}
                  </ActionButton>
                  <ActionButton
                    variant="primary"
                    disabled={
                      !isOperator || batch.status !== 'netting' || pendingAction === 'settle'
                    }
                    onClick={() => handleSettle(batchId)}
                  >
                    {pendingAction === 'settle' ? 'Settling' : 'Settle'}
                  </ActionButton>
                </div>
              </SurfacePanel>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
