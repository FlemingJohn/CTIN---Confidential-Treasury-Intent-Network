// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ITransferableToken} from "../interfaces/ITransferableToken.sol";

contract MockErc20Token is ITransferableToken {
    mapping(address => uint256) public balanceOf;

    function mint(address account, uint256 amount) external {
        balanceOf[account] += amount;
    }

    function transfer(address recipient, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        return true;
    }
}
