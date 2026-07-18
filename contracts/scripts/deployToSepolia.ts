import { ethers, network } from 'hardhat';

const DEFAULT_UNISWAP_SWAP_ROUTER = '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E';

async function deployConfidentialTreasuryStack() {
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error(
      'No deployer account configured. Set DEPLOYER_PRIVATE_KEY in contracts/.env and try again.'
    );
  }

  const deployer = signers[0];
  const disclosureAuthorityAddress = deployer.address;
  const uniswapSwapRouterAddress =
    process.env.UNISWAP_SWAP_ROUTER_ADDRESS ?? DEFAULT_UNISWAP_SWAP_ROUTER;

  const disclosureRegistryFactory = await ethers.getContractFactory('DisclosureRegistry');
  const disclosureRegistry = await disclosureRegistryFactory.deploy();
  await disclosureRegistry.waitForDeployment();

  const intentNetworkFactory = await ethers.getContractFactory('ConfidentialIntentNetwork');
  const intentNetwork = await intentNetworkFactory.deploy(disclosureAuthorityAddress);
  await intentNetwork.waitForDeployment();
  const intentNetworkAddress = await intentNetwork.getAddress();

  const safeModuleFactory = await ethers.getContractFactory('TreasurySafeModule');
  const safeModule = await safeModuleFactory.deploy(intentNetworkAddress);
  await safeModule.waitForDeployment();
  const safeModuleAddress = await safeModule.getAddress();

  const adapterFactory = await ethers.getContractFactory('UniswapExecutionAdapter');
  const executionAdapter = await adapterFactory.deploy(
    uniswapSwapRouterAddress,
    intentNetworkAddress
  );
  await executionAdapter.waitForDeployment();
  const executionAdapterAddress = await executionAdapter.getAddress();

  await (await intentNetwork.setSettlementModule(safeModuleAddress)).wait();
  await (await intentNetwork.setExecutionAdapter(executionAdapterAddress)).wait();

  const disclosureRegistryAddress = await disclosureRegistry.getAddress();

  const deploymentTransaction = intentNetwork.deploymentTransaction();
  const deploymentReceipt = deploymentTransaction ? await deploymentTransaction.wait() : null;
  const deploymentStartBlock = deploymentReceipt ? deploymentReceipt.blockNumber : 0;

  console.log('');
  console.log(`Network: ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`DisclosureRegistry: ${disclosureRegistryAddress}`);
  console.log(`ConfidentialIntentNetwork: ${intentNetworkAddress}`);
  console.log(`TreasurySafeModule: ${safeModuleAddress}`);
  console.log(`UniswapExecutionAdapter: ${executionAdapterAddress}`);
  console.log(`Uniswap swap router: ${uniswapSwapRouterAddress}`);
  console.log('');
  console.log('Paste the following into frontend/.env.local:');
  console.log(`NEXT_PUBLIC_INTENT_NETWORK_CONTRACT_ADDRESS=${intentNetworkAddress}`);
  console.log(`NEXT_PUBLIC_DISCLOSURE_REGISTRY_CONTRACT_ADDRESS=${disclosureRegistryAddress}`);
  console.log(`NEXT_PUBLIC_SAFE_MODULE_CONTRACT_ADDRESS=${safeModuleAddress}`);
  console.log(`NEXT_PUBLIC_EXECUTION_ADAPTER_CONTRACT_ADDRESS=${executionAdapterAddress}`);
  console.log(`NEXT_PUBLIC_DEPLOYMENT_START_BLOCK=${deploymentStartBlock}`);
}

deployConfidentialTreasuryStack().catch((deploymentError) => {
  console.error(deploymentError);
  process.exitCode = 1;
});
