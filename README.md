# Noah - A revolutionary hardware redundancy, fund recovery, and inheritance solution that guarantees your crypto assets will never be lost.


Noah's dead man switch technology provides a secure, automated way to ensure your cryptocurrency is safely inherited. By combining blockchain security with real-world verification systems, we create a foolproof inheritance mechanism.

Our platform monitors your activity and, when combined with real-world verification triggers, can automatically transfer your assets to designated beneficiaries when you're no longer able to manage them yourself.

Deployed on Flow however it appears there are errors with the current testnet block explorer as the account is running into read errors -- https://testnet.flowscan.io/evm/account/0xD42D01CfE3EEb70B4d27a9De27cbEacB4b3CAb56

> "It's not you, it's us 😔 Error while fetching data on route:Evm/account/0xD42D01CfE3EEb70B4d27a9De27cbEacB4b3CAb56 Cannot read properties of null (reading 'hash')"

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
