import { expect } from "chai";
import { ethers } from "hardhat";

describe("TreasurySafeModule", () => {
  async function deployModule() {
    const [coordinator, recipient, outsider] = await ethers.getSigners();

    const moduleFactory = await ethers.getContractFactory("TreasurySafeModule");
    const module = await moduleFactory.deploy(coordinator.address);
    await module.waitForDeployment();

    const safeFactory = await ethers.getContractFactory("MockSafe");
    const safe = await safeFactory.deploy();
    await safe.waitForDeployment();

    const tokenFactory = await ethers.getContractFactory("MockErc20Token");
    const token = await tokenFactory.deploy();
    await token.waitForDeployment();

    const moduleAddress = await module.getAddress();
    const safeAddress = await safe.getAddress();
    const tokenAddress = await token.getAddress();

    async function safeSetsAllowance(
      batchId: number,
      tokenAddr: string,
      amount: bigint
    ) {
      const data = module.interface.encodeFunctionData("setBatchAllowance", [
        batchId,
        tokenAddr,
        amount,
      ]);
      return safe.executeCall(moduleAddress, data);
    }

    return {
      module,
      safe,
      token,
      coordinator,
      recipient,
      outsider,
      moduleAddress,
      safeAddress,
      tokenAddress,
      safeSetsAllowance,
    };
  }

  it("records a batch allowance and emits BatchAllowanceSet", async () => {
    const { module, safeAddress, tokenAddress, safeSetsAllowance } =
      await deployModule();

    await expect(safeSetsAllowance(1, tokenAddress, 400n))
      .to.emit(module, "BatchAllowanceSet")
      .withArgs(safeAddress, 1, tokenAddress, 400n);

    expect(await module.allowanceOf(safeAddress, 1, tokenAddress)).to.equal(400n);
  });

  it("pulls funds within the allowance and moves tokens out of the Safe", async () => {
    const {
      module,
      token,
      coordinator,
      recipient,
      safeAddress,
      tokenAddress,
      safeSetsAllowance,
    } = await deployModule();

    await token.mint(safeAddress, 1000n);
    await safeSetsAllowance(1, tokenAddress, 400n);

    await expect(
      module
        .connect(coordinator)
        .pullForSettlement(safeAddress, 1, tokenAddress, 150n, recipient.address)
    )
      .to.emit(module, "SettlementPulled")
      .withArgs(safeAddress, 1, tokenAddress, recipient.address, 150n);

    expect(await token.balanceOf(recipient.address)).to.equal(150n);
    expect(await token.balanceOf(safeAddress)).to.equal(850n);
    expect(await module.allowanceOf(safeAddress, 1, tokenAddress)).to.equal(250n);
  });

  it("reverts when the pull exceeds the batch allowance", async () => {
    const {
      module,
      token,
      coordinator,
      recipient,
      safeAddress,
      tokenAddress,
      safeSetsAllowance,
    } = await deployModule();

    await token.mint(safeAddress, 1000n);
    await safeSetsAllowance(1, tokenAddress, 400n);

    await expect(
      module
        .connect(coordinator)
        .pullForSettlement(safeAddress, 1, tokenAddress, 500n, recipient.address)
    ).to.be.revertedWith("amount exceeds batch allowance");

    expect(await module.allowanceOf(safeAddress, 1, tokenAddress)).to.equal(400n);
    expect(await token.balanceOf(recipient.address)).to.equal(0n);
  });

  it("reverts when a non-coordinator attempts to pull", async () => {
    const {
      module,
      token,
      outsider,
      recipient,
      safeAddress,
      tokenAddress,
      safeSetsAllowance,
    } = await deployModule();

    await token.mint(safeAddress, 1000n);
    await safeSetsAllowance(1, tokenAddress, 400n);

    await expect(
      module
        .connect(outsider)
        .pullForSettlement(safeAddress, 1, tokenAddress, 150n, recipient.address)
    ).to.be.revertedWith("caller is not the settlement coordinator");
  });

  it("reverts and preserves allowance when the Safe execution fails", async () => {
    const {
      module,
      safe,
      token,
      coordinator,
      recipient,
      safeAddress,
      tokenAddress,
      safeSetsAllowance,
    } = await deployModule();

    await token.mint(safeAddress, 1000n);
    await safeSetsAllowance(1, tokenAddress, 400n);
    await safe.setExecutionShouldSucceed(false);

    await expect(
      module
        .connect(coordinator)
        .pullForSettlement(safeAddress, 1, tokenAddress, 150n, recipient.address)
    ).to.be.revertedWith("safe module transfer failed");

    expect(await module.allowanceOf(safeAddress, 1, tokenAddress)).to.equal(400n);
    expect(await token.balanceOf(recipient.address)).to.equal(0n);
    expect(await token.balanceOf(safeAddress)).to.equal(1000n);
  });
});
