// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface INoahV4 {
    function poolManagerSwapCallback(BalanceDelta delta, bytes calldata data) external returns (bytes memory);
}

/// @title MockPoolManager
/// @notice A simplified mock pool manager for testing purposes
/// @dev This contract only implements the functions needed for testing, not the full IPoolManager interface
contract MockPoolManager {
    mapping(address => mapping(address => uint256)) public mockRates;
    
    function setMockRate(address tokenIn, address tokenOut, uint256 rate) external {
        mockRates[tokenIn][tokenOut] = rate;
    }
    
    function swap(
        PoolKey calldata key,
        SwapParams calldata params,
        bytes calldata hookData
    ) external returns (BalanceDelta delta) {
        address tokenIn = Currency.unwrap(key.currency0);
        address tokenOut = Currency.unwrap(key.currency1);
        
        if (params.zeroForOne) {
            tokenIn = Currency.unwrap(key.currency0);
            tokenOut = Currency.unwrap(key.currency1);
        } else {
            tokenIn = Currency.unwrap(key.currency1);
            tokenOut = Currency.unwrap(key.currency0);
        }
        
        uint256 amountIn = uint256(params.amountSpecified);
        uint256 amountOut = (amountIn * mockRates[tokenIn][tokenOut]) / 1e18;
        
        // Transfer tokens from caller to this contract
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // Create delta using the toBalanceDelta function
        // For zeroForOne = true (token -> USDC):
        // amount0 should be negative (token going out)
        // amount1 should be positive (USDC coming in)
        if (params.zeroForOne) {
            // amount0: negative (token going out), amount1: positive (USDC coming in)
            // Pack two int128 values into int256: (amount0 << 128) | amount1
            delta = BalanceDelta.wrap(
                (int256(-int256(amountIn)) << 128) | int256(amountOut)
            );
        } else {
            // amount0: positive (USDC coming in), amount1: negative (token going out)
            // Pack two int128 values into int256: (amount0 << 128) | amount1
            delta = BalanceDelta.wrap(
                (int256(amountOut) << 128) | int256(-int256(amountIn))
            );
        }
        
        // Call the callback function
        // This is essential for the flood function to work properly
        if (msg.sender.code.length > 0) {
            // Call the callback function directly
            INoahV4(msg.sender).poolManagerSwapCallback(delta, hookData);
        }
    }
}
