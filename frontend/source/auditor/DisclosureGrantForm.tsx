'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { SurfacePanel } from '@/source/shared/SurfacePanel';
import { ActionButton } from '@/source/shared/ActionButton';
import { useDisclosureGrants } from '@/source/auditor/useDisclosureGrants';

export function DisclosureGrantForm() {
  const { isConnected } = useAccount();
  const { grantDisclosure, refresh } = useDisclosureGrants();
  const [auditorAddress, setAuditorAddress] = useState('');
  const [isGranting, setIsGranting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isGrantEnabled = isConnected && auditorAddress.trim().length > 0 && !isGranting;

  const handleGrant = async () => {
    setIsGranting(true);
    setErrorMessage(null);
    try {
      await grantDisclosure(auditorAddress.trim());
      setAuditorAddress('');
      await refresh();
    } catch (grantError) {
      setErrorMessage(
        grantError instanceof Error ? grantError.message : 'Failed to grant disclosure'
      );
    } finally {
      setIsGranting(false);
    }
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
          {isGranting ? 'Granting disclosure' : 'Grant disclosure'}
        </ActionButton>
        {!isConnected ? (
          <span className="font-mono text-[11px] text-neutral-500">
            Connect a wallet to grant disclosure
          </span>
        ) : null}
        {errorMessage ? (
          <span className="font-mono text-[11px] text-signal-reverted">{errorMessage}</span>
        ) : null}
      </div>
    </SurfacePanel>
  );
}
