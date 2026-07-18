import { ethers, network } from "hardhat";
import * as dotenv from "dotenv";
import { createEthersHandleClient } from "@iexec-nox/handle";

dotenv.config();

const INTENT_NETWORK_ADDRESS = "0x762548935C21d46AA049a0cDB1776c47b3e76A49";
const TEST_AUDITOR = ethers.getAddress("0x000000000000000000000000000000000000a0d1");

async function main() {
  if (network.name !== "sepolia") {
    throw new Error('expected --network sepolia');
  }
  const rawKey = process.env.DEPLOYER_PRIVATE_KEY ?? "";
  const privateKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
  const wallet = new ethers.Wallet(privateKey, ethers.provider);
  const institution = await wallet.getAddress();

  const intentNetwork = await ethers.getContractAt(
    "ConfidentialIntentNetwork",
    INTENT_NETWORK_ADDRESS,
    wallet
  );
  const handleClient = await createEthersHandleClient(wallet);

  console.log(`institution: ${institution}`);
  console.log(`test auditor: ${TEST_AUDITOR}`);

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
  console.log(`opened batch ${batchId}`);

  await (await intentNetwork.authorizeAuditor(TEST_AUDITOR)).wait();
  const recordedAuditor = await intentNetwork.auditorOf(institution);
  console.log(`auditorOf(institution): ${recordedAuditor}`);

  const { handle, handleProof } = await handleClient.encryptInput(
    100n,
    "uint256",
    INTENT_NETWORK_ADDRESS
  );
  await (await intentNetwork.submitIntent(batchId, handle, handleProof, true)).wait();
  console.log(`submitted intent, handle ${handle}`);

  const acl = await handleClient.viewACL(handle as `0x${string}`);
  const viewers = (acl.viewers ?? []).map((viewer: string) => viewer.toLowerCase());
  console.log(`viewers: ${JSON.stringify(acl.viewers)}`);

  const auditorIsViewer = viewers.includes(TEST_AUDITOR.toLowerCase());
  const auditorRecorded = recordedAuditor.toLowerCase() === TEST_AUDITOR.toLowerCase();

  console.log(`\nauditor recorded on-chain: ${auditorRecorded}`);
  console.log(`auditor is a viewer of the intent handle: ${auditorIsViewer}`);
  if (!auditorRecorded || !auditorIsViewer) {
    throw new Error("auditor disclosure verification failed");
  }
  console.log("\nAuditor disclosure verified: the authorized auditor can decrypt this intent.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
