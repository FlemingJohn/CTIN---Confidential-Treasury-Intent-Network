'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { supportedNetworks } from '@/source/wallet/supportedNetworks';

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? 'ctin_wallet_connect_project_id';

export const walletConnectionConfig = getDefaultConfig({
  appName: 'Confidential Treasury Intent Network',
  projectId: walletConnectProjectId,
  chains: supportedNetworks,
  ssr: true,
});
