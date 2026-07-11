'use client';

import { SurfacePanel } from '@/source/shared/SurfacePanel';
import { ActionButton } from '@/source/shared/ActionButton';
import { EmptyState } from '@/source/shared/EmptyState';
import { useDisclosureGrants } from '@/source/auditor/useDisclosureGrants';

export function DisclosureGrantList() {
  const { grants, revokeDisclosure, refresh } = useDisclosureGrants();

  const handleRevoke = async (auditorAddress: string) => {
    await revokeDisclosure(auditorAddress);
    await refresh();
  };

  if (grants.length === 0) {
    return (
      <EmptyState
        title="No active grants"
        description="Grant an auditor address to let it decrypt your confidential receipts on demand."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {grants.map((grant) => (
        <SurfacePanel
          key={grant.auditorAddress}
          className="flex items-center justify-between p-5"
        >
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
              Auditor
            </span>
            <span className="font-mono text-sm text-white">{grant.auditorAddress}</span>
          </div>
          <ActionButton variant="outline" onClick={() => handleRevoke(grant.auditorAddress)}>
            Revoke
          </ActionButton>
        </SurfacePanel>
      ))}
    </div>
  );
}
