import { ethers, network } from 'hardhat';

async function deployConfidentialTreasuryStack() {
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error(
      'No deployer account configured. Set DEPLOYER_PRIVATE_KEY in contracts/.env and try again.'
    );
  }

  const deployer = signers[0];
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

  const deploymentTransaction = intentNetwork.deploymentTransaction();
  const deploymentReceipt = deploymentTransaction ? await deploymentTransaction.wait() : null;
  const deploymentStartBlock = deploymentReceipt ? deploymentReceipt.blockNumber : 0;

  console.log('');
  console.log(`Network: ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`DisclosureRegistry: ${disclosureRegistryAddress}`);
  console.log(`ConfidentialIntentNetwork: ${intentNetworkAddress}`);
  console.log(`TreasurySafeModule: ${safeModuleAddress}`);
  console.log('');
  console.log('Paste the following into frontend/.env.local:');
  console.log(`NEXT_PUBLIC_INTENT_NETWORK_CONTRACT_ADDRESS=${intentNetworkAddress}`);
  console.log(`NEXT_PUBLIC_DISCLOSURE_REGISTRY_CONTRACT_ADDRESS=${disclosureRegistryAddress}`);
  console.log(`NEXT_PUBLIC_SAFE_MODULE_CONTRACT_ADDRESS=${safeModuleAddress}`);
  console.log(`NEXT_PUBLIC_DEPLOYMENT_START_BLOCK=${deploymentStartBlock}`);
}

deployConfidentialTreasuryStack().catch((deploymentError) => {
  console.error(deploymentError);
  process.exitCode = 1;
});
