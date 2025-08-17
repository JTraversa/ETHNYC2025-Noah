// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";

/// @title BaseHook
/// @notice Base contract for Uniswap V4 hooks
/// @dev This contract provides the basic structure for implementing Uniswap V4 hooks
abstract contract BaseHook {
    /// @notice The pool manager contract
    IPoolManager public immutable poolManager;

    /// @notice Constructor that sets the pool manager
    /// @param _poolManager The address of the pool manager contract
    constructor(IPoolManager _poolManager) {
        poolManager = _poolManager;
    }

    /// @notice Get the hook permissions
    /// @return The hook permissions
    function getHookPermissions() public pure virtual returns (Hooks.Permissions memory);

    /// @notice Hook called before pool initialization
    /// @param sender The address that initiated the action
    /// @param key The pool key
    /// @param sqrtPriceX96 The initial sqrt price
    /// @param tick The initial tick
    function beforeInitialize(address sender, PoolKey calldata key, uint160 sqrtPriceX96, int24 tick)
        external
        virtual
        returns (bytes4)
    {
        return BaseHook.beforeInitialize.selector;
    }

    /// @notice Hook called after pool initialization
    /// @param sender The address that initiated the action
    /// @param key The pool key
    /// @param sqrtPriceX96 The initial sqrt price
    /// @param tick The initial tick
    /// @param delta The balance delta
    function afterInitialize(address sender, PoolKey calldata key, uint160 sqrtPriceX96, int24 tick, BalanceDelta delta)
        external
        virtual
        returns (bytes4)
    {
        return BaseHook.afterInitialize.selector;
    }

    /// @notice Hook called before position modification
    /// @param sender The address that initiated the action
    /// @param key The pool key
    /// @param params The position modification parameters
    function beforeModifyPosition(address sender, PoolKey calldata key, ModifyLiquidityParams calldata params)
        external
        virtual
        returns (bytes4)
    {
        return BaseHook.beforeModifyPosition.selector;
    }

    /// @notice Hook called after position modification
    /// @param sender The address that initiated the action
    /// @param key The pool key
    /// @param params The position modification parameters
    /// @param delta The balance delta
    function afterModifyPosition(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        BalanceDelta delta
    ) external virtual returns (bytes4) {
        return BaseHook.afterModifyPosition.selector;
    }

    /// @notice Hook called before swap
    /// @param sender The address that initiated the action
    /// @param key The pool key
    /// @param params The swap parameters
    function beforeSwap(address sender, PoolKey calldata key, SwapParams calldata params)
        external
        virtual
        returns (bytes4)
    {
        return BaseHook.beforeSwap.selector;
    }

    /// @notice Hook called after swap
    /// @param sender The address that initiated the action
    /// @param key The pool key
    /// @param params The swap parameters
    /// @param delta The balance delta
    function afterSwap(address sender, PoolKey calldata key, SwapParams calldata params, BalanceDelta delta)
        external
        virtual
        returns (bytes4)
    {
        return BaseHook.afterSwap.selector;
    }

    /// @notice Hook called before donate
    /// @param sender The address that initiated the action
    /// @param key The pool key
    /// @param amount0 The amount of token0 to donate
    /// @param amount1 The amount of token1 to donate
    function beforeDonate(address sender, PoolKey calldata key, uint256 amount0, uint256 amount1)
        external
        virtual
        returns (bytes4)
    {
        return BaseHook.beforeDonate.selector;
    }

    /// @notice Hook called after donate
    /// @param sender The address that initiated the action
    /// @param key The pool key
    /// @param amount0 The amount of token0 donated
    /// @param amount1 The amount of token1 donated
    function afterDonate(address sender, PoolKey calldata key, uint256 amount0, uint256 amount1)
        external
        virtual
        returns (bytes4)
    {
        return BaseHook.afterDonate.selector;
    }
}
