'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { intentNetworkAbi } from '@/source/contracts/intentNetworkAbi';
import { intentNetworkAddress } from '@/source/contracts/contractAddresses';
import { useTransactionRunner, sepoliaTransactionUrl } from '@/source/shared/useTransactionRunner';

export interface ActiveDisclosureGrant {
  auditorAddress: string;
}

const zeroAddress = '0x0000000000000000000000000000000000000000';

export function useDisclosureGrants() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { run } = useTransactionRunner();
  const [grants, setGrants] = useState<ActiveDisclosureGrant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadGrants = useCallback(async () => {
    if (!publicClient || !intentNetworkAddress || !address) {
      setGrants([]);
      return;
    }
    setIsLoading(true);
    try {
      const auditor = (await publicClient.readContract({
        address: intentNetworkAddress,
        abi: intentNetworkAbi,
        functionName: 'auditorOf',
        args: [address],
      })) as `0x${string}`;
      setGrants(
        auditor && auditor.toLowerCase() !== zeroAddress ? [{ auditorAddress: auditor }] : []
      );
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, address]);

  useEffect(() => {
    loadGrants();
  }, [loadGrants]);

  const grantDisclosure = async (auditorAddress: string) =>
    run({
      pending: 'Authorizing auditor',
      success: 'Auditor authorized to decrypt your intents',
      linkFromResult: (value: `0x${string}`) => sepoliaTransactionUrl(value),
      action: async () => {
        if (!intentNetworkAddress) {
          throw new Error('Intent network contract address is not configured');
        }
        return writeContractAsync({
          address: intentNetworkAddress,
          abi: intentNetworkAbi,
          functionName: 'authorizeAuditor',
          args: [auditorAddress as `0x${string}`],
        });
      },
    });

  const revokeDisclosure = async () =>
    run({
      pending: 'Revoking auditor',
      success: 'Auditor revoked for future intents',
      linkFromResult: (value: `0x${string}`) => sepoliaTransactionUrl(value),
      action: async () => {
        if (!intentNetworkAddress) {
          throw new Error('Intent network contract address is not configured');
        }
        return writeContractAsync({
          address: intentNetworkAddress,
          abi: intentNetworkAbi,
          functionName: 'revokeAuditor',
          args: [],
        });
      },
    });

  return { grants, isLoading, grantDisclosure, revokeDisclosure, refresh: loadGrants };
}
