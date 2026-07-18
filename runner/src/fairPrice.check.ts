import assert from 'node:assert';
import { expectedAmountOut, minimumAmountOut, blendedClearingPrice, PRICE_SCALE } from './fairPrice';

const priceTwoToOne = 2n * PRICE_SCALE;

assert.equal(expectedAmountOut(150n, priceTwoToOne), 300n);
assert.equal(minimumAmountOut(150n, priceTwoToOne, 100n), 297n);
assert.equal(minimumAmountOut(150n, priceTwoToOne, 0n), 300n);
assert.equal(
  blendedClearingPrice(2n * PRICE_SCALE, 3n * PRICE_SCALE, 5000n),
  2n * PRICE_SCALE + PRICE_SCALE / 2n
);
assert.equal(blendedClearingPrice(2n * PRICE_SCALE, 3n * PRICE_SCALE, 0n), 2n * PRICE_SCALE);
assert.equal(blendedClearingPrice(2n * PRICE_SCALE, 3n * PRICE_SCALE, 10000n), 3n * PRICE_SCALE);

console.log('fair price checks passed');
