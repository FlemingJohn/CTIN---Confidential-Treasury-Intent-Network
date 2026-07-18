// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {
    Nox,
    euint256,
    externalEuint256
} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";
import {IConfidentialIntentNetwork} from "../interfaces/IConfidentialIntentNetwork.sol";
import {IExecutionAdapter} from "../interfaces/IExecutionAdapter.sol";
import {ISettlementModule} from "../interfaces/ISettlementModule.sol";
import {IApprovableToken} from "../interfaces/IApprovableToken.sol";

contract ConfidentialIntentNetwork is IConfidentialIntentNetwork {
    struct SubmittedIntent {
        address institution;
        euint256 encryptedAmount;
        bool isBuy;
    }

    struct Batch {
        BatchStatus status;
        uint256 openedAtTimestamp;
        euint256 encryptedBuyTotal;
        euint256 encryptedSellTotal;
        bytes32 settlementReference;
        SubmittedIntent[] intents;
    }

    address public immutable networkOperator;
    address public immutable disclosureAuthority;
    address public executionAdapter;
    address public settlementModule;

    uint256 private nextBatchId;
    mapping(uint256 => Batch) private batches;
    mapping(address => address) private institutionAuditor;

    modifier onlyNetworkOperator() {
        require(msg.sender == networkOperator, "caller is not the network operator");
        _;
    }

    constructor(address disclosureAuthorityAddress) {
        networkOperator = msg.sender;
        disclosureAuthority = disclosureAuthorityAddress;
    }

    function setExecutionAdapter(address adapter) external onlyNetworkOperator {
        executionAdapter = adapter;
    }

    function setSettlementModule(address module) external onlyNetworkOperator {
        settlementModule = module;
    }

    function authorizeAuditor(address auditor) external {
        require(auditor != address(0), "auditor is the zero address");
        institutionAuditor[msg.sender] = auditor;
        emit AuditorAuthorized(msg.sender, auditor);
    }

    function revokeAuditor() external {
        address previousAuditor = institutionAuditor[msg.sender];
        delete institutionAuditor[msg.sender];
        emit AuditorRevoked(msg.sender, previousAuditor);
    }

    function auditorOf(address institution) external view returns (address) {
        return institutionAuditor[institution];
    }

    function openBatch() external onlyNetworkOperator returns (uint256 batchId) {
        batchId = nextBatchId;
        nextBatchId += 1;

        Batch storage batch = batches[batchId];
        batch.status = BatchStatus.Open;
        batch.openedAtTimestamp = block.timestamp;
        batch.encryptedBuyTotal = Nox.toEuint256(0);
        batch.encryptedSellTotal = Nox.toEuint256(0);

        Nox.allowThis(batch.encryptedBuyTotal);
        Nox.allowThis(batch.encryptedSellTotal);

        emit BatchOpened(batchId, batch.openedAtTimestamp);
    }

    function submitIntent(
        uint256 batchId,
        externalEuint256 encryptedAmountHandle,
        bytes calldata encryptedAmountProof,
        bool isBuy
    ) external {
        Batch storage batch = batches[batchId];
        require(batch.status == BatchStatus.Open, "batch is not open");

        euint256 encryptedAmount = Nox.fromExternal(encryptedAmountHandle, encryptedAmountProof);

        if (isBuy) {
            batch.encryptedBuyTotal = Nox.add(batch.encryptedBuyTotal, encryptedAmount);
        } else {
            batch.encryptedSellTotal = Nox.add(batch.encryptedSellTotal, encryptedAmount);
        }

        batch.intents.push(
            SubmittedIntent({
                institution: msg.sender,
                encryptedAmount: encryptedAmount,
                isBuy: isBuy
            })
        );

        Nox.allowThis(encryptedAmount);
        Nox.allow(encryptedAmount, msg.sender);
        Nox.allow(encryptedAmount, disclosureAuthority);

        address authorizedAuditor = institutionAuditor[msg.sender];
        if (authorizedAuditor != address(0)) {
            Nox.addViewer(encryptedAmount, authorizedAuditor);
        }

        Nox.allowThis(batch.encryptedBuyTotal);
        Nox.allowThis(batch.encryptedSellTotal);
        Nox.allow(batch.encryptedBuyTotal, networkOperator);
        Nox.allow(batch.encryptedSellTotal, networkOperator);

        emit IntentSubmitted(batchId, msg.sender, isBuy, euint256.unwrap(encryptedAmount));
    }

    function closeBatch(uint256 batchId) external onlyNetworkOperator {
        Batch storage batch = batches[batchId];
        require(batch.status == BatchStatus.Open, "batch is not open");
        batch.status = BatchStatus.Netting;
        emit BatchClosed(batchId);
    }

    function settleBatch(
        uint256 batchId,
        bytes32 settlementReference
    ) external onlyNetworkOperator {
        Batch storage batch = batches[batchId];
        require(batch.status == BatchStatus.Netting, "batch is not netting");
        batch.status = BatchStatus.Settled;
        batch.settlementReference = settlementReference;
        emit BatchSettled(batchId, settlementReference);
    }

    function executeSettlement(
        uint256 batchId,
        address safe,
        address assetIn,
        address assetOut,
        uint256 netAmountIn,
        uint256 minimumAmountOut,
        address recipient,
        bytes32 settlementReference
    ) external onlyNetworkOperator returns (uint256 amountOut) {
        Batch storage batch = batches[batchId];
        require(batch.status == BatchStatus.Netting, "batch is not netting");
        require(
            settlementModule != address(0) && executionAdapter != address(0),
            "settlement is not configured"
        );

        batch.status = BatchStatus.Executing;

        bool pulled = ISettlementModule(settlementModule).pullForSettlement(
            safe,
            batchId,
            assetIn,
            netAmountIn,
            address(this)
        );
        require(pulled, "safe pull failed");

        IApprovableToken(assetIn).approve(executionAdapter, netAmountIn);
        amountOut = IExecutionAdapter(executionAdapter).executeNetResidual(
            assetIn,
            assetOut,
            netAmountIn,
            minimumAmountOut,
            recipient
        );

        batch.status = BatchStatus.Settled;
        batch.settlementReference = settlementReference;
        emit BatchSettled(batchId, settlementReference);
        emit BatchExecuted(batchId, assetIn, assetOut, netAmountIn, amountOut);
    }

    function batchStatusOf(uint256 batchId) external view returns (BatchStatus) {
        return batches[batchId].status;
    }

    function encryptedBuyTotalOf(uint256 batchId) external view returns (euint256) {
        return batches[batchId].encryptedBuyTotal;
    }

    function encryptedSellTotalOf(uint256 batchId) external view returns (euint256) {
        return batches[batchId].encryptedSellTotal;
    }

    function intentCountOf(uint256 batchId) external view returns (uint256) {
        return batches[batchId].intents.length;
    }
}
