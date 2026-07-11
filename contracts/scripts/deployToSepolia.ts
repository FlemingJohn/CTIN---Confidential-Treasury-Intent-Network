import { ethers } from 'hardhat';

async function deployConfidentialTreasuryStack() {
  const [deployer] = await ethers.getSigners();
  const disclosureAuthorityAddress = deployer.address;

  const disclosureRegistryFactory = await ethers.getContractFactory('DisclosureRegistry');
  const disclosureRegistry = await disclosureRegistryFactory.deploy();
  await disclosureRegistry.waitForDeployment();

  const intentNetworkFactory = await ethers.getContractFactory('ConfidentialIntentNetwork');
  const intentNetwork = await intentNetworkFactory.deploy(disclosureAuthorityAddress);
  await intentNetwork.waitForDeployment();

  const safeModuleFactory = await ethers.getContractFactory('TreasurySafeModule');
  const safeModule = await safeModuleFactory.deploy(deployer.address);
  await safeModule.waitForDeployment();

  const disclosureRegistryAddress = await disclosureRegistry.getAddress();
  const intentNetworkAddress = await intentNetwork.getAddress();
  const safeModuleAddress = await safeModule.getAddress();

  console.log(`DisclosureRegistry deployed at ${disclosureRegistryAddress}`);
  console.log(`ConfidentialIntentNetwork deployed at ${intentNetworkAddress}`);
  console.log(`TreasurySafeModule deployed at ${safeModuleAddress}`);
}

deployConfidentialTreasuryStack().catch((deploymentError) => {
  console.error(deploymentError);
  process.exitCode = 1;
});
