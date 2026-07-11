'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { SurfacePanel } from '@/source/shared/SurfacePanel';
import { ActionButton } from '@/source/shared/ActionButton';
import {
  IntentDirection,
  SupportedAsset,
} from '@/source/shared/treasuryDomain';

const assetOptions: SupportedAsset[] = ['ETH', 'USDC'];

export function IntentComposer() {
  const { address, isConnected } = useAccount();
  const [direction, setDirection] = useState<IntentDirection>('buy');
  const [asset, setAsset] = useState<SupportedAsset>('ETH');
  const [amount, setAmount] = useState('');

  const isSubmitEnabled = isConnected && amount.trim().length > 0;

  return (
    <SurfacePanel className="p-6">
      <h3 className="font-display text-lg font-bold text-white">Compose confidential intent</h3>
      <p className="mt-2 text-sm text-neutral-400">
        The amount is encrypted on your device before it reaches the network.
      </p>

      <div className="mt-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
            Direction
          </span>
          <div className="flex gap-2">
            {(['buy', 'sell'] as IntentDirection[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDirection(option)}
                className={
                  option === direction
                    ? 'flex-1 border border-magma-ember bg-magma-ember/15 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-magma-glow'
                    : 'flex-1 border border-obsidian-border px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-neutral-400 hover:border-white/30'
                }
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
            Asset
          </span>
          <div className="flex gap-2">
            {assetOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setAsset(option)}
                className={
                  option === asset
                    ? 'flex-1 border border-magma-ember bg-magma-ember/15 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-magma-glow'
                    : 'flex-1 border border-obsidian-border px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-neutral-400 hover:border-white/30'
                }
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
            Amount
          </span>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
            placeholder="0.0"
            className="border border-obsidian-border bg-obsidian-raised px-4 py-3 font-mono text-sm text-white outline-none focus:border-magma-ember"
          />
        </div>

        <ActionButton variant="primary" disabled={!isSubmitEnabled}>
          {isConnected ? 'Encrypt and submit intent' : 'Connect wallet to submit'}
        </ActionButton>

        {isConnected ? (
          <span className="font-mono text-[11px] text-neutral-500">
            Submitting as {address}
          </span>
        ) : null}
      </div>
    </SurfacePanel>
  );
}
