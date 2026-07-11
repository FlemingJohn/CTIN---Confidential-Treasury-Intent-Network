import clsx from 'clsx';
import {
  BatchStatus,
  batchStatusColorClasses,
  batchStatusLabels,
} from '@/source/shared/batchStatus';

export function StatusBadge({ status }: { status: BatchStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em]',
        batchStatusColorClasses[status]
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {batchStatusLabels[status]}
    </span>
  );
}
