export type BatchStatus = 'open' | 'netting' | 'executing' | 'settled' | 'reverted';

export const batchStatusLabels: Record<BatchStatus, string> = {
  open: 'Open',
  netting: 'Netting',
  executing: 'Executing',
  settled: 'Settled',
  reverted: 'Reverted',
};

export const batchStatusColorClasses: Record<BatchStatus, string> = {
  open: 'text-signal-pending border-signal-pending/40 bg-signal-pending/10',
  netting: 'text-magma-core border-magma-core/40 bg-magma-core/10',
  executing: 'text-magma-ember border-magma-ember/40 bg-magma-ember/10',
  settled: 'text-signal-settled border-signal-settled/40 bg-signal-settled/10',
  reverted: 'text-signal-reverted border-signal-reverted/40 bg-signal-reverted/10',
};
