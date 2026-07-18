'use client';

import { useState } from 'react';
import { keccak256, toBytes } from 'viem';
import { useWriteContract } from 'wagmi';
import { intentNetworkAbi } from '@/source/contracts/intentNetworkAbi';
import { intentNetworkAddress } from '@/source/contracts/contractAddresses';
import { useTransactionRunner, sepoliaTransactionUrl } from '@/source/shared/useTransactionRunner';
import { friendlyError } from '@/source/shared/friendlyError';

type OperatorAction = 'open' | 'close' | 'settle';

const actionLabels: Record<OperatorAction, { pending: string; success: string }> = {
  open: { pending: 'Opening batch', success: 'Batch opened' },
  close: { pending: 'Closing batch', success: 'Batch closed' },
  settle: { pending: 'Settling batch', success: 'Batch settled' },
};

export function useOperatorActions() {
  const { writeContractAsync } = useWriteContract();
  const { run } = useTransactionRunner();
  const [pendingAction, setPendingAction] = useState<OperatorAction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requireNetworkAddress = () => {
    if (!intentNetworkAddress) {
      throw new Error('Intent network contract address is not configured');
    }
    return intentNetworkAddress;
  };

  const perform = async (action: OperatorAction, execute: () => Promise<`0x${string}`>) => {
    setPendingAction(action);
    setErrorMessage(null);
    try {
      return await run({
        pending: actionLabels[action].pending,
        success: actionLabels[action].success,
        linkFromResult: (value: `0x${string}`) => sepoliaTransactionUrl(value),
        action: execute,
      });
    } catch (actionError) {
      setErrorMessage(friendlyError(actionError));
      throw actionError;
    } finally {
      setPendingAction(null);
    }
  };

  const openBatch = () =>
    perform('open', () =>
      writeContractAsync({
        address: requireNetworkAddress(),
        abi: intentNetworkAbi,
        functionName: 'openBatch',
        args: [],
      })
    );

  const closeBatch = (batchId: bigint) =>
    perform('close', () =>
      writeContractAsync({
        address: requireNetworkAddress(),
        abi: intentNetworkAbi,
        functionName: 'closeBatch',
        args: [batchId],
      })
    );

  const settleBatch = (batchId: bigint) =>
    perform('settle', () => {
      const settlementReference = keccak256(toBytes(`settlement-${batchId}-${Date.now()}`));
      return writeContractAsync({
        address: requireNetworkAddress(),
        abi: intentNetworkAbi,
        functionName: 'settleBatch',
        args: [batchId, settlementReference],
      });
    });

  return { openBatch, closeBatch, settleBatch, pendingAction, errorMessage };
}
