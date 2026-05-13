#!/usr/bin/env node
// Ping all Arks across all chains for the wallet derived from PRIVATE_KEY.
// Usage: node scripts/ping-all.js

import { ethers } from "ethers";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually
const envPath = resolve(__dirname, "../.env");
const env = {};
try {
  readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const [key, ...rest] = line.split("=");
      if (key && !key.startsWith("#") && rest.length) {
        env[key.trim()] = rest.join("=").trim();
      }
    });
} catch {}

const PRIVATE_KEY = process.env.PRIVATE_KEY || env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error("Error: PRIVATE_KEY not set in .env");
  process.exit(1);
}

const NOAH = "0xD8C7F7F25EaDE1d8ad317F33aA697af357899261";

const PING_ABI = [
  "function arks(address) external view returns (address beneficiary, uint256 deadline, uint256 deadlineDuration)",
  "function pingArk() external",
];

const CHAINS = [
  { name: "Ethereum",  rpc: "https://ethereum-rpc.publicnode.com" },
  { name: "Arbitrum",  rpc: "https://arb1.arbitrum.io/rpc" },
  { name: "Base",      rpc: "https://base-rpc.publicnode.com" },
  { name: "Optimism",  rpc: "https://optimism-rpc.publicnode.com" },
  { name: "Linea",     rpc: "https://linea-rpc.publicnode.com" },
  { name: "Scroll",    rpc: "https://rpc.scroll.io" },
  { name: "Polygon",   rpc: "https://polygon-bor-rpc.publicnode.com" },
  { name: "BSC",       rpc: "https://bsc-rpc.publicnode.com" },
  { name: "Avalanche", rpc: "https://api.avax.network/ext/bc/C/rpc" },
  { name: "Sonic",     rpc: "https://rpc.soniclabs.com" },
  { name: "Berachain", rpc: "https://rpc.berachain.com" },
  { name: "Mantle",    rpc: "https://rpc.mantle.xyz" },
  { name: "Flare",     rpc: "https://flare-api.flare.network/ext/C/rpc" },
  { name: "Flow",      rpc: "https://mainnet.evm.nodes.onflow.org" },
  { name: "Monad",     rpc: "https://rpc.monad.xyz" },
  { name: "MegaETH",   rpc: "https://mainnet.megaeth.com/rpc" },
  { name: "Stable",    rpc: "https://rpc.stable.xyz" },
  { name: "Cronos",    rpc: "https://evm.cronos.org" },
  { name: "Gnosis",    rpc: "https://rpc.gnosischain.com" },
  { name: "Celo",      rpc: "https://forno.celo.org" },
  { name: "Sei",       rpc: "https://evm-rpc.sei-apis.com" },
  { name: "Tempo",     rpc: "https://rpc.presto.tempo.xyz" },
  { name: "Plasma",    rpc: "https://rpc.plasma.to" },
  { name: "Ink",       rpc: "https://ink.drpc.org" },
  { name: "Katana",    rpc: "https://rpc.katana.network" },
];

async function pingChain({ name, rpc }) {
  const label = name.padEnd(14);
  try {
    const provider = new ethers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const noah = new ethers.Contract(NOAH, PING_ABI, wallet);

    // Check if Ark exists
    const ark = await noah.arks(wallet.address);
    if (ark.deadline === 0n) {
      console.log(`${label}  SKIP (no Ark)`);
      return "skipped";
    }

    // Ping
    const tx = await noah.pingArk();
    const receipt = await tx.wait();
    console.log(`${label}  OK   tx=${receipt.hash}`);
    return "success";
  } catch (err) {
    const msg = err.shortMessage || err.message?.split("\n")[0] || String(err);
    console.log(`${label}  FAIL ${msg}`);
    return "failed";
  }
}

async function main() {
  const wallet = new ethers.Wallet(PRIVATE_KEY);
  console.log("=== Noah Ping All Arks ===");
  console.log(`Contract:  ${NOAH}`);
  console.log(`Wallet:    ${wallet.address}`);
  console.log("");

  let success = 0, failed = 0, skipped = 0;

  for (const chain of CHAINS) {
    const result = await pingChain(chain);
    if (result === "success") success++;
    else if (result === "skipped") skipped++;
    else failed++;
  }

  console.log("");
  console.log("=== Summary ===");
  console.log(`  Pinged:  ${success}`);
  console.log(`  Failed:  ${failed}`);
  console.log(`  Skipped: ${skipped} (no Ark or RPC unreachable)`);
  console.log(`  Total:   ${CHAINS.length} chains checked`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
