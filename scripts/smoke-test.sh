#!/bin/bash
# Smoke test: build a barebones Ark on each of the 22 chains
# Calls buildArk(beneficiary, deadlineDuration, tokens[]) with:
#   - beneficiary: 0x000...dead (burn address)
#   - deadlineDuration: 365 days (31536000 seconds)
#   - tokens: [] (empty array)
#
# Usage: ./scripts/smoke-test.sh

set -euo pipefail
export PATH="$PATH:$HOME/.foundry/bin"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
if [[ -f "$ENV_FILE" ]]; then
  source "$ENV_FILE"
fi

if [[ -z "${PRIVATE_KEY:-}" ]]; then
  echo "Error: PRIVATE_KEY not set in .env"
  exit 1
fi

NOAH="0xD8C7F7F25EaDE1d8ad317F33aA697af357899261"
BENEFICIARY="0x3f60008Dfd0EfC03F476D9B489D6c5B13B3eBF2C"
DURATION="31536000"  # 365 days

# Chain configs: name|chain_id|rpc_url
CHAINS=(
  "Ethereum|1|https://ethereum-rpc.publicnode.com"
  "Arbitrum|42161|https://arb1.arbitrum.io/rpc"
  "Base|8453|https://mainnet.base.org"
  "Optimism|10|https://mainnet.optimism.io"
  "Linea|59144|https://rpc.linea.build"
  "Scroll|534352|https://rpc.scroll.io"
  "Polygon|137|https://polygon-bor-rpc.publicnode.com"
  "BSC|56|https://bsc-rpc.publicnode.com"
  "Avalanche|43114|https://api.avax.network/ext/bc/C/rpc"
  "Sonic|146|https://rpc.soniclabs.com"
  "Berachain|80094|https://rpc.berachain.com"
  "Mantle|5000|https://rpc.mantle.xyz"
  "Flare|14|https://flare-api.flare.network/ext/C/rpc"
  "Flow|747|https://mainnet.evm.nodes.onflow.org"
  "Monad|143|https://rpc.monad.xyz"
  "MegaETH|4326|https://mainnet.megaeth.com/rpc"
  "Stable|988|https://rpc.stable.xyz"
  "Cronos|25|https://evm.cronos.org"
  "Gnosis|100|https://rpc.gnosischain.com"
  "Celo|42220|https://forno.celo.org"
  "Sei|1329|https://evm-rpc.sei-apis.com"
  "Tempo|4217|https://rpc.presto.tempo.xyz"
  "Plasma|9745|https://rpc.plasma.to"
  "Ink|57073|https://ink.drpc.org"
)

# buildArk(address,uint256,address[]) selector = 0x79000013
# Encode: beneficiary (address), deadlineDuration (uint256), offset to tokens array, length 0
USDC="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
CALLDATA=$(cast calldata "buildArk(address,uint256,address[])" "$BENEFICIARY" "$DURATION" "[$USDC]")

echo "=== Noah Smoke Test — Build Ark on All 22 Chains ==="
echo "Contract: $NOAH"
echo "Beneficiary: $BENEFICIARY"
echo "Duration: $DURATION seconds (365 days)"
echo "Tokens: [$USDC] (USDC)"
echo ""

SUCCESS=0
FAILED=0
SKIPPED=0
TOTAL=${#CHAINS[@]}

for entry in "${CHAINS[@]}"; do
  IFS='|' read -r name chain_id rpc <<< "$entry"

  # Check if ark already exists (deadline != 0)
  WALLET=$(cast wallet address "$PRIVATE_KEY")
  EXISTING=$(cast call "$NOAH" "arks(address)(address,uint256,uint256)" "$WALLET" --rpc-url "$rpc" 2>/dev/null || echo "ERROR")

  if [[ "$EXISTING" == "ERROR" ]]; then
    printf "%-14s  SKIP (RPC unreachable)\n" "$name"
    SKIPPED=$((SKIPPED+1))
    continue
  fi

  # Extract deadline (second return value)
  DEADLINE=$(echo "$EXISTING" | awk 'NR==2' | tr -d ' ')
  if [[ "$DEADLINE" != "0" ]]; then
    printf "%-14s  SKIP (ark already exists, deadline=%s)\n" "$name" "$DEADLINE"
    SKIPPED=$((SKIPPED+1))
    continue
  fi

  # Send buildArk transaction
  printf "%-14s  sending..." "$name"

  if [[ "$name" == "MegaETH" ]]; then
    TX=$(cast send "$NOAH" "$CALLDATA" --private-key "$PRIVATE_KEY" --rpc-url "$rpc" --gas-limit 500000 2>&1) || TX="ERROR"
  else
    TX=$(cast send "$NOAH" "$CALLDATA" --private-key "$PRIVATE_KEY" --rpc-url "$rpc" 2>&1) || TX="ERROR"
  fi

  if echo "$TX" | grep -q "transactionHash\|blockNumber\|status.*1"; then
    HASH=$(echo "$TX" | grep "transactionHash" | awk '{print $2}')
    printf "\r%-14s  OK  tx=%s\n" "$name" "$HASH"
    SUCCESS=$((SUCCESS+1))
  else
    ERR=$(echo "$TX" | grep -i "error\|revert\|fail" | awk 'NR==1')
    printf "\r%-14s  FAIL  %s\n" "$name" "$ERR"
    FAILED=$((FAILED+1))
  fi
done

echo ""
echo "=== Summary ==="
echo "  Success: $SUCCESS / $TOTAL"
echo "  Failed:  $FAILED / $TOTAL"
echo "  Skipped: $SKIPPED / $TOTAL"

if [[ $SUCCESS -eq $TOTAL || $((SUCCESS + SKIPPED)) -eq $TOTAL ]]; then
  echo ""
  echo "Smoke test passed!"
fi
