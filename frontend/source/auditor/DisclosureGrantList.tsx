'use client';

import { useTreasuryStore } from '@/source/shared/treasuryStore';
import { SurfacePanel } from '@/source/shared/SurfacePanel';
import { ActionButton } from '@/source/shared/ActionButton';
import { EmptyState } from '@/source/shared/EmptyState';

export function DisclosureGrantList() {
  const disclosureGrants = useTreasuryStore((state) => state.disclosureGrants);
  const revokeDisclosureGrant = useTreasuryStore((state) => state.revokeDisclosureGrant);

  if (disclosureGrants.length === 0) {
    return (
      <EmptyState
        title="No active grants"
        description="Grant an auditor address to let it decrypt your confidential receipts on demand."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {disclosureGrants.map((grant) => (
        <SurfacePanel
          key={grant.grantId}
          className="flex items-center justify-between p-5"
        >
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
              Auditor
            </span>
            <span className="font-mono text-sm text-white">{grant.auditorAddress}</span>
          </div>
          <ActionButton
            variant="outline"
            onClick={() => revokeDisclosureGrant(grant.grantId)}
          >
            Revoke
          </ActionButton>
        </SurfacePanel>
      ))}
    </div>
  );
}
