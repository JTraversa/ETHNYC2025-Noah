#!/bin/bash
# Deploy Noah to all configured chains
# Usage: ./scripts/deploy-all.sh [--no-verify]

set -e

# Ensure foundry is on PATH
export PATH="$PATH:$HOME/.foundry/bin"

# Load .env
source .env

# Chain configs: name|rpc_url
CHAINS=(
  "Sepolia|$SEPOLIA_RPC_URL"
  "Arbitrum Sepolia|$ARBITRUM_SEPOLIA_RPC_URL"
)

VERIFY_FLAG="--verify"
if [[ "$1" == "--no-verify" ]]; then
  VERIFY_FLAG=""
fi

# Create logs directory with timestamped subfolder
TIMESTAMP=$(date -u +"%Y-%m-%d_%H-%M-%S")
LOG_DIR="deployments/$TIMESTAMP"
mkdir -p "$LOG_DIR"

echo "=== Noah Multi-Chain Deployment ==="
echo "Logs: $LOG_DIR/"
echo ""

PIDS=()
ENTRIES=()

for chain in "${CHAINS[@]}"; do
  IFS='|' read -r name rpc <<< "$chain"

  if [[ -z "$rpc" ]]; then
    echo "[$name] Skipping — no RPC URL configured"
    continue
  fi

  # Sanitize name for filename
  safe_name=$(echo "$name" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
  logfile="$LOG_DIR/$safe_name.log"
  ENTRIES+=("$name|$logfile")

  echo "[$name] Starting deployment..."
  forge script scripts/Deploy.s.sol:Deploy \
    --rpc-url "$rpc" \
    --broadcast \
    $VERIFY_FLAG \
    > "$logfile" 2>&1 &
  PIDS+=($!)
done

echo ""
echo "Waiting for all deployments to complete..."
echo ""

FAILED=0
SUMMARY=""

for i in "${!PIDS[@]}"; do
  IFS='|' read -r name logfile <<< "${ENTRIES[$i]}"
  if wait "${PIDS[$i]}"; then
    STATUS="SUCCESS"
    echo "[$name] Deployed successfully"
  else
    STATUS="FAILED"
    echo "[$name] FAILED"
    FAILED=1
  fi

  # Extract deployed address from log
  ADDRESS=$(grep -oP 'Noah deployed at: \K0x[a-fA-F0-9]+' "$logfile" 2>/dev/null || echo "unknown")

  SUMMARY+="$name | $STATUS | $ADDRESS"$'\n'

  echo "--- $name output ---"
  cat "$logfile"
  echo "---"
  echo ""
done

# Write summary file
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

$(for entry in "${ENTRIES[@]}"; do
  IFS='|' read -r name logfile <<< "$entry"
  safe_name=$(basename "$logfile")
  echo "- [$name]($safe_name)"
done)
EOF

echo "Summary written to $SUMMARY_FILE"
echo ""

if [[ $FAILED -eq 0 ]]; then
  echo "=== All deployments succeeded ==="
else
  echo "=== Some deployments failed ==="
  exit 1
fi
