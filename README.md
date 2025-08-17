# Noah V4 - Uniswap V4 Integration

This project demonstrates the migration from Uniswap V2 to Uniswap V4 for the Noah contract, which provides a time-based asset recovery mechanism.

## Overview

Noah V4 allows users to:
- Build "Arks" with a deadline and beneficiary
- Add/remove tokens to their Ark
- Ping their Ark to reset the deadline
- Automatically sell all tokens for USDC when the deadline passes (flood)

## Key Changes from V2 to V4

1. **Uniswap V4 Integration**: Replaced Uniswap V2 router with V4 PoolManager
2. **Hook System**: Added a custom hook contract for V4 compliance
3. **Improved Swap Logic**: Better handling of swap callbacks and balance tracking
4. **Enhanced Security**: Added SafeERC20 for safer token operations

## Architecture

- **NoahV4**: Main contract implementing the Ark functionality
- **NoahV4Hook**: Uniswap V4 hook contract for swap compliance
- **MockPoolManager**: Test mock for the V4 PoolManager
- **MockERC20**: Test ERC20 tokens for development

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Or with yarn
yarn install
```

### Compilation
```bash
# Compile contracts
npm run compile

# Or with yarn
yarn compile
```

### Testing
```bash
# Run tests
npm test

# Or with yarn
yarn test
```

### Deployment
```bash
# Deploy to local network
npm run deploy

# Or with yarn
yarn deploy
```

## Contract Functions

### Ark Management
- `buildArk(beneficiary, deadlineDuration, tokens)`: Create a new Ark
- `pingArk()`: Reset the deadline timer
- `addPassengers(tokens)`: Add new tokens to the Ark
- `removePassenger(token)`: Remove a specific token
- `updateDeadlineDuration(duration)`: Change the deadline duration

### Flood Mechanism
- `flood(user)`: Trigger the automatic token sale for USDC

## Testing

The test suite covers:
- Contract deployment and initialization
- Ark building and management
- Token operations (add/remove)
- Deadline management
- Flood functionality with Uniswap V4 swaps
- Edge cases and error conditions

## Security Features

- SafeERC20 for all token transfers
- Proper access control
- Deadline validation
- Callback verification for swaps

## Development Notes

- Uses Solidity 0.8.20
- Implements Uniswap V4 SwapCallback interface
- Includes comprehensive test coverage
- Uses Hardhat for development and testing

## License

MIT License - see LICENSE file for details.
