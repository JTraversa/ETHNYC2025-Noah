// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {Noah} from "../contracts/noah.sol";
import "./mocks/MockERC20.sol";

/**
 * @title GasComparisonTest
 * @notice Gas benchmarks for Noah contract operations at various token counts
 */
contract GasComparisonTest is Test {
    Noah public noah;

    address public user;
    address public beneficiary;

    uint256 constant DEADLINE_DURATION = 30 days;
    uint256 constant MINT_AMOUNT = 1000e18;

    function setUp() public {
        noah = new Noah();
        user = makeAddr("user");
        beneficiary = makeAddr("beneficiary");
    }

    // ===== Build Ark Gas =====

    function test_GasComparison_BuildArk_5Tokens() public {
        address[] memory tokens = _createTokenArray(5);

        vm.prank(user);
        uint256 gasBefore = gasleft();
        noah.buildArk(beneficiary, DEADLINE_DURATION, tokens);
        uint256 gasUsed = gasBefore - gasleft();

        emit log_named_uint("buildArk (5 tokens) gas used", gasUsed);
    }

    // ===== Ping Ark Gas =====

    function test_GasComparison_PingArk_5Tokens() public {
        address[] memory tokens = _createTokenArray(5);

        vm.prank(user);
        noah.buildArk(beneficiary, DEADLINE_DURATION, tokens);

        vm.warp(block.timestamp + 10 days);

        vm.prank(user);
        uint256 gasBefore = gasleft();
        noah.pingArk();
        uint256 gasUsed = gasBefore - gasleft();

        emit log_named_uint("pingArk (5 tokens) gas used", gasUsed);
    }

    // ===== Full Report =====

    function test_GasComparison_FullReport() public {
        emit log("========================================");
        emit log("    GAS REPORT: Noah (5 tokens)");
        emit log("========================================");

        address[] memory tokens = _createTokenArray(5);

        // Build
        vm.prank(user);
        uint256 buildGasBefore = gasleft();
        noah.buildArk(beneficiary, DEADLINE_DURATION, tokens);
        uint256 buildGas = buildGasBefore - gasleft();

        vm.warp(block.timestamp + 10 days);

        // Ping
        vm.prank(user);
        uint256 pingGasBefore = gasleft();
        noah.pingArk();
        uint256 pingGas = pingGasBefore - gasleft();

        emit log("");
        emit log_named_uint("  buildArk gas", buildGas);
        emit log_named_uint("  pingArk gas", pingGas);
        emit log_named_uint("  10 pings total", pingGas * 10);
        emit log("========================================");
    }

    // ===== Scaling Tests =====

    function test_GasComparison_PingArk_Scaling() public {
        emit log("========================================");
        emit log("    PING ARK GAS SCALING");
        emit log("========================================");

        for (uint256 numTokens = 1; numTokens <= 10; numTokens++) {
            address newUser = makeAddr(string(abi.encodePacked("user", _uint2str(numTokens))));
            address[] memory tokens = _createTokenArray(numTokens);

            vm.prank(newUser);
            noah.buildArk(beneficiary, DEADLINE_DURATION, tokens);

            vm.warp(block.timestamp + 1 days);

            vm.prank(newUser);
            uint256 gasBefore = gasleft();
            noah.pingArk();
            uint256 gasUsed = gasBefore - gasleft();

            emit log_named_uint(
                string(abi.encodePacked("  pingArk (", _uint2str(numTokens), " tokens)")),
                gasUsed
            );
        }
        emit log("========================================");
    }

    function test_GasComparison_BuildArk_Scaling() public {
        emit log("========================================");
        emit log("    BUILD ARK GAS SCALING");
        emit log("========================================");

        for (uint256 numTokens = 1; numTokens <= 10; numTokens++) {
            Noah n = new Noah();
            address newUser = makeAddr(string(abi.encodePacked("buser", _uint2str(numTokens))));
            address[] memory tokens = _createTokenArray(numTokens);

            vm.prank(newUser);
            uint256 gasBefore = gasleft();
            n.buildArk(beneficiary, DEADLINE_DURATION, tokens);
            uint256 gasUsed = gasBefore - gasleft();

            emit log_named_uint(
                string(abi.encodePacked("  buildArk (", _uint2str(numTokens), " tokens)")),
                gasUsed
            );
        }
        emit log("========================================");
    }

    // ===== Helper Functions =====

    function _createTokenArray(uint256 count) internal returns (address[] memory) {
        address[] memory tokens = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            MockERC20 token = new MockERC20(
                string(abi.encodePacked("Token", _uint2str(i))),
                string(abi.encodePacked("TK", _uint2str(i)))
            );
            tokens[i] = address(token);
        }
        return tokens;
    }

    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 length;
        while (j != 0) { length++; j /= 10; }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k = k - 1;
            bstr[k] = bytes1(uint8(48 + (_i % 10)));
            _i /= 10;
        }
        return string(bstr);
    }
}
