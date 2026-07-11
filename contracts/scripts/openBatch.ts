import { ethers } from 'hardhat';

async function openBatch() {
  const intentNetworkAddress = process.env.INTENT_NETWORK_ADDRESS;
  if (!intentNetworkAddress) {
    throw new Error('Set INTENT_NETWORK_ADDRESS to the deployed ConfidentialIntentNetwork address');
  }

  const intentNetwork = await ethers.getContractAt(
    'ConfidentialIntentNetwork',
    intentNetworkAddress
  );

  const transaction = await intentNetwork.openBatch();
  const receipt = await transaction.wait();

  console.log(`openBatch transaction: ${receipt ? receipt.hash : transaction.hash}`);
}

openBatch().catch((openBatchError) => {
  console.error(openBatchError);
  process.exitCode = 1;
});
