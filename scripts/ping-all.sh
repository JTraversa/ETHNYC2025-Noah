#!/bin/bash
# Ping all Arks across all chains for the wallet derived from PRIVATE_KEY.
# Skips chains where no Ark exists or RPC is unreachable.
#
# Usage: ./scripts/ping-all.sh

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
WALLET=$(cast wallet address "$PRIVATE_KEY")

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
  "Katana|747474|https://rpc.katana.network"
)

echo "=== Noah Ping All Arks ==="
echo "Contract:  $NOAH"
echo "Wallet:    $WALLET"
echo ""

SUCCESS=0
FAILED=0
SKIPPED=0
TOTAL=${#CHAINS[@]}

for entry in "${CHAINS[@]}"; do
  IFS='|' read -r name chain_id rpc <<< "$entry"

  # Check if an Ark exists (deadline != 0)
  EXISTING=$(cast call "$NOAH" "arks(address)(address,uint256,uint256)" "$WALLET" --rpc-url "$rpc" 2>/dev/null || echo "ERROR")

  if [[ "$EXISTING" == "ERROR" ]]; then
    printf "%-14s  SKIP (RPC unreachable)\n" "$name"
    SKIPPED=$((SKIPPED+1))
    continue
  fi

  # Extract deadline (second return value)
  DEADLINE=$(echo "$EXISTING" | awk 'NR==2' | tr -d ' ')
  if [[ "$DEADLINE" == "0" ]]; then
    printf "%-14s  SKIP (no Ark)\n" "$name"
    SKIPPED=$((SKIPPED+1))
    continue
  fi

  # Ping the Ark
  printf "%-14s  pinging (deadline=%s)..." "$name" "$DEADLINE"

  if [[ "$name" == "MegaETH" ]]; then
    TX=$(cast send "$NOAH" "pingArk()" --private-key "$PRIVATE_KEY" --rpc-url "$rpc" --gas-limit 500000 2>&1) || TX="ERROR"
  else
    TX=$(cast send "$NOAH" "pingArk()" --private-key "$PRIVATE_KEY" --rpc-url "$rpc" 2>&1) || TX="ERROR"
  fi

  if echo "$TX" | grep -q "transactionHash\|blockNumber\|status.*1"; then
    HASH=$(echo "$TX" | grep "transactionHash" | awk '{print $2}')
    printf "\r%-14s  OK  tx=%s\n" "$name" "$HASH"
    SUCCESS=$((SUCCESS+1))
  else
    ERR=$(echo "$TX" | grep -i "error\|revert\|fail" | head -1)
    printf "\r%-14s  FAIL  %s\n" "$name" "$ERR"
    FAILED=$((FAILED+1))
  fi
done

echo ""
echo "=== Summary ==="
echo "  Pinged:  $SUCCESS"
echo "  Failed:  $FAILED"
echo "  Skipped: $SKIPPED (no Ark or RPC unreachable)"
echo "  Total:   $TOTAL chains checked"
