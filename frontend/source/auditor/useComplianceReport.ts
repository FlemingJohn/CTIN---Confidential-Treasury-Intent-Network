'use client';

import { useAccount, useSignMessage } from 'wagmi';
import { useTransactionRunner } from '@/source/shared/useTransactionRunner';
import { intentNetworkAddress } from '@/source/contracts/contractAddresses';
import { primaryNetworkChainId } from '@/source/wallet/supportedNetworks';

export interface ComplianceReportIntent {
  institution: string;
  batchId: string;
  direction: string;
  handle: string;
  amount: string;
}

function downloadJsonDocument(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function useComplianceReport() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { run } = useTransactionRunner();

  const exportReport = async (intents: ComplianceReportIntent[]) =>
    run({
      pending: 'Signing compliance report',
      success: 'Compliance report downloaded',
      action: async () => {
        if (!address) {
          throw new Error('Connect your wallet to sign the report');
        }
        if (intents.length === 0) {
          throw new Error('Decrypt at least one intent before exporting');
        }
        const report = {
          kind: 'ctin-compliance-report',
          version: 1,
          generatedAt: new Date().toISOString(),
          auditor: address,
          intentNetwork: intentNetworkAddress ?? null,
          chainId: primaryNetworkChainId,
          intents,
        };
        const payload = JSON.stringify(report);
        const signature = await signMessageAsync({ message: payload });
        const document = JSON.stringify({ report, signature, signer: address }, null, 2);
        downloadJsonDocument(document, `ctin-compliance-report-${report.generatedAt}.json`);
        return signature;
      },
    });

  return { exportReport };
}
