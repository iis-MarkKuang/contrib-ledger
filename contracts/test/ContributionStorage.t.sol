// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {ContributionRegistry} from "../src/ContributionRegistry.sol";

contract ContributionRegistryHarness is ContributionRegistry {
    constructor(address maintainer_) ContributionRegistry(maintainer_) {}

    function record(address contributor, uint256 prOrIssueId, uint256 valuationScore, string calldata repo)
        external
        returns (uint256)
    {
        return _record(contributor, prOrIssueId, valuationScore, repo);
    }
}

contract ContributionStorageTest is Test {
    ContributionRegistryHarness internal registry;
    address internal alice = makeAddr("alice");

    function setUp() public {
        registry = new ContributionRegistryHarness(makeAddr("maintainer"));
    }

    function test_recordAndReadBack() public {
        uint256 id = registry.record(alice, 42, 10, "contrib-ledger-demo");
        ContributionRegistry.Contribution memory stored = registry.getContribution(id);

        assertEq(stored.contributor, alice);
        assertEq(stored.prOrIssueId, 42);
        assertEq(stored.valuationScore, 10);
        assertEq(stored.repo, "contrib-ledger-demo");
        assertFalse(stored.minted);
        assertEq(registry.getContributorScore(alice), 10);
    }

    function test_scoresAccumulateForTheSameContributor() public {
        registry.record(alice, 1, 10, "repo");
        registry.record(alice, 2, 25, "repo");

        assertEq(registry.getContributorScore(alice), 35);
    }
}
