# CTIN Contract Code

Complete Solidity contract code for the Confidential Treasury Intent Network.

## Core Contracts

### ConfidentialIntentNetwork.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {
    Nox,
    euint256,
    externalEuint256
} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";
import {IConfidentialIntentNetwork} from "../interfaces/IConfidentialIntentNetwork.sol";

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

    uint256 private nextBatchId;
    mapping(uint256 => Batch) private batches;

    modifier onlyNetworkOperator() {
        require(msg.sender == networkOperator, "caller is not the network operator");
        _;
    }

    constructor(address disclosureAuthorityAddress) {
        networkOperator = msg.sender;
        disclosureAuthority = disclosureAuthorityAddress;
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

        Nox.allowThis(batch.encryptedBuyTotal);
        Nox.allowThis(batch.encryptedSellTotal);
        Nox.allow(batch.encryptedBuyTotal, networkOperator);
        Nox.allow(batch.encryptedSellTotal, networkOperator);

        emit IntentSubmitted(batchId, msg.sender, isBuy);
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
```

### DisclosureRegistry.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract DisclosureRegistry {
    event DisclosureGranted(address indexed institution, address indexed auditor);
    event DisclosureRevoked(address indexed institution, address indexed auditor);

    mapping(address => mapping(address => bool)) private disclosureGrants;

    function grantDisclosure(address auditor) external {
        disclosureGrants[msg.sender][auditor] = true;
        emit DisclosureGranted(msg.sender, auditor);
    }

    function revokeDisclosure(address auditor) external {
        disclosureGrants[msg.sender][auditor] = false;
        emit DisclosureRevoked(msg.sender, auditor);
    }

    function isDisclosureGranted(
        address institution,
        address auditor
    ) external view returns (bool) {
        return disclosureGrants[institution][auditor];
    }
}
```

### TreasurySafeModule.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ISafe} from "../interfaces/ISafe.sol";
import {ITransferableToken} from "../interfaces/ITransferableToken.sol";

contract TreasurySafeModule {
    event BatchAllowanceSet(
        address indexed safe,
        uint256 indexed batchId,
        address indexed token,
        uint256 amount
    );
    event SettlementPulled(
        address indexed safe,
        uint256 indexed batchId,
        address indexed token,
        address recipient,
        uint256 amount
    );

    address public immutable settlementCoordinator;

    mapping(address => mapping(uint256 => mapping(address => uint256))) private batchAllowance;

    modifier onlySettlementCoordinator() {
        require(msg.sender == settlementCoordinator, "caller is not the settlement coordinator");
        _;
    }

    constructor(address settlementCoordinatorAddress) {
        settlementCoordinator = settlementCoordinatorAddress;
    }

    function setBatchAllowance(uint256 batchId, address token, uint256 amount) external {
        batchAllowance[msg.sender][batchId][token] = amount;
        emit BatchAllowanceSet(msg.sender, batchId, token, amount);
    }

    function allowanceOf(
        address safe,
        uint256 batchId,
        address token
    ) external view returns (uint256) {
        return batchAllowance[safe][batchId][token];
    }

    function pullForSettlement(
        address safe,
        uint256 batchId,
        address token,
        uint256 amount,
        address recipient
    ) external onlySettlementCoordinator returns (bool) {
        uint256 remainingAllowance = batchAllowance[safe][batchId][token];
        require(amount <= remainingAllowance, "amount exceeds batch allowance");

        batchAllowance[safe][batchId][token] = remainingAllowance - amount;

        bytes memory transferCallData = abi.encodeWithSelector(
            ITransferableToken.transfer.selector,
            recipient,
            amount
        );

        bool success = ISafe(safe).execTransactionFromModule(
            token,
            0,
            transferCallData,
            ISafe.Operation.Call
        );
        require(success, "safe module transfer failed");

        emit SettlementPulled(safe, batchId, token, recipient, amount);
        return success;
    }
}
```

## Interface Contracts

### IConfidentialIntentNetwork.sol

```solidity
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
```

### ISafe.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface ISafe {
    enum Operation {
        Call,
        DelegateCall
    }

    function execTransactionFromModule(
        address to,
        uint256 value,
        bytes calldata data,
        Operation operation
    ) external returns (bool success);
}
```

### ITransferableToken.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface ITransferableToken {
    function transfer(address recipient, uint256 amount) external returns (bool);
}
```

### IExecutionAdapter.sol

```solidity
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
```

## Adapter Contracts

### UniswapExecutionAdapter.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IExecutionAdapter} from "../interfaces/IExecutionAdapter.sol";

interface IUniswapSwapRouter {
    struct ExactInputSingleParameters {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(
        ExactInputSingleParameters calldata parameters
    ) external payable returns (uint256 amountOut);
}

interface IErc20Token {
    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract UniswapExecutionAdapter is IExecutionAdapter {
    uint24 public constant DEFAULT_POOL_FEE = 3000;

    IUniswapSwapRouter public immutable swapRouter;
    address public immutable networkContract;

    modifier onlyNetworkContract() {
        require(msg.sender == networkContract, "caller is not the network contract");
        _;
    }

    constructor(address swapRouterAddress, address networkContractAddress) {
        swapRouter = IUniswapSwapRouter(swapRouterAddress);
        networkContract = networkContractAddress;
    }

    function executeNetResidual(
        address assetIn,
        address assetOut,
        uint256 residualAmountIn,
        uint256 minimumAmountOut,
        address recipient
    ) external onlyNetworkContract returns (uint256 amountOut) {
        IErc20Token(assetIn).transferFrom(msg.sender, address(this), residualAmountIn);
        IErc20Token(assetIn).approve(address(swapRouter), residualAmountIn);

        IUniswapSwapRouter.ExactInputSingleParameters memory parameters = IUniswapSwapRouter
            .ExactInputSingleParameters({
                tokenIn: assetIn,
                tokenOut: assetOut,
                fee: DEFAULT_POOL_FEE,
                recipient: recipient,
                amountIn: residualAmountIn,
                amountOutMinimum: minimumAmountOut,
                sqrtPriceLimitX96: 0
            });

        amountOut = swapRouter.exactInputSingle(parameters);
    }
}
```

## Contract Architecture Overview

The CTIN smart contracts implement a confidential intent network for treasury operations:

- **ConfidentialIntentNetwork**: Main contract managing encrypted intent batches with FHE (Fully Homomorphic Encryption) support via Nox protocol
- **DisclosureRegistry**: Manages audit permissions for institutional transparency
- **TreasurySafeModule**: Integrates with Safe multisigs to enable secure fund settlement
- **UniswapExecutionAdapter**: Executes netting through Uniswap v3

All contracts use Solidity 0.8.27 and Ethereum Sepolia testnet.
