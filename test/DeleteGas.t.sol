// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {Noah} from "../contracts/noah.sol";
import "./mocks/MockERC20.sol";

// Noah variant that uses `delete` to clear the struct
contract NoahWithDelete {
    struct Ark {
        address beneficiary;
        uint256 deadline;
        uint256 deadlineDuration;
        address[] tokens;
    }

    mapping(address => Ark) public arks;

    function buildArk(address _beneficiary, uint256 _deadlineDuration, address[] calldata _tokens) external {
        require(arks[msg.sender].deadline == 0, "Account already initialized");
        require(_beneficiary != address(0), "Beneficiary cannot be the zero address");
        require(_deadlineDuration > 0, "Deadline duration must be greater than zero");
        Ark memory tempArk = Ark(_beneficiary, block.timestamp + _deadlineDuration, _deadlineDuration, _tokens);
        arks[msg.sender] = tempArk;
    }

    function pingArk() external {
        require(arks[msg.sender].deadline != 0, "Account not initialized");
        arks[msg.sender].deadline = block.timestamp + arks[msg.sender].deadlineDuration;
    }

    function flood(address _user) external {
        Ark storage account = arks[_user];
        require(account.deadline != 0, "Account not initialized");
        require(block.timestamp >= account.deadline, "Deadline has not passed");

        address beneficiary = account.beneficiary;
        uint256 len = account.tokens.length;
        address[] memory tokensCopy = new address[](len);
        for (uint i = 0; i < len; i++) {
            tokensCopy[i] = account.tokens[i];
        }

        // Delete entire struct (clears all fields + array, refunds gas)
        delete arks[_user];

        for (uint i = 0; i < len; i++) {
            uint256 userBalance = MockERC20(tokensCopy[i]).balanceOf(_user);
            if (userBalance > 0) {
                MockERC20(tokensCopy[i]).transferFrom(_user, beneficiary, userBalance);
            }
        }
    }

    function destroyArk() external {
        require(arks[msg.sender].deadline != 0, "Ark not built");
        delete arks[msg.sender];
    }
}

// Noah baseline that mimics current behavior (deadline = 0 only)
contract NoahBaseline {
    struct Ark {
        address beneficiary;
        uint256 deadline;
        uint256 deadlineDuration;
        address[] tokens;
    }

    mapping(address => Ark) public arks;

    function buildArk(address _beneficiary, uint256 _deadlineDuration, address[] calldata _tokens) external {
        require(arks[msg.sender].deadline == 0, "Account already initialized");
        require(_beneficiary != address(0), "Beneficiary cannot be the zero address");
        require(_deadlineDuration > 0, "Deadline duration must be greater than zero");
        Ark memory tempArk = Ark(_beneficiary, block.timestamp + _deadlineDuration, _deadlineDuration, _tokens);
        arks[msg.sender] = tempArk;
    }

    function pingArk() external {
        require(arks[msg.sender].deadline != 0, "Account not initialized");
        arks[msg.sender].deadline = block.timestamp + arks[msg.sender].deadlineDuration;
    }

    function flood(address _user) external {
        Ark storage account = arks[_user];
        require(account.deadline != 0, "Account not initialized");
        require(block.timestamp >= account.deadline, "Deadline has not passed");

        account.deadline = 0;

        address beneficiary = account.beneficiary;
        for (uint i = 0; i < account.tokens.length; i++) {
            uint256 userBalance = MockERC20(account.tokens[i]).balanceOf(_user);
            if (userBalance > 0) {
                MockERC20(account.tokens[i]).transferFrom(_user, beneficiary, userBalance);
            }
        }
    }

    function destroyArk() external {
        require(arks[msg.sender].deadline != 0, "Ark not built");
        arks[msg.sender].deadline = 0;
    }
}

contract DeleteGasTest is Test {
    address public user;
    address public beneficiary;
    uint256 constant DEADLINE_DURATION = 30 days;
    uint256 constant MINT_AMOUNT = 1000e18;

    function setUp() public {
        user = makeAddr("user");
        beneficiary = makeAddr("beneficiary");
    }

    function _makeTokens(uint256 n, address approveTarget) internal returns (address[] memory) {
        address[] memory tokens = new address[](n);
        for (uint256 i = 0; i < n; i++) {
            MockERC20 t = new MockERC20(
                string(abi.encodePacked("T", _uint2str(i))),
                string(abi.encodePacked("T", _uint2str(i)))
            );
            t.mint(user, MINT_AMOUNT);
            vm.prank(user);
            t.approve(approveTarget, type(uint256).max);
            tokens[i] = address(t);
        }
        return tokens;
    }

    function test_FloodComparison() public {
        uint256[3] memory counts = [uint256(3), uint256(5), uint256(10)];

        emit log("==========================================================");
        emit log("  FLOOD: deadline=0 vs delete (gas comparison)");
        emit log("==========================================================");

        for (uint256 ci = 0; ci < counts.length; ci++) {
            uint256 n = counts[ci];

            // --- Baseline (deadline = 0 only) ---
            uint256 baseGas;
            {
                NoahBaseline nb = new NoahBaseline();
                address u = makeAddr(string(abi.encodePacked("fb", _uint2str(n))));
                address[] memory tokens = new address[](n);
                for (uint256 i = 0; i < n; i++) {
                    MockERC20 t = new MockERC20(
                        string(abi.encodePacked("FB", _uint2str(n), _uint2str(i))),
                        string(abi.encodePacked("FB", _uint2str(n), _uint2str(i)))
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

            // --- Delete variant ---
            uint256 delGas;
            {
                NoahWithDelete nd = new NoahWithDelete();
                address u = makeAddr(string(abi.encodePacked("fd", _uint2str(n))));
                address[] memory tokens = new address[](n);
                for (uint256 i = 0; i < n; i++) {
                    MockERC20 t = new MockERC20(
                        string(abi.encodePacked("FD", _uint2str(n), _uint2str(i))),
                        string(abi.encodePacked("FD", _uint2str(n), _uint2str(i)))
                    );
                    t.mint(u, MINT_AMOUNT);
                    vm.prank(u);
                    t.approve(address(nd), type(uint256).max);
                    tokens[i] = address(t);
                }
                vm.prank(u);
                nd.buildArk(beneficiary, DEADLINE_DURATION, tokens);
                vm.warp(block.timestamp + DEADLINE_DURATION + 1);

                uint256 g0 = gasleft();
                nd.flood(u);
                delGas = g0 - gasleft();
            }

            emit log(string(abi.encodePacked("--- ", _uint2str(n), " tokens ---")));
            emit log_named_uint("  Baseline (deadline=0) ", baseGas);
            emit log_named_uint("  Delete (full clear)   ", delGas);
            if (delGas < baseGas) {
                emit log_named_uint("  Delete SAVES          ", baseGas - delGas);
                emit log_named_uint("  Delete cheaper by %   ", ((baseGas - delGas) * 100) / baseGas);
            } else {
                emit log_named_uint("  Delete COSTS EXTRA    ", delGas - baseGas);
                emit log_named_uint("  Delete more expensive%", ((delGas - baseGas) * 100) / baseGas);
            }
            emit log("");
        }
        emit log("==========================================================");
    }

    function test_DestroyArkComparison() public {
        uint256[3] memory counts = [uint256(3), uint256(5), uint256(10)];

        emit log("==========================================================");
        emit log("  DESTROY ARK: deadline=0 vs delete (gas comparison)");
        emit log("==========================================================");

        for (uint256 ci = 0; ci < counts.length; ci++) {
            uint256 n = counts[ci];

            // --- Baseline ---
            uint256 baseGas;
            {
                NoahBaseline nb = new NoahBaseline();
                address u = makeAddr(string(abi.encodePacked("db", _uint2str(n))));
                address[] memory tokens = new address[](n);
                for (uint256 i = 0; i < n; i++) {
                    MockERC20 t = new MockERC20(
                        string(abi.encodePacked("DB", _uint2str(n), _uint2str(i))),
                        string(abi.encodePacked("DB", _uint2str(n), _uint2str(i)))
                    );
                    tokens[i] = address(t);
                }
                vm.prank(u);
                nb.buildArk(beneficiary, DEADLINE_DURATION, tokens);

                vm.prank(u);
                uint256 g0 = gasleft();
                nb.destroyArk();
                baseGas = g0 - gasleft();
            }

            // --- Delete ---
            uint256 delGas;
            {
                NoahWithDelete nd = new NoahWithDelete();
                address u = makeAddr(string(abi.encodePacked("dd", _uint2str(n))));
                address[] memory tokens = new address[](n);
                for (uint256 i = 0; i < n; i++) {
                    MockERC20 t = new MockERC20(
                        string(abi.encodePacked("DD", _uint2str(n), _uint2str(i))),
                        string(abi.encodePacked("DD", _uint2str(n), _uint2str(i)))
                    );
                    tokens[i] = address(t);
                }
                vm.prank(u);
                nd.buildArk(beneficiary, DEADLINE_DURATION, tokens);

                vm.prank(u);
                uint256 g0 = gasleft();
                nd.destroyArk();
                delGas = g0 - gasleft();
            }

            emit log(string(abi.encodePacked("--- ", _uint2str(n), " tokens ---")));
            emit log_named_uint("  Baseline (deadline=0) ", baseGas);
            emit log_named_uint("  Delete (full clear)   ", delGas);
            if (delGas < baseGas) {
                emit log_named_uint("  Delete SAVES          ", baseGas - delGas);
                emit log_named_uint("  Delete cheaper by %   ", ((baseGas - delGas) * 100) / baseGas);
            } else {
                emit log_named_uint("  Delete COSTS EXTRA    ", delGas - baseGas);
                emit log_named_uint("  Delete more expensive%", ((delGas - baseGas) * 100) / baseGas);
            }
            emit log("");
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
