'use client';

import { useEffect, useState } from 'react';
import { useWalletClient } from 'wagmi';
import { createViemHandleClient } from '@iexec-nox/handle';

type HandleClient = Awaited<ReturnType<typeof createViemHandleClient>>;

export function useHandleClient() {
  const { data: walletClient } = useWalletClient();
  const [handleClient, setHandleClient] = useState<HandleClient | null>(null);

  useEffect(() => {
    let isActive = true;

    if (!walletClient) {
      setHandleClient(null);
      return;
    }

    createViemHandleClient(walletClient).then((client) => {
      if (isActive) {
        setHandleClient(client);
      }
    });

    return () => {
      isActive = false;
    };
  }, [walletClient]);

  return handleClient;
}
