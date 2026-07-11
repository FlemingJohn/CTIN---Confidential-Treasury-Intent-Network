'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import type { NavigationDestination } from '@/source/layout/navigationDestinations';

export function NavigationLink({ destination }: { destination: NavigationDestination }) {
  const currentPath = usePathname();
  const isActive = currentPath === destination.href;
  const Icon = destination.icon;

  return (
    <Link
      href={destination.href}
      className={clsx(
        'flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-colors',
        isActive
          ? 'border-b-2 border-magma-ember bg-white/5 text-magma-ember'
          : 'text-obsidian-border/0 text-neutral-500 hover:bg-white/5 hover:text-neutral-200'
      )}
    >
      <Icon size={16} />
      <span className="hidden sm:inline">{destination.label}</span>
    </Link>
  );
}
