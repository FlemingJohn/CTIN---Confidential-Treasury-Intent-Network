import { BatchStatus } from '@/source/shared/batchStatus';

export type IntentDirection = 'buy' | 'sell';

export type SupportedAsset = 'ETH' | 'USDC';

export interface ConfidentialIntent {
  intentId: string;
  institutionAddress: string;
  direction: IntentDirection;
  assetIn: SupportedAsset;
  assetOut: SupportedAsset;
  encryptedAmountHandle: string;
  submittedAtIso: string;
}

export interface ExecutionReceipt {
  intentId: string;
  filledAmount: string;
  clearingPrice: string;
  decrypted: boolean;
}

export interface TreasuryBatch {
  batchId: string;
  status: BatchStatus;
  openedAtIso: string;
  intents: ConfidentialIntent[];
  netResidualDescription: string | null;
  settlementTransactionHash: string | null;
  receipts: ExecutionReceipt[];
}

export interface DisclosureGrant {
  grantId: string;
  institutionAddress: string;
  auditorAddress: string;
  createdAtIso: string;
}
