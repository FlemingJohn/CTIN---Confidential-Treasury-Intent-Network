import { PageShell } from '@/source/layout/PageShell';
import { SectionHeading } from '@/source/shared/SectionHeading';
import { DisclosureGrantForm } from '@/source/auditor/DisclosureGrantForm';
import { DisclosureGrantList } from '@/source/auditor/DisclosureGrantList';

export function AuditorConsole() {
  return (
    <PageShell>
      <SectionHeading
        overline="Auditor console"
        title="Confidential to the public, disclosable to your auditor."
        description="Institutions grant scoped decryption rights so auditors, limited partners, and regulators keep full visibility on demand."
      />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <DisclosureGrantForm />
        <DisclosureGrantList />
      </div>
    </PageShell>
  );
}
