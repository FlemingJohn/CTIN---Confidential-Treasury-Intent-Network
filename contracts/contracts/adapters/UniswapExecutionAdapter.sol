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
