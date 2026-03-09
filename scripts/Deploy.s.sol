// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {Noah} from "../contracts/noah.sol";

contract Deploy is Script {
    // Salt for CREATE2 - same salt = same address across chains
    bytes32 constant NOAH_SALT = bytes32(uint256(0x4e6f6168)); // "Noah" in hex

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== Noah Deployment ===");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);

        vm.startBroadcast(deployerPrivateKey);

        Noah noah = new Noah{salt: NOAH_SALT}();
        console.log("Noah deployed at:", address(noah));

        vm.stopBroadcast();

        console.log("=== Deployment Complete ===");
    }
}
