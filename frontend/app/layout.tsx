import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { ReactNode } from 'react';
import './globals.css';
import { ApplicationProviders } from '@/app/providers';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'CTIN — Confidential Treasury Intent Network',
  description:
    'Confidential execution infrastructure for institutional treasuries. Batch, net, and settle encrypted intents on top of Safe and Uniswap using Nox.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}
        suppressHydrationWarning
      >
        <ApplicationProviders>{children}</ApplicationProviders>
      </body>
    </html>
  );
}
