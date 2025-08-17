// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract NoahV4 {
    using PoolIdLibrary for PoolKey;
    using SafeERC20 for IERC20;

    IPoolManager public immutable poolManager;
    address public immutable usdcAddress;
    address public immutable pyrusdAddress; // PayPal USD
    address public immutable hookAddress;

    struct Ark {
        address beneficiary;
        uint256 deadline;
        uint256 deadlineDuration;
        address[] tokens;
        bool useDutchAuction; // true for Dutch auction, false for Uniswap V4 swap
        bool usePYUSD; // true for PYUSD, false for USDC
    }

    struct DutchAuction {
        address token;
        uint256 startPrice;
        uint256 endPrice;
        uint256 startTime;
        uint256 duration;
        bool active;
        address highestBidder;
        uint256 highestBid;
    }

    mapping(address => Ark) public arks;
    mapping(address => mapping(address => DutchAuction)) public auctions; // user => token => auction
    
    // Custom getter for Ark data
    function getArk(address user) external view returns (address beneficiary, uint256 deadline, uint256 deadlineDuration, address[] memory tokens, bool useDutchAuction, bool usePYUSD) {
        Ark storage ark = arks[user];
        return (ark.beneficiary, ark.deadline, ark.deadlineDuration, ark.tokens, ark.useDutchAuction, ark.usePYUSD);
    }

    event ArkBuilt(address indexed user, address indexed beneficiary, uint256 deadline);
    event ArkPinged(address indexed user, uint256 newDeadline);
    event FloodTriggered(address indexed user, address indexed beneficiary, uint256 usdcAmount);
    event PassengersAdded(address indexed user, address[] newPassengers);
    event PassengerRemoved(address indexed user, address passenger);
    event DeadlineUpdated(address indexed user, uint256 newDuration, uint256 newDeadline);
    event AuctionPreferenceUpdated(address indexed user, bool useDutchAuction);
    event TargetCurrencyPreferenceUpdated(address indexed user, bool usePYUSD);
    event DutchAuctionStarted(address indexed user, address indexed token, uint256 startPrice, uint256 endPrice, uint256 duration);
    event DutchAuctionBid(address indexed user, address indexed token, address bidder, uint256 bidAmount, uint256 currentPrice);
    event DutchAuctionSettled(address indexed user, address indexed token, address winner, uint256 amount, address beneficiary);
    event PYUSDClaimed(address indexed user, address indexed beneficiary, uint256 amount);

    constructor(IPoolManager _poolManager, address _usdc, address _pyrusd, address _hook) {
        poolManager = _poolManager;
        usdcAddress = _usdc;
        pyrusdAddress = _pyrusd;
        hookAddress = _hook;
    }

    /**
     * @notice Builds an Ark for the caller.
     * @param _beneficiary The address to receive the funds.
     * @param _deadlineDuration The time in seconds to wait before the Ark can be triggered.
     * @param _tokens The list of token addresses to be managed.
     * @param _useDutchAuction Whether to use Dutch auction (true) or Uniswap V4 swap (false).
     * @param _usePYUSD Whether to liquidate to PYUSD (true) or USDC (false).
     */
    function buildArk(address _beneficiary, uint256 _deadlineDuration, address[] calldata _tokens, bool _useDutchAuction, bool _usePYUSD) external {
        require(arks[msg.sender].deadline == 0, "Account already initialized");
        require(_beneficiary != address(0), "Beneficiary cannot be the zero address");
        require(_deadlineDuration > 0, "Deadline duration must be greater than zero");

        // Create a temporary struct and assign it to the mapping
        Ark memory tempArk = Ark({
            beneficiary: _beneficiary,
            deadline: block.timestamp + _deadlineDuration,
            deadlineDuration: _deadlineDuration,
            tokens: _tokens,
            useDutchAuction: _useDutchAuction,
            usePYUSD: _usePYUSD
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
     * @notice Updates the auction preference for a user's Ark.
     * @param _useDutchAuction Whether to use Dutch auction (true) or Uniswap V4 swap (false).
     */
    function updateAuctionPreference(bool _useDutchAuction) external {
        require(arks[msg.sender].deadline != 0, "Ark not built");
        arks[msg.sender].useDutchAuction = _useDutchAuction;
        emit AuctionPreferenceUpdated(msg.sender, _useDutchAuction);
    }

    /**
     * @notice Updates the target currency preference for a user's Ark.
     * @param _usePYUSD Whether to liquidate to PYUSD (true) or USDC (false).
     */
    function updateTargetCurrencyPreference(bool _usePYUSD) external {
        require(arks[msg.sender].deadline != 0, "Ark not built");
        arks[msg.sender].usePYUSD = _usePYUSD;
        emit TargetCurrencyPreferenceUpdated(msg.sender, _usePYUSD);
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

    /// @notice The callback invoked by the PoolManager for swaps.
    function poolManagerSwapCallback(
        BalanceDelta delta,
        bytes calldata data
    ) external returns (bytes memory) {
        require(msg.sender == address(poolManager), "Only PoolManager can call this");
        
        (address beneficiary) = abi.decode(data, (address));

        // The amount of USDC or PYUSD received from the swap
        // For zeroForOne = true (token -> USDC/PYUSD): amount1 should be positive (USDC/PYUSD coming in)
        // For zeroForOne = false (USDC/PYUSD -> token): amount0 should be positive (USDC/PYUSD coming in)
        int128 amount1 = delta.amount1();
        int128 amount0 = delta.amount0();
        
        uint256 currencyReceived = 0;
        
        // Check amount1 (USDC/PYUSD) - this handles zeroForOne = true case
        if (amount1 > 0) {
            currencyReceived = uint256(uint128(amount1));
        }
        // Check amount0 (USDC/PYUSD) - this handles zeroForOne = false case  
        else if (amount0 > 0) {
            currencyReceived = uint256(uint128(amount0));
        }
        
        if (currencyReceived > 0) {
            // Determine which currency was received based on the pool
            // For now, we'll assume USDC (this can be enhanced with pool detection)
            // Transfer the currency to the beneficiary
            IERC20(usdcAddress).safeTransfer(beneficiary, currencyReceived);
        }
        
        return "";
    }

    /**
     * @notice Triggers the flood process for a user, selling their tokens for USDC.
     * @param _user The address of the user whose assets are being recovered.
     */
    function flood(address _user) external {
        Ark storage account = arks[_user];
        require(account.deadline != 0, "Account not initialized");
        require(block.timestamp >= account.deadline, "Deadline has not passed");

        if (account.useDutchAuction) {
            // Handle Dutch auction liquidation
            _handleDutchAuctionFlood(_user, account);
        } else {
            // Handle Uniswap V4 swap liquidation
            _handleUniswapFlood(_user, account);
        }

        // Reset the Ark
        account.deadline = 0;
        emit FloodTriggered(_user, account.beneficiary, 0); // Amount will be determined by auction/swap
    }

    /**
     * @notice Internal function to handle Dutch auction liquidation.
     * @param _user The user whose assets are being liquidated.
     * @param _account The user's Ark data.
     */
    function _handleDutchAuctionFlood(address _user, Ark storage _account) internal {
        for (uint i = 0; i < _account.tokens.length; i++) {
            address tokenAddress = _account.tokens[i];
            if (tokenAddress == usdcAddress) continue; // Skip USDC

            uint256 userBalance = IERC20(tokenAddress).balanceOf(_user);
            if (userBalance > 0) {
                // Start a Dutch auction for this token
                // For now, use a simple pricing model based on token amount
                // In a real implementation, you might want to get market prices from oracles
                uint256 estimatedPrice = userBalance; // 1:1 ratio as placeholder
                uint256 startPrice = estimatedPrice * 110 / 100; // 110% of estimated price
                uint256 endPrice = estimatedPrice * 90 / 100;   // 90% of estimated price
                uint256 duration = 3600; // 1 hour
                
                // Transfer tokens to this contract
                IERC20(tokenAddress).safeTransferFrom(_user, address(this), userBalance);
                
                // Create auction
                auctions[_user][tokenAddress] = DutchAuction({
                    token: tokenAddress,
                    startPrice: startPrice,
                    endPrice: endPrice,
                    startTime: block.timestamp,
                    duration: duration,
                    active: true,
                    highestBidder: address(0),
                    highestBid: 0
                });
                
                emit DutchAuctionStarted(_user, tokenAddress, startPrice, endPrice, duration);
            }
        }
    }

    /**
     * @notice Internal function to handle Uniswap V4 swap liquidation.
     * @param _user The user whose assets are being liquidated.
     * @param _account The user's Ark data.
     */
    function _handleUniswapFlood(address _user, Ark storage _account) internal {
        uint256 totalTargetCurrencyReceived = 0;

        for (uint i = 0; i < _account.tokens.length; i++) {
            address tokenAddress = _account.tokens[i];
            if (tokenAddress == usdcAddress || tokenAddress == pyrusdAddress) continue; // Skip stablecoins

            uint256 userBalance = IERC20(tokenAddress).balanceOf(_user);

            if (userBalance > 0) {
                // Transfer tokens to this contract
                IERC20(tokenAddress).safeTransferFrom(_user, address(this), userBalance);

                // Approve the PoolManager to spend the token
                IERC20(tokenAddress).approve(address(poolManager), userBalance);
                
                // Define the pool key with the hook (always swap to USDC first)
                PoolKey memory key = PoolKey({
                    currency0: Currency.wrap(tokenAddress),
                    currency1: Currency.wrap(usdcAddress),
                    fee: 3000,
                    tickSpacing: 60,
                    hooks: IHooks(hookAddress)
                });

                // Trigger the swap to USDC
                BalanceDelta delta = poolManager.swap(
                    key,
                    SwapParams({
                        zeroForOne: true, // Swapping token for USDC
                        amountSpecified: int256(userBalance),
                        sqrtPriceLimitX96: 0
                    }),
                    abi.encode(_account.beneficiary) // Pass beneficiary to callback
                );

                // Calculate USDC received from this swap
                int128 amount1 = delta.amount1();
                int128 amount0 = delta.amount0();
                
                uint256 usdcFromSwap = 0;
                
                // Check amount1 (USDC) - this handles zeroForOne = true case
                if (amount1 > 0) {
                    usdcFromSwap = uint256(uint128(amount1));
                }
                // Check amount0 (USDC) - this handles zeroForOne = false case
                else if (amount0 > 0) {
                    usdcFromSwap = uint256(uint128(amount0));
                }
                
                if (usdcFromSwap > 0) {
                    if (_account.usePYUSD) {
                        // Convert USDC to PYUSD
                        uint256 pyrusdReceived = _swapUSDCToPYUSD(usdcFromSwap);
                        totalTargetCurrencyReceived += pyrusdReceived;
                    } else {
                        totalTargetCurrencyReceived += usdcFromSwap;
                    }
                }
            }
        }
    }

    /**
     * @notice Allows beneficiaries to claim their accumulated PYUSD.
     * @param _user The user whose Ark was liquidated.
     */
    function claimPYUSD(address _user) external {
        require(arks[_user].deadline == 0, "Ark not yet liquidated");
        require(arks[_user].usePYUSD, "Ark not configured for PYUSD");
        
        address beneficiary = arks[_user].beneficiary;
        require(msg.sender == beneficiary, "Only beneficiary can claim");
        
        uint256 pyrusdBalance = IERC20(pyrusdAddress).balanceOf(address(this));
        require(pyrusdBalance > 0, "No PYUSD to claim");
        
        // Transfer PYUSD to beneficiary
        IERC20(pyrusdAddress).safeTransfer(beneficiary, pyrusdBalance);
        
        emit PYUSDClaimed(_user, beneficiary, pyrusdBalance);
    }

    /**
     * @notice Internal function to swap USDC to PYUSD.
     * @param _usdcAmount The amount of USDC to swap.
     * @return The amount of PYUSD received.
     */
    function _swapUSDCToPYUSD(uint256 _usdcAmount) internal returns (uint256) {
        // Approve the PoolManager to spend USDC
        IERC20(usdcAddress).approve(address(poolManager), _usdcAmount);
        
        // Define the pool key for USDC to PYUSD swap
        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(usdcAddress),
            currency1: Currency.wrap(pyrusdAddress),
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(hookAddress)
        });

        // Trigger the swap from USDC to PYUSD
        BalanceDelta delta = poolManager.swap(
            key,
            SwapParams({
                zeroForOne: true, // Swapping USDC for PYUSD
                amountSpecified: int256(_usdcAmount),
                sqrtPriceLimitX96: 0
            }),
            abi.encode(address(this)) // Pass this contract as beneficiary to receive PYUSD
        );

        // Calculate PYUSD received from this swap
        int128 amount1 = delta.amount1();
        int128 amount0 = delta.amount0();
        
        uint256 pyrusdReceived = 0;
        
        // Check amount1 (PYUSD) - this handles zeroForOne = true case
        if (amount1 > 0) {
            pyrusdReceived = uint256(uint128(amount1));
        }
        // Check amount0 (PYUSD) - this handles zeroForOne = false case
        else if (amount0 > 0) {
            pyrusdReceived = uint256(uint128(amount0));
        }
        
        return pyrusdReceived;
    }

    /**
     * @notice Places a bid on a Dutch auction.
     * @param _user The user whose auction to bid on.
     * @param _token The token being auctioned.
     * @param _bidAmount The amount of USDC or PYUSD to bid (based on user's preference).
     */
    function bidOnDutchAuction(address _user, address _token, uint256 _bidAmount) external {
        DutchAuction storage auction = auctions[_user][_token];
        require(auction.active, "Auction not active");
        require(block.timestamp < auction.startTime + auction.duration, "Auction ended");
        require(_bidAmount > 0, "Bid amount must be greater than zero");
        
        // Calculate current price based on time elapsed
        uint256 timeElapsed = block.timestamp - auction.startTime;
        uint256 currentPrice = auction.startPrice - ((auction.startPrice - auction.endPrice) * timeElapsed / auction.duration);
        
        require(_bidAmount >= currentPrice, "Bid too low");
        
        // Determine which currency to use for bidding
        address targetCurrency = arks[_user].usePYUSD ? pyrusdAddress : usdcAddress;
        
        // Transfer target currency from bidder to this contract
        IERC20(targetCurrency).safeTransferFrom(msg.sender, address(this), _bidAmount);
        
        // Refund previous highest bidder if exists
        if (auction.highestBidder != address(0)) {
            IERC20(targetCurrency).safeTransfer(auction.highestBidder, auction.highestBid);
        }
        
        // Update auction with new bid
        auction.highestBidder = msg.sender;
        auction.highestBid = _bidAmount;
        
        emit DutchAuctionBid(_user, _token, msg.sender, _bidAmount, currentPrice);
    }

    /**
     * @notice Settles a Dutch auction after it ends.
     * @param _user The user whose auction to settle.
     * @param _token The token being auctioned.
     */
    function settleDutchAuction(address _user, address _token) external {
        DutchAuction storage auction = auctions[_user][_token];
        require(auction.active, "Auction not active");
        require(block.timestamp >= auction.startTime + auction.duration, "Auction not ended");
        
        // Determine which currency was used for bidding
        address targetCurrency = arks[_user].usePYUSD ? pyrusdAddress : usdcAddress;
        
        if (auction.highestBidder != address(0)) {
            // Transfer tokens to highest bidder
            uint256 tokenBalance = IERC20(_token).balanceOf(address(this));
            IERC20(_token).safeTransfer(auction.highestBidder, tokenBalance);
            
            // Transfer target currency to beneficiary
            address beneficiary = arks[_user].beneficiary;
            IERC20(targetCurrency).safeTransfer(beneficiary, auction.highestBid);
            
            emit DutchAuctionSettled(_user, _token, auction.highestBidder, auction.highestBid, beneficiary);
        } else {
            // No bids, return tokens to user
            uint256 tokenBalance = IERC20(_token).balanceOf(address(this));
            IERC20(_token).safeTransfer(_user, tokenBalance);
            
            emit DutchAuctionSettled(_user, _token, address(0), 0, _user);
        }
        
        // Mark auction as inactive
        auction.active = false;
    }
}
