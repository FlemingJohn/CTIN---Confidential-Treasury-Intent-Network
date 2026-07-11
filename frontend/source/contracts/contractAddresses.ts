function optionalAddress(value: string | undefined): `0x${string}` | undefined {
  if (!value || value.length === 0) {
    return undefined;
  }
  return value as `0x${string}`;
}

export const intentNetworkAddress = optionalAddress(
  process.env.NEXT_PUBLIC_INTENT_NETWORK_CONTRACT_ADDRESS
);

export const disclosureRegistryAddress = optionalAddress(
  process.env.NEXT_PUBLIC_DISCLOSURE_REGISTRY_CONTRACT_ADDRESS
);

export const safeModuleAddress = optionalAddress(
  process.env.NEXT_PUBLIC_SAFE_MODULE_CONTRACT_ADDRESS
);

export const deploymentStartBlock = BigInt(
  process.env.NEXT_PUBLIC_DEPLOYMENT_START_BLOCK ?? '0'
);
