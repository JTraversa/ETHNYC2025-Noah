#!/bin/bash
# Generate backend chains.json from deploy-all.sh's deployments.json output
# Usage: ./scripts/generate-chains-json.sh <deployments-dir>
#   e.g. ./scripts/generate-chains-json.sh deployments/2026-03-20_14-30-00
#
# Reads broadcast artifacts to extract deploy block numbers,
# outputs a chains.json ready for the NoahBackend indexer.

set -euo pipefail

if [[ -z "${1:-}" ]]; then
  # Find most recent deployment directory
  DEPLOY_DIR=$(ls -dt deployments/*/ 2>/dev/null | head -1)
  if [[ -z "$DEPLOY_DIR" ]]; then
    echo "Usage: $0 <deployments-dir>"
    echo "No deployment directories found."
    exit 1
  fi
  echo "Using most recent deployment: $DEPLOY_DIR"
else
  DEPLOY_DIR="$1"
fi

DEPLOYS_FILE="$DEPLOY_DIR/deployments.json"
if [[ ! -f "$DEPLOYS_FILE" ]]; then
  echo "Error: $DEPLOYS_FILE not found"
  exit 1
fi

NOAH_ADDRESS="0xD8C7F7F25EaDE1d8ad317F33aA697af357899261"

# Chain metadata: name|chain_id|rpc_url
CHAIN_META=(
  "Ethereum|1|https://eth.llamarpc.com"
  "Arbitrum|42161|https://arb1.arbitrum.io/rpc"
  "Base|8453|https://mainnet.base.org"
  "Optimism|10|https://mainnet.optimism.io"
  "Linea|59144|https://rpc.linea.build"
  "Scroll|534352|https://rpc.scroll.io"
  "Polygon|137|https://polygon.publicnode.com"
  "BSC|56|https://bsc-dataseed.binance.org"
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
)

OUTPUT_FILE="$DEPLOY_DIR/chains.json"

# Start building JSON
echo '{' > "$OUTPUT_FILE"
echo '  "default_poll_interval_secs": 12,' >> "$OUTPUT_FILE"
echo '  "chains": [' >> "$OUTPUT_FILE"

FIRST=true
FOUND=0
SKIPPED=0

for meta in "${CHAIN_META[@]}"; do
  IFS='|' read -r name chain_id rpc_url <<< "$meta"

  # Extract block number from the broadcast artifact for this chain
  BROADCAST_FILE="broadcast/Deploy.s.sol/$chain_id/run-latest.json"

  if [[ ! -f "$BROADCAST_FILE" ]]; then
    echo "  Skipping $name (chain $chain_id) — no broadcast artifact"
    SKIPPED=$((SKIPPED+1))
    continue
  fi

  # Get blockNumber hex from first receipt, convert to decimal
  BLOCK_HEX=$(grep -o '"blockNumber"[[:space:]]*:[[:space:]]*"0x[a-fA-F0-9]*"' "$BROADCAST_FILE" | grep -o '0x[a-fA-F0-9]*' | awk 'NR==1')
  if [[ -z "$BLOCK_HEX" ]]; then
    echo "  Skipping $name — no blockNumber in broadcast"
    SKIPPED=$((SKIPPED+1))
    continue
  fi
  START_BLOCK=$(printf "%d" "$BLOCK_HEX")

  if [[ "$FIRST" == true ]]; then
    FIRST=false
  else
    echo "," >> "$OUTPUT_FILE"
  fi

  # Write chain entry
  printf '    {\n' >> "$OUTPUT_FILE"
  printf '      "name": "%s",\n' "$name" >> "$OUTPUT_FILE"
  printf '      "chain_id": %d,\n' "$chain_id" >> "$OUTPUT_FILE"
  printf '      "rpc_url": "%s",\n' "$rpc_url" >> "$OUTPUT_FILE"
  printf '      "noah_address": "%s",\n' "$NOAH_ADDRESS" >> "$OUTPUT_FILE"
  printf '      "start_block": %d,\n' "$START_BLOCK" >> "$OUTPUT_FILE"
  printf '      "enabled": true\n' >> "$OUTPUT_FILE"
  printf '    }' >> "$OUTPUT_FILE"

  FOUND=$((FOUND+1))
  echo "  $name (chain $chain_id) — start block $START_BLOCK"
done

echo "" >> "$OUTPUT_FILE"
echo '  ]' >> "$OUTPUT_FILE"
echo '}' >> "$OUTPUT_FILE"

echo ""
echo "=== Generated $OUTPUT_FILE ==="
echo "  Chains included: $FOUND"
echo "  Chains skipped:  $SKIPPED"
echo ""
echo "To use: copy to NoahBackend/chains.json"
echo "  cp $OUTPUT_FILE ../NoahBackend/chains.json"
