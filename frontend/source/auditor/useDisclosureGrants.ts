'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { disclosureRegistryAbi } from '@/source/contracts/disclosureRegistryAbi';
import {
  deploymentStartBlock,
  disclosureRegistryAddress,
} from '@/source/contracts/contractAddresses';

export interface ActiveDisclosureGrant {
  auditorAddress: string;
}

export function useDisclosureGrants() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [grants, setGrants] = useState<ActiveDisclosureGrant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadGrants = useCallback(async () => {
    if (!publicClient || !disclosureRegistryAddress || !address) {
      setGrants([]);
      return;
    }

    setIsLoading(true);
    try {
      const grantedLogs = await publicClient.getContractEvents({
        address: disclosureRegistryAddress,
        abi: disclosureRegistryAbi,
        eventName: 'DisclosureGranted',
        args: { institution: address },
        fromBlock: deploymentStartBlock,
        toBlock: 'latest',
      });

      const auditorAddresses = Array.from(
        new Set(grantedLogs.map((grantedLog) => grantedLog.args.auditor as string))
      );

      const statusResults = await publicClient.multicall({
        contracts: auditorAddresses.map((auditorAddress) => ({
          address: disclosureRegistryAddress as `0x${string}`,
          abi: disclosureRegistryAbi,
          functionName: 'isDisclosureGranted' as const,
          args: [address, auditorAddress as `0x${string}`],
        })),
      });

      const activeGrants = auditorAddresses
        .filter((_, index) => {
          const statusResult = statusResults[index];
          return statusResult && statusResult.status === 'success' && statusResult.result === true;
        })
        .map((auditorAddress) => ({ auditorAddress }));

      setGrants(activeGrants);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, address]);

  useEffect(() => {
    loadGrants();
  }, [loadGrants]);

  const grantDisclosure = async (auditorAddress: string) => {
    if (!disclosureRegistryAddress) {
      throw new Error('Disclosure registry contract address is not configured');
    }
    return writeContractAsync({
      address: disclosureRegistryAddress,
      abi: disclosureRegistryAbi,
      functionName: 'grantDisclosure',
      args: [auditorAddress as `0x${string}`],
    });
  };

  const revokeDisclosure = async (auditorAddress: string) => {
    if (!disclosureRegistryAddress) {
      throw new Error('Disclosure registry contract address is not configured');
    }
    return writeContractAsync({
      address: disclosureRegistryAddress,
      abi: disclosureRegistryAbi,
      functionName: 'revokeDisclosure',
      args: [auditorAddress as `0x${string}`],
    });
  };

  return { grants, isLoading, grantDisclosure, revokeDisclosure, refresh: loadGrants };
}
