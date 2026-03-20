#!/bin/bash
# Verify Noah contract on all deployed chains
# Usage: ./scripts/verify-contracts.sh
#
# Tries Sourcify first (free, no API key), then falls back to the
# chain-specific etherscan/blockscout verifier.
#
# For etherscan-family chains, set per-chain API keys in .env:
#   ETHERSCAN_KEY_1=...        (Ethereum)
#   ETHERSCAN_KEY_42161=...    (Arbitrum)
#   ETHERSCAN_KEY_8453=...     (Base)
#   etc.
# Or set ETHERSCAN_API_KEY as a shared fallback (works on some).

set -euo pipefail
export PATH="$PATH:$HOME/.foundry/bin"

NOAH_ADDRESS="0xD8C7F7F25EaDE1d8ad317F33aA697af357899261"
CONTRACT_PATH="contracts/noah.sol:Noah"

# Chain configs: name|chain_id|verifier|verifier_url
CHAINS=(
  "Ethereum|1|etherscan|https://api.etherscan.io/api"
  "Arbitrum|42161|etherscan|https://api.arbiscan.io/api"
  "Base|8453|etherscan|https://api.basescan.org/api"
  "Optimism|10|etherscan|https://api-optimistic.etherscan.io/api"
  "Linea|59144|etherscan|https://api.lineascan.build/api"
  "Scroll|534352|etherscan|https://api.scrollscan.com/api"
  "Polygon|137|etherscan|https://api.polygonscan.com/api"
  "BSC|56|etherscan|https://api.bscscan.com/api"
  "Avalanche|43114|etherscan|https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan/api"
  "Sonic|146|etherscan|https://api.sonicscan.org/api"
  "Berachain|80094|etherscan|https://api.berascan.com/api"
  "Mantle|5000|etherscan|https://api.mantlescan.xyz/api"
  "Flare|14|blockscout|https://flare-explorer.flare.network/api"
  "Flow|747|blockscout|https://evm.flowscan.io/api"
  "Monad|143|sourcify|https://sourcify-api-monad.blockvision.org/server"
  "MegaETH|4326|etherscan|https://api-mega.etherscan.io/api"
  "Stable|988|blockscout|https://stablescan.xyz/api"
  "Cronos|25|blockscout|https://explorer-api.cronos.org/mainnet/api"
  "Gnosis|100|etherscan|https://api.gnosisscan.io/api"
  "Celo|42220|etherscan|https://api.celoscan.io/api"
  "Sei|1329|blockscout|https://seitrace.com/pacific-1/api"
  "Tempo|4217|sourcify|"
)

# Load .env for API keys
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
if [[ -f "$ENV_FILE" ]]; then
  source "$ENV_FILE"
fi

echo "=== Noah Contract Verification ==="
echo "Address: $NOAH_ADDRESS"
echo ""

printf "%-14s %s\n" "CHAIN" "RESULT"
printf "%-14s %s\n" "--------------" "--------------------"

VERIFIED=0
FAILED_COUNT=0
SKIPPED=0
FAILED_CHAINS=()

for entry in "${CHAINS[@]}"; do
  IFS='|' read -r name chain_id verifier verifier_url <<< "$entry"

  printf "%-14s " "$name"

  # Try Sourcify first (free, works on most chains)
  if forge verify-contract "$NOAH_ADDRESS" "$CONTRACT_PATH" \
    --chain-id "$chain_id" \
    --verifier sourcify \
    > /dev/null 2>&1; then
    echo "OK (sourcify)"
    VERIFIED=$((VERIFIED+1))
    continue
  fi

  # Fall back to chain-specific verifier
  case "$verifier" in
    etherscan)
      # Check for per-chain key (ETHERSCAN_KEY_<chain_id>), then shared fallback
      KEY_VAR="ETHERSCAN_KEY_${chain_id}"
      API_KEY="${!KEY_VAR:-${ETHERSCAN_API_KEY:-}}"

      if [[ -z "$API_KEY" ]]; then
        echo "SKIP (no $KEY_VAR or ETHERSCAN_API_KEY)"
        SKIPPED=$((SKIPPED+1))
        FAILED_CHAINS+=("$name")
        continue
      fi

      if forge verify-contract "$NOAH_ADDRESS" "$CONTRACT_PATH" \
        --chain-id "$chain_id" \
        --verifier etherscan \
        --verifier-url "$verifier_url" \
        --etherscan-api-key "$API_KEY" \
        > /dev/null 2>&1; then
        echo "OK (etherscan)"
        VERIFIED=$((VERIFIED+1))
      else
        echo "FAILED (etherscan)"
        FAILED_COUNT=$((FAILED_COUNT+1))
        FAILED_CHAINS+=("$name")
      fi
      ;;
    blockscout)
      if forge verify-contract "$NOAH_ADDRESS" "$CONTRACT_PATH" \
        --chain-id "$chain_id" \
        --verifier blockscout \
        --verifier-url "$verifier_url" \
        > /dev/null 2>&1; then
        echo "OK (blockscout)"
        VERIFIED=$((VERIFIED+1))
      else
        echo "FAILED (blockscout)"
        FAILED_COUNT=$((FAILED_COUNT+1))
        FAILED_CHAINS+=("$name")
      fi
      ;;
    sourcify)
      echo "FAILED (sourcify only)"
      FAILED_COUNT=$((FAILED_COUNT+1))
      FAILED_CHAINS+=("$name")
      ;;
  esac
done

echo ""
echo "=== Summary ==="
echo "  Verified: $VERIFIED / ${#CHAINS[@]}"
echo "  Failed:   $FAILED_COUNT / ${#CHAINS[@]}"
echo "  Skipped:  $SKIPPED / ${#CHAINS[@]}"

if [[ ${#FAILED_CHAINS[@]} -gt 0 ]]; then
  echo ""
  echo "Unverified: ${FAILED_CHAINS[*]}"
fi

if [[ $SKIPPED -gt 0 ]]; then
  echo ""
  echo "For etherscan-family chains, add per-chain keys to .env:"
  echo "  ETHERSCAN_KEY_1=...      (etherscan.io)"
  echo "  ETHERSCAN_KEY_42161=...  (arbiscan.io)"
  echo "  ETHERSCAN_KEY_8453=...   (basescan.org)"
  echo "  etc."
fi
