import { ReactNode } from 'react';
import { MagmaFissureBackground } from '@/source/background/MagmaFissureBackground';
import { NavigationBar } from '@/source/layout/NavigationBar';

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <MagmaFissureBackground />
      <div className="relative z-10">
        <NavigationBar />
        <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-10">{children}</main>
      </div>
    </div>
  );
}
