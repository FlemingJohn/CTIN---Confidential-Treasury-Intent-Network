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
