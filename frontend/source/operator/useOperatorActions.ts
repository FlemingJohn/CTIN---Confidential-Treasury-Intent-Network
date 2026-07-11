'use client';

import { useState } from 'react';
import { keccak256, toBytes } from 'viem';
import { useWriteContract } from 'wagmi';
import { intentNetworkAbi } from '@/source/contracts/intentNetworkAbi';
import { intentNetworkAddress } from '@/source/contracts/contractAddresses';

type OperatorAction = 'open' | 'close' | 'settle';

export function useOperatorActions() {
  const { writeContractAsync } = useWriteContract();
  const [pendingAction, setPendingAction] = useState<OperatorAction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requireNetworkAddress = () => {
    if (!intentNetworkAddress) {
      throw new Error('Intent network contract address is not configured');
    }
    return intentNetworkAddress;
  };

  const run = async (action: OperatorAction, execute: () => Promise<`0x${string}`>) => {
    setPendingAction(action);
    setErrorMessage(null);
    try {
      return await execute();
    } catch (actionError) {
      setErrorMessage(
        actionError instanceof Error ? actionError.message : 'Operator action failed'
      );
      throw actionError;
    } finally {
      setPendingAction(null);
    }
  };

  const openBatch = () =>
    run('open', () =>
      writeContractAsync({
        address: requireNetworkAddress(),
        abi: intentNetworkAbi,
        functionName: 'openBatch',
        args: [],
      })
    );

  const closeBatch = (batchId: bigint) =>
    run('close', () =>
      writeContractAsync({
        address: requireNetworkAddress(),
        abi: intentNetworkAbi,
        functionName: 'closeBatch',
        args: [batchId],
      })
    );

  const settleBatch = (batchId: bigint) =>
    run('settle', () => {
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
