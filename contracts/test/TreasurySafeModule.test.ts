import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('TreasurySafeModule', () => {
  async function deployModuleFixture() {
    const [settlementCoordinator, recipient] = await ethers.getSigners();

    const tokenFactory = await ethers.getContractFactory('MockErc20Token');
    const token = await tokenFactory.deploy('Mock USD Coin', 'mUSDC');
    await token.waitForDeployment();

    const safeFactory = await ethers.getContractFactory('MockSafe');
    const safe = await safeFactory.deploy();
    await safe.waitForDeployment();

    const moduleFactory = await ethers.getContractFactory('TreasurySafeModule');
    const module = await moduleFactory.deploy(settlementCoordinator.address);
    await module.waitForDeployment();

    const safeAddress = await safe.getAddress();
    const tokenAddress = await token.getAddress();
    const moduleAddress = await module.getAddress();

    await token.mint(safeAddress, 1000n);

    return {
      settlementCoordinator,
      recipient,
      token,
      safe,
      module,
      safeAddress,
      tokenAddress,
      moduleAddress,
    };
  }

  it('records a scoped batch allowance set by the safe', async () => {
    const { safe, module, safeAddress, tokenAddress, moduleAddress } =
      await deployModuleFixture();

    await safe.authorizeBatch(moduleAddress, 1, tokenAddress, 400n);

    expect(await module.allowanceOf(safeAddress, 1, tokenAddress)).to.equal(400n);
  });

  it('pulls funds from the safe within the authorized allowance', async () => {
    const { recipient, token, safe, module, safeAddress, tokenAddress, moduleAddress } =
      await deployModuleFixture();

    await safe.authorizeBatch(moduleAddress, 1, tokenAddress, 400n);
    await module.pullForSettlement(safeAddress, 1, tokenAddress, 150n, recipient.address);

    expect(await token.balanceOf(recipient.address)).to.equal(150n);
    expect(await module.allowanceOf(safeAddress, 1, tokenAddress)).to.equal(250n);
    expect(await token.balanceOf(safeAddress)).to.equal(850n);
  });

  it('reverts when the amount exceeds the batch allowance', async () => {
    const { recipient, safe, module, safeAddress, tokenAddress, moduleAddress } =
      await deployModuleFixture();

    await safe.authorizeBatch(moduleAddress, 1, tokenAddress, 100n);

    await expect(
      module.pullForSettlement(safeAddress, 1, tokenAddress, 150n, recipient.address)
    ).to.be.revertedWith('amount exceeds batch allowance');
  });

  it('reverts when a non coordinator attempts settlement', async () => {
    const { recipient, safe, module, safeAddress, tokenAddress, moduleAddress } =
      await deployModuleFixture();

    await safe.authorizeBatch(moduleAddress, 1, tokenAddress, 400n);

    await expect(
      module
        .connect(recipient)
        .pullForSettlement(safeAddress, 1, tokenAddress, 100n, recipient.address)
    ).to.be.revertedWith('caller is not the settlement coordinator');
  });
});
