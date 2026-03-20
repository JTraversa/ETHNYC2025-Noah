#!/bin/bash
# Verify the deterministic CREATE2 deployer exists on all target chains
# Factory: 0x4e59b44847b379578588920ca78fbf26c0b4956c (Arachnid's CREATE2 deployer)
# Usage: ./scripts/check-create2.sh

set -euo pipefail
export PATH="$PATH:$HOME/.foundry/bin"

CREATE2_FACTORY="0x4e59b44847b379578588920ca78fbf26c0b4956c"

echo "=== CREATE2 Factory Check ==="
echo "Factory: $CREATE2_FACTORY"
echo ""

# Chain configs: name|rpc_url|chain_id
CHAINS=(
  "Ethereum|https://eth.llamarpc.com|1"
  "Arbitrum|https://arb1.arbitrum.io/rpc|42161"
  "Base|https://mainnet.base.org|8453"
  "Optimism|https://mainnet.optimism.io|10"
  "Linea|https://rpc.linea.build|59144"
  "Scroll|https://rpc.scroll.io|534352"
  "Polygon|https://polygon.publicnode.com|137"
  "BSC|https://bsc-dataseed.binance.org|56"
  "Avalanche|https://api.avax.network/ext/bc/C/rpc|43114"
  "Sonic|https://rpc.soniclabs.com|146"
  "Berachain|https://rpc.berachain.com|80094"
  "Mantle|https://rpc.mantle.xyz|5000"
  "Flare|https://flare-api.flare.network/ext/C/rpc|14"
  "Flow|https://mainnet.evm.nodes.onflow.org|747"
  "Monad|https://rpc.monad.xyz|143"
  "MegaETH|https://mainnet.megaeth.com/rpc|4326"
  "Stable|https://api-stable-mainnet.n.dwellir.com|988"
  "Cronos|https://evm.cronos.org|25"
  "Gnosis|https://rpc.gnosischain.com|100"
  "Celo|https://forno.celo.org|42220"
  "Sei|https://evm-rpc.sei-apis.com|1329"
  "Tempo|https://rpc.presto.tempo.xyz|4217"
)

RESULTS_DIR=$(mktemp -d)
trap "rm -rf $RESULTS_DIR" EXIT

for i in "${!CHAINS[@]}"; do
  IFS='|' read -r name rpc chain_id <<< "${CHAINS[$i]}"
  (
    code=$(cast code "$CREATE2_FACTORY" --rpc-url "$rpc" 2>/dev/null || echo "ERROR")
    if [[ "$code" == "ERROR" ]]; then
      echo "RPC_FAIL" > "$RESULTS_DIR/$i"
    elif [[ "$code" == "0x" || -z "$code" ]]; then
      echo "MISSING" > "$RESULTS_DIR/$i"
    else
      echo "OK" > "$RESULTS_DIR/$i"
    fi
  ) &
done
wait

printf "%-14s %-8s %s\n" "CHAIN" "ID" "STATUS"
printf "%-14s %-8s %s\n" "--------------" "--------" "----------"

OK=0
MISSING=0
ERRORS=0

for i in "${!CHAINS[@]}"; do
  IFS='|' read -r name rpc chain_id <<< "${CHAINS[$i]}"
  status=$(cat "$RESULTS_DIR/$i" 2>/dev/null || echo "RPC_FAIL")

  case "$status" in
    OK)       printf "%-14s %-8s OK\n" "$name" "$chain_id"; ((OK++)) ;;
    MISSING)  printf "%-14s %-8s MISSING — CREATE2 deploy will fail\n" "$name" "$chain_id"; ((MISSING++)) ;;
    RPC_FAIL) printf "%-14s %-8s RPC ERROR\n" "$name" "$chain_id"; ((ERRORS++)) ;;
  esac
done

echo ""
echo "=== Summary ==="
echo "  Factory exists: $OK / ${#CHAINS[@]}"
echo "  Missing:        $MISSING / ${#CHAINS[@]}"
echo "  RPC errors:     $ERRORS / ${#CHAINS[@]}"

if [[ $MISSING -gt 0 ]]; then
  echo ""
  echo "Chains missing the factory will need a different deployment strategy"
  echo "(e.g. regular CREATE, or deploy the factory first via the keyless tx)."
fi

if [[ $OK -eq ${#CHAINS[@]} ]]; then
  echo ""
  echo "All chains have the CREATE2 factory — ready for deterministic deployment!"
fi
