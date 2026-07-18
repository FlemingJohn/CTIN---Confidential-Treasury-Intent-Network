'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { supportedNetworks, primaryNetworkChainId } from '@/source/wallet/supportedNetworks';

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? 'ctin_wallet_connect_project_id';

const sepoliaRpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;

export const walletConnectionConfig = getDefaultConfig({
  appName: 'Confidential Treasury Intent Network',
  projectId: walletConnectProjectId,
  chains: supportedNetworks,
  transports: {
    [primaryNetworkChainId]: http(sepoliaRpcUrl),
  },
  ssr: true,
});
