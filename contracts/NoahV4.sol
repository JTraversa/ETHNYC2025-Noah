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
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// Minimal Flare periphery interface for getFeedById
interface IFlarePeripheryReader {
    function getFeedById(bytes21 _feedId) external view returns (uint256 price, uint256 timestamp);
    function getFeedByIdWithDecimals(bytes21 _feedId) external view returns (uint256 price, uint8 decimals);
}

contract NoahV4 {
    using PoolIdLibrary for PoolKey;
    using SafeERC20 for IERC20;

    IPoolManager public immutable poolManager;
    address public immutable usdcAddress;
    address public immutable pyrusdAddress; // PayPal USD
    address public immutable hookAddress;
    
    // Chainlink price feed mapping: token => price feed address
    mapping(address => address) public priceFeeds;
    // Flare price: token => feedId (bytes21) used on Flare periphery getFeedById
    mapping(address => bytes21) public flareFeedIds;
    // Flare periphery data provider contract
    address public flareDataProvider;
    
    // Admin to set price feeds
    address public admin;
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

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
    event PriceFeedUpdated(address indexed token, address indexed priceFeed);
    event FlareFeedIdUpdated(address indexed token, bytes21 feedId);
    event FlareDataProviderUpdated(address indexed provider);
    event FernInfoSaved(address indexed user, string customerId, string paymentAccountId);
    event BeneficiaryUpdated(address indexed user, address indexed newBeneficiary);
    event FernOfframped(address indexed token, address indexed to, uint256 amount);

    constructor(IPoolManager _poolManager, address _usdc, address _pyrusd, address _hook) {
        poolManager = _poolManager;
        usdcAddress = _usdc;
        pyrusdAddress = _pyrusd;
        hookAddress = _hook;
        admin = msg.sender;
    }

    struct FernInfo {
        string customerId;
        string paymentAccountId;
    }

    // Stores Fern IDs only for users opting into fiat off-ramps (beneficiary set to this contract)
    mapping(address => FernInfo) public fernInfos;

    /**
     * @notice Save Fern customer/payment IDs on-chain for the caller. Only allowed when beneficiary is this contract.
     * This indicates the user opted into Fern off-ramps (USD flow where contract is beneficiary).
     */
    function setFernInfo(string calldata _customerId, string calldata _paymentAccountId) external {
        require(arks[msg.sender].deadline != 0, "Ark not built");
        require(arks[msg.sender].beneficiary == address(this), "Fern only when contract is beneficiary");
        require(bytes(_customerId).length > 0 && bytes(_paymentAccountId).length > 0, "Invalid Fern IDs");

        fernInfos[msg.sender] = FernInfo({ customerId: _customerId, paymentAccountId: _paymentAccountId });
        emit FernInfoSaved(msg.sender, _customerId, _paymentAccountId);
    }
    
    /**
     * @notice Sets the price feed address for a token (admin only)
     * @param _token The token address
     * @param _priceFeed The Chainlink price feed address
     */
    function setPriceFeed(address _token, address _priceFeed) external onlyAdmin {
        require(_token != address(0), "Token cannot be zero address");
        require(_priceFeed != address(0), "Price feed cannot be zero address");
        priceFeeds[_token] = _priceFeed;
        emit PriceFeedUpdated(_token, _priceFeed);
    }
    
    /**
     * @notice Sets the Flare periphery data provider (admin only)
     */
    function setFlareDataProvider(address _provider) external onlyAdmin {
        require(_provider != address(0), "Provider cannot be zero address");
        flareDataProvider = _provider;
        emit FlareDataProviderUpdated(_provider);
    }

    /**
     * @notice Sets the Flare feed id (bytes21) for a token (admin only)
     */
    function setFlareFeedId(address _token, bytes21 _feedId) external onlyAdmin {
        require(_token != address(0), "Token cannot be zero address");
        flareFeedIds[_token] = _feedId;
        emit FlareFeedIdUpdated(_token, _feedId);
    }
    
    /**
     * @notice Transfers admin role to a new address (admin only)
     * @param _newAdmin The new admin address
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "New admin cannot be zero address");
        admin = _newAdmin;
    }
    
    /**
     * @notice Gets the current price of a token from Chainlink oracle
     * @param _token The token address
     * @return price The current price in USD (8 decimals)
     */
    function getTokenPrice(address _token) public view returns (uint256 price) {
        address priceFeedAddress = priceFeeds[_token];
        require(priceFeedAddress != address(0), "Price feed not set for token");
        
        AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeedAddress);
        (, int256 priceInt, , , ) = priceFeed.latestRoundData();
        require(priceInt > 0, "Invalid price from oracle");
        
        return uint256(priceInt);
    }

    /**
     * @notice Returns average USD price (1e8 scale) across Chainlink and Flare if available.
     */
    function getAverageUsdPrice(address _token) public view returns (uint256) {
        uint256 count = 0;
        uint256 sumScaled = 0;

        // Chainlink
        address cl = priceFeeds[_token];
        if (cl != address(0)) {
            AggregatorV3Interface feed = AggregatorV3Interface(cl);
            (, int256 p, , , ) = feed.latestRoundData();
            if (p > 0) {
                uint8 dec = feed.decimals();
                uint256 scaled = _scaleTo1e8(uint256(p), dec);
                sumScaled += scaled;
                count += 1;
            }
        }

        // Flare periphery via getFeedById(feedId)
        if (flareDataProvider != address(0)) {
            bytes21 feedId = flareFeedIds[_token];
            if (feedId != bytes21(0)) {
                IFlarePeripheryReader reader = IFlarePeripheryReader(flareDataProvider);
                uint256 fPrice;
                uint8 fDec;
                // Try decimals-aware first
                try reader.getFeedByIdWithDecimals(feedId) returns (uint256 priceF, uint8 decF) {
                    fPrice = priceF; fDec = decF;
                } catch {
                    // Fallback to default getFeedById and assume 8 decimals
                    try reader.getFeedById(feedId) returns (uint256 priceF2, uint256 /*ts*/) {
                        fPrice = priceF2; fDec = 8;
                    } catch {
                        fPrice = 0; fDec = 8;
                    }
                }
                if (fPrice > 0) {
                    uint256 scaledF = _scaleTo1e8(fPrice, fDec);
                    sumScaled += scaledF;
                    count += 1;
                }
            }
        }

        require(count > 0, "No price feeds available");
        return sumScaled / count;
    }

    function _scaleTo1e8(uint256 amount, uint8 decimals_) internal pure returns (uint256) {
        if (decimals_ == 8) return amount;
        if (decimals_ > 8) {
            return amount / (10 ** (decimals_ - 8));
        } else {
            return amount * (10 ** (8 - decimals_));
        }
    }
    
    /**
     * @notice Gets the current auction price for a Dutch auction
     * @param _user The user address
     * @param _token The token address
     * @return currentPrice The current auction price
     */
    function getCurrentAuctionPrice(address _user, address _token) external view returns (uint256 currentPrice) {
        DutchAuction storage auction = auctions[_user][_token];
        require(auction.active, "Auction not active");
        
        uint256 timeElapsed = block.timestamp - auction.startTime;
        if (timeElapsed >= auction.duration) {
            return auction.endPrice; // Auction finished, return end price
        }
        
        // Linear price decrease from start to end
        uint256 priceRange = auction.startPrice - auction.endPrice;
        uint256 priceDecrease = (priceRange * timeElapsed) / auction.duration;
        
        return auction.startPrice - priceDecrease;
    }
    
    /**
     * @notice Checks if a price feed is set for a token
     * @param _token The token address
     * @return True if price feed is set, false otherwise
     */
    function hasPriceFeed(address _token) external view returns (bool) {
        return priceFeeds[_token] != address(0);
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
     * @notice Build Ark and set Fern info in one transaction if beneficiary is this contract.
     */
    function buildArkWithFern(
        address _beneficiary,
        uint256 _deadlineDuration,
        address[] calldata _tokens,
        bool _useDutchAuction,
        bool _usePYUSD,
        string calldata _customerId,
        string calldata _paymentAccountId
    ) external {
        this.buildArk(_beneficiary, _deadlineDuration, _tokens, _useDutchAuction, _usePYUSD);
        if (_beneficiary == address(this)) {
            require(bytes(_customerId).length > 0 && bytes(_paymentAccountId).length > 0, "Invalid Fern IDs");
            fernInfos[msg.sender] = FernInfo({ customerId: _customerId, paymentAccountId: _paymentAccountId });
            emit FernInfoSaved(msg.sender, _customerId, _paymentAccountId);
        }
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

    /**
     * @notice Updates the beneficiary for the caller's Ark. Can be set to any address including this contract's address.
     * @param _newBeneficiary The new beneficiary address.
     */
    function updateBeneficiary(address _newBeneficiary) external {
        require(arks[msg.sender].deadline != 0, "Ark not built");
        require(_newBeneficiary != address(0), "Beneficiary cannot be zero");
        arks[msg.sender].beneficiary = _newBeneficiary;
        emit BeneficiaryUpdated(msg.sender, _newBeneficiary);
    }

    /**
     * @notice Admin-only offramp function to transfer tokens held by this contract to a specified destination.
     * Intended to be used when users set the beneficiary to this contract to facilitate fiat off-ramps.
     * @param _token The ERC20 token address to transfer (e.g., USDC/PYUSD).
     * @param _to The destination address to receive the tokens.
     * @param _amount The amount of tokens to transfer.
     */
    function fernOfframp(address _token, address _to, uint256 _amount) external onlyAdmin {
        require(_to != address(0), "Invalid destination");
        require(_token != address(0), "Invalid token");
        require(_amount > 0, "Amount must be greater than zero");
        IERC20(_token).safeTransfer(_to, _amount);
        emit FernOfframped(_token, _to, _amount);
    }

    /// @notice The callback invoked by the PoolManager for swaps.
    function poolManagerSwapCallback(
        BalanceDelta delta,
        bytes calldata data
    ) external returns (bytes memory) {
        require(msg.sender == address(poolManager), "Only PoolManager can call this");
        
        (address beneficiary, address tokenOut) = abi.decode(data, (address, address));

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
            // Transfer the received output token to the beneficiary
            IERC20(tokenOut).safeTransfer(beneficiary, currencyReceived);
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
                // Get average price from Chainlink & Flare (1e8 decimals)
                uint256 tokenPriceUSD = getAverageUsdPrice(tokenAddress);
                
                // Calculate total value in USD (8 decimals from oracle)
                uint256 totalValueUSD = (userBalance * tokenPriceUSD) / 1e8;
                
                // Set start price at 0.1% above oracle price
                uint256 startPrice = totalValueUSD + (totalValueUSD * 1) / 1000; // +0.1%
                
                // Set end price at 10% below oracle price
                uint256 endPrice = totalValueUSD - (totalValueUSD * 10) / 100; // -10%
                
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
                    abi.encode(_account.beneficiary, usdcAddress) // Pass beneficiary and tokenOut to callback
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
                        // Convert USDC to PYUSD and deliver directly to beneficiary via callback
                        uint256 pyrusdReceived = _swapUSDCToPYUSD(usdcFromSwap, _account.beneficiary);
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
    // claimPYUSD no longer necessary since PYUSD is delivered directly to the beneficiary via callback

    /**
     * @notice Internal function to swap USDC to PYUSD.
     * @param _usdcAmount The amount of USDC to swap.
     * @return The amount of PYUSD received.
     */
    function _swapUSDCToPYUSD(uint256 _usdcAmount, address beneficiary) internal returns (uint256) {
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
            abi.encode(beneficiary, pyrusdAddress) // Pass beneficiary and tokenOut so callback delivers PYUSD
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
