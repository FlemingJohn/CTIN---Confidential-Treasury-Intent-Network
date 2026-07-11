import { ReactNode } from 'react';
import { SurfacePanel } from '@/source/shared/SurfacePanel';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <SurfacePanel className="flex flex-col items-center gap-3 px-8 py-16 text-center">
      <h3 className="font-display text-lg font-bold text-white">{title}</h3>
      <p className="max-w-md text-sm leading-relaxed text-neutral-400">{description}</p>
      {action}
    </SurfacePanel>
  );
}
