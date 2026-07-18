'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { SurfacePanel } from '@/source/shared/SurfacePanel';
import { ActionButton } from '@/source/shared/ActionButton';
import { EmptyState } from '@/source/shared/EmptyState';
import { useDecryptHandle } from '@/source/confidential/useDecryptHandle';
import { useDisclosedIntents } from '@/source/auditor/useDisclosedIntents';
import { useComplianceReport } from '@/source/auditor/useComplianceReport';

export function DisclosedIntents() {
  const { address } = useAccount();
  const { intents } = useDisclosedIntents();
  const { decryptHandle, isReady } = useDecryptHandle();
  const { exportReport } = useComplianceReport();
  const [decryptedByHandle, setDecryptedByHandle] = useState<Record<string, string>>({});
  const [decryptingHandle, setDecryptingHandle] = useState<string | null>(null);

  const decryptedIntents = intents
    .filter((intent) => decryptedByHandle[intent.handle] !== undefined)
    .map((intent) => ({
      institution: intent.institution,
      batchId: intent.batchId,
      direction: intent.direction,
      handle: intent.handle,
      amount: decryptedByHandle[intent.handle],
    }));

  const handleDecrypt = async (handle: string) => {
    setDecryptingHandle(handle);
    try {
      const value = await decryptHandle(handle);
      setDecryptedByHandle((previous) => ({ ...previous, [handle]: formatUnits(value, 18) }));
    } finally {
      setDecryptingHandle(null);
    }
  };

  if (!address) {
    return (
      <EmptyState
        title="Connect as an auditor"
        description="Connect your auditor wallet to see the confidential intents institutions have disclosed to you."
      />
    );
  }

  if (intents.length === 0) {
    return (
      <EmptyState
        title="No disclosed intents"
        description="When an institution authorizes your address, their confidential intents appear here for you to decrypt."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {decryptedIntents.length > 0 ? (
        <div className="flex items-center justify-between border border-obsidian-border bg-obsidian-panel/60 p-4">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
            {decryptedIntents.length} decrypted · signed report
          </span>
          <ActionButton variant="primary" onClick={() => exportReport(decryptedIntents)}>
            Export compliance report
          </ActionButton>
        </div>
      ) : null}
      {intents.map((intent) => {
        const decryptedAmount = decryptedByHandle[intent.handle];
        return (
          <SurfacePanel
            key={`${intent.batchId}-${intent.handle}`}
            className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-magma-ember">
                {intent.direction} · batch {intent.batchId}
              </span>
              <span className="font-mono text-[11px] text-neutral-500">{intent.institution}</span>
              {decryptedAmount ? (
                <span className="font-mono text-sm text-signal-settled">Amount {decryptedAmount}</span>
              ) : (
                <span className="font-mono text-sm text-neutral-400">Amount encrypted</span>
              )}
            </div>
            <ActionButton
              variant="outline"
              disabled={!isReady || decryptingHandle === intent.handle}
              onClick={() => handleDecrypt(intent.handle)}
            >
              {decryptingHandle === intent.handle
                ? 'Decrypting'
                : decryptedAmount
                  ? 'Decrypt again'
                  : 'Decrypt'}
            </ActionButton>
          </SurfacePanel>
        );
      })}
    </div>
  );
}
