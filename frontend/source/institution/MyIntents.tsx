'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { SurfacePanel } from '@/source/shared/SurfacePanel';
import { ActionButton } from '@/source/shared/ActionButton';
import { EmptyState } from '@/source/shared/EmptyState';
import { assetDecimals } from '@/source/confidential/assetDecimals';
import { useDecryptHandle } from '@/source/confidential/useDecryptHandle';
import {
  readSubmittedIntents,
  submittedIntentsUpdatedEvent,
  SubmittedIntentRecord,
} from '@/source/institution/submittedIntentsStore';

export function MyIntents() {
  const { address } = useAccount();
  const { decryptHandle, isReady } = useDecryptHandle();
  const [records, setRecords] = useState<SubmittedIntentRecord[]>([]);
  const [decryptedByHandle, setDecryptedByHandle] = useState<Record<string, string>>({});
  const [decryptingHandle, setDecryptingHandle] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setRecords([]);
      return;
    }
    const loadRecords = () => setRecords(readSubmittedIntents(address));
    loadRecords();
    window.addEventListener(submittedIntentsUpdatedEvent, loadRecords);
    return () => window.removeEventListener(submittedIntentsUpdatedEvent, loadRecords);
  }, [address]);

  const handleDecrypt = async (record: SubmittedIntentRecord) => {
    setDecryptingHandle(record.handle);
    setErrorMessage(null);
    try {
      const decryptedValue = await decryptHandle(record.handle);
      setDecryptedByHandle((previous) => ({
        ...previous,
        [record.handle]: formatUnits(decryptedValue, assetDecimals[record.asset]),
      }));
    } catch (decryptError) {
      setErrorMessage(
        decryptError instanceof Error ? decryptError.message : 'Failed to decrypt'
      );
    } finally {
      setDecryptingHandle(null);
    }
  };

  if (!address) {
    return (
      <EmptyState
        title="Connect to view your intents"
        description="Your submitted confidential intents appear here, and only you can decrypt their amounts."
      />
    );
  }

  if (records.length === 0) {
    return (
      <EmptyState
        title="No submitted intents"
        description="Submit a confidential intent to see it here. The amount stays encrypted until you decrypt it."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {errorMessage ? (
        <p className="font-mono text-[11px] text-signal-reverted">{errorMessage}</p>
      ) : null}
      {records.map((record) => {
        const decryptedAmount = decryptedByHandle[record.handle];
        return (
          <SurfacePanel
            key={record.handle}
            className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-magma-ember">
                {record.direction} {record.asset} · batch {record.batchId}
              </span>
              <span className="font-mono text-[11px] text-neutral-500">
                {record.handle.slice(0, 12)}…{record.handle.slice(-6)}
              </span>
              {decryptedAmount ? (
                <span className="font-mono text-sm text-signal-settled">
                  Amount {decryptedAmount} {record.asset}
                </span>
              ) : (
                <span className="font-mono text-sm text-neutral-400">Amount encrypted</span>
              )}
            </div>
            <ActionButton
              variant="outline"
              disabled={!isReady || decryptingHandle === record.handle}
              onClick={() => handleDecrypt(record)}
            >
              {decryptingHandle === record.handle
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
