import { expect } from "chai";
import { ethers } from "hardhat";

describe("ConfidentialIntentNetwork settlement execution", () => {
  async function deployStack() {
    const [operator, recipient] = await ethers.getSigners();

    const networkFactory = await ethers.getContractFactory("ConfidentialIntentNetwork");
    const network = await networkFactory.deploy(operator.address);
    await network.waitForDeployment();
    const networkAddress = await network.getAddress();

    const moduleFactory = await ethers.getContractFactory("TreasurySafeModule");
    const safeModule = await moduleFactory.deploy(networkAddress);
    await safeModule.waitForDeployment();
    const moduleAddress = await safeModule.getAddress();

    const tokenFactory = await ethers.getContractFactory("MockErc20Token");
    const tokenIn = await tokenFactory.deploy();
    const tokenOut = await tokenFactory.deploy();
    await tokenIn.waitForDeployment();
    await tokenOut.waitForDeployment();
    const tokenInAddress = await tokenIn.getAddress();
    const tokenOutAddress = await tokenOut.getAddress();

    const routerFactory = await ethers.getContractFactory("MockSwapRouter");
    const router = await routerFactory.deploy();
    await router.waitForDeployment();
    const routerAddress = await router.getAddress();

    const adapterFactory = await ethers.getContractFactory("UniswapExecutionAdapter");
    const adapter = await adapterFactory.deploy(routerAddress, networkAddress);
    await adapter.waitForDeployment();
    const adapterAddress = await adapter.getAddress();

    await network.setSettlementModule(moduleAddress);
    await network.setExecutionAdapter(adapterAddress);

    const safeFactory = await ethers.getContractFactory("MockSafe");
    const safe = await safeFactory.deploy();
    await safe.waitForDeployment();
    const safeAddress = await safe.getAddress();

    await tokenIn.mint(safeAddress, 1000n);

    async function safeSetsAllowance(batchId: number, amount: bigint) {
      const data = safeModule.interface.encodeFunctionData("setBatchAllowance", [
        batchId,
        tokenInAddress,
        amount,
      ]);
      await safe.executeCall(moduleAddress, data);
    }

    return {
      network,
      safeModule,
      tokenIn,
      tokenOut,
      safe,
      operator,
      recipient,
      networkAddress,
      moduleAddress,
      tokenInAddress,
      tokenOutAddress,
      safeAddress,
      safeSetsAllowance,
    };
  }

  it("pulls the net from the Safe and swaps it through the router", async () => {
    const {
      network,
      safeModule,
      tokenIn,
      tokenOut,
      tokenInAddress,
      tokenOutAddress,
      safeAddress,
      safeSetsAllowance,
    } = await deployStack();

    await safeSetsAllowance(0, 400n);
    await network.closeBatch(0);

    await expect(
      network.executeSettlement(
        0,
        safeAddress,
        tokenInAddress,
        tokenOutAddress,
        150n,
        0n,
        safeAddress,
        ethers.id("settlement-0")
      )
    )
      .to.emit(network, "BatchExecuted")
      .withArgs(0, tokenInAddress, tokenOutAddress, 150n, 150n);

    expect(await tokenIn.balanceOf(safeAddress)).to.equal(850n);
    expect(await tokenOut.balanceOf(safeAddress)).to.equal(150n);
    expect(await safeModule.allowanceOf(safeAddress, 0, tokenInAddress)).to.equal(250n);
    expect(await network.batchStatusOf(0)).to.equal(3);
  });

  it("reverts when the pull exceeds the batch allowance", async () => {
    const { network, tokenInAddress, tokenOutAddress, safeAddress, safeSetsAllowance } =
      await deployStack();

    await safeSetsAllowance(0, 100n);
    await network.closeBatch(0);

    await expect(
      network.executeSettlement(
        0,
        safeAddress,
        tokenInAddress,
        tokenOutAddress,
        150n,
        0n,
        safeAddress,
        ethers.id("settlement-0")
      )
    ).to.be.revertedWith("amount exceeds batch allowance");
  });

  it("reverts when the batch is not in netting", async () => {
    const { network, tokenInAddress, tokenOutAddress, safeAddress, safeSetsAllowance } =
      await deployStack();

    await safeSetsAllowance(5, 400n);

    await expect(
      network.executeSettlement(
        5,
        safeAddress,
        tokenInAddress,
        tokenOutAddress,
        150n,
        0n,
        safeAddress,
        ethers.id("settlement-5")
      )
    ).to.be.revertedWith("batch is not netting");
  });
});
