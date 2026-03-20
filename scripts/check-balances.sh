#!/bin/bash
# Check deployer wallet balances across all 21 target chains
# Usage: ./scripts/check-balances.sh [ADDRESS]
#   If no address given, derives it from PRIVATE_KEY in .env

set -euo pipefail
export PATH="$PATH:$HOME/.foundry/bin"

# Load .env if it exists
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
if [[ -f "$ENV_FILE" ]]; then
  source "$ENV_FILE"
fi

# Resolve wallet address
if [[ -n "${1:-}" ]]; then
  WALLET="$1"
elif [[ -n "${PRIVATE_KEY:-}" ]]; then
  WALLET=$(cast wallet address "$PRIVATE_KEY")
else
  echo "Usage: ./scripts/check-balances.sh <ADDRESS>"
  echo "   or: set PRIVATE_KEY in .env"
  exit 1
fi

echo "=== Noah Deployer Balance Check ==="
echo "Wallet: $WALLET"
echo "Date:   $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo ""

# Chain configs: name|rpc_url|symbol|recommended
CHAINS=(
  "Ethereum|https://eth.llamarpc.com|ETH|0.01"
  "Arbitrum|https://arb1.arbitrum.io/rpc|ETH|0.01"
  "Base|https://mainnet.base.org|ETH|0.01"
  "Optimism|https://mainnet.optimism.io|ETH|0.01"
  "Linea|https://rpc.linea.build|ETH|0.01"
  "Scroll|https://rpc.scroll.io|ETH|0.01"
  "Polygon|https://polygon.publicnode.com|POL|1"
  "BSC|https://bsc-dataseed.binance.org|BNB|0.001"
  "Avalanche|https://api.avax.network/ext/bc/C/rpc|AVAX|0.01"
  "Sonic|https://rpc.soniclabs.com|S|1"
  "Berachain|https://rpc.berachain.com|BERA|0.01"
  "Mantle|https://rpc.mantle.xyz|MNT|0.1"
  "Flare|https://flare-api.flare.network/ext/C/rpc|FLR|0.5"
  "Flow|https://mainnet.evm.nodes.onflow.org|FLOW|0.5"
  "Monad|https://rpc.monad.xyz|MON|1"
  "MegaETH|https://mainnet.megaeth.com/rpc|MEGA|0.01"
  "Stable|https://api-stable-mainnet.n.dwellir.com|gUSDT|0.1"
  "Cronos|https://evm.cronos.org|CRO|1"
  "Gnosis|https://rpc.gnosischain.com|xDAI|0.1"
  "Celo|https://forno.celo.org|CELO|0.5"
  "Sei|https://evm-rpc.sei-apis.com|SEI|0.1"
  "Tempo|https://rpc.presto.tempo.xyz|USD|0.1"
)

# Temp file for parallel results
RESULTS_DIR=$(mktemp -d)
trap "rm -rf $RESULTS_DIR" EXIT

# pathUSD TIP-20 address on Tempo (fees paid in stablecoins, not native token)
TEMPO_PATHUSD="0x20c0000000000000000000000000000000000000"

# Query all chains in parallel
for i in "${!CHAINS[@]}"; do
  IFS='|' read -r name rpc symbol recommended <<< "${CHAINS[$i]}"
  (
    if [[ "$name" == "Tempo" ]]; then
      # Tempo has no native gas token — check pathUSD (TIP-20, 6 decimals) balance instead
      balance_raw=$(cast call "$TEMPO_PATHUSD" "balanceOf(address)(uint256)" "$WALLET" --rpc-url "$rpc" 2>/dev/null || echo "ERROR")
      if [[ "$balance_raw" == "ERROR" ]]; then
        echo "$name|$symbol|ERROR|$recommended|UNREACHABLE" > "$RESULTS_DIR/$i"
      else
        balance=$(awk "BEGIN { printf \"%.6f\", $balance_raw / 1000000 }")
        status=$(awk "BEGIN { print ($balance >= $recommended) ? \"FUNDED\" : ($balance > 0) ? \"LOW\" : \"EMPTY\" }")
        echo "$name|$symbol|$balance|$recommended|$status" > "$RESULTS_DIR/$i"
      fi
    else
      balance_wei=$(cast balance "$WALLET" --rpc-url "$rpc" 2>/dev/null || echo "ERROR")
      if [[ "$balance_wei" == "ERROR" ]]; then
        echo "$name|$symbol|ERROR|$recommended|UNREACHABLE" > "$RESULTS_DIR/$i"
      else
        balance_eth=$(cast from-wei "$balance_wei" 2>/dev/null || echo "0")
        # Compare: funded if balance >= recommended (using awk for float comparison)
        status=$(awk "BEGIN { print ($balance_eth >= $recommended) ? \"FUNDED\" : ($balance_eth > 0) ? \"LOW\" : \"EMPTY\" }")
        echo "$name|$symbol|$balance_eth|$recommended|$status" > "$RESULTS_DIR/$i"
      fi
    fi
  ) &
done

wait

# Print results table
printf "%-14s %-6s %16s %12s   %s\n" "CHAIN" "TOKEN" "BALANCE" "RECOMMENDED" "STATUS"
printf "%-14s %-6s %16s %12s   %s\n" "--------------" "------" "----------------" "------------" "----------"

FUNDED=0
EMPTY=0
LOW=0
ERRORS=0
TOTAL=${#CHAINS[@]}

for i in "${!CHAINS[@]}"; do
  if [[ -f "$RESULTS_DIR/$i" ]]; then
    IFS='|' read -r name symbol balance recommended status < "$RESULTS_DIR/$i"

    case "$status" in
      FUNDED)      marker="OK"; ((FUNDED++)) ;;
      LOW)         marker="LOW"; ((LOW++)) ;;
      EMPTY)       marker="--"; ((EMPTY++)) ;;
      UNREACHABLE) marker="ERR"; ((ERRORS++)) ;;
    esac

    if [[ "$status" == "UNREACHABLE" ]]; then
      printf "%-14s %-6s %16s %12s   %s\n" "$name" "$symbol" "---" "$recommended" "$marker"
    else
      printf "%-14s %-6s %16s %12s   %s\n" "$name" "$symbol" "$balance" "$recommended" "$marker"
    fi
  fi
done

echo ""
echo "=== Summary ==="
echo "  Funded:      $FUNDED / $TOTAL"
echo "  Low balance: $LOW / $TOTAL"
echo "  Empty:       $EMPTY / $TOTAL"
echo "  RPC errors:  $ERRORS / $TOTAL"

if [[ $FUNDED -eq $TOTAL ]]; then
  echo ""
  echo "All chains funded — ready to deploy!"
elif [[ $((FUNDED + LOW)) -eq $((TOTAL - ERRORS)) ]]; then
  echo ""
  echo "All reachable chains have some funds. Top up LOW chains before deploying."
fi
