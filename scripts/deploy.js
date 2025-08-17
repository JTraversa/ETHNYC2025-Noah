const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("Deploying NoahV4 contracts...");

    // Get the contract factories
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const MockPoolManager = await ethers.getContractFactory("MockPoolManager");
    const NoahV4Hook = await ethers.getContractFactory("NoahV4Hook");
    const NoahV4 = await ethers.getContractFactory("NoahV4");
    const Noahv4NFT = await ethers.getContractFactory("Noahv4NFT");

    // Deploy mock USDC
    console.log("Deploying Mock USDC...");
    const usdc = await MockERC20.deploy("USD Coin", "USDC", ethers.parseEther("1000000"));
    await usdc.waitForDeployment();
    console.log("Mock USDC deployed to:", await usdc.getAddress());

    // Deploy mock PYUSD
    console.log("Deploying Mock PYUSD...");
    const pyrusd = await MockERC20.deploy("PayPal USD", "PYUSD", ethers.parseEther("1000000"));
    await pyrusd.waitForDeployment();
    console.log("Mock PYUSD deployed to:", await pyrusd.getAddress());

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
        await pyrusd.getAddress(),
        await noahV4Hook.getAddress()
    );
    await noahV4.waitForDeployment();
    console.log("NoahV4 deployed to:", await noahV4.getAddress());

    // Deploy Noahv4NFT (ERC721 Ark)
    console.log("Deploying Noahv4NFT...");
    const noahV4Nft = await Noahv4NFT.deploy();
    await noahV4Nft.waitForDeployment();
    console.log("Noahv4NFT deployed to:", await noahV4Nft.getAddress());

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
    console.log("Mock PYUSD:", await pyrusd.getAddress());
    console.log("Mock Pool Manager:", await mockPoolManager.getAddress());
    console.log("NoahV4Hook:", await noahV4Hook.getAddress());
    console.log("NoahV4:", await noahV4.getAddress());
    console.log("Noahv4NFT:", await noahV4Nft.getAddress());
    console.log("Token1:", await token1.getAddress());
    console.log("Token2:", await token2.getAddress());
    console.log("\nDeployment completed successfully!");

    // Write/update frontend env vars for this chain
    try {
        const net = await ethers.provider.getNetwork();
        const chainId = Number(net.chainId);
        const envPath = '.env.local';
        const updates = {
            [`REACT_APP_NOAHV4_${chainId}`]: await noahV4.getAddress(),
            [`REACT_APP_NOAHV4NFT_${chainId}`]: await noahV4Nft.getAddress(),
        };
        let env = '';
        if (fs.existsSync(envPath)) {
            env = fs.readFileSync(envPath, 'utf8');
        }
        const lines = env.split(/\r?\n/).filter(Boolean);
        for (const [k, v] of Object.entries(updates)) {
            const idx = lines.findIndex((l) => l.startsWith(k + '='));
            if (idx >= 0) lines[idx] = `${k}=${v}`; else lines.push(`${k}=${v}`);
        }
        const out = lines.join('\n') + (lines.length ? '\n' : '');
        fs.writeFileSync(envPath, out, 'utf8');
        console.log(`Updated ${envPath} with Noah addresses for chain ${chainId}`);
    } catch (werr) {
        console.warn('Failed to update env file:', werr?.message || werr);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
