'use client';

import { create } from 'zustand';
import {
  ConfidentialIntent,
  DisclosureGrant,
  TreasuryBatch,
} from '@/source/shared/treasuryDomain';

interface TreasuryStoreState {
  batches: TreasuryBatch[];
  disclosureGrants: DisclosureGrant[];
  addIntentToOpenBatch: (intent: ConfidentialIntent) => void;
  registerBatch: (batch: TreasuryBatch) => void;
  markReceiptDecrypted: (batchId: string, intentId: string) => void;
  addDisclosureGrant: (grant: DisclosureGrant) => void;
  revokeDisclosureGrant: (grantId: string) => void;
}

export const useTreasuryStore = create<TreasuryStoreState>((set) => ({
  batches: [],
  disclosureGrants: [],
  addIntentToOpenBatch: (intent) =>
    set((state) => {
      const openBatch = state.batches.find((batch) => batch.status === 'open');
      if (!openBatch) {
        return state;
      }
      const updatedBatches = state.batches.map((batch) =>
        batch.batchId === openBatch.batchId
          ? { ...batch, intents: [...batch.intents, intent] }
          : batch
      );
      return { batches: updatedBatches };
    }),
  registerBatch: (batch) => set((state) => ({ batches: [batch, ...state.batches] })),
  markReceiptDecrypted: (batchId, intentId) =>
    set((state) => ({
      batches: state.batches.map((batch) =>
        batch.batchId === batchId
          ? {
              ...batch,
              receipts: batch.receipts.map((receipt) =>
                receipt.intentId === intentId ? { ...receipt, decrypted: true } : receipt
              ),
            }
          : batch
      ),
    })),
  addDisclosureGrant: (grant) =>
    set((state) => ({ disclosureGrants: [grant, ...state.disclosureGrants] })),
  revokeDisclosureGrant: (grantId) =>
    set((state) => ({
      disclosureGrants: state.disclosureGrants.filter((grant) => grant.grantId !== grantId),
    })),
}));
