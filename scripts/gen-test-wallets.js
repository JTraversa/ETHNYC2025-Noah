#!/usr/bin/env node
// Generate N test wallets and write them to .env.test-wallets
// Usage: node scripts/gen-test-wallets.js [count]

import { ethers } from "ethers";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COUNT = parseInt(process.argv[2] || "25", 10);

console.log(`Generating ${COUNT} wallets...`);

const wallets = [];
for (let i = 0; i < COUNT; i++) {
  const w = ethers.Wallet.createRandom();
  wallets.push({ address: w.address, key: w.privateKey });
}

// Write .env.test-wallets
let env = `# Test wallets for Arbitrum stress test\n`;
env += `# Generated: ${new Date().toISOString()}\n`;
env += `# DO NOT COMMIT — contains private keys\n\n`;
env += `WALLET_COUNT=${COUNT}\n\n`;
wallets.forEach((w, i) => {
  env += `WALLET_${i + 1}_ADDRESS=${w.address}\n`;
  env += `WALLET_${i + 1}_KEY=${w.key}\n\n`;
});

const envPath = resolve(__dirname, "../.env.test-wallets");
writeFileSync(envPath, env);

console.log(`Written to .env.test-wallets`);
console.log(`\nAddresses:`);
wallets.forEach((w, i) => console.log(`  ${i + 1}. ${w.address}`));
