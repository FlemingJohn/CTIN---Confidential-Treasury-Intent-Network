// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {MockErc20Token} from "./MockErc20Token.sol";

contract MockSwapRouter {
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
    ) external payable returns (uint256 amountOut) {
        MockErc20Token(parameters.tokenIn).transferFrom(
            msg.sender,
            address(this),
            parameters.amountIn
        );
        amountOut = parameters.amountIn;
        require(amountOut >= parameters.amountOutMinimum, "insufficient output");
        MockErc20Token(parameters.tokenOut).mint(parameters.recipient, amountOut);
    }
}
