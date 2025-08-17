// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title Noahv4NFT
 * @notice Dead man switch for ERC721 assets. Users create an Ark specifying
 *         a beneficiary, a timeout, and a set of NFTs (collection, tokenId).
 *         If not pinged before the deadline, anyone may trigger a flood to
 *         transfer the user's specified NFTs directly to the beneficiary.
 *         No liquidation is performed.
 */
contract Noahv4NFT {
    struct NFTPosition {
        address collection;
        uint256 tokenId;
    }

    struct Ark {
        address beneficiary;
        uint256 deadline;
        uint256 deadlineDuration;
        NFTPosition[] nfts;
    }

    mapping(address => Ark) private arks;

    // Events
    event ArkBuilt(address indexed user, address indexed beneficiary, uint256 deadline);
    event ArkPinged(address indexed user, uint256 newDeadline);
    event FloodTriggered(address indexed user, address indexed beneficiary, uint256 numNFTs);
    event NFTsAdded(address indexed user, address[] collections, uint256[] tokenIds);
    event NFTRemoved(address indexed user, address indexed collection, uint256 tokenId);
    event DeadlineUpdated(address indexed user, uint256 newDuration, uint256 newDeadline);
    event BeneficiaryUpdated(address indexed user, address indexed newBeneficiary);

    // Views
    function getArk(
        address user
    ) external view returns (
        address beneficiary,
        uint256 deadline,
        uint256 deadlineDuration,
        address[] memory collections,
        uint256[] memory tokenIds
    ) {
        Ark storage a = arks[user];
        uint256 len = a.nfts.length;
        collections = new address[](len);
        tokenIds = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            collections[i] = a.nfts[i].collection;
            tokenIds[i] = a.nfts[i].tokenId;
        }
        return (a.beneficiary, a.deadline, a.deadlineDuration, collections, tokenIds);
    }

    function hasArk(address user) external view returns (bool) {
        return arks[user].deadline != 0;
    }

    // Mutations
    function buildArk(
        address beneficiary,
        uint256 deadlineDuration,
        address[] calldata collections,
        uint256[] calldata tokenIds
    ) external {
        require(arks[msg.sender].deadline == 0, "Account already initialized");
        require(beneficiary != address(0), "Beneficiary cannot be zero");
        require(deadlineDuration > 0, "Deadline duration must be > 0");
        require(collections.length == tokenIds.length, "Length mismatch");

        Ark storage a = arks[msg.sender];
        a.beneficiary = beneficiary;
        a.deadlineDuration = deadlineDuration;
        a.deadline = block.timestamp + deadlineDuration;

        for (uint256 i = 0; i < collections.length; i++) {
            a.nfts.push(NFTPosition({collection: collections[i], tokenId: tokenIds[i]}));
        }

        emit ArkBuilt(msg.sender, beneficiary, a.deadline);
        if (collections.length > 0) {
            emit NFTsAdded(msg.sender, collections, tokenIds);
        }
    }

    function pingArk() external {
        require(arks[msg.sender].deadline != 0, "Account not initialized");
        uint256 newDeadline = block.timestamp + arks[msg.sender].deadlineDuration;
        arks[msg.sender].deadline = newDeadline;
        emit ArkPinged(msg.sender, newDeadline);
    }

    function updateDeadlineDuration(uint256 newDuration) external {
        require(arks[msg.sender].deadline != 0, "Ark not built");
        require(newDuration > 0, "Duration must be > 0");
        arks[msg.sender].deadlineDuration = newDuration;
        arks[msg.sender].deadline = block.timestamp + newDuration;
        emit DeadlineUpdated(msg.sender, newDuration, arks[msg.sender].deadline);
    }

    function updateBeneficiary(address newBeneficiary) external {
        require(arks[msg.sender].deadline != 0, "Ark not built");
        require(newBeneficiary != address(0), "Beneficiary cannot be zero");
        arks[msg.sender].beneficiary = newBeneficiary;
        emit BeneficiaryUpdated(msg.sender, newBeneficiary);
    }

    function addNFTs(address[] calldata collections, uint256[] calldata tokenIds) external {
        require(arks[msg.sender].deadline != 0, "Ark not built");
        require(collections.length == tokenIds.length, "Length mismatch");
        Ark storage a = arks[msg.sender];
        for (uint256 i = 0; i < collections.length; i++) {
            a.nfts.push(NFTPosition({collection: collections[i], tokenId: tokenIds[i]}));
        }
        emit NFTsAdded(msg.sender, collections, tokenIds);
    }

    function removeNFT(address collection, uint256 tokenId) external {
        require(arks[msg.sender].deadline != 0, "Ark not built");
        Ark storage a = arks[msg.sender];
        uint256 len = a.nfts.length;
        for (uint256 i = 0; i < len; i++) {
            if (a.nfts[i].collection == collection && a.nfts[i].tokenId == tokenId) {
                // swap & pop
                a.nfts[i] = a.nfts[len - 1];
                a.nfts.pop();
                emit NFTRemoved(msg.sender, collection, tokenId);
                return;
            }
        }
        revert("NFT not found");
    }

    /**
     * @notice Trigger flood for a user when the deadline has passed.
     *         Transfers each saved NFT from the user to the beneficiary.
     *         Requires prior approval for this contract to transfer the NFTs
     *         (either per-token approvals or setApprovalForAll).
     */
    function flood(address user) external {
        Ark storage a = arks[user];
        require(a.deadline != 0, "Account not initialized");
        require(block.timestamp >= a.deadline, "Deadline has not passed");

        address beneficiary = a.beneficiary;
        uint256 len = a.nfts.length;

        for (uint256 i = 0; i < len; i++) {
            NFTPosition storage p = a.nfts[i];
            // Will revert if contract lacks approval
            IERC721(p.collection).transferFrom(user, beneficiary, p.tokenId);
        }

        // reset Ark
        a.deadline = 0;
        emit FloodTriggered(user, beneficiary, len);
    }
}


