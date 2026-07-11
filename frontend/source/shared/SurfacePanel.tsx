import { ReactNode } from 'react';
import clsx from 'clsx';

export function SurfacePanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'border border-obsidian-border bg-obsidian-panel/70 backdrop-blur-sm',
        className
      )}
    >
      {children}
    </div>
  );
}
