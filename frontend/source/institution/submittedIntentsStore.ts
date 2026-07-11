import { IntentDirection, SupportedAsset } from '@/source/shared/treasuryDomain';

export interface SubmittedIntentRecord {
  batchId: string;
  direction: IntentDirection;
  asset: SupportedAsset;
  handle: string;
  transactionHash: string;
  submittedAtIso: string;
}

export const submittedIntentsUpdatedEvent = 'ctin:submitted-intents-updated';

function storageKey(address: string): string {
  return `ctin.submittedIntents.${address.toLowerCase()}`;
}

export function readSubmittedIntents(address: string): SubmittedIntentRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const rawValue = window.localStorage.getItem(storageKey(address));
  if (!rawValue) {
    return [];
  }
  try {
    return JSON.parse(rawValue) as SubmittedIntentRecord[];
  } catch {
    return [];
  }
}

export function recordSubmittedIntent(address: string, record: SubmittedIntentRecord): void {
  if (typeof window === 'undefined') {
    return;
  }
  const existingRecords = readSubmittedIntents(address);
  const nextRecords = [record, ...existingRecords];
  window.localStorage.setItem(storageKey(address), JSON.stringify(nextRecords));
  window.dispatchEvent(new Event(submittedIntentsUpdatedEvent));
}
