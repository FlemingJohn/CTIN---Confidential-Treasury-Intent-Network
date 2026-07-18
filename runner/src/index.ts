import { ethers } from 'ethers';
import { createEthersHandleClient } from '@iexec-nox/handle';
import { config } from './config';
import { intentNetworkAbi } from './abi';
import { minimumAmountOut } from './fairPrice';

const BATCH_STATUS = ['Open', 'Netting', 'Executing', 'Settled', 'Reverted'];

async function decryptWithRetry(handleClient: any, handle: string): Promise<bigint> {
  const maxAttempts = 10;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const { value } = await handleClient.decrypt(handle);
      return BigInt(value);
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }
  throw new Error('decrypt failed');
}

async function settleNetting(contract: any, handleClient: any, batchId: bigint) {
  const buyHandle = await contract.encryptedBuyTotalOf(batchId);
  const sellHandle = await contract.encryptedSellTotalOf(batchId);
  const buyTotal = await decryptWithRetry(handleClient, buyHandle);
  const sellTotal = await decryptWithRetry(handleClient, sellHandle);
  const isBuy = buyTotal >= sellTotal;
  const netAmount = isBuy ? buyTotal - sellTotal : sellTotal - buyTotal;
  const direction = isBuy ? 'BUY' : 'SELL';
  console.log(`batch ${batchId}: buy ${buyTotal}, sell ${sellTotal} -> net ${direction} ${netAmount}`);

  const reference = ethers.id(`ctin-net-${batchId}-${direction}-${netAmount}`);
  const canExecute =
    config.settlementSafe &&
    config.settlementAssetIn &&
    config.settlementAssetOut &&
    netAmount > 0n;

  if (canExecute) {
    const minOut =
      config.referencePriceX18 > 0n
        ? minimumAmountOut(netAmount, config.referencePriceX18, config.slippageBps)
        : 0n;
    console.log(
      `executing net residual on Uniswap from Safe ${config.settlementSafe} (min out ${minOut})`
    );
    await (
      await contract.executeSettlement(
        batchId,
        config.settlementSafe,
        config.settlementAssetIn,
        config.settlementAssetOut,
        netAmount,
        minOut,
        config.settlementSafe,
        reference
      )
    ).wait();
    console.log(`batch ${batchId} executed and settled`);
  } else {
    await (await contract.settleBatch(batchId, reference)).wait();
    console.log(`batch ${batchId} settled with recorded net reference`);
  }
}

async function runOnce(contract: any, handleClient: any, provider: ethers.JsonRpcProvider) {
  const openedLogs = await contract.queryFilter(
    contract.filters.BatchOpened(),
    config.deploymentStartBlock,
    'latest'
  );
  const latestBlock = await provider.getBlock('latest');
  const now = latestBlock ? Number(latestBlock.timestamp) : Math.floor(Date.now() / 1000);

  let hasOpenBatch = false;
  for (const log of openedLogs) {
    const batchId = log.args.batchId as bigint;
    const openedAt = Number(log.args.openedAtTimestamp);
    const status = Number(await contract.batchStatusOf(batchId));

    if (status === 0) {
      const age = now - openedAt;
      if (age >= config.batchWindowSeconds) {
        console.log(`closing batch ${batchId} (age ${age}s >= ${config.batchWindowSeconds}s)`);
        await (await contract.closeBatch(batchId)).wait();
        await settleNetting(contract, handleClient, batchId);
      } else {
        hasOpenBatch = true;
        console.log(`batch ${batchId} still open (age ${age}s), waiting for the window`);
      }
    } else if (status === 1) {
      await settleNetting(contract, handleClient, batchId);
    } else {
      console.log(`batch ${batchId}: ${BATCH_STATUS[status] ?? status}`);
    }
  }

  if (!hasOpenBatch) {
    console.log('no open batch available; opening a new one for institutions to join');
    await (await contract.openBatch()).wait();
  }
}

async function main() {
  if (!config.privateKey || config.privateKey === '0x') {
    throw new Error('Set DEPLOYER_PRIVATE_KEY in contracts/.env or runner/.env');
  }
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(config.privateKey, provider);
  const handleClient = await createEthersHandleClient(wallet);
  const contract = new ethers.Contract(config.intentNetworkAddress, intentNetworkAbi as any, wallet);

  console.log(`runner operating as ${await wallet.getAddress()}`);
  console.log(`intent network ${config.intentNetworkAddress}`);

  if (process.argv.includes('--once')) {
    await runOnce(contract, handleClient, provider);
    return;
  }

  for (;;) {
    try {
      await runOnce(contract, handleClient, provider);
    } catch (error) {
      console.error('runner pass failed:', error instanceof Error ? error.message : error);
    }
    await new Promise((resolve) => setTimeout(resolve, config.pollIntervalSeconds * 1000));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
