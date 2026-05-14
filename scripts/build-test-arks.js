#!/usr/bin/env node
// Build an Ark on Arbitrum for each test wallet in .env.test-wallets
// Usage: node scripts/build-test-arks.js
//
// Uses the same beneficiary and duration as the smoke test.
// Skips wallets that already have an Ark.

import { ethers } from "ethers";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv(filename) {
  const env = {};
  try {
    readFileSync(resolve(__dirname, `../${filename}`), "utf8")
      .split("\n")
      .forEach((line) => {
        const [key, ...rest] = line.split("=");
        if (key && !key.startsWith("#") && rest.length) {
          env[key.trim()] = rest.join("=").trim();
        }
      });
  } catch {}
  return env;
}

const testEnv = loadEnv(".env.test-wallets");

const COUNT = parseInt(testEnv.WALLET_COUNT || "0", 10);
if (!COUNT) { console.error("Error: .env.test-wallets not found or empty. Run gen-test-wallets.js first."); process.exit(1); }

const NOAH        = "0xD8C7F7F25EaDE1d8ad317F33aA697af357899261";
const BENEFICIARY = "0x3f60008dfd0efc03f476d9b489d6c5b13b3ebf2c";
const DURATION    = 31536000n; // 365 days
const TOKENS      = ["0xaf88d065e77c8cc2239327c5edb3a432268e5831"]; // USDC on Arbitrum
const RPC         = "https://arbitrum-rpc.publicnode.com";

const ABI = [
  "function arks(address) external view returns (address beneficiary, uint256 deadline, uint256 deadlineDuration)",
  "function buildArk(address _beneficiary, uint256 _deadlineDuration, address[] calldata _tokens) external",
];

async function buildForWallet(provider, index) {
  const key = testEnv[`WALLET_${index}_KEY`];
  const wallet = new ethers.Wallet(key, provider);
  const noah = new ethers.Contract(NOAH, ABI, wallet);
  const label = `Wallet ${String(index).padStart(2, "0")} (${wallet.address})`;

  try {
    // Check if Ark already exists
    const ark = await noah.arks(wallet.address);
    if (ark.deadline !== 0n) {
      console.log(`${label}  SKIP (Ark already exists)`);
      return "skipped";
    }

    const tx = await noah.buildArk(BENEFICIARY, DURATION, TOKENS);
    const receipt = await tx.wait();
    console.log(`${label}  OK   tx=${receipt.hash}`);
    return "success";
  } catch (e) {
    const msg = e.shortMessage || e.message?.split("\n")[0] || String(e);
    console.log(`${label}  FAIL ${msg}`);
    return "failed";
  }
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const network = await provider.getNetwork();

  console.log("=== Build Test Arks on Arbitrum ===");
  console.log(`Contract:   ${NOAH}`);
  console.log(`Beneficiary:${BENEFICIARY}`);
  console.log(`Duration:   365 days`);
  console.log(`Tokens:     USDC (${TOKENS[0]})`);
  console.log(`Chain:      Arbitrum (${network.chainId})`);
  console.log(`Wallets:    ${COUNT}`);
  console.log("");

  // Process in batches of 5 to avoid nonce/RPC issues
  const BATCH = 5;
  let success = 0, failed = 0, skipped = 0;

  for (let i = 1; i <= COUNT; i += BATCH) {
    const batch = [];
    for (let j = i; j < i + BATCH && j <= COUNT; j++) {
      batch.push(buildForWallet(provider, j));
    }
    const results = await Promise.all(batch);
    results.forEach(r => {
      if (r === "success") success++;
      else if (r === "skipped") skipped++;
      else failed++;
    });
  }

  console.log("");
  console.log("=== Summary ===");
  console.log(`  Built:   ${success}`);
  console.log(`  Failed:  ${failed}`);
  console.log(`  Skipped: ${skipped} (already had Ark)`);
  console.log(`  Total:   ${COUNT}`);
}

main().catch(e => { console.error(e); process.exit(1); });
