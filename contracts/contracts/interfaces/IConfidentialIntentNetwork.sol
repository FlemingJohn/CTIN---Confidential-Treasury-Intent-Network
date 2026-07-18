// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {externalEuint256} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";

interface IConfidentialIntentNetwork {
    enum BatchStatus {
        Open,
        Netting,
        Executing,
        Settled,
        Reverted
    }

    event BatchOpened(uint256 indexed batchId, uint256 openedAtTimestamp);
    event IntentSubmitted(
        uint256 indexed batchId,
        address indexed institution,
        bool isBuy,
        bytes32 handle
    );
    event BatchClosed(uint256 indexed batchId);
    event BatchSettled(uint256 indexed batchId, bytes32 settlementReference);
    event BatchExecuted(
        uint256 indexed batchId,
        address assetIn,
        address assetOut,
        uint256 amountIn,
        uint256 amountOut
    );
    event AuditorAuthorized(address indexed institution, address indexed auditor);
    event AuditorRevoked(address indexed institution, address indexed auditor);

    function openBatch() external returns (uint256 batchId);

    function submitIntent(
        uint256 batchId,
        externalEuint256 encryptedAmountHandle,
        bytes calldata encryptedAmountProof,
        bool isBuy
    ) external;

    function closeBatch(uint256 batchId) external;

    function settleBatch(uint256 batchId, bytes32 settlementReference) external;

    function executeSettlement(
        uint256 batchId,
        address safe,
        address assetIn,
        address assetOut,
        uint256 netAmountIn,
        uint256 minimumAmountOut,
        address recipient,
        bytes32 settlementReference
    ) external returns (uint256 amountOut);

    function setExecutionAdapter(address adapter) external;

    function setSettlementModule(address module) external;

    function authorizeAuditor(address auditor) external;

    function revokeAuditor() external;

    function auditorOf(address institution) external view returns (address);

    function batchStatusOf(uint256 batchId) external view returns (BatchStatus);
}
