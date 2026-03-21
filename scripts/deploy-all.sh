#!/bin/bash
# Deploy Noah to all configured chains
# Usage: ./scripts/deploy-all.sh [--no-verify] [--testnets] [--chain <name>]
#
# Deploys standard EVM chains first, then swaps to tempo-foundry for Tempo,
# then restores standard foundry. Verifies via Sourcify by default.

set -e

# Ensure foundry is on PATH
export PATH="$PATH:$HOME/.foundry/bin"

# Load .env
source .env

# --- Parse flags ---
SKIP_VERIFY=false
TESTNETS=false
SINGLE_CHAIN=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-verify) SKIP_VERIFY=true; shift ;;
    --testnets)  TESTNETS=true; shift ;;
    --chain)     SINGLE_CHAIN="$2"; shift 2 ;;
    *)           echo "Unknown flag: $1"; exit 1 ;;
  esac
done

# --- Chain configs: name|rpc_url|chain_id|verifier|verifier_url ---
# Verifier types: sourcify, etherscan, blockscout, none
# For etherscan-family, verifier_url is the API endpoint
# Sourcify needs no API key; etherscan needs ETHERSCAN_API_KEY in .env

MAINNET_CHAINS=(
  # ETH-native (6)
  "Ethereum|https://eth.llamarpc.com|1|etherscan|https://api.etherscan.io/api"
  "Arbitrum|https://arb1.arbitrum.io/rpc|42161|etherscan|https://api.arbiscan.io/api"
  "Base|https://mainnet.base.org|8453|etherscan|https://api.basescan.org/api"
  "Optimism|https://mainnet.optimism.io|10|etherscan|https://api-optimistic.etherscan.io/api"
  "Linea|https://rpc.linea.build|59144|etherscan|https://api.lineascan.build/api"
  "Scroll|https://rpc.scroll.io|534352|etherscan|https://api.scrollscan.com/api"
  # Non-ETH-native (15)
  "Polygon|https://polygon.publicnode.com|137|etherscan|https://api.polygonscan.com/api"
  "BSC|https://bsc-dataseed.binance.org|56|etherscan|https://api.bscscan.com/api"
  "Avalanche|https://api.avax.network/ext/bc/C/rpc|43114|etherscan|https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan/api"
  "Sonic|https://rpc.soniclabs.com|146|etherscan|https://api.sonicscan.org/api"
  "Berachain|https://rpc.berachain.com|80094|etherscan|https://api.berascan.com/api"
  "Mantle|https://rpc.mantle.xyz|5000|etherscan|https://api.mantlescan.xyz/api"
  "Flare|https://flare-api.flare.network/ext/C/rpc|14|blockscout|https://flare-explorer.flare.network/api"
  "Flow|https://mainnet.evm.nodes.onflow.org|747|blockscout|https://evm.flowscan.io/api"
  "Monad|https://rpc.monad.xyz|143|sourcify|"
  "MegaETH|https://mainnet.megaeth.com/rpc|4326|etherscan|https://api-mega.etherscan.io/api"
  "Stable|https://rpc.stable.xyz|988|blockscout|https://stablescan.xyz/api"
  "Cronos|https://evm.cronos.org|25|blockscout|https://explorer-api.cronos.org/mainnet/api"
  "Gnosis|https://rpc.gnosischain.com|100|etherscan|https://api.gnosisscan.io/api"
  "Celo|https://forno.celo.org|42220|etherscan|https://api.celoscan.io/api"
  "Sei|https://evm-rpc.sei-apis.com|1329|blockscout|https://seitrace.com/pacific-1/api"
  # Stablecoin-native (requires tempo-foundry fork)
  "Tempo|https://rpc.presto.tempo.xyz|4217|sourcify|"
  # New chains
  "Plasma|https://rpc.plasma.to|9745|sourcify|"
  "Ink|https://ink.drpc.org|57073|blockscout|https://explorer.inkonchain.com/api"
)

TESTNET_CHAINS=(
  "Sepolia|${SEPOLIA_RPC_URL:-}|11155111|etherscan|https://api-sepolia.etherscan.io/api"
  "Arbitrum Sepolia|${ARBITRUM_SEPOLIA_RPC_URL:-}|421614|etherscan|https://api-sepolia.arbiscan.io/api"
)

# Select which chains to deploy
if [[ "$TESTNETS" == true ]]; then
  CHAINS=("${TESTNET_CHAINS[@]}")
else
  CHAINS=("${MAINNET_CHAINS[@]}")
fi

# Filter to single chain if --chain specified
if [[ -n "$SINGLE_CHAIN" ]]; then
  FILTERED=()
  for chain in "${CHAINS[@]}"; do
    IFS='|' read -r name rpc chain_id verifier verifier_url <<< "$chain"
    if [[ "${name,,}" == "${SINGLE_CHAIN,,}" ]]; then
      FILTERED+=("$chain")
    fi
  done
  if [[ ${#FILTERED[@]} -eq 0 ]]; then
    echo "Error: chain '$SINGLE_CHAIN' not found"
    exit 1
  fi
  CHAINS=("${FILTERED[@]}")
fi

# --- Split chains into standard EVM and Tempo ---
TEMPO_CHAIN_ID="4217"
TEMPO_FEE_TOKEN="0x20c0000000000000000000000000000000000000"

STANDARD_CHAINS=()
TEMPO_CHAINS=()
for chain in "${CHAINS[@]}"; do
  IFS='|' read -r name rpc chain_id verifier verifier_url <<< "$chain"
  if [[ "$chain_id" == "$TEMPO_CHAIN_ID" ]]; then
    TEMPO_CHAINS+=("$chain")
  else
    STANDARD_CHAINS+=("$chain")
  fi
done

# --- Pre-flight: test all RPCs in parallel ---
echo "=== Pre-flight RPC Check ==="
echo ""

RPC_CHECK_DIR=$(mktemp -d)
trap "rm -rf $RPC_CHECK_DIR" EXIT

for i in "${!CHAINS[@]}"; do
  IFS='|' read -r name rpc chain_id verifier verifier_url <<< "${CHAINS[$i]}"
  [[ -z "$rpc" ]] && continue
  (
    BLOCK=$(cast block-number --rpc-url "$rpc" 2>/dev/null)
    CHAIN_REPORTED=$(cast chain-id --rpc-url "$rpc" 2>/dev/null)
    if [[ -n "$BLOCK" && "$CHAIN_REPORTED" == "$chain_id" ]]; then
      echo "OK|$BLOCK" > "$RPC_CHECK_DIR/$i"
    elif [[ -n "$BLOCK" ]]; then
      echo "MISMATCH|expected $chain_id got $CHAIN_REPORTED" > "$RPC_CHECK_DIR/$i"
    else
      echo "FAIL|unreachable" > "$RPC_CHECK_DIR/$i"
    fi
  ) &
done
wait

RPC_FAILURES=0
for i in "${!CHAINS[@]}"; do
  IFS='|' read -r name rpc chain_id verifier verifier_url <<< "${CHAINS[$i]}"
  [[ -z "$rpc" ]] && continue

  if [[ -f "$RPC_CHECK_DIR/$i" ]]; then
    IFS='|' read -r status detail < "$RPC_CHECK_DIR/$i"
  else
    status="FAIL"; detail="no response"
  fi

  case "$status" in
    OK)       printf "  %-14s chain %-6s block %-12s OK\n" "$name" "$chain_id" "$detail" ;;
    MISMATCH) printf "  %-14s CHAIN ID MISMATCH (%s)\n" "$name" "$detail"; RPC_FAILURES=$((RPC_FAILURES+1)) ;;
    FAIL)     printf "  %-14s FAILED (%s)\n" "$name" "$detail"; RPC_FAILURES=$((RPC_FAILURES+1)) ;;
  esac
done

echo ""
if [[ $RPC_FAILURES -gt 0 ]]; then
  echo "$RPC_FAILURES RPC(s) failed pre-flight check. Aborting."
  exit 1
fi
echo "All RPCs healthy."
echo ""

# Create logs directory with timestamped subfolder
TIMESTAMP=$(date -u +"%Y-%m-%d_%H-%M-%S")
LOG_DIR="deployments/$TIMESTAMP"
mkdir -p "$LOG_DIR"

FAILED=0
SUMMARY=""
SUCCESSFUL_CHAINS=()
ALL_ENTRIES=()

# --- Verification strategy ---
# Deploy script uses Sourcify for all chains (free, no API keys needed).
# If Sourcify doesn't cover a chain, run verify-contracts.sh post-deploy
# to retry with chain-specific etherscan/blockscout verifiers.
if [[ "$SKIP_VERIFY" == true ]]; then
  VERIFY_FLAGS=""
else
  VERIFY_FLAGS="--verify --verifier sourcify"
fi

# --- Helper: deploy a batch of chains in parallel ---
deploy_batch() {
  local -n batch=$1
  local extra_flags="${2:-}"

  local PIDS=()
  local ENTRIES=()

  for chain in "${batch[@]}"; do
    IFS='|' read -r name rpc chain_id verifier verifier_url <<< "$chain"

    if [[ -z "$rpc" ]]; then
      echo "[$name] Skipping — no RPC URL configured"
      continue
    fi

    local safe_name=$(echo "$name" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
    local logfile="$LOG_DIR/$safe_name.log"
    ENTRIES+=("$name|$logfile|$chain_id")
    ALL_ENTRIES+=("$name|$logfile|$chain_id")

    echo "[$name] Starting deployment..."
    forge script scripts/Deploy.s.sol:Deploy \
      --rpc-url "$rpc" \
      --broadcast \
      $VERIFY_FLAGS \
      $extra_flags \
      > "$logfile" 2>&1 &
    PIDS+=($!)
  done

  echo ""
  echo "Waiting for deployments to complete..."
  echo ""

  for i in "${!PIDS[@]}"; do
    IFS='|' read -r name logfile chain_id <<< "${ENTRIES[$i]}"
    if wait "${PIDS[$i]}"; then
      STATUS="SUCCESS"
      echo "[$name] Deployed successfully"
      SUCCESSFUL_CHAINS+=("$name|$chain_id")
    else
      STATUS="FAILED"
      echo "[$name] FAILED"
      FAILED=1
    fi

    ADDRESS=$(grep -oP 'Noah deployed at: \K0x[a-fA-F0-9]+' "$logfile" 2>/dev/null || echo "unknown")
    SUMMARY+="$name | $STATUS | $ADDRESS"$'\n'

    echo "--- $name output ---"
    cat "$logfile"
    echo "---"
    echo ""
  done
}

# --- Phase 1: Deploy standard EVM chains ---
if [[ ${#STANDARD_CHAINS[@]} -gt 0 ]]; then
  echo "=== Phase 1: Standard EVM Chains (${#STANDARD_CHAINS[@]}) ==="
  echo "Logs: $LOG_DIR/"
  echo ""
  deploy_batch STANDARD_CHAINS
fi

# --- Phase 2: Deploy Tempo (requires tempo-foundry fork) ---
if [[ ${#TEMPO_CHAINS[@]} -gt 0 ]]; then
  echo "=== Phase 2: Tempo (requires tempo-foundry) ==="
  echo ""

  echo "Switching to tempo-foundry..."
  rm -rf "$HOME/.foundry/versions/nightly"
  foundryup -n tempo 2>&1 | grep -E "^foundryup: use" || true
  echo ""

  deploy_batch TEMPO_CHAINS "--tempo.fee-token $TEMPO_FEE_TOKEN"

  echo "Restoring standard foundry..."
  foundryup 2>&1 | grep -E "^foundryup: use" || true
  echo ""
fi

# --- Write summary ---
SUMMARY_FILE="$LOG_DIR/summary.md"
cat > "$SUMMARY_FILE" <<EOF
# Deployment Summary

**Date:** $TIMESTAMP (UTC)

| Chain | Status | Address |
|-------|--------|---------|
$(echo "$SUMMARY" | while IFS='|' read -r chain status addr; do
  echo "| $chain | $status | \`$addr\` |"
done)

## Logs

$(for entry in "${ALL_ENTRIES[@]}"; do
  IFS='|' read -r name logfile <<< "$entry"
  safe_name=$(basename "$logfile")
  echo "- [$name]($safe_name)"
done)
EOF

echo "Summary written to $SUMMARY_FILE"
echo ""

# --- Collect full broadcast data from forge artifacts ---
DEPLOYS_FILE="$LOG_DIR/deployments.json"
echo "{" > "$DEPLOYS_FILE"
FIRST=true

for entry in "${SUCCESSFUL_CHAINS[@]}"; do
  IFS='|' read -r name chain_id <<< "$entry"

  BROADCAST_FILE="broadcast/Deploy.s.sol/$chain_id/run-latest.json"

  if [[ ! -f "$BROADCAST_FILE" ]]; then
    echo "  Warning: no broadcast file for $name (chain $chain_id)"
    continue
  fi

  if [[ "$FIRST" == true ]]; then
    FIRST=false
  else
    echo "," >> "$DEPLOYS_FILE"
  fi

  printf '  "%s": ' "$name" >> "$DEPLOYS_FILE"
  cat "$BROADCAST_FILE" >> "$DEPLOYS_FILE"
done

echo "" >> "$DEPLOYS_FILE"
echo "}" >> "$DEPLOYS_FILE"

echo "Full deployment data written to $DEPLOYS_FILE"
echo ""

if [[ $FAILED -eq 0 ]]; then
  echo "=== All deployments succeeded ==="
else
  echo "=== Some deployments failed ==="
  exit 1
fi
