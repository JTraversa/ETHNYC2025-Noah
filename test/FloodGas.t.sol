// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {Noah} from "../contracts/noah.sol";
import "./mocks/MockERC20.sol";

contract RevertingToken {
    string public name = "Reverting";
    string public symbol = "RVT";
    uint8 public decimals = 18;

    function balanceOf(address) external pure returns (uint256) {
        return 1000e18;
    }

    function transferFrom(address, address, uint256) external pure returns (bool) {
        revert("PAUSED");
    }

    function allowance(address, address) external pure returns (uint256) {
        return type(uint256).max;
    }
}

contract FloodGasTest is Test {
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

    function _setupFlood(uint256 numTokens) internal returns (address[] memory) {
        address[] memory tokens = new address[](numTokens);
        for (uint256 i = 0; i < numTokens; i++) {
            MockERC20 token = new MockERC20(
                string(abi.encodePacked("Token", _uint2str(i))),
                string(abi.encodePacked("TK", _uint2str(i)))
            );
            token.mint(user, MINT_AMOUNT);
            vm.prank(user);
            token.approve(address(noah), type(uint256).max);
            tokens[i] = address(token);
        }

        vm.prank(user);
        noah.buildArk(beneficiary, DEADLINE_DURATION, tokens);

        vm.warp(block.timestamp + DEADLINE_DURATION + 1);
        return tokens;
    }

    function test_FloodGas_3Tokens() public {
        _setupFlood(3);

        uint256 gasBefore = gasleft();
        noah.flood(user);
        uint256 gasUsed = gasBefore - gasleft();

        emit log_named_uint("flood (3 tokens) gas", gasUsed);
    }

    function test_FloodGas_5Tokens() public {
        _setupFlood(5);

        uint256 gasBefore = gasleft();
        noah.flood(user);
        uint256 gasUsed = gasBefore - gasleft();

        emit log_named_uint("flood (5 tokens) gas", gasUsed);
    }

    function test_FloodGas_10Tokens() public {
        _setupFlood(10);

        uint256 gasBefore = gasleft();
        noah.flood(user);
        uint256 gasUsed = gasBefore - gasleft();

        emit log_named_uint("flood (10 tokens) gas", gasUsed);
    }

    function test_FloodGas_5Tokens_1Poisoned() public {
        // Setup 4 healthy tokens
        address[] memory tokens = new address[](5);
        for (uint256 i = 0; i < 4; i++) {
            MockERC20 token = new MockERC20(
                string(abi.encodePacked("Token", _uint2str(i))),
                string(abi.encodePacked("TK", _uint2str(i)))
            );
            token.mint(user, MINT_AMOUNT);
            vm.prank(user);
            token.approve(address(noah), type(uint256).max);
            tokens[i] = address(token);
        }

        // 5th token reverts on transferFrom
        RevertingToken bad = new RevertingToken();
        tokens[4] = address(bad);

        vm.prank(user);
        noah.buildArk(beneficiary, DEADLINE_DURATION, tokens);
        vm.warp(block.timestamp + DEADLINE_DURATION + 1);

        // This should REVERT since current contract has no try/catch
        vm.expectRevert();
        noah.flood(user);

        emit log("flood (5 tokens, 1 poisoned): REVERTS as expected");
    }

    function test_FloodGas_Scaling() public {
        emit log("========================================");
        emit log("    FLOOD GAS SCALING (current noah.sol)");
        emit log("========================================");

        for (uint256 n = 1; n <= 10; n++) {
            // Fresh user per iteration
            address u = makeAddr(string(abi.encodePacked("scaleuser", _uint2str(n))));
            address b = makeAddr(string(abi.encodePacked("scaleben", _uint2str(n))));

            address[] memory tokens = new address[](n);
            for (uint256 i = 0; i < n; i++) {
                MockERC20 token = new MockERC20(
                    string(abi.encodePacked("S", _uint2str(n), "T", _uint2str(i))),
                    string(abi.encodePacked("S", _uint2str(n), _uint2str(i)))
                );
                token.mint(u, MINT_AMOUNT);
                vm.prank(u);
                token.approve(address(noah), type(uint256).max);
                tokens[i] = address(token);
            }

            vm.prank(u);
            noah.buildArk(b, DEADLINE_DURATION, tokens);
            vm.warp(block.timestamp + DEADLINE_DURATION + 1);

            uint256 gasBefore = gasleft();
            noah.flood(u);
            uint256 gasUsed = gasBefore - gasleft();

            emit log_named_uint(
                string(abi.encodePacked("  flood (", _uint2str(n), " tokens)")),
                gasUsed
            );
        }
        emit log("========================================");
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
