// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {ContributionRegistry} from "../src/ContributionRegistry.sol";

contract ReputationNftTest is Test {
    uint256 internal maintainerKey = 0xA11CE;
    address internal contributor = makeAddr("contributor");
    ContributionRegistry internal registry;

    function setUp() public {
        registry = new ContributionRegistry(vm.addr(maintainerKey));
    }

    function test_submitMintsToContributor() public {
        bytes32 digest = registry.hashContribution(contributor, 3, 9, "demo", 4);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(maintainerKey, digest);

        uint256 id = registry.submitContribution(contributor, 3, 9, "demo", 4, abi.encodePacked(r, s, v));

        assertEq(registry.ownerOf(id), contributor);
        assertEq(registry.balanceOf(contributor), 1);
        assertTrue(registry.getContribution(id).minted);
    }
}
