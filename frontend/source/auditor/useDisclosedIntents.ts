'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { intentNetworkAbi } from '@/source/contracts/intentNetworkAbi';
import { intentNetworkAddress, deploymentStartBlock } from '@/source/contracts/contractAddresses';

export interface DisclosedIntent {
  batchId: string;
  institution: string;
  direction: 'buy' | 'sell';
  handle: string;
}

export function useDisclosedIntents() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [intents, setIntents] = useState<DisclosedIntent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!publicClient || !intentNetworkAddress || !address) {
      setIntents([]);
      return;
    }
    setIsLoading(true);
    try {
      const authorizedLogs = await publicClient.getContractEvents({
        address: intentNetworkAddress,
        abi: intentNetworkAbi,
        eventName: 'AuditorAuthorized',
        args: { auditor: address },
        fromBlock: deploymentStartBlock,
        toBlock: 'latest',
      });

      const authorizationBlockByInstitution = new Map<string, bigint>();
      for (const authorizedLog of authorizedLogs) {
        const institution = (authorizedLog.args.institution as string).toLowerCase();
        const blockNumber = authorizedLog.blockNumber as bigint;
        const existing = authorizationBlockByInstitution.get(institution);
        if (existing === undefined || blockNumber < existing) {
          authorizationBlockByInstitution.set(institution, blockNumber);
        }
      }

      const institutions = Array.from(
        new Set(authorizedLogs.map((authorizedLog) => authorizedLog.args.institution as string))
      );
      if (institutions.length === 0) {
        setIntents([]);
        return;
      }

      const currentAuditors = await publicClient.multicall({
        contracts: institutions.map((institution) => ({
          address: intentNetworkAddress as `0x${string}`,
          abi: intentNetworkAbi,
          functionName: 'auditorOf' as const,
          args: [institution as `0x${string}`],
        })),
      });

      const activeInstitutions = new Set(
        institutions
          .filter((_, index) => {
            const result = currentAuditors[index];
            return (
              result &&
              result.status === 'success' &&
              (result.result as string).toLowerCase() === address.toLowerCase()
            );
          })
          .map((institution) => institution.toLowerCase())
      );
      if (activeInstitutions.size === 0) {
        setIntents([]);
        return;
      }

      const intentLogs = await publicClient.getContractEvents({
        address: intentNetworkAddress,
        abi: intentNetworkAbi,
        eventName: 'IntentSubmitted',
        fromBlock: deploymentStartBlock,
        toBlock: 'latest',
      });

      const disclosed = intentLogs
        .filter((intentLog) => {
          const institution = (intentLog.args.institution as string).toLowerCase();
          if (!activeInstitutions.has(institution)) {
            return false;
          }
          const authorizationBlock = authorizationBlockByInstitution.get(institution);
          return authorizationBlock !== undefined && (intentLog.blockNumber as bigint) >= authorizationBlock;
        })
        .map((intentLog) => ({
          batchId: (intentLog.args.batchId as bigint).toString(),
          institution: intentLog.args.institution as string,
          direction: (intentLog.args.isBuy as boolean) ? ('buy' as const) : ('sell' as const),
          handle: intentLog.args.handle as string,
        }));

      setIntents(disclosed);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, address]);

  useEffect(() => {
    load();
  }, [load]);

  return { intents, isLoading, refresh: load };
}
