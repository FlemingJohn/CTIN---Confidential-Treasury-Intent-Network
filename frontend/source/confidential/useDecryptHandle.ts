'use client';

import { useHandleClient } from '@/source/confidential/useHandleClient';
import { useTransactionRunner } from '@/source/shared/useTransactionRunner';

export function useDecryptHandle() {
  const handleClient = useHandleClient();
  const { run } = useTransactionRunner();

  const decryptHandle = async (handle: string): Promise<bigint> =>
    run({
      pending: 'Decrypting confidential value',
      success: 'Decrypted for your eyes only',
      action: async () => {
        if (!handleClient) {
          throw new Error('Handle client is not ready');
        }
        const { value } = await handleClient.decrypt(handle as `0x${string}`);
        return BigInt(value as string | bigint | number);
      },
    });

  return { decryptHandle, isReady: Boolean(handleClient) };
}
