import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const here = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(here, '../../contracts/.env') });
dotenv.config({ path: join(here, '../.env') });

const deploymentPath = join(here, '../../contracts/deployments/sepolia.json');
const deployment = JSON.parse(readFileSync(deploymentPath, 'utf8'));

const rawKey = process.env.DEPLOYER_PRIVATE_KEY ?? '';

export const config = {
  rpcUrl: process.env.SEPOLIA_RPC_URL ?? 'https://ethereum-sepolia-rpc.publicnode.com',
  privateKey: rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`,
  intentNetworkAddress: deployment.intentNetwork as string,
  deploymentStartBlock: Number(deployment.deploymentStartBlock ?? 0),
  batchWindowSeconds: Number(process.env.BATCH_WINDOW_SECONDS ?? 120),
  pollIntervalSeconds: Number(process.env.POLL_INTERVAL_SECONDS ?? 30),
  settlementSafe: process.env.SETTLEMENT_SAFE,
  settlementAssetIn: process.env.SETTLEMENT_ASSET_IN,
  settlementAssetOut: process.env.SETTLEMENT_ASSET_OUT,
  referencePriceX18: BigInt(process.env.REFERENCE_PRICE_X18 ?? '0'),
  slippageBps: BigInt(process.env.SLIPPAGE_BPS ?? '100'),
};
