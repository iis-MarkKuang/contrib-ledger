// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {ContributionRegistry} from "../src/ContributionRegistry.sol";

contract SubmitContributionTest is Test {
    uint256 internal maintainerKey = 0xA11CE;
    address internal maintainer = vm.addr(maintainerKey);
    address internal contributor = makeAddr("contributor");
    address internal submitter = makeAddr("submitter");
    ContributionRegistry internal registry;

    function setUp() public {
        registry = new ContributionRegistry(maintainer);
    }

    function test_validSignatureRecordsAndConsumesNonce() public {
        bytes memory signature = _sign(contributor, 7, 15, "demo", 1);

        vm.prank(submitter);
        uint256 id = registry.submitContribution(contributor, 7, 15, "demo", 1, signature);

        ContributionRegistry.Contribution memory stored = registry.getContribution(id);
        assertEq(stored.contributor, contributor);
        assertEq(stored.valuationScore, 15);
        assertTrue(registry.usedNonce(1));
        assertEq(registry.getContributorScore(contributor), 15);
    }

    function test_changedFieldFails() public {
        bytes memory signature = _sign(contributor, 7, 15, "demo", 1);

        vm.expectRevert(ContributionRegistry.InvalidSignature.selector);
        registry.submitContribution(contributor, 7, 16, "demo", 1, signature);
    }

    function test_reusedNonceFails() public {
        bytes memory signature = _sign(contributor, 7, 15, "demo", 1);
        registry.submitContribution(contributor, 7, 15, "demo", 1, signature);

        bytes memory second = _sign(contributor, 8, 15, "demo", 1);
        vm.expectRevert(ContributionRegistry.NonceUsed.selector);
        registry.submitContribution(contributor, 8, 15, "demo", 1, second);
    }

    function test_duplicateWorkFails() public {
        registry.submitContribution(contributor, 7, 15, "demo", 1, _sign(contributor, 7, 15, "demo", 1));

        bytes memory second = _sign(contributor, 7, 15, "demo", 2);
        vm.expectRevert(ContributionRegistry.DuplicateContribution.selector);
        registry.submitContribution(contributor, 7, 15, "demo", 2, second);
    }

    function _sign(address to, uint256 prId, uint256 score, string memory repo, uint256 nonce)
        internal
        view
        returns (bytes memory)
    {
        bytes32 digest = registry.hashContribution(to, prId, score, repo, nonce);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(maintainerKey, digest);
        return abi.encodePacked(r, s, v);
    }
}
