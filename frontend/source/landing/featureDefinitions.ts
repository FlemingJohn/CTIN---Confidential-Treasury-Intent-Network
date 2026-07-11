import { Lock, Layers, ShieldCheck, GitMerge, Wallet, ScrollText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface FeatureDefinition {
  title: string;
  detail: string;
  icon: LucideIcon;
}

export const featureDefinitions: FeatureDefinition[] = [
  {
    title: 'Encrypted intents',
    detail: 'Amounts, direction, and beneficiaries are encrypted with Nox before submission.',
    icon: Lock,
  },
  {
    title: 'Homomorphic netting',
    detail: 'Intents are summed on encrypted data so only the net residual is ever revealed.',
    icon: GitMerge,
  },
  {
    title: 'Fair clearing price',
    detail: 'Internal crosses settle at a blended executed volume weighted and oracle price.',
    icon: Layers,
  },
  {
    title: 'Custody stays in Safe',
    detail: 'A scoped Safe module authorizes each batch. Funds never leave institution custody.',
    icon: Wallet,
  },
  {
    title: 'Selective disclosure',
    detail: 'Each institution grants auditors decryption rights to its own data on demand.',
    icon: ShieldCheck,
  },
  {
    title: 'Confidential receipts',
    detail: 'Every party decrypts only its own fill and private execution report.',
    icon: ScrollText,
  },
];
