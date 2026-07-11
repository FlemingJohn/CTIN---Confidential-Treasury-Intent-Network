'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { SurfacePanel } from '@/source/shared/SurfacePanel';
import { ActionButton } from '@/source/shared/ActionButton';
import { useTreasuryStore } from '@/source/shared/treasuryStore';

export function DisclosureGrantForm() {
  const { address, isConnected } = useAccount();
  const addDisclosureGrant = useTreasuryStore((state) => state.addDisclosureGrant);
  const [auditorAddress, setAuditorAddress] = useState('');

  const isGrantEnabled = isConnected && auditorAddress.trim().length > 0;

  const handleGrant = () => {
    if (!address) {
      return;
    }
    addDisclosureGrant({
      grantId: `${address}-${auditorAddress}-${Date.now()}`,
      institutionAddress: address,
      auditorAddress: auditorAddress.trim(),
      createdAtIso: new Date().toISOString(),
    });
    setAuditorAddress('');
  };

  return (
    <SurfacePanel className="p-6">
      <h3 className="font-display text-lg font-bold text-white">Grant disclosure access</h3>
      <p className="mt-2 text-sm text-neutral-400">
        Authorize an auditor address to decrypt your confidential receipts. Nothing else is
        exposed.
      </p>
      <div className="mt-6 flex flex-col gap-4">
        <input
          value={auditorAddress}
          onChange={(event) => setAuditorAddress(event.target.value)}
          placeholder="0xAuditorAddress"
          className="border border-obsidian-border bg-obsidian-raised px-4 py-3 font-mono text-sm text-white outline-none focus:border-magma-ember"
        />
        <ActionButton variant="primary" disabled={!isGrantEnabled} onClick={handleGrant}>
          {isConnected ? 'Grant disclosure' : 'Connect wallet to grant'}
        </ActionButton>
      </div>
    </SurfacePanel>
  );
}
