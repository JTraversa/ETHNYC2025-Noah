// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IUniswapV2Router02} from "./interfaces/IUniswapV2Router02.sol";

/**
 * @title Noah
 * @dev A dead man's switch contract to transfer a user's tokens to a beneficiary after a set time.
 */
contract Noah {
    IUniswapV2Router02 public immutable uniswapRouter;
    address public immutable usdcAddress;

    struct Ark {
        address beneficiary;
        uint256 deadline;
        uint256 deadlineDuration; // The duration in seconds
        address[] tokens;
    }

    mapping(address => Ark) public arks;
    
    // Custom getter for Ark data
    function getArk(address user) external view returns (address beneficiary, uint256 deadline, uint256 deadlineDuration, address[] memory tokens) {
        Ark storage ark = arks[user];
        return (ark.beneficiary, ark.deadline, ark.deadlineDuration, ark.tokens);
    }


    event ArkBuilt(address indexed user, address indexed beneficiary, uint256 deadline);
    event ArkPinged(address indexed user, uint256 newDeadline);
    event FloodTriggered(address indexed user, address indexed beneficiary, uint256 usdcAmount);
    event PassengersAdded(address indexed user, address[] newPassengers);
    event PassengerRemoved(address indexed user, address passenger);
    event DeadlineUpdated(address indexed user, uint256 newDuration, uint256 newDeadline);


    constructor(address _router, address _usdc) {
        uniswapRouter = IUniswapV2Router02(_router);
        usdcAddress = _usdc;
    }

    /**
     * @notice Builds an Ark for the caller.
     * @param _beneficiary The address to receive the funds.
     * @param _deadlineDuration The time in seconds to wait before the Ark can be triggered.
     * @param _tokens The list of token addresses to be managed.
     */
    function buildArk(address _beneficiary, uint256 _deadlineDuration, address[] calldata _tokens) external {
        require(arks[msg.sender].deadline == 0, "Account already initialized");
        require(_beneficiary != address(0), "Beneficiary cannot be the zero address");
        require(_deadlineDuration > 0, "Deadline duration must be greater than zero");

        // Create a temporary struct and assign it to the mapping
        Ark memory tempArk = Ark({
            beneficiary: _beneficiary,
            deadline: block.timestamp + _deadlineDuration,
            deadlineDuration: _deadlineDuration,
            tokens: _tokens
        });
        
        arks[msg.sender] = tempArk;

        emit ArkBuilt(msg.sender, _beneficiary, block.timestamp + _deadlineDuration);
    }

    /**
     * @notice Pings an Ark to reset its timer.
     */
    function pingArk() external {
        require(arks[msg.sender].deadline != 0, "Account not initialized");
        
        uint256 newDeadline = block.timestamp + arks[msg.sender].deadlineDuration;
        arks[msg.sender].deadline = newDeadline;

        emit ArkPinged(msg.sender, newDeadline);
    }

    /**
     * @notice Triggers the flood process for a user, selling their tokens for USDC.
     * @param _user The address of the user whose assets are being recovered.
     */
    function flood(address _user) external {
        Ark storage account = arks[_user];
        require(account.deadline != 0, "Account not initialized");
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
            IERC20(usdcAddress).transfer(account.beneficiary, totalUsdcRecovered);
        }

        // Reset the deadline to 0 to allow for future re-initialization
        account.deadline = 0;

        emit FloodTriggered(_user, account.beneficiary, totalUsdcRecovered);
    }

    /**
     * @notice Adds new passengers (tokens) to a user's Ark.
     * @param _newPassengers The list of new token addresses to add.
     */
    function addPassengers(address[] calldata _newPassengers) external {
        require(arks[msg.sender].deadline != 0, "Ark not built");
        for (uint i = 0; i < _newPassengers.length; i++) {
            arks[msg.sender].tokens.push(_newPassengers[i]);
        }
        emit PassengersAdded(msg.sender, _newPassengers);
    }

    /**
     * @notice Removes a passenger (token) from a user's Ark.
     * @param _passengerToRemove The address of the token to remove.
     */
    function removePassenger(address _passengerToRemove) external {
        require(arks[msg.sender].deadline != 0, "Ark not built");
        address[] storage tokenList = arks[msg.sender].tokens;
        for (uint i = 0; i < tokenList.length; i++) {
            if (tokenList[i] == _passengerToRemove) {
                tokenList[i] = tokenList[tokenList.length - 1];
                tokenList.pop();
                break;
            }
        }
        emit PassengerRemoved(msg.sender, _passengerToRemove);
    }

    /**
     * @notice Updates the deadline duration for a user's Ark.
     * @param _newDuration The new deadline duration in seconds.
     */
    function updateDeadlineDuration(uint256 _newDuration) external {
        require(arks[msg.sender].deadline != 0, "Ark not built");
        require(_newDuration > 0, "Duration must be greater than zero");
        arks[msg.sender].deadlineDuration = _newDuration;
        arks[msg.sender].deadline = block.timestamp + _newDuration;
        emit DeadlineUpdated(msg.sender, _newDuration, arks[msg.sender].deadline);
    }
}