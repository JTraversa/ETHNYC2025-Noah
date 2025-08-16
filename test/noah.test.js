const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Noah", function () {
    let Noah, noah, MockERC20, usdc, token1, MockUniswapV2Router, mockRouter;
    let owner, user, beneficiary, other;

    const DEADLINE_DURATION = 60 * 60 * 24 * 30; // 30 days

    beforeEach(async function () {
        [owner, user, beneficiary, other] = await ethers.getSigners();

        // Deploy Mock USDC
        MockERC20 = await ethers.getContractFactory("MockERC20");
        usdc = await MockERC20.deploy("USD Coin", "USDC", ethers.parseEther("1000000"));

        // Deploy Mock Token1
        token1 = await MockERC20.deploy("Token1", "TK1", ethers.parseEther("10000"));
        
        // Transfer some Token1 to the user
        await token1.transfer(user.address, ethers.parseEther("100"));

        // Deploy Mock Uniswap Router
        MockUniswapV2Router = await ethers.getContractFactory("MockUniswapV2Router");
        mockRouter = await MockUniswapV2Router.deploy(await usdc.getAddress());
        
        // Fund the Mock Router with USDC to simulate swaps
        await usdc.transfer(await mockRouter.getAddress(), ethers.parseEther("500000"));
        
        // Deploy Noah
        Noah = await ethers.getContractFactory("Noah");
        noah = await Noah.deploy(await mockRouter.getAddress(), await usdc.getAddress());
    });

    describe("Ark Management", function () {
        it("Should allow a user to build an Ark", async function () {
            const tokens = [await token1.getAddress()];
            await noah.connect(user).buildArk(beneficiary.address, DEADLINE_DURATION, tokens);

            const account = await noah.arks(user.address);
            expect(account.beneficiary).to.equal(beneficiary.address);
            expect(account.deadline).to.not.equal(0);
        });

        it("Should allow a user to reset their Ark", async function () {
            const tokens = [await token1.getAddress()];
            await noah.connect(user).buildArk(beneficiary.address, DEADLINE_DURATION, tokens);
            
            const oldAccount = await noah.arks(user.address);
            const oldDeadline = oldAccount.deadline;

            // Increase time by a bit
            await ethers.provider.send("evm_increaseTime", [60]);
            await ethers.provider.send("evm_mine");

            await noah.connect(user).resetArk();
            const newAccount = await noah.arks(user.address);
            expect(newAccount.deadline).to.be.above(oldDeadline);
        });
    });

    describe("Recovery and Selling", function () {
        beforeEach(async function () {
            const tokens = [await token1.getAddress()];
            await noah.connect(user).buildArk(beneficiary.address, DEADLINE_DURATION, tokens);
            // User approves Noah to spend their Token1
            await token1.connect(user).approve(await noah.getAddress(), ethers.parseEther("100"));
        });

        it("Should fail if deadline has not passed", async function () {
            await expect(noah.recoverAndSell(user.address)).to.be.revertedWith("Deadline has not passed");
        });

        it("Should recover and sell tokens after deadline", async function () {
            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [DEADLINE_DURATION + 1]);
            await ethers.provider.send("evm_mine");

            const initialBeneficiaryUsdc = await usdc.balanceOf(beneficiary.address);
            await noah.recoverAndSell(user.address);
            const finalBeneficiaryUsdc = await usdc.balanceOf(beneficiary.address);

            // Check beneficiary balance
            const recoveredAmount = finalBeneficiaryUsdc - initialBeneficiaryUsdc;
            expect(recoveredAmount).to.equal(ethers.parseEther("100"));

            // Check user's token balance is now 0
            const userTokenBalance = await token1.balanceOf(user.address);
            expect(userTokenBalance).to.equal(0);

            // Check that the user's account is reset
            const account = await noah.arks(user.address);
            expect(account.deadline).to.equal(0);
        });

        it("Should allow user to build a new Ark after the old one is drained", async function () {
            // Fast forward time and recover
            await ethers.provider.send("evm_increaseTime", [DEADLINE_DURATION + 1]);
            await ethers.provider.send("evm_mine");
            await noah.recoverAndSell(user.address);

            // User gets more tokens
            await token1.transfer(user.address, ethers.parseEther("50"));

            // Set up a new switch
            const newBeneficiary = other;
            const newTokens = [await token1.getAddress()];
            await noah.connect(user).buildArk(newBeneficiary.address, DEADLINE_DURATION, newTokens);

            const newAccount = await noah.arks(user.address);
            expect(newAccount.beneficiary).to.equal(newBeneficiary.address);
            expect(newAccount.deadline).to.not.equal(0);
        });
    });


});
