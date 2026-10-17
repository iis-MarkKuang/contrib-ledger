// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {ContributionRegistry} from "../src/ContributionRegistry.sol";
import {RedeemVault} from "../src/RedeemVault.sol";

contract RedeemVaultTest is Test {
    uint256 internal maintainerKey = 0xA11CE;
    address internal maintainer = vm.addr(maintainerKey);
    address internal contributor = makeAddr("contributor");

    ContributionRegistry internal registry;
    RedeemVault internal vault;

    function setUp() public {
        registry = new ContributionRegistry(maintainer);
        vault = new RedeemVault(address(registry));
    }

    function _submit(uint256 prOrIssueId, uint256 score, string memory repo, uint256 nonce) internal {
        bytes32 digest = registry.hashContribution(contributor, prOrIssueId, score, repo, nonce);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(maintainerKey, digest);
        bytes memory sig = abi.encodePacked(r, s, v);
        registry.submitContribution(contributor, prOrIssueId, score, repo, nonce, sig);
    }

    function testRedeemSuccess() public {
        _submit(1, 35, "demo/repo", 1);
        assertEq(vault.availableScore(contributor), 35);
        vm.prank(contributor);
        uint256 badgeId = vault.redeemBadge(35);
        assertEq(badgeId, 1);
        assertEq(vault.ownerOf(1), contributor);
        assertEq(vault.availableScore(contributor), 0);
        assertEq(vault.usedScore(contributor), 35);
    }

    function testRedeemTwiceAccumulates() public {
        _submit(1, 70, "demo/repo", 1);
        vm.startPrank(contributor);
        vault.redeemBadge(35);
        vault.redeemBadge(35);
        vm.stopPrank();
        assertEq(vault.availableScore(contributor), 0);
        assertEq(vault.balanceOf(contributor), 2);
    }

    function testRevertInsufficientScore() public {
        _submit(1, 20, "demo/repo", 1);
        vm.prank(contributor);
        vm.expectRevert(RedeemVault.InsufficientScore.selector);
        vault.redeemBadge(35);
    }

    function testRevertNoReputationNft() public {
        address other = makeAddr("other");
        vm.prank(other);
        vm.expectRevert(RedeemVault.NoReputationNft.selector);
        vault.redeemBadge(1);
    }

    function testRevertZeroCost() public {
        _submit(1, 35, "demo/repo", 1);
        vm.prank(contributor);
        vm.expectRevert(RedeemVault.InsufficientScore.selector);
        vault.redeemBadge(0);
    }
}
