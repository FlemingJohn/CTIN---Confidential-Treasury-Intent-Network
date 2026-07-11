'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { intentNetworkAbi } from '@/source/contracts/intentNetworkAbi';
import {
  deploymentStartBlock,
  intentNetworkAddress,
} from '@/source/contracts/contractAddresses';
import { BatchStatus } from '@/source/shared/batchStatus';
import { ConfidentialIntent, TreasuryBatch } from '@/source/shared/treasuryDomain';

const batchStatusByIndex: BatchStatus[] = [
  'open',
  'netting',
  'executing',
  'settled',
  'reverted',
];

export function useTreasuryBatches() {
  const publicClient = usePublicClient();
  const [batches, setBatches] = useState<TreasuryBatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadBatches = useCallback(async () => {
    if (!publicClient || !intentNetworkAddress) {
      setBatches([]);
      return;
    }

    setIsLoading(true);
    try {
      const openedLogs = await publicClient.getContractEvents({
        address: intentNetworkAddress,
        abi: intentNetworkAbi,
        eventName: 'BatchOpened',
        fromBlock: deploymentStartBlock,
        toBlock: 'latest',
      });
      const intentLogs = await publicClient.getContractEvents({
        address: intentNetworkAddress,
        abi: intentNetworkAbi,
        eventName: 'IntentSubmitted',
        fromBlock: deploymentStartBlock,
        toBlock: 'latest',
      });
      const settledLogs = await publicClient.getContractEvents({
        address: intentNetworkAddress,
        abi: intentNetworkAbi,
        eventName: 'BatchSettled',
        fromBlock: deploymentStartBlock,
        toBlock: 'latest',
      });

      const statusResults = await publicClient.multicall({
        contracts: openedLogs.map((openedLog) => ({
          address: intentNetworkAddress as `0x${string}`,
          abi: intentNetworkAbi,
          functionName: 'batchStatusOf' as const,
          args: [openedLog.args.batchId as bigint],
        })),
      });

      const nextBatches: TreasuryBatch[] = openedLogs.map((openedLog, index) => {
        const batchId = openedLog.args.batchId as bigint;
        const statusResult = statusResults[index];
        const statusIndex =
          statusResult && statusResult.status === 'success' ? Number(statusResult.result) : 0;

        const intents: ConfidentialIntent[] = intentLogs
          .filter((intentLog) => (intentLog.args.batchId as bigint) === batchId)
          .map((intentLog, intentIndex) => ({
            intentId: `${batchId.toString()}-${intentIndex}`,
            institutionAddress: intentLog.args.institution as string,
            direction: (intentLog.args.isBuy as boolean) ? 'buy' : 'sell',
            assetIn: 'USDC',
            assetOut: 'ETH',
            encryptedAmountHandle: '',
            submittedAtIso: '',
          }));

        const settledLog = settledLogs.find(
          (candidate) => (candidate.args.batchId as bigint) === batchId
        );

        return {
          batchId: batchId.toString(),
          status: batchStatusByIndex[statusIndex] ?? 'open',
          openedAtIso: new Date(
            Number(openedLog.args.openedAtTimestamp as bigint) * 1000
          ).toISOString(),
          intents,
          netResidualDescription: null,
          settlementTransactionHash: settledLog ? settledLog.transactionHash : null,
          receipts: [],
        };
      });

      nextBatches.sort((first, second) =>
        Number(BigInt(second.batchId) - BigInt(first.batchId))
      );
      setBatches(nextBatches);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  const openBatch = batches.find((batch) => batch.status === 'open');
  const openBatchId = openBatch ? BigInt(openBatch.batchId) : null;

  return { batches, openBatchId, isLoading, refresh: loadBatches };
}
