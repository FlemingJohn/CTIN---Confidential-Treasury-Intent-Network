import { sepolia } from 'wagmi/chains';

export const supportedNetworks = [sepolia] as const;

export const primaryNetwork = sepolia;

export const primaryNetworkChainId = sepolia.id;
