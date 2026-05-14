#!/usr/bin/env node
// Fund all test wallets from PRIVATE_KEY with enough ETH for Arbitrum gas.
// Usage: node scripts/fund-test-wallets.js
//
// Sends 0.002 ETH to each wallet (covers ~hundreds of txs on Arbitrum).
// Transactions are sent in parallel.

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

const mainEnv = loadEnv(".env");
const testEnv = loadEnv(".env.test-wallets");

const PRIVATE_KEY = process.env.PRIVATE_KEY || mainEnv.PRIVATE_KEY;
if (!PRIVATE_KEY) { console.error("Error: PRIVATE_KEY not set in .env"); process.exit(1); }

const COUNT = parseInt(testEnv.WALLET_COUNT || "0", 10);
if (!COUNT) { console.error("Error: .env.test-wallets not found or empty. Run gen-test-wallets.js first."); process.exit(1); }

const AMOUNT = ethers.parseEther("0.0002"); // per wallet (~60x gas buffer on Arbitrum)
const RPC = "https://arbitrum-rpc.publicnode.com";

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const funder = new ethers.Wallet(PRIVATE_KEY, provider);

  const funderBalance = await provider.getBalance(funder.address);
  const total = AMOUNT * BigInt(COUNT);

  console.log("=== Fund Test Wallets ===");
  console.log(`Funder:  ${funder.address}`);
  console.log(`Balance: ${ethers.formatEther(funderBalance)} ETH`);
  console.log(`Sending: ${ethers.formatEther(AMOUNT)} ETH x ${COUNT} wallets = ${ethers.formatEther(total)} ETH total (~60x gas buffer each)`);
  console.log(`Network: Arbitrum (chain 42161)`);
  console.log("");

  if (funderBalance < total) {
    console.error(`Insufficient balance. Need ${ethers.formatEther(total)} ETH, have ${ethers.formatEther(funderBalance)} ETH`);
    process.exit(1);
  }

  // Send transfers with explicit sequential nonces, then wait for all in parallel
  let nonce = await provider.getTransactionCount(funder.address);
  const pending = [];

  for (let i = 1; i <= COUNT; i++) {
    const address = testEnv[`WALLET_${i}_ADDRESS`];
    const label = `Wallet ${String(i).padStart(2, "0")}`;
    try {
      const tx = await funder.sendTransaction({ to: address, value: AMOUNT, nonce: nonce++ });
      console.log(`${label}  sent tx=${tx.hash}`);
      pending.push({ label, tx });
    } catch (e) {
      console.log(`${label}  FAIL (send) ${e.shortMessage || e.message?.split("\n")[0]}`);
    }
  }

  console.log("\nWaiting for confirmations...\n");
  await Promise.all(pending.map(({ label, tx }) =>
    tx.wait()
      .then(r => console.log(`${label}  confirmed  block=${r.blockNumber}`))
      .catch(e => console.log(`${label}  FAIL (confirm) ${e.shortMessage || e.message?.split("\n")[0]}`))
  ));
  console.log("\nDone.");
}

main().catch(e => { console.error(e); process.exit(1); });
