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

  // Track deadlines
  const userToDeadline = new Map();

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
    console.log('[Watcher] ArkBuilt detected', { user, beneficiary, deadline: dl });
  });
}

main().catch((e) => {
  console.error('[Watcher] Fatal', e);
  process.exit(1);
});


