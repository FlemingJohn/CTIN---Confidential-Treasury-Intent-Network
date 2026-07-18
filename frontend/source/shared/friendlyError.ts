interface PossibleWalletError {
  shortMessage?: string;
  details?: string;
  message?: string;
}

function extractRawMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  const candidate = error as PossibleWalletError;
  return candidate?.shortMessage || candidate?.details || candidate?.message || String(error);
}

function extractRevertReason(raw: string): string | null {
  const match = raw.match(/execution reverted:?\s*"?([^"\n]+)"?/i);
  return match ? match[1].trim().replace(/\.$/, '') : null;
}

function shorten(raw: string): string {
  const firstLine = raw.split('\n')[0].trim();
  return firstLine.length > 140 ? `${firstLine.slice(0, 140)}…` : firstLine;
}

export function friendlyError(error: unknown): string {
  const raw = extractRawMessage(error);
  const normalized = raw.toLowerCase();

  if (/user rejected|user denied|rejected the request|request rejected|denied transaction|4001/.test(normalized)) {
    return 'You cancelled the request.';
  }
  if (/insufficient funds|insufficient balance for gas|exceeds the balance|gas required exceeds/.test(normalized)) {
    return 'Not enough Sepolia ETH for gas. Fund your wallet from a faucet.';
  }
  if (/chain mismatch|does not match the target chain|wrong network|unsupported chain|chain id|switch chain/.test(normalized)) {
    return 'Switch your wallet to Ethereum Sepolia.';
  }
  if (/handle client is not ready|connector not connected|no account|not connected|connect a wallet/.test(normalized)) {
    return 'Connect your wallet to continue.';
  }
  if (/encrypt|handle gateway|gateway|decrypt|acl/.test(normalized)) {
    return 'Confidential service error. Please try again in a moment.';
  }
  if (/nonce|replacement transaction underpriced|already known|timeout|network request failed|fetch failed/.test(normalized)) {
    return 'Network is busy. Please try again.';
  }

  const revertReason = extractRevertReason(raw);
  if (revertReason) {
    return `Transaction failed: ${revertReason}`;
  }

  return shorten(raw) || 'Something went wrong. Please try again.';
}
