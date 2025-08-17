/*
 Quick deploy helper to configure Chainlink and Flare price feeds on NoahV4

 Usage examples:
   npx hardhat run scripts/configure-feeds.js --network <network> \
     --noah 0xNoahAddress \
     --flareProvider 0xFlarePeripheryReader \
     --chainlink "0xTokenA=0xChainlinkFeedA,0xTokenB=0xChainlinkFeedB" \
     --flareIds "0xTokenA=0xfeedidhex...,0xTokenB=0xfeedidhex..."

 Notes:
  - feedId must be bytes21 hex (length 44 including 0x), as required by Flare periphery getFeedById.
*/

const hre = require("hardhat");
const { ethers } = hre;

function parsePairs(arg) {
  if (!arg) return [];
  return String(arg)
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const [a, b] = p.split("=");
      if (!a || !b) throw new Error(`Invalid pair '${p}', expected token=feed`);
      return [a.trim(), b.trim()];
    });
}

async function main() {
  const args = process.argv.slice(2);

  function getFlag(name) {
    const idx = args.indexOf(`--${name}`);
    if (idx >= 0 && idx + 1 < args.length) return args[idx + 1];
    return undefined;
  }

  const noahAddr = getFlag("noah");
  if (!noahAddr) throw new Error("--noah <address> is required");

  const flareProvider = getFlag("flareProvider");
  const chainlinkPairs = parsePairs(getFlag("chainlink"));
  const flareIdPairs = parsePairs(getFlag("flareIds"));

  const [signer] = await ethers.getSigners();
  console.log(`Using signer: ${await signer.getAddress()}`);

  const NoahV4 = await ethers.getContractFactory("NoahV4", signer);
  const noah = NoahV4.attach(noahAddr);

  if (flareProvider) {
    console.log(`Setting Flare data provider: ${flareProvider}`);
    const tx = await noah.setFlareDataProvider(flareProvider);
    await tx.wait();
    console.log("✔ Flare data provider set");
  }

  for (const [token, feed] of chainlinkPairs) {
    console.log(`Setting Chainlink feed: token=${token} -> feed=${feed}`);
    const tx = await noah.setPriceFeed(token, feed);
    await tx.wait();
    console.log("✔ Chainlink feed set");
  }

  for (const [token, feedId] of flareIdPairs) {
    if (!/^0x[0-9a-fA-F]+$/.test(feedId)) {
      throw new Error(`Invalid hex for feedId: ${feedId}`);
    }
    console.log(`Setting Flare feedId: token=${token} -> feedId=${feedId}`);
    const tx = await noah.setFlareFeedId(token, feedId);
    await tx.wait();
    console.log("✔ Flare feedId set");
  }

  console.log("All configuration steps completed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


