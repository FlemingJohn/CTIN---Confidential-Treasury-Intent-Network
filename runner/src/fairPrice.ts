export const PRICE_SCALE = 10n ** 18n;
const BASIS_POINTS = 10000n;

export function expectedAmountOut(netAmountIn: bigint, priceX18: bigint): bigint {
  return (netAmountIn * priceX18) / PRICE_SCALE;
}

export function minimumAmountOut(
  netAmountIn: bigint,
  priceX18: bigint,
  slippageBps: bigint
): bigint {
  const expected = expectedAmountOut(netAmountIn, priceX18);
  return (expected * (BASIS_POINTS - slippageBps)) / BASIS_POINTS;
}

export function blendedClearingPrice(
  executedPriceX18: bigint,
  twapPriceX18: bigint,
  twapWeightBps: bigint
): bigint {
  const weight = twapWeightBps > BASIS_POINTS ? BASIS_POINTS : twapWeightBps;
  return (executedPriceX18 * (BASIS_POINTS - weight) + twapPriceX18 * weight) / BASIS_POINTS;
}
