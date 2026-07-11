'use client';

import { BrandMark } from '@/source/layout/BrandMark';
import { NavigationLink } from '@/source/layout/NavigationLink';
import { WalletConnectButton } from '@/source/layout/WalletConnectButton';
import { navigationDestinations } from '@/source/layout/navigationDestinations';

export function NavigationBar() {
  return (
    <nav className="sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b border-white/10 bg-obsidian-base/80 px-4 backdrop-blur-md md:px-10">
      <BrandMark />
      <div className="flex items-center gap-2 md:gap-6">
        <div className="flex items-center gap-1">
          {navigationDestinations.map((destination) => (
            <NavigationLink key={destination.href} destination={destination} />
          ))}
        </div>
        <div className="hidden h-8 w-px bg-white/10 md:block" />
        <WalletConnectButton />
      </div>
    </nav>
  );
}
