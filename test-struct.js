const { ethers } = require("hardhat");

async function testStruct() {
    try {
        console.log("Testing struct with array...");
        
        // Get signers
        const [owner, user] = await ethers.getSigners();
        console.log("User address:", user.address);

        // Deploy TestStruct
        const TestStruct = await ethers.getContractFactory("TestStruct");
        const testContract = await TestStruct.deploy();
        console.log("TestStruct deployed at:", await testContract.getAddress());

        // Set test data
        const tokens = [user.address, owner.address];
        console.log("Setting test with tokens:", tokens);
        
        const tx = await testContract.setTest(user.address, tokens);
        await tx.wait();
        console.log("Test set successfully");

        // Try to read the test
        console.log("Reading test...");
        const result = await testContract.getTest(user.address);
        console.log("Result:", result);
        
        console.log("Test completed successfully!");
        
    } catch (error) {
        console.error("Test failed:", error);
        console.error("Error details:", error.message);
    }
}

testStruct();
