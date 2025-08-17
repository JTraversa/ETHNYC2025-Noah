// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {SwapParams, ModifyLiquidityParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockPoolManager is IPoolManager {
    mapping(bytes32 => bool) public pools;
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
        
        // Don't transfer USDC immediately - let the callback handle it
        // This allows the callback to transfer USDC to the beneficiary
        
        // Create delta using the correct BalanceDelta.wrap format
        if (params.zeroForOne) {
            // amount0: negative (token going out), amount1: positive (USDC coming in)
            delta = BalanceDelta.wrap(
                (int256(-int256(amountIn)) << 128) | int256(amountOut)
            );
        } else {
            // amount0: positive (USDC coming in), amount1: negative (token going out)
            delta = BalanceDelta.wrap(
                (int256(amountOut) << 128) | int256(-int256(amountIn))
            );
        }
        
        // Call the callback function
        IPoolManager.SwapCallback(msg.sender).poolManagerSwapCallback(delta, hookData);
    }
    
    // Mock other required functions
    function unlock(bytes calldata data) external returns (bytes memory) {
        // Mock implementation
        return data;
    }
    
    function initialize(PoolKey memory key, uint160 sqrtPriceX96) external returns (int24 tick) {
        // Mock implementation
        return 0;
    }
    
    function modifyLiquidity(PoolKey calldata, ModifyLiquidityParams calldata, bytes calldata) external returns (BalanceDelta, BalanceDelta) {
        // Mock implementation
        return (BalanceDelta.wrap(0, 0), BalanceDelta.wrap(0, 0));
    }
    
    function donate(PoolKey calldata, uint256, uint256, bytes calldata) external returns (BalanceDelta) {
        // Mock implementation
        return BalanceDelta.wrap(0, 0);
    }
    
    function sync(Currency) external {}
    
    function take(Currency currency, address to, uint256 amount) external {}
    
    function settle() external payable returns (uint256) {
        return 0;
    }
    
    function settleFor(address recipient) external payable returns (uint256) {
        return 0;
    }
    
    function clear(Currency currency, uint256 amount) external {}
    
    function mint(address to, uint256 id, uint256 amount) external {}
    
    function burn(address from, uint256 id, uint256 amount) external {}
    
    function updateDynamicLPFee(PoolKey calldata key, uint24 newDynamicLPFee) external {}
}
