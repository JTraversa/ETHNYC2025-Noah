// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IUniswapV2Router02} from "../contracts/interfaces/IUniswapV2Router02.sol";

// A simplified mock for the Uniswap V2 Router for testing purposes
contract MockUniswapV2Router is IUniswapV2Router02 {
    address public immutable usdcAddress;

    constructor(address _usdcAddress) {
        usdcAddress = _usdcAddress;
    }

    function swapExactTokensForTokens(
        uint amountIn,
        uint, /* amountOutMin */
        address[] calldata path,
        address to,
        uint /* deadline */
    ) external override returns (uint[] memory amounts) {
        require(path.length == 2, "Path must be 2");
        address tokenIn = path[0];

        // Simulate the swap:
        // 1. Transfer the input token from the caller (Noah contract)
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

        // 2. "Calculate" the output USDC amount (e.g., 1:1 for simplicity)
        uint256 amountOut = amountIn; 

        // 3. Transfer the USDC to the recipient ('to' address, which is Noah)
        IERC20(usdcAddress).transfer(to, amountOut);
        
        amounts = new uint[](2);
        amounts[0] = amountIn;
        amounts[1] = amountOut;

        return amounts;
    }
}
