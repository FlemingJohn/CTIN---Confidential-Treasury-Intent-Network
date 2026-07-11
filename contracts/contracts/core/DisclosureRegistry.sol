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
