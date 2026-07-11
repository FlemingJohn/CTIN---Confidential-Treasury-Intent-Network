export const intentNetworkAbi = [
  {
    type: 'function',
    name: 'openBatch',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [{ name: 'batchId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'submitIntent',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'batchId', type: 'uint256' },
      { name: 'encryptedAmountHandle', type: 'bytes32' },
      { name: 'encryptedAmountProof', type: 'bytes' },
      { name: 'isBuy', type: 'bool' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'closeBatch',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'batchId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'settleBatch',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'batchId', type: 'uint256' },
      { name: 'settlementReference', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'batchStatusOf',
    stateMutability: 'view',
    inputs: [{ name: 'batchId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'intentCountOf',
    stateMutability: 'view',
    inputs: [{ name: 'batchId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'event',
    name: 'BatchOpened',
    inputs: [
      { name: 'batchId', type: 'uint256', indexed: true },
      { name: 'openedAtTimestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'IntentSubmitted',
    inputs: [
      { name: 'batchId', type: 'uint256', indexed: true },
      { name: 'institution', type: 'address', indexed: true },
      { name: 'isBuy', type: 'bool', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'BatchClosed',
    inputs: [{ name: 'batchId', type: 'uint256', indexed: true }],
  },
  {
    type: 'event',
    name: 'BatchSettled',
    inputs: [
      { name: 'batchId', type: 'uint256', indexed: true },
      { name: 'settlementReference', type: 'bytes32', indexed: false },
    ],
  },
] as const;
