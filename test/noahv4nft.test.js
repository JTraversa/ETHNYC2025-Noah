const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Noahv4NFT", function () {
  let Noahv4NFT, noahNFT, MockERC721, nftA, nftB;
  let owner, user, beneficiary, other;

  const DEADLINE_DURATION = 60 * 60 * 24 * 7; // 7 days

  beforeEach(async function () {
    [owner, user, beneficiary, other] = await ethers.getSigners();

    MockERC721 = await ethers.getContractFactory("MockERC721");
    nftA = await MockERC721.deploy("CollectionA", "CLLA");
    nftB = await MockERC721.deploy("CollectionB", "CLLB");

    // Mint NFTs to user
    await nftA.mint(user.address, 1);
    await nftA.mint(user.address, 2);
    await nftB.mint(user.address, 10);

    Noahv4NFT = await ethers.getContractFactory("Noahv4NFT");
    noahNFT = await Noahv4NFT.deploy();
  });

  it("deploys", async function () {
    expect(await noahNFT.hasArk(user.address)).to.equal(false);
  });

  it("builds an ark and reads it back", async function () {
    const cols = [await nftA.getAddress(), await nftB.getAddress()];
    const ids = [1, 10];
    await noahNFT.connect(user).buildArk(beneficiary.address, DEADLINE_DURATION, cols, ids);

    const ark = await noahNFT.getArk(user.address);
    expect(ark[0]).to.equal(beneficiary.address);
    expect(ark[2]).to.equal(DEADLINE_DURATION);
    expect(ark[3]).to.deep.equal(cols);
    expect(ark[4].map(x => x.toString())).to.deep.equal(ids.map(String));
  });

  it("prevents double build", async function () {
    const cols = [await nftA.getAddress()];
    const ids = [1];
    await noahNFT.connect(user).buildArk(beneficiary.address, DEADLINE_DURATION, cols, ids);

    await expect(
      noahNFT.connect(user).buildArk(beneficiary.address, DEADLINE_DURATION, cols, ids)
    ).to.be.revertedWith("Account already initialized");
  });

  it("adds and removes nfts", async function () {
    const cols = [await nftA.getAddress()];
    const ids = [1];
    await noahNFT.connect(user).buildArk(beneficiary.address, DEADLINE_DURATION, cols, ids);

    await noahNFT.connect(user).addNFTs([await nftA.getAddress(), await nftB.getAddress()], [2, 10]);
    let ark = await noahNFT.getArk(user.address);
    expect(ark[3].length).to.equal(3);

    await noahNFT.connect(user).removeNFT(await nftA.getAddress(), 2);
    ark = await noahNFT.getArk(user.address);
    expect(ark[3].length).to.equal(2);
  });

  it("pings and updates deadline", async function () {
    const cols = [await nftA.getAddress()];
    const ids = [1];
    await noahNFT.connect(user).buildArk(beneficiary.address, DEADLINE_DURATION, cols, ids);
    const original = await noahNFT.getArk(user.address);
    const originalDeadline = original[1];

    await ethers.provider.send("evm_increaseTime", [3600]);
    await ethers.provider.send("evm_mine");

    await noahNFT.connect(user).pingArk();
    const afterPing = await noahNFT.getArk(user.address);
    expect(afterPing[1]).to.be.gt(originalDeadline);

    const newDuration = DEADLINE_DURATION * 2;
    await noahNFT.connect(user).updateDeadlineDuration(newDuration);
    const afterUpdate = await noahNFT.getArk(user.address);
    expect(afterUpdate[2]).to.equal(newDuration);
  });

  it("floods after deadline and transfers NFTs", async function () {
    const cols = [await nftA.getAddress(), await nftB.getAddress()];
    const ids = [1, 10];
    await noahNFT.connect(user).buildArk(beneficiary.address, DEADLINE_DURATION, cols, ids);

    // User must approve contract to transfer NFTs
    await nftA.connect(user).setApprovalForAll(await noahNFT.getAddress(), true);
    await nftB.connect(user).setApprovalForAll(await noahNFT.getAddress(), true);

    await ethers.provider.send("evm_increaseTime", [DEADLINE_DURATION + 1]);
    await ethers.provider.send("evm_mine");

    await noahNFT.connect(other).flood(user.address);

    expect(await nftA.ownerOf(1)).to.equal(beneficiary.address);
    expect(await nftB.ownerOf(10)).to.equal(beneficiary.address);

    const ark = await noahNFT.getArk(user.address);
    expect(ark[1]).to.equal(0); // reset
  });

  it("prevents flood before deadline", async function () {
    const cols = [await nftA.getAddress()];
    const ids = [1];
    await noahNFT.connect(user).buildArk(beneficiary.address, DEADLINE_DURATION, cols, ids);

    await expect(
      noahNFT.connect(other).flood(user.address)
    ).to.be.revertedWith("Deadline has not passed");
  });
});


