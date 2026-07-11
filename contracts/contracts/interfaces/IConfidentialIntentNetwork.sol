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
    event IntentSubmitted(uint256 indexed batchId, address indexed institution, bool isBuy);
    event BatchClosed(uint256 indexed batchId);
    event BatchSettled(uint256 indexed batchId, bytes32 settlementReference);

    function openBatch() external returns (uint256 batchId);

    function submitIntent(
        uint256 batchId,
        externalEuint256 encryptedAmountHandle,
        bytes calldata encryptedAmountProof,
        bool isBuy
    ) external;

    function closeBatch(uint256 batchId) external;

    function settleBatch(uint256 batchId, bytes32 settlementReference) external;

    function batchStatusOf(uint256 batchId) external view returns (BatchStatus);
}
