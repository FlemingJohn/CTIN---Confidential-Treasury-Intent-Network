// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ISafe} from "../interfaces/ISafe.sol";
import {TreasurySafeModule} from "../core/TreasurySafeModule.sol";

contract MockSafe is ISafe {
    function authorizeBatch(
        address module,
        uint256 batchId,
        address token,
        uint256 amount
    ) external {
        TreasurySafeModule(module).setBatchAllowance(batchId, token, amount);
    }

    function execTransactionFromModule(
        address to,
        uint256 value,
        bytes calldata data,
        Operation operation
    ) external returns (bool success) {
        require(operation == Operation.Call, "only call operation supported");
        (success, ) = to.call{value: value}(data);
        require(success, "mock safe execution failed");
    }
}
