// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {IUniswapV2Router02} from "./interfaces/IUniswapV2Router02.sol";

/**
 * @title Noah
 * @dev A dead man's switch contract to transfer a user's tokens to a beneficiary after a set time.
 */
contract Noah {
    IUniswapV2Router02 public immutable uniswapRouter;
    address public immutable usdcAddress;

    struct UserAccount {
        address beneficiary;
        uint256 deadline;
        uint256 deadlineDuration; // The duration in seconds
        address[] tokens;
        bool initialized;
    }

    mapping(address => UserAccount) public userAccounts;
    mapping(address => uint256) public beneficiaryBalances; // beneficiary => USDC balance

    event AccountSetup(address indexed user, address indexed beneficiary, uint256 deadline);
    event SwitchReset(address indexed user, uint256 newDeadline);
    event RecoveryTriggered(address indexed user, address indexed beneficiary, uint256 usdcAmount);
    event FundsWithdrawn(address indexed beneficiary, uint256 amount);

    constructor(address _router, address _usdc) {
        uniswapRouter = IUniswapV2Router02(_router);
        usdcAddress = _usdc;
    }

    /**
     * @notice Sets up the dead man's switch for the caller.
     * @param _beneficiary The address to receive the funds.
     * @param _deadlineDuration The time in seconds to wait before the switch can be triggered.
     * @param _tokens The list of token addresses to be managed.
     */
    function setupSwitch(address _beneficiary, uint256 _deadlineDuration, address[] calldata _tokens) external {
        require(!userAccounts[msg.sender].initialized, "Account already initialized");
        require(_beneficiary != address(0), "Beneficiary cannot be the zero address");
        require(_deadlineDuration > 0, "Deadline duration must be greater than zero");

        userAccounts[msg.sender] = UserAccount({
            beneficiary: _beneficiary,
            deadline: block.timestamp + _deadlineDuration,
            deadlineDuration: _deadlineDuration,
            tokens: _tokens,
            initialized: true
        });

        emit AccountSetup(msg.sender, _beneficiary, block.timestamp + _deadlineDuration);
    }

    /**
     * @notice Resets the timer on the dead man's switch.
     */
    function resetSwitch() external {
        require(userAccounts[msg.sender].initialized, "Account not initialized");
        
        uint256 newDeadline = block.timestamp + userAccounts[msg.sender].deadlineDuration;
        userAccounts[msg.sender].deadline = newDeadline;

        emit SwitchReset(msg.sender, newDeadline);
    }

    /**
     * @notice Triggers the recovery process for a user, selling their tokens for USDC.
     * @param _user The address of the user whose assets are being recovered.
     */
    function recoverAndSell(address _user) external {
        UserAccount storage account = userAccounts[_user];
        require(account.initialized, "Account not initialized");
        require(block.timestamp >= account.deadline, "Deadline has not passed");

        uint256 totalUsdcRecovered = 0;

        for (uint i = 0; i < account.tokens.length; i++) {
            address tokenAddress = account.tokens[i];
            IERC20 token = IERC20(tokenAddress);
            uint256 userBalance = token.balanceOf(_user);

            if (userBalance > 0) {
                // Transfer tokens to this contract
                token.transferFrom(_user, address(this), userBalance);

                if (tokenAddress == usdcAddress) {
                    totalUsdcRecovered += userBalance;
                } else {
                    // Sell the token for USDC
                    uint256 initialUsdcBalance = IERC20(usdcAddress).balanceOf(address(this));

                    token.approve(address(uniswapRouter), userBalance);

                    address[] memory path = new address[](2);
                    path[0] = tokenAddress;
                    path[1] = usdcAddress;

                    uniswapRouter.swapExactTokensForTokens(
                        userBalance,
                        0, // amountOutMin: accept any amount of USDC
                        path,
                        address(this),
                        block.timestamp
                    );

                    uint256 receivedUsdc = IERC20(usdcAddress).balanceOf(address(this)) - initialUsdcBalance;
                    totalUsdcRecovered += receivedUsdc;
                }
            }
        }

        if (totalUsdcRecovered > 0) {
            beneficiaryBalances[account.beneficiary] += totalUsdcRecovered;
        }

        // Prevent re-triggering by setting deadline to max uint256
        account.deadline = type(uint256).max;

        emit RecoveryTriggered(_user, account.beneficiary, totalUsdcRecovered);
    }

    /**
     * @notice Allows a beneficiary to withdraw their accumulated USDC balance.
     */
    function withdrawFunds() external {
        address beneficiary = msg.sender;
        uint256 amount = beneficiaryBalances[beneficiary];
        require(amount > 0, "No funds to withdraw");

        // Set balance to 0 before transfer to prevent re-entrancy
        beneficiaryBalances[beneficiary] = 0;

        // Transfer the USDC to the beneficiary
        IERC20(usdcAddress).transfer(beneficiary, amount);

        emit FundsWithdrawn(beneficiary, amount);
    }
}