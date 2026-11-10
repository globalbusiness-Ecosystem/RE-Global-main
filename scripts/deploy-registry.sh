#!/usr/bin/env bash
# Builds the ownership registry (smart contract), deploys it on Pi Testnet and makes the platform anchoring
# account its admin. Run it from your own computer: bash scripts/deploy-registry.sh [identity-name]
# No secret is typed or printed here: the stellar CLI reads the key from your saved identity (stellar keys).
set -euo pipefail

IDENTITY="${1:-platform-anchor}"
RPC="https://rpc.testnet.minepi.com"
PASSPHRASE="Pi Testnet"

command -v stellar >/dev/null 2>&1 || { echo "stellar CLI is not installed on this computer"; exit 1; }
ADMIN="$(stellar keys address "$IDENTITY")"
echo "Admin account (public address): $ADMIN"

cd "$(dirname "$0")/../contracts/ownership-registry"
stellar contract build
WASM="$(ls target/wasm32*/release/re_ownership_registry.wasm 2>/dev/null | head -1 || true)"
[ -n "$WASM" ] || { echo "The built .wasm file was not found"; exit 1; }

CONTRACT_ID="$(stellar contract deploy --wasm "$WASM" --source "$IDENTITY" --rpc-url "$RPC" --network-passphrase "$PASSPHRASE")"
echo "Contract ID: $CONTRACT_ID"

stellar contract invoke --id "$CONTRACT_ID" --source "$IDENTITY" --rpc-url "$RPC" --network-passphrase "$PASSPHRASE" -- init --admin "$ADMIN"

GOT="$(stellar contract invoke --id "$CONTRACT_ID" --source "$IDENTITY" --rpc-url "$RPC" --network-passphrase "$PASSPHRASE" -- admin | tr -d '"[:space:]')"
if [ "$GOT" != "$ADMIN" ]; then echo "The registry admin ($GOT) is not the expected account ($ADMIN). Do not use this contract."; exit 1; fi

echo
echo "DONE. The registry admin is $ADMIN."
echo "Now add this to Vercel (Environment Variables, Production) and redeploy:"
echo "REGISTRY_CONTRACT_ID=$CONTRACT_ID"
