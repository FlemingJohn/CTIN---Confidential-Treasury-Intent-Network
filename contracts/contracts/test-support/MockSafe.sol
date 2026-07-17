// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ISafe} from "../interfaces/ISafe.sol";

contract MockSafe is ISafe {
    bool public executionShouldSucceed = true;

    function setExecutionShouldSucceed(bool value) external {
        executionShouldSucceed = value;
    }

    function executeCall(address to, bytes calldata data) external returns (bool) {
        (bool success, ) = to.call(data);
        return success;
    }

    function execTransactionFromModule(
        address to,
        uint256,
        bytes calldata data,
        Operation
    ) external returns (bool success) {
        if (!executionShouldSucceed) {
            return false;
        }
        (success, ) = to.call(data);
    }
}
