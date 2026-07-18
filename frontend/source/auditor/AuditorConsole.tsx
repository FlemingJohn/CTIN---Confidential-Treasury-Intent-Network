import { PageShell } from '@/source/layout/PageShell';
import { SectionHeading } from '@/source/shared/SectionHeading';
import { DisclosureGrantForm } from '@/source/auditor/DisclosureGrantForm';
import { DisclosureGrantList } from '@/source/auditor/DisclosureGrantList';
import { DisclosedIntents } from '@/source/auditor/DisclosedIntents';

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
      <div className="mt-12">
        <SectionHeading
          overline="Disclosed to you"
          title="Decrypt the intents shared with you."
          description="Connected as an auditor, decrypt the confidential amounts institutions have authorized you to read. No one else can."
        />
        <DisclosedIntents />
      </div>
    </PageShell>
  );
}
