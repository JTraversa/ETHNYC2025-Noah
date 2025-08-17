const { ethers } = require("hardhat");

async function debugTest() {
    try {
        console.log("Starting debug test...");
        
        // Get signers
        const [owner, user, beneficiary] = await ethers.getSigners();
        console.log("Signers obtained:", {
            owner: owner.address,
            user: user.address,
            beneficiary: beneficiary.address
        });

        // Deploy Mock USDC
        console.log("Deploying MockERC20...");
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        const usdc = await MockERC20.deploy("USD Coin", "USDC", ethers.parseEther("1000000"));
        console.log("MockERC20 deployed at:", await usdc.getAddress());

        // Deploy Mock Token1
        console.log("Deploying MockERC20 for Token1...");
        const token1 = await MockERC20.deploy("Token1", "TK1", ethers.parseEther("10000"));
        console.log("Token1 deployed at:", await token1.getAddress());

        // Deploy Mock Uniswap Router
        console.log("Deploying MockUniswapV2Router...");
        const MockUniswapV2Router = await ethers.getContractFactory("MockUniswapV2Router");
        const mockRouter = await MockUniswapV2Router.deploy(await usdc.getAddress());
        console.log("MockRouter deployed at:", await mockRouter.getAddress());

        // Deploy Noah
        console.log("Deploying Noah...");
        const Noah = await ethers.getContractFactory("Noah");
        const noah = await Noah.deploy(await mockRouter.getAddress(), await usdc.getAddress());
        console.log("Noah deployed at:", await noah.getAddress());

        // Try to build an Ark
        console.log("Building Ark...");
        const tokens = [await token1.getAddress()];
        const tx = await noah.connect(user).buildArk(beneficiary.address, 86400, tokens);
        console.log("Ark build transaction sent:", tx.hash);
        
        // Wait for transaction
        const receipt = await tx.wait();
        console.log("Transaction mined in block:", receipt.blockNumber);

        // Try to read the Ark using custom getter
        console.log("Reading Ark...");
        const ark = await noah.getArk(user.address);
        console.log("Ark data:", ark);
        
        if (ark) {
            console.log("Ark beneficiary:", ark[0]);
            console.log("Ark deadline:", ark[1].toString());
            console.log("Ark deadline duration:", ark[2].toString());
            console.log("Ark tokens length:", ark[3].length);
            console.log("Ark tokens:", ark[3]);
        } else {
            console.log("Ark is undefined!");
        }

        console.log("Debug test completed successfully!");
        
    } catch (error) {
        console.error("Debug test failed:", error);
        console.error("Error details:", error.message);
    }
}

debugTest();
