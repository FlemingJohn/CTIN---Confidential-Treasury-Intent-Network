import { ethers, network } from "hardhat";
import * as dotenv from "dotenv";
import { createEthersHandleClient } from "@iexec-nox/handle";

dotenv.config();

const INTENT_NETWORK_ADDRESS = "0x762548935C21d46AA049a0cDB1776c47b3e76A49";

const INTENTS: Array<{ amount: bigint; isBuy: boolean }> = [
  { amount: 400n, isBuy: true },
  { amount: 350n, isBuy: false },
  { amount: 100n, isBuy: true },
];

function explorerTx(hash: string): string {
  return `https://sepolia.etherscan.io/tx/${hash}`;
}

async function decryptWithRetry(
  handleClient: Awaited<ReturnType<typeof createEthersHandleClient>>,
  handle: string,
  label: string
): Promise<bigint> {
  const maxAttempts = 12;
  const delayMs = 10_000;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const { value } = await handleClient.decrypt(handle as `0x${string}`);
      return value as bigint;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.log(
        `  decrypt ${label}: attempt ${attempt}/${maxAttempts} not ready yet (${reason})`
      );
      if (attempt === maxAttempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error(`could not decrypt ${label}`);
}

async function main() {
  if (network.name !== "sepolia") {
    throw new Error(
      `expected --network sepolia, got "${network.name}". Run: npm run e2e:sepolia`
    );
  }

  const rawKey = process.env.DEPLOYER_PRIVATE_KEY ?? "";
  if (!rawKey) {
    throw new Error("Set DEPLOYER_PRIVATE_KEY in contracts/.env");
  }
  const privateKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;

  const wallet = new ethers.Wallet(privateKey, ethers.provider);
  const walletAddress = await wallet.getAddress();
  const balance = await ethers.provider.getBalance(walletAddress);
  console.log(`Operator / institution wallet: ${walletAddress}`);
  console.log(`Balance: ${ethers.formatEther(balance)} SepoliaETH\n`);

  const intentNetwork = await ethers.getContractAt(
    "ConfidentialIntentNetwork",
    INTENT_NETWORK_ADDRESS,
    wallet
  );
  const handleClient = await createEthersHandleClient(wallet);

  console.log("1. Opening a new batch ...");
  const openTx = await intentNetwork.openBatch();
  const openReceipt = await openTx.wait();
  let batchId: bigint | undefined;
  for (const log of openReceipt!.logs) {
    try {
      const parsed = intentNetwork.interface.parseLog(log);
      if (parsed?.name === "BatchOpened") {
        batchId = parsed.args.batchId as bigint;
      }
    } catch {
      continue;
    }
  }
  if (batchId === undefined) {
    throw new Error("BatchOpened event not found in openBatch receipt");
  }
  console.log(`   batch ${batchId} opened  ${explorerTx(openTx.hash)}\n`);

  let expectedBuyTotal = 0n;
  let expectedSellTotal = 0n;
  for (const [index, intent] of INTENTS.entries()) {
    const side = intent.isBuy ? "buy " : "sell";
    console.log(
      `2.${index + 1} Encrypting + submitting ${side} ${intent.amount} ...`
    );
    const { handle, handleProof } = await handleClient.encryptInput(
      intent.amount,
      "uint256",
      INTENT_NETWORK_ADDRESS
    );
    const submitTx = await intentNetwork.submitIntent(
      batchId,
      handle,
      handleProof,
      intent.isBuy
    );
    await submitTx.wait();
    console.log(`     submitted  ${explorerTx(submitTx.hash)}`);
    if (intent.isBuy) {
      expectedBuyTotal += intent.amount;
    } else {
      expectedSellTotal += intent.amount;
    }
  }
  const intentCount = await intentNetwork.intentCountOf(batchId);
  console.log(`   on-chain intent count: ${intentCount}\n`);

  console.log("3. Closing the batch ...");
  const closeTx = await intentNetwork.closeBatch(batchId);
  await closeTx.wait();
  console.log(`   closed  ${explorerTx(closeTx.hash)}`);

  const settlementReference = ethers.id(`ctin-e2e-batch-${batchId}`);
  const settleTx = await intentNetwork.settleBatch(batchId, settlementReference);
  await settleTx.wait();
  console.log(`   settled ${explorerTx(settleTx.hash)}`);
  console.log(`   status: ${await intentNetwork.batchStatusOf(batchId)} (3 = Settled)\n`);

  console.log("4. Decrypting encrypted totals via the Nox Handle Gateway ...");
  const encryptedBuyTotal = await intentNetwork.encryptedBuyTotalOf(batchId);
  const encryptedSellTotal = await intentNetwork.encryptedSellTotalOf(batchId);

  const decryptedBuyTotal = await decryptWithRetry(
    handleClient,
    encryptedBuyTotal,
    "buyTotal"
  );
  const decryptedSellTotal = await decryptWithRetry(
    handleClient,
    encryptedSellTotal,
    "sellTotal"
  );

  console.log(
    `   buy total : decrypted ${decryptedBuyTotal}, expected ${expectedBuyTotal}`
  );
  console.log(
    `   sell total: decrypted ${decryptedSellTotal}, expected ${expectedSellTotal}`
  );

  if (decryptedBuyTotal !== expectedBuyTotal) {
    throw new Error(
      `buy total mismatch: got ${decryptedBuyTotal}, expected ${expectedBuyTotal}`
    );
  }
  if (decryptedSellTotal !== expectedSellTotal) {
    throw new Error(
      `sell total mismatch: got ${decryptedSellTotal}, expected ${expectedSellTotal}`
    );
  }

  const netBuy = decryptedBuyTotal - decryptedSellTotal;
  console.log(`\n   net residual: buy ${netBuy}`);
  console.log("\nEnd-to-end confidential flow verified on Sepolia.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
