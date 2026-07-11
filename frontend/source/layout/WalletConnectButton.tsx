'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet } from 'lucide-react';

export function WalletConnectButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const isReady = mounted;
        const isConnected = isReady && Boolean(account) && Boolean(chain);

        if (!isReady) {
          return <div aria-hidden className="h-9 w-28 opacity-0" />;
        }

        if (!isConnected) {
          return (
            <button
              type="button"
              onClick={openConnectModal}
              className="flex items-center gap-2 border border-white/20 px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-neutral-300 transition-colors hover:border-white/40 hover:bg-white/5"
            >
              <Wallet size={16} />
              <span className="hidden sm:inline">Connect</span>
            </button>
          );
        }

        if (chain?.unsupported) {
          return (
            <button
              type="button"
              onClick={openChainModal}
              className="flex items-center gap-2 border border-signal-reverted/50 bg-signal-reverted/10 px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-signal-reverted transition-colors hover:border-signal-reverted"
            >
              Wrong Network
            </button>
          );
        }

        return (
          <button
            type="button"
            onClick={openAccountModal}
            className="flex items-center gap-2 border border-magma-ember bg-magma-ember/10 px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-magma-ember transition-colors hover:bg-magma-ember/20"
          >
            <span className="h-2 w-2 animate-emberPulse rounded-full bg-magma-ember" />
            <span className="hidden sm:inline">{account?.displayName}</span>
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
