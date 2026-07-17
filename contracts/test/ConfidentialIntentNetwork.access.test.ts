import { expect } from "chai";
import { ethers } from "hardhat";

describe("ConfidentialIntentNetwork (access control)", () => {
  async function deployNetwork() {
    const [operator, disclosureAuthority, outsider] = await ethers.getSigners();
    const networkFactory = await ethers.getContractFactory(
      "ConfidentialIntentNetwork"
    );
    const network = await networkFactory.deploy(disclosureAuthority.address);
    await network.waitForDeployment();
    return { network, operator, disclosureAuthority, outsider };
  }

  it("records the operator and disclosure authority on deployment", async () => {
    const { network, operator, disclosureAuthority } = await deployNetwork();

    expect(await network.networkOperator()).to.equal(operator.address);
    expect(await network.disclosureAuthority()).to.equal(
      disclosureAuthority.address
    );
  });

  it("rejects openBatch from a non-operator", async () => {
    const { network, outsider } = await deployNetwork();

    await expect(network.connect(outsider).openBatch()).to.be.revertedWith(
      "caller is not the network operator"
    );
  });

  it("rejects closeBatch from a non-operator", async () => {
    const { network, outsider } = await deployNetwork();

    await expect(network.connect(outsider).closeBatch(0)).to.be.revertedWith(
      "caller is not the network operator"
    );
  });

  it("rejects settleBatch from a non-operator", async () => {
    const { network, outsider } = await deployNetwork();

    await expect(
      network.connect(outsider).settleBatch(0, ethers.ZeroHash)
    ).to.be.revertedWith("caller is not the network operator");
  });
});
