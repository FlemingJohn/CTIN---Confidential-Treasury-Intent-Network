'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { walletConnectionConfig } from '@/source/wallet/walletConnectionConfig';
import { themeColors } from '@/source/design/themeColors';

const queryClient = new QueryClient();

export function ApplicationProviders({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={walletConnectionConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: themeColors.magmaEmber,
            accentColorForeground: themeColors.obsidianBase,
            borderRadius: 'small',
            fontStack: 'system',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
