// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IContributionRegistry {
    function getContributorScore(address contributor) external view returns (uint256);
}

/// @notice Burns score (off-chain accounting) to mint a badge NFT.
///         Score in the registry is a non-decreasing accumulator, so this vault
///         tracks `usedScore` per contributor. Available = score - used.
contract RedeemVault is ERC721 {
    IContributionRegistry public immutable registry;

    uint256 public nextBadgeId = 1;
    mapping(address => uint256) private _usedScore;

    error InsufficientScore();
    error NoReputationNft();
    error ZeroAddress();

    event BadgeRedeemed(address indexed contributor, uint256 indexed badgeId, uint256 scoreCost);

    constructor(address registry_) ERC721("Contribution Badge", "CBADGE") {
        if (registry_ == address(0)) revert ZeroAddress();
        registry = IContributionRegistry(registry_);
    }

    function usedScore(address contributor) external view returns (uint256) {
        return _usedScore[contributor];
    }

    function availableScore(address contributor) public view returns (uint256) {
        return registry.getContributorScore(contributor) - _usedScore[contributor];
    }

    function redeemBadge(uint256 scoreCost) external returns (uint256 badgeId) {
        if (scoreCost == 0) revert InsufficientScore();
        if (IERC721(address(registry)).balanceOf(msg.sender) == 0) revert NoReputationNft();
        if (availableScore(msg.sender) < scoreCost) revert InsufficientScore();

        _usedScore[msg.sender] += scoreCost;
        badgeId = nextBadgeId++;
        _safeMint(msg.sender, badgeId);
        emit BadgeRedeemed(msg.sender, badgeId, scoreCost);
    }
}
