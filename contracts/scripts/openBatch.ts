import { ethers } from 'hardhat';
import { readFileSync } from 'fs';
import { join } from 'path';

function resolveIntentNetworkAddress(): string {
  if (process.env.INTENT_NETWORK_ADDRESS) {
    return process.env.INTENT_NETWORK_ADDRESS;
  }
  const deployment = JSON.parse(
    readFileSync(join(__dirname, '..', 'deployments', 'sepolia.json'), 'utf8')
  );
  return deployment.intentNetwork as string;
}

async function openBatch() {
  const intentNetworkAddress = resolveIntentNetworkAddress();
  if (!intentNetworkAddress) {
    throw new Error('Set INTENT_NETWORK_ADDRESS or provide contracts/deployments/sepolia.json');
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
