// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/// @notice Records a scored open-source contribution and mints a reputation NFT.
///         The maintainer signs the score off-chain. The contributor submits it.
contract ContributionRegistry is ERC721, EIP712, Ownable {
    struct Contribution {
        address contributor;
        uint256 prOrIssueId;
        uint256 valuationScore;
        uint256 timestamp;
        string repo;
        bool minted;
    }

    bytes32 private constant CONTRIBUTION_TYPEHASH = keccak256(
        "Contribution(address contributor,uint256 prOrIssueId,uint256 valuationScore,string repo,uint256 nonce)"
    );

    address public maintainer;
    uint256 public nextId = 1;

    mapping(uint256 => Contribution) private _contributions;
    mapping(address => uint256) private _scores;
    mapping(uint256 => bool) private _usedNonce;
    mapping(bytes32 => bool) private _usedWork;

    error ZeroAddress();
    error UnknownContribution();
    error InvalidSignature();
    error NonceUsed();
    error DuplicateContribution();

    event ContributionSubmitted(
        address indexed contributor,
        uint256 indexed prOrIssueId,
        uint256 valuationScore,
        uint256 timestamp,
        address indexed submitter
    );
    event ReputationMinted(address indexed to, uint256 indexed tokenId);

    constructor(address maintainer_)
        ERC721("Contribution Reputation", "CREP")
        EIP712("ContributionRegistry", "1")
        Ownable(msg.sender)
    {
        if (maintainer_ == address(0)) revert ZeroAddress();
        maintainer = maintainer_;
    }

    function setMaintainer(address maintainer_) external onlyOwner {
        if (maintainer_ == address(0)) revert ZeroAddress();
        maintainer = maintainer_;
    }

    function submitContribution(
        address contributor,
        uint256 prOrIssueId,
        uint256 valuationScore,
        string calldata repo,
        uint256 nonce,
        bytes calldata signature
    ) external returns (uint256 id) {
        if (_usedNonce[nonce]) revert NonceUsed();
        bytes32 workId = keccak256(abi.encode(repo, prOrIssueId));
        if (_usedWork[workId]) revert DuplicateContribution();

        address signer = ECDSA.recover(
            hashContribution(contributor, prOrIssueId, valuationScore, repo, nonce), signature
        );
        if (signer != maintainer) revert InvalidSignature();

        _usedNonce[nonce] = true;
        _usedWork[workId] = true;
        id = _record(contributor, prOrIssueId, valuationScore, repo);
        _mintReputation(id, contributor);
        emit ContributionSubmitted(contributor, prOrIssueId, valuationScore, block.timestamp, msg.sender);
    }

    function getContribution(uint256 id) external view returns (Contribution memory) {
        if (id == 0 || id >= nextId) revert UnknownContribution();
        return _contributions[id];
    }

    function getContributorScore(address contributor) external view returns (uint256) {
        return _scores[contributor];
    }

    function usedNonce(uint256 nonce) external view returns (bool) {
        return _usedNonce[nonce];
    }

    /// @dev EIP-712 digest. Domain name is ContributionRegistry, version is 1.
    function hashContribution(
        address contributor,
        uint256 prOrIssueId,
        uint256 valuationScore,
        string calldata repo,
        uint256 nonce
    ) public view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(
                CONTRIBUTION_TYPEHASH, contributor, prOrIssueId, valuationScore, keccak256(bytes(repo)), nonce
            )
        );
        return _hashTypedDataV4(structHash);
    }

    function _record(address contributor, uint256 prOrIssueId, uint256 valuationScore, string memory repo)
        internal
        returns (uint256 id)
    {
        id = nextId++;
        _contributions[id] = Contribution({
            contributor: contributor,
            prOrIssueId: prOrIssueId,
            valuationScore: valuationScore,
            timestamp: block.timestamp,
            repo: repo,
            minted: false
        });
        _scores[contributor] += valuationScore;
    }

    function _mintReputation(uint256 id, address contributor) internal {
        _safeMint(contributor, id);
        _contributions[id].minted = true;
        emit ReputationMinted(contributor, id);
    }
}
