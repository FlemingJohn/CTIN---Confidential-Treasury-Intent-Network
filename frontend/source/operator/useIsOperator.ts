'use client';

import { useAccount, useReadContract } from 'wagmi';
import { intentNetworkAbi } from '@/source/contracts/intentNetworkAbi';
import { intentNetworkAddress } from '@/source/contracts/contractAddresses';

export function useIsOperator() {
  const { address } = useAccount();

  const { data: operatorAddress } = useReadContract({
    address: intentNetworkAddress,
    abi: intentNetworkAbi,
    functionName: 'networkOperator',
    query: { enabled: Boolean(intentNetworkAddress) },
  });

  const isOperator =
    Boolean(address) &&
    Boolean(operatorAddress) &&
    address?.toLowerCase() === (operatorAddress as string).toLowerCase();

  return { isOperator, operatorAddress: operatorAddress as `0x${string}` | undefined };
}
