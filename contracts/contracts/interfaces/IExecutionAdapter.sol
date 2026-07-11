// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IExecutionAdapter {
    function executeNetResidual(
        address assetIn,
        address assetOut,
        uint256 residualAmountIn,
        uint256 minimumAmountOut,
        address recipient
    ) external returns (uint256 amountOut);
}
