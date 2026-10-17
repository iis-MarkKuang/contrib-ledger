---
name: deploy-registry
description: >-
  Deploys this repo's ContributionRegistry to local Anvil and Monad testnet
  with Forge after a contract change, then writes each address into the
  matching env var. Use when the user updates the contract, asks to deploy
  Anvil or Monad testnet, or mentions VITE_CONTRACT_ADDRESS,
  VITE_ANVIL_CONTRACT_ADDRESS, CONTRACT_ADDRESS, or forge script Deploy.s.sol.
---

# Deploy ContributionRegistry

This repo deploys with `contracts/script/Deploy.s.sol`. Do not use the upstream `wallet/` skill, Alchemy, CreateX, or Para for this deploy. Do not install or log in to those CLIs.

Deploy Anvil first, then Monad testnet. Ask before the testnet broadcast. It spends the maintainer's testnet MON.

## Before either broadcast

1. Read `gas/SKILL.md` and `docs/monad-testnet.md`. If they disagree on a number you would pass to Forge, stop and tell the user. Do not pick one.
2. Do not pass Anvil's estimated base fee, and do not pass Notion's 50 gwei. Both current gas sources say the minimum base fee is 100 MON-gwei. Their block gas limits disagree, so do not put a block gas limit in the command.
3. Forge loads `.env` only from `contracts/`. The project file is the repo-root `.env`. From `contracts/`, run `set -a && source ../.env && set +a`.
4. The script reads `MAINTAINER_ADDRESS` into the constructor. The key on the command line is only the deployer and is not written into the contract.
5. Do not print private keys, webhook secrets, or path-keyed RPC URLs. Do not commit `.env`.

## Anvil

Start `anvil --network monad` if `127.0.0.1:8545` is down. Do not use `anvil --monad`.

Deployer is Anvil account 0. Its key is `ANVIL_KEY_0` in `server/src/sign.test.ts`. Pass that shell variable to Forge. Do not copy the key into `.env`, the skill, or the chat. The maintainer key has no Anvil balance, so do not use it as the deployer. `MAINTAINER_ADDRESS` still comes from `.env`.

```bash
cd contracts
set -a && source ../.env && set +a
forge script script/Deploy.s.sol \
  --rpc-url local \
  --private-key "$ANVIL_KEY_0" \
  --broadcast \
  --network monad
```

`foundry.toml` names `local` as `http://127.0.0.1:8545`.

Take the address from the `ContributionRegistry` log. A fresh Anvil and nonce 0 produce `0x5FbDB2315678afecb367f032d93F642f64180aa3`. A later nonce produces a different address. Write the logged address only to `VITE_ANVIL_CONTRACT_ADDRESS`.

Confirm code:

```bash
cast code <logged address> --rpc-url http://127.0.0.1:8545
```

`0x` is not deployed. `0xef0100` plus 20 bytes is an EIP-7702 delegation, not this registry.

## Monad testnet

Chain id is `10143`. RPC endpoint name in `foundry.toml` is `monad_testnet` (`https://testnet-rpc.monad.xyz`). Check the deployer balance first. The deployer is the account for `MAINTAINER_PRIVATE_KEY`, which matches `MAINTAINER_ADDRESS`. Never use `ANVIL_KEY_0` on testnet.

```bash
cast balance "$MAINTAINER_ADDRESS" --rpc-url https://testnet-rpc.monad.xyz --ether
```

Simulate first, without `--broadcast`. Stop if the balance is below "Estimated amount required". A non-zero balance can still be too small: this deploy simulated at about 0.90 MON with a 100 gwei base fee. Do not invent a faucet call.

```bash
cd contracts
set -a && source ../.env && set +a
forge script script/Deploy.s.sol \
  --rpc-url monad_testnet \
  --private-key "$MAINTAINER_PRIVATE_KEY" \
  --network monad
```

Add `--broadcast` only after the estimate fits the balance. The simulated address is not deployed until that broadcast succeeds.

Write the logged address to both `CONTRACT_ADDRESS` and `VITE_CONTRACT_ADDRESS`. Leave `VITE_ANVIL_CONTRACT_ADDRESS`, `CHAIN_ID` (`10143`), and `RPC_URL` unchanged. `CHAIN_ID` is the EIP-712 domain. Anvil tests set `31337` themselves.

Confirm code on `https://testnet-rpc.monad.xyz`. Same rejection rule as Anvil: empty code and EIP-7702 delegation do not count.

Restart Vite after any `VITE_*` change. Restart the server after `CONTRACT_ADDRESS` changes. Do not run `forge verify`. The verifier URL is not confirmed; stop and ask before verifying.
