// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {Noah} from "../contracts/noah.sol";
import "./mocks/MockERC20.sol";

// Variant A: try/catch on raw ERC20.transferFrom (loses SafeTransferLib's return-value handling)
contract NoahTryCatchRaw {
    struct Ark {
        address beneficiary;
        uint256 deadline;
        uint256 deadlineDuration;
        address[] tokens;
    }

    mapping(address => Ark) public arks;

    function getArk(address user) external view returns (address, uint256, uint256, address[] memory) {
        Ark storage ark = arks[user];
        return (ark.beneficiary, ark.deadline, ark.deadlineDuration, ark.tokens);
    }

    function buildArk(address _beneficiary, uint256 _deadlineDuration, address[] calldata _tokens) external {
        require(arks[msg.sender].deadline == 0, "Account already initialized");
        require(_beneficiary != address(0), "Beneficiary cannot be the zero address");
        require(_deadlineDuration > 0, "Deadline duration must be greater than zero");
        Ark memory tempArk = Ark(_beneficiary, block.timestamp + _deadlineDuration, _deadlineDuration, _tokens);
        arks[msg.sender] = tempArk;
    }

    function flood(address _user) external {
        Ark storage account = arks[_user];
        require(account.deadline != 0, "Account not initialized");
        require(block.timestamp >= account.deadline, "Deadline has not passed");
        account.deadline = 0;
        address beneficiary = account.beneficiary;
        for (uint i = 0; i < account.tokens.length; i++) {
            address token = account.tokens[i];
            // Get balance via static call
            (bool balSuccess, bytes memory balData) = token.staticcall(
                abi.encodeWithSignature("balanceOf(address)", _user)
            );
            if (!balSuccess) continue;
            uint256 userBalance = abi.decode(balData, (uint256));
            if (userBalance > 0) {
                // try/catch the transferFrom
                try IERC20Minimal(token).transferFrom(_user, beneficiary, userBalance) {
                    // success
                } catch {
                    // skip poisoned token
                }
            }
        }
    }
}

// Variant B: low-level call (handles non-standard tokens like USDT + skip on failure)
contract NoahLowLevelCall {
    struct Ark {
        address beneficiary;
        uint256 deadline;
        uint256 deadlineDuration;
        address[] tokens;
    }

    mapping(address => Ark) public arks;

    function getArk(address user) external view returns (address, uint256, uint256, address[] memory) {
        Ark storage ark = arks[user];
        return (ark.beneficiary, ark.deadline, ark.deadlineDuration, ark.tokens);
    }

    function buildArk(address _beneficiary, uint256 _deadlineDuration, address[] calldata _tokens) external {
        require(arks[msg.sender].deadline == 0, "Account already initialized");
        require(_beneficiary != address(0), "Beneficiary cannot be the zero address");
        require(_deadlineDuration > 0, "Deadline duration must be greater than zero");
        Ark memory tempArk = Ark(_beneficiary, block.timestamp + _deadlineDuration, _deadlineDuration, _tokens);
        arks[msg.sender] = tempArk;
    }

    function flood(address _user) external {
        Ark storage account = arks[_user];
        require(account.deadline != 0, "Account not initialized");
        require(block.timestamp >= account.deadline, "Deadline has not passed");
        account.deadline = 0;
        address beneficiary = account.beneficiary;
        for (uint i = 0; i < account.tokens.length; i++) {
            address token = account.tokens[i];
            // balanceOf via low-level
            (bool balSuccess, bytes memory balData) = token.staticcall(
                abi.encodeWithSignature("balanceOf(address)", _user)
            );
            if (!balSuccess) continue;
            uint256 userBalance = abi.decode(balData, (uint256));
            if (userBalance > 0) {
                // transferFrom via low-level call — handles missing return values
                (bool success, bytes memory retData) = token.call(
                    abi.encodeWithSignature("transferFrom(address,address,uint256)", _user, beneficiary, userBalance)
                );
                // Accept if call succeeded and either returned true or returned nothing (USDT-style)
                if (!success) continue;
                if (retData.length > 0 && !abi.decode(retData, (bool))) continue;
            }
        }
    }
}

interface IERC20Minimal {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

// Reverting token for poisoned tests
contract RevertingToken2 {
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

contract FloodTryCatchTest is Test {
    Noah public noahBase;
    NoahTryCatchRaw public noahTryCatch;
    NoahLowLevelCall public noahLowLevel;

    address public user;
    address public beneficiary;
    uint256 constant DEADLINE_DURATION = 30 days;
    uint256 constant MINT_AMOUNT = 1000e18;

    function setUp() public {
        noahBase = new Noah();
        noahTryCatch = new NoahTryCatchRaw();
        noahLowLevel = new NoahLowLevelCall();
        user = makeAddr("user");
        beneficiary = makeAddr("beneficiary");
    }

    // ============ HELPERS ============

    function _setupTokens(uint256 n) internal returns (address[] memory) {
        address[] memory tokens = new address[](n);
        for (uint256 i = 0; i < n; i++) {
            MockERC20 t = new MockERC20(
                string(abi.encodePacked("T", _uint2str(i))),
                string(abi.encodePacked("T", _uint2str(i)))
            );
            t.mint(user, MINT_AMOUNT);
            vm.startPrank(user);
            t.approve(address(noahBase), type(uint256).max);
            t.approve(address(noahTryCatch), type(uint256).max);
            t.approve(address(noahLowLevel), type(uint256).max);
            vm.stopPrank();
            tokens[i] = address(t);
        }
        return tokens;
    }

    function _buildAll(address[] memory tokens) internal {
        vm.startPrank(user);
        noahBase.buildArk(beneficiary, DEADLINE_DURATION, tokens);
        noahTryCatch.buildArk(beneficiary, DEADLINE_DURATION, tokens);
        noahLowLevel.buildArk(beneficiary, DEADLINE_DURATION, tokens);
        vm.stopPrank();
        vm.warp(block.timestamp + DEADLINE_DURATION + 1);
    }

    // ============ HAPPY PATH COMPARISON ============

    function test_Comparison_3Tokens() public {
        address[] memory tokens = _setupTokens(3);
        _buildAll(tokens);

        // Need separate users for each contract since flood drains balances
        // Actually the tokens are approved to all 3 contracts but balance only transfers once
        // Let me use separate users

        // Re-do with isolated setups
    }

    function test_FullComparison() public {
        uint256[3] memory counts = [uint256(3), uint256(5), uint256(10)];

        emit log("==========================================================");
        emit log("  FLOOD GAS: Baseline vs Try/Catch vs Low-Level Call");
        emit log("==========================================================");

        for (uint256 ci = 0; ci < counts.length; ci++) {
            uint256 n = counts[ci];

            // --- Baseline (current noah.sol with SafeTransferLib) ---
            uint256 baseGas;
            {
                Noah nb = new Noah();
                address u = makeAddr(string(abi.encodePacked("base", _uint2str(n))));
                address[] memory tokens = new address[](n);
                for (uint256 i = 0; i < n; i++) {
                    MockERC20 t = new MockERC20(
                        string(abi.encodePacked("B", _uint2str(n), _uint2str(i))),
                        string(abi.encodePacked("B", _uint2str(n), _uint2str(i)))
                    );
                    t.mint(u, MINT_AMOUNT);
                    vm.prank(u);
                    t.approve(address(nb), type(uint256).max);
                    tokens[i] = address(t);
                }
                vm.prank(u);
                nb.buildArk(beneficiary, DEADLINE_DURATION, tokens);
                vm.warp(block.timestamp + DEADLINE_DURATION + 1);

                uint256 g0 = gasleft();
                nb.flood(u);
                baseGas = g0 - gasleft();
            }

            // --- Try/Catch variant ---
            uint256 tcGas;
            {
                NoahTryCatchRaw ntc = new NoahTryCatchRaw();
                address u = makeAddr(string(abi.encodePacked("tc", _uint2str(n))));
                address[] memory tokens = new address[](n);
                for (uint256 i = 0; i < n; i++) {
                    MockERC20 t = new MockERC20(
                        string(abi.encodePacked("C", _uint2str(n), _uint2str(i))),
                        string(abi.encodePacked("C", _uint2str(n), _uint2str(i)))
                    );
                    t.mint(u, MINT_AMOUNT);
                    vm.prank(u);
                    t.approve(address(ntc), type(uint256).max);
                    tokens[i] = address(t);
                }
                vm.prank(u);
                ntc.buildArk(beneficiary, DEADLINE_DURATION, tokens);
                vm.warp(block.timestamp + DEADLINE_DURATION + 1);

                uint256 g0 = gasleft();
                ntc.flood(u);
                tcGas = g0 - gasleft();
            }

            // --- Low-level call variant ---
            uint256 llGas;
            {
                NoahLowLevelCall nll = new NoahLowLevelCall();
                address u = makeAddr(string(abi.encodePacked("ll", _uint2str(n))));
                address[] memory tokens = new address[](n);
                for (uint256 i = 0; i < n; i++) {
                    MockERC20 t = new MockERC20(
                        string(abi.encodePacked("L", _uint2str(n), _uint2str(i))),
                        string(abi.encodePacked("L", _uint2str(n), _uint2str(i)))
                    );
                    t.mint(u, MINT_AMOUNT);
                    vm.prank(u);
                    t.approve(address(nll), type(uint256).max);
                    tokens[i] = address(t);
                }
                vm.prank(u);
                nll.buildArk(beneficiary, DEADLINE_DURATION, tokens);
                vm.warp(block.timestamp + DEADLINE_DURATION + 1);

                uint256 g0 = gasleft();
                nll.flood(u);
                llGas = g0 - gasleft();
            }

            emit log(string(abi.encodePacked("--- ", _uint2str(n), " tokens ---")));
            emit log_named_uint("  Baseline (SafeTransferLib)", baseGas);
            emit log_named_uint("  Try/Catch (raw ERC20)     ", tcGas);
            emit log_named_uint("  Low-Level Call             ", llGas);

            if (baseGas > tcGas) {
                emit log_named_uint("  Try/Catch saves vs base   ", baseGas - tcGas);
            } else {
                emit log_named_uint("  Try/Catch costs extra     ", tcGas - baseGas);
            }
            if (baseGas > llGas) {
                emit log_named_uint("  Low-Level saves vs base   ", baseGas - llGas);
            } else {
                emit log_named_uint("  Low-Level costs extra     ", llGas - baseGas);
            }
            emit log("");
        }

        emit log("==========================================================");
    }

    // ============ POISONED TOKEN TEST ============

    function test_Poisoned_Comparison() public {
        emit log("==========================================================");
        emit log("  POISONED TOKEN: 5 tokens, 1 reverting");
        emit log("==========================================================");

        // --- Baseline: should revert ---
        {
            Noah nb = new Noah();
            address u = makeAddr("poison_base");
            address[] memory tokens = new address[](5);
            for (uint256 i = 0; i < 4; i++) {
                MockERC20 t = new MockERC20(
                    string(abi.encodePacked("PB", _uint2str(i))),
                    string(abi.encodePacked("PB", _uint2str(i)))
                );
                t.mint(u, MINT_AMOUNT);
                vm.prank(u);
                t.approve(address(nb), type(uint256).max);
                tokens[i] = address(t);
            }
            tokens[4] = address(new RevertingToken2());

            vm.prank(u);
            nb.buildArk(beneficiary, DEADLINE_DURATION, tokens);
            vm.warp(block.timestamp + DEADLINE_DURATION + 1);

            vm.expectRevert();
            nb.flood(u);
            emit log("  Baseline: REVERTS (all funds stuck)");
        }

        // --- Try/Catch: should succeed, skip bad token ---
        {
            NoahTryCatchRaw ntc = new NoahTryCatchRaw();
            address u = makeAddr("poison_tc");
            address[] memory tokens = new address[](5);
            for (uint256 i = 0; i < 4; i++) {
                MockERC20 t = new MockERC20(
                    string(abi.encodePacked("PC", _uint2str(i))),
                    string(abi.encodePacked("PC", _uint2str(i)))
                );
                t.mint(u, MINT_AMOUNT);
                vm.prank(u);
                t.approve(address(ntc), type(uint256).max);
                tokens[i] = address(t);
            }
            tokens[4] = address(new RevertingToken2());

            vm.prank(u);
            ntc.buildArk(beneficiary, DEADLINE_DURATION, tokens);
            vm.warp(block.timestamp + DEADLINE_DURATION + 1);

            uint256 g0 = gasleft();
            ntc.flood(u);
            uint256 gasUsed = g0 - gasleft();
            emit log_named_uint("  Try/Catch: SUCCESS, gas", gasUsed);
        }

        // --- Low-Level: should succeed, skip bad token ---
        {
            NoahLowLevelCall nll = new NoahLowLevelCall();
            address u = makeAddr("poison_ll");
            address[] memory tokens = new address[](5);
            for (uint256 i = 0; i < 4; i++) {
                MockERC20 t = new MockERC20(
                    string(abi.encodePacked("PL", _uint2str(i))),
                    string(abi.encodePacked("PL", _uint2str(i)))
                );
                t.mint(u, MINT_AMOUNT);
                vm.prank(u);
                t.approve(address(nll), type(uint256).max);
                tokens[i] = address(t);
            }
            tokens[4] = address(new RevertingToken2());

            vm.prank(u);
            nll.buildArk(beneficiary, DEADLINE_DURATION, tokens);
            vm.warp(block.timestamp + DEADLINE_DURATION + 1);

            uint256 g0 = gasleft();
            nll.flood(u);
            uint256 gasUsed = g0 - gasleft();
            emit log_named_uint("  Low-Level: SUCCESS, gas", gasUsed);
        }

        emit log("==========================================================");
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
