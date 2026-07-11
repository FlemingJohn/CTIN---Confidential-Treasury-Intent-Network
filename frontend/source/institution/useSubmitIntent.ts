'use client';

import { useState } from 'react';
import { parseUnits } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';
import { useHandleClient } from '@/source/confidential/useHandleClient';
import { assetDecimals } from '@/source/confidential/assetDecimals';
import { intentNetworkAbi } from '@/source/contracts/intentNetworkAbi';
import { intentNetworkAddress } from '@/source/contracts/contractAddresses';
import { IntentDirection, SupportedAsset } from '@/source/shared/treasuryDomain';
import { recordSubmittedIntent } from '@/source/institution/submittedIntentsStore';

interface SubmitIntentArguments {
  batchId: bigint;
  amount: string;
  asset: SupportedAsset;
  direction: IntentDirection;
}

export function useSubmitIntent() {
  const handleClient = useHandleClient();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | null>(null);

  const submitIntent = async ({ batchId, amount, asset, direction }: SubmitIntentArguments) => {
    if (!intentNetworkAddress) {
      throw new Error('Intent network contract address is not configured');
    }
    if (!handleClient) {
      throw new Error('Handle client is not ready');
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const plaintextAmount = parseUnits(amount, assetDecimals[asset]);
      const { handle, handleProof } = await handleClient.encryptInput(
        plaintextAmount,
        'uint256',
        intentNetworkAddress
      );

      const hash = await writeContractAsync({
        address: intentNetworkAddress,
        abi: intentNetworkAbi,
        functionName: 'submitIntent',
        args: [batchId, handle, handleProof, direction === 'buy'],
      });

      if (address) {
        recordSubmittedIntent(address, {
          batchId: batchId.toString(),
          direction,
          asset,
          handle,
          transactionHash: hash,
          submittedAtIso: new Date().toISOString(),
        });
      }

      setTransactionHash(hash);
      return hash;
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'Failed to submit intent';
      setErrorMessage(message);
      throw submitError;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitIntent, isSubmitting, errorMessage, transactionHash };
}
