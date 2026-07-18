// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface ISettlementModule {
    function pullForSettlement(
        address safe,
        uint256 batchId,
        address token,
        uint256 amount,
        address recipient
    ) external returns (bool);
}
