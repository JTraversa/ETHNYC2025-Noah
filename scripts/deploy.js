const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying NoahV4 contracts...");

    // Get the contract factories
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const MockPoolManager = await ethers.getContractFactory("MockPoolManager");
    const NoahV4Hook = await ethers.getContractFactory("NoahV4Hook");
    const NoahV4 = await ethers.getContractFactory("NoahV4");

    // Deploy mock USDC
    console.log("Deploying Mock USDC...");
    const usdc = await MockERC20.deploy("USD Coin", "USDC", ethers.parseEther("1000000"));
    await usdc.waitForDeployment();
    console.log("Mock USDC deployed to:", await usdc.getAddress());

    // Deploy mock pool manager
    console.log("Deploying Mock Pool Manager...");
    const mockPoolManager = await MockPoolManager.deploy();
    await mockPoolManager.waitForDeployment();
    console.log("Mock Pool Manager deployed to:", await mockPoolManager.getAddress());

    // Deploy NoahV4Hook
    console.log("Deploying NoahV4Hook...");
    const noahV4Hook = await NoahV4Hook.deploy(await mockPoolManager.getAddress());
    await noahV4Hook.waitForDeployment();
    console.log("NoahV4Hook deployed to:", await noahV4Hook.getAddress());

    // Deploy NoahV4
    console.log("Deploying NoahV4...");
    const noahV4 = await NoahV4.deploy(
        await mockPoolManager.getAddress(),
        await usdc.getAddress(),
        await noahV4Hook.getAddress()
    );
    await noahV4.waitForDeployment();
    console.log("NoahV4 deployed to:", await noahV4.getAddress());

    // Deploy some mock tokens for testing
    console.log("Deploying Mock Tokens...");
    const token1 = await MockERC20.deploy("Token1", "TK1", ethers.parseEther("10000"));
    await token1.waitForDeployment();
    console.log("Token1 deployed to:", await token1.getAddress());

    const token2 = await MockERC20.deploy("Token2", "TK2", ethers.parseEther("10000"));
    await token2.waitForDeployment();
    console.log("Token2 deployed to:", await token2.getAddress());

    // Set up mock exchange rates
    console.log("Setting up mock exchange rates...");
    await mockPoolManager.setMockRate(
        await token1.getAddress(),
        await usdc.getAddress(),
        ethers.parseEther("0.5") // 1 token = 0.5 USDC
    );
    await mockPoolManager.setMockRate(
        await token2.getAddress(),
        await usdc.getAddress(),
        ethers.parseEther("0.5") // 1 token = 0.5 USDC
    );

    // Fund the mock pool manager with USDC
    console.log("Funding mock pool manager...");
    await usdc.transfer(await mockPoolManager.getAddress(), ethers.parseEther("500000"));

    console.log("\nDeployment Summary:");
    console.log("===================");
    console.log("Mock USDC:", await usdc.getAddress());
    console.log("Mock Pool Manager:", await mockPoolManager.getAddress());
    console.log("NoahV4Hook:", await noahV4Hook.getAddress());
    console.log("NoahV4:", await noahV4.getAddress());
    console.log("Token1:", await token1.getAddress());
    console.log("Token2:", await token2.getAddress());
    console.log("\nDeployment completed successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
