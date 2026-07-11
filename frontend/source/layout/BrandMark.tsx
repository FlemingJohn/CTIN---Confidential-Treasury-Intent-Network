import Link from 'next/link';
import { Flame } from 'lucide-react';

export function BrandMark() {
  return (
    <Link href="/" className="group flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center border border-magma-ember/30 bg-magma-ember/5 transition-colors group-hover:border-magma-ember/70 group-hover:bg-magma-ember/10">
        <Flame size={22} className="text-magma-ember" />
      </div>
      <div className="hidden flex-col leading-none md:flex">
        <span className="font-display text-lg font-bold tracking-tight text-white transition-colors group-hover:text-magma-ember">
          CTIN
        </span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.28em] text-magma-ember/70">
          Confidential Treasury
        </span>
      </div>
    </Link>
  );
}
