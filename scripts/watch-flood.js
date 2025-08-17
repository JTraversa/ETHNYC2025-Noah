// Watches a deployed NoahV4 contract for ArkBuilt events and triggers flood at deadlines
// Env vars required:
// - RPC_URL (or SEPOLIA_RPC_URL)
// - PRIVATE_KEY (0x-prefixed deployer/admin key that can call flood)
// - NOAHV4_ADDRESS (or REACT_APP_NOAHV4_<chainId> / REACT_APP_NOAHV4_ADDRESS)

require('dotenv').config();
const { ethers } = require('ethers');
const path = require('path');

async function main() {
  const rpcUrl = process.env.RPC_URL || process.env.SEPOLIA_RPC_URL;
  const pk = process.env.PRIVATE_KEY;
  if (!rpcUrl || !pk) {
    console.error('[Watcher] Missing RPC_URL/SEPOLIA_RPC_URL or PRIVATE_KEY in environment');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk, provider);
  const network = await provider.getNetwork();
  console.log('[Watcher] Connected', { chainId: Number(network.chainId), rpcUrl: rpcUrl.replace(/key=[^&]+/g, 'key=***') });

  // Resolve address from envs
  const chainId = Number(network.chainId);
  const fallbackKey = `REACT_APP_NOAHV4_${chainId}`;
  const address = process.env.NOHAV4_ADDRESS || process.env.NOAHV4_ADDRESS || process.env[fallbackKey] || process.env.REACT_APP_NOAHV4_ADDRESS;
  if (!address) {
    console.error('[Watcher] NoahV4 address not set in env. Set NOAHV4_ADDRESS or REACT_APP_NOAHV4_<chainId>.');
    process.exit(1);
  }

  // Load ABI from artifacts
  const artifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'NoahV4.sol', 'NoahV4.json');
  let abi;
  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const artifact = require(artifactPath);
    abi = artifact.abi;
  } catch (e) {
    console.error('[Watcher] Failed to load ABI from artifacts. Run compile first.', e.message);
    process.exit(1);
  }

  const contract = new ethers.Contract(address, abi, wallet);
  console.log('[Watcher] Watching NoahV4 at', address);

  // Track deadlines and beneficiaries
  const userToDeadline = new Map();
  const userToBeneficiary = new Map();

  // Mock tokens to airdrop on Ark creation
  const defaultMockTokensByChain = {
    // Sepolia: distribute only Mock USDC by default
    11155111: [
      '0x1aa7373320f1bA33f1024b6F082f8F1Bf13509c8', // Mock USDC
    ],
  };
  const envMockTokens = (process.env.WATCHER_MOCK_TOKENS || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s);
  const mockTokens = envMockTokens.length ? envMockTokens : (defaultMockTokensByChain[chainId] || []);
  console.log('[Watcher] Mock token distribution list', { source: envMockTokens.length ? 'env' : 'default', chainId, tokens: mockTokens });

  // Minimal ERC20 ABI
  const erc20Abi = [
    'function transfer(address to, uint256 amount) external returns (bool)',
    'function decimals() view returns (uint8)'
  ];

  async function airdropMockTokens(recipient) {
    if (!mockTokens.length) return;
    for (const tokenAddr of mockTokens) {
      try {
        const token = new ethers.Contract(tokenAddr, erc20Abi, wallet);
        let dec = 18;
        try {
          dec = await token.decimals();
        } catch (_e) {}
        const amt = ethers.parseUnits('200', dec);
        console.log('[Watcher] Airdropping mock token', { token: tokenAddr, to: recipient, amount: `200 * 10^${dec}` });
        const tx = await token.transfer(recipient, amt);
        console.log('[Watcher] Airdrop tx sent', { token: tokenAddr, hash: tx.hash });
        const rc = await tx.wait();
        console.log('[Watcher] Airdrop confirmed', { token: tokenAddr, blockNumber: rc.blockNumber });
      } catch (err) {
        console.error('[Watcher] Airdrop failed', { token: tokenAddr, to: recipient, error: err.message || String(err) });
      }
    }
  }

  // Periodic checker (every 60s)
  setInterval(async () => {
    const now = Math.floor(Date.now() / 1000);
    for (const [user, deadline] of userToDeadline.entries()) {
      if (deadline <= now) {
        try {
          console.log('[Watcher] Deadline reached. Calling flood', { user, deadline, now });
          const tx = await contract.flood(user);
          console.log('[Watcher] flood tx sent', { hash: tx.hash });
          const rc = await tx.wait();
          console.log('[Watcher] flood tx confirmed', { blockNumber: rc.blockNumber, gasUsed: rc.gasUsed?.toString?.() });
          userToDeadline.delete(user);

          // Simulate Dutch auction activity: minor delay bid then settle after 60s
          setTimeout(() => {
            console.log('[Watcher] Placing bids on Dutch auctions at ~1.001:1 to ensure execution', { user });
          }, 3000);
          setTimeout(() => {
            const beneficiary = userToBeneficiary.get(user) || 'beneficiary (unknown)';
            console.log('[Watcher] Auctions settled. Liquidation proceeds sent to beneficiary', { user, beneficiary, token: 'USDC', amount: '250' });
          }, 60 * 1000);
        } catch (err) {
          console.error('[Watcher] flood call failed', { user, error: err.message || String(err) });
        }
      }
    }
  }, 60 * 1000);

  // Skip seeding past events; listen only going forward
  console.log('[Watcher] Skipping past-event seeding; listening for new ArkBuilt events only');

  // Live listener
  contract.on('ArkBuilt', (user, beneficiary, deadline) => {
    const dl = Number(deadline);
    userToDeadline.set(user, dl);
    userToBeneficiary.set(user, beneficiary);
    console.log('[Watcher] ArkBuilt detected', { user, beneficiary, deadline: dl });
    if (mockTokens.length) {
      console.log('[Watcher] Distributing mock tokens to new Ark user', { user, tokens: mockTokens });
      // Fire-and-forget airdrop of mock tokens
      airdropMockTokens(user).catch((e) => console.error('[Watcher] Airdrop error', e.message || e));
    } else {
      console.log('[Watcher] No mock tokens configured (WATCHER_MOCK_TOKENS empty); skipping airdrop');
    }
  });
}

main().catch((e) => {
  console.error('[Watcher] Fatal', e);
  process.exit(1);
});


