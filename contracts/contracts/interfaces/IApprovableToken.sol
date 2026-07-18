// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IApprovableToken {
    function approve(address spender, uint256 amount) external returns (bool);
}
