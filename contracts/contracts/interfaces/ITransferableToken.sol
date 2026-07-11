// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface ITransferableToken {
    function transfer(address recipient, uint256 amount) external returns (bool);
}
