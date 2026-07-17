import { expect } from "chai";
import { ethers } from "hardhat";

describe("DisclosureRegistry", () => {
  async function deployRegistry() {
    const [institution, auditor, otherInstitution, otherAuditor] =
      await ethers.getSigners();
    const registryFactory = await ethers.getContractFactory("DisclosureRegistry");
    const registry = await registryFactory.deploy();
    await registry.waitForDeployment();
    return { registry, institution, auditor, otherInstitution, otherAuditor };
  }

  it("grants disclosure and emits DisclosureGranted", async () => {
    const { registry, institution, auditor } = await deployRegistry();

    await expect(registry.connect(institution).grantDisclosure(auditor.address))
      .to.emit(registry, "DisclosureGranted")
      .withArgs(institution.address, auditor.address);

    expect(
      await registry.isDisclosureGranted(institution.address, auditor.address)
    ).to.equal(true);
  });

  it("revokes disclosure and emits DisclosureRevoked", async () => {
    const { registry, institution, auditor } = await deployRegistry();

    await registry.connect(institution).grantDisclosure(auditor.address);

    await expect(registry.connect(institution).revokeDisclosure(auditor.address))
      .to.emit(registry, "DisclosureRevoked")
      .withArgs(institution.address, auditor.address);

    expect(
      await registry.isDisclosureGranted(institution.address, auditor.address)
    ).to.equal(false);
  });

  it("scopes a grant to the institution that created it", async () => {
    const { registry, institution, auditor, otherInstitution } =
      await deployRegistry();

    await registry.connect(institution).grantDisclosure(auditor.address);

    expect(
      await registry.isDisclosureGranted(institution.address, auditor.address)
    ).to.equal(true);
    expect(
      await registry.isDisclosureGranted(otherInstitution.address, auditor.address)
    ).to.equal(false);
  });

  it("keeps grants independent across auditors", async () => {
    const { registry, institution, auditor, otherAuditor } =
      await deployRegistry();

    await registry.connect(institution).grantDisclosure(auditor.address);

    expect(
      await registry.isDisclosureGranted(institution.address, auditor.address)
    ).to.equal(true);
    expect(
      await registry.isDisclosureGranted(institution.address, otherAuditor.address)
    ).to.equal(false);
  });

  it("returns false for a pair that was never granted", async () => {
    const { registry, institution, auditor } = await deployRegistry();

    expect(
      await registry.isDisclosureGranted(institution.address, auditor.address)
    ).to.equal(false);
  });
});
