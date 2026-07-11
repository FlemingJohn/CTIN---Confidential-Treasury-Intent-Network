'use client';

import { useHandleClient } from '@/source/confidential/useHandleClient';

export function useDecryptHandle() {
  const handleClient = useHandleClient();

  const decryptHandle = async (handle: string): Promise<bigint> => {
    if (!handleClient) {
      throw new Error('Handle client is not ready');
    }
    const { value } = await handleClient.decrypt(handle as `0x${string}`);
    return BigInt(value as string | bigint | number);
  };

  return { decryptHandle, isReady: Boolean(handleClient) };
}
