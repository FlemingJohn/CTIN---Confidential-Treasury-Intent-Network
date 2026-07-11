import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';

dotenv.config();

const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL ?? 'https://rpc.sepolia.org';
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY ?? '';

const hardhatConfiguration: HardhatUserConfig = {
  solidity: {
    version: '0.8.35',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: sepoliaRpcUrl,
      accounts: deployerPrivateKey ? [deployerPrivateKey] : [],
    },
  },
};

export default hardhatConfiguration;
