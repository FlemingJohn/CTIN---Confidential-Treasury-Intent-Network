export const disclosureRegistryAbi = [
  {
    type: 'function',
    name: 'grantDisclosure',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'auditor', type: 'address' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'revokeDisclosure',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'auditor', type: 'address' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'isDisclosureGranted',
    stateMutability: 'view',
    inputs: [
      { name: 'institution', type: 'address' },
      { name: 'auditor', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'event',
    name: 'DisclosureGranted',
    inputs: [
      { name: 'institution', type: 'address', indexed: true },
      { name: 'auditor', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'DisclosureRevoked',
    inputs: [
      { name: 'institution', type: 'address', indexed: true },
      { name: 'auditor', type: 'address', indexed: true },
    ],
  },
] as const;
