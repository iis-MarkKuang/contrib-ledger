---
name: e2e-demo
description: >-
  Runs the full Contrib Ledger demo end-to-end on Monad testnet: starts backend
  and Vite, opens a cloudflared quick tunnel, configures the GitHub webhook on
  iis-MarkKuang/contrib-ledger-demo, creates and merges a real PR, casts 3 votes
  with random wallets, submits the finalized payload onchain, and redeems a
  badge NFT. Use when the user asks to run the demo, test the full flow, verify
  e2e, or mentions cloudflared tunnel, webhook PR, multi-voter scoring, or
  badge redemption.
---

# End-to-end demo

This skill runs the complete demo flow on Monad testnet. It does not deploy contracts — use `deploy-registry/` first if contracts changed.

## Prereqs

- `.env` has `MAINTAINER_PRIVATE_KEY`, `MAINTAINER_ADDRESS`, `GITHUB_WEBHOOK_SECRET`, `DEMO_CONTRIBUTOR_ADDRESS`, `CONTRACT_ADDRESS`, `VITE_CONTRACT_ADDRESS`, `VITE_REDEEM_ADDRESS` all set.
- `CONTRACT_ADDRESS` and `VITE_CONTRACT_ADDRESS` point to the deployed `ContributionRegistry` on testnet. `VITE_REDEEM_ADDRESS` points to the deployed `RedeemVault`.
- `gh` CLI is authenticated (`gh auth status` shows `iis-MarkKuang`).
- `cloudflared` is installed (`which cloudflared`).
- Anvil is NOT required for this flow — it runs on testnet.

## Steps

### 1. Start backend

```bash
cd server
env -u CHAIN_ID -u CONTRACT_ADDRESS -u VITE_CONTRACT_ADDRESS -u VITE_ANVIL_CONTRACT_ADDRESS -u VITE_ANVIL_REDEEM_ADDRESS -u VITE_REDEEM_ADDRESS \
  node --env-file=../.env --import tsx src/index.ts
```

The `env -u` clears shell vars that would override `.env` (see `pitfalls.md`). Backend listens on `127.0.0.1:8787`.

### 2. Start Vite

```bash
cd web
env -u VITE_CONTRACT_ADDRESS -u VITE_ANVIL_CONTRACT_ADDRESS -u VITE_ANVIL_REDEEM_ADDRESS -u VITE_REDEEM_ADDRESS \
  npm run dev -- --host 127.0.0.1 --port 5173
```

### 3. Start cloudflared quick tunnel

```bash
cloudflared tunnel --url http://127.0.0.1:8787
```

Wait for the `https://<random>.trycloudflare.com` URL in the output. It is free, no account, no domain. DNS takes ~15s to propagate — retry `/health` until it returns 200.

### 4. Point the GitHub webhook at the tunnel

The repo `iis-MarkKuang/contrib-ledger-demo` already has a webhook (id from `gh api repos/iis-MarkKuang/contrib-ledger-demo/hooks`). PATCH its URL to the tunnel:

```bash
set -a && source .env && set +a
gh api -X PATCH repos/iis-MarkKuang/contrib-ledger-demo/hooks/<id> \
  -f 'config[url]=https://<tunnel>.trycloudflare.com/webhook' \
  -f 'config[content_type]=json' \
  -f "config[secret]=$GITHUB_WEBHOOK_SECRET" \
  -f 'events[]=pull_request' -f 'events[]=issues' \
  -F active=true
```

Quote the `config[...]` keys — zsh treats unquoted brackets as globs.

Ping it and confirm `status_code: 200`:

```bash
gh api -X POST repos/iis-MarkKuang/contrib-ledger-demo/hooks/<id>/pings
gh api repos/iis-MarkKuang/contrib-ledger-demo/hooks/<id>/deliveries --jq '.[0] | {event, status_code}'
```

### 5. Create and merge a real PR

```bash
cd /tmp && rm -rf contrib-ledger-demo && gh repo clone iis-MarkKuang/contrib-ledger-demo && cd contrib-ledger-demo
git config user.name "iis-MarkKuang" && git config user.email "iis-MarkKuang@users.noreply.github.com"
git checkout -b demo/<branch>
# make a small change, commit, push
gh pr create --title "<title>" --body "Demo PR for Contrib Ledger." --base main --head demo/<branch>
gh pr merge <number> --merge --admin
```

Wait ~4s for the webhook delivery, then confirm a voting task exists:

```bash
curl -s http://127.0.0.1:8787/voting | python3 -m json.tool
```

### 6. Cast 3 votes with random wallets

Voting only needs a signature (EIP-191 `personal_sign` over `repo:prOrIssueId:score`), no gas. Use a node script with `ethers.Wallet.createRandom()`. See `scripts/vote-e2e.mjs` for the template. Run it from `server/` so `ethers` resolves:

```bash
cp ../scripts/vote-e2e.mjs server/vote-e2e.mjs
cd server && node vote-e2e.mjs
```

After 3 votes the backend finalizes: averages scores, signs with the maintainer key, moves the payload to `/pending`. Confirm:

```bash
curl -s http://127.0.0.1:8787/pending | python3 -m json.tool
```

### 7. Submit onchain + redeem (browser)

Open `http://127.0.0.1:5173`, switch to **Monad 测试网**, connect MetaMask:

1. Pending list shows the real PR payload. Click 「提交这条」.
2. Dashboard shows the contribution row + score.
3. 「积分兑换」panel: click 「用 35 积分兑换徽章」.
4. 「社区投票通过（演示）」button at the dashboard bottom is a no-tx mock.

## Teardown

- Stop cloudflared (the tunnel URL dies with the process).
- The webhook still points at the dead URL until you re-point it or restart the tunnel.
- Backend and Vite stay running across demo iterations; only the tunnel URL changes.

## Common failures

- **webhook 401**: `GITHUB_WEBHOOK_SECRET` in `.env` does not match the webhook's configured secret. Re-PATCH with the correct secret.
- **tunnel 1033**: DNS not propagated yet. Wait 15s, retry `/health`.
- **vote 404 "no voting task"**: webhook didn't fire or backend restarted (in-memory state lost). Re-merge a PR or re-deliver the webhook delivery via `gh api -X POST repos/.../hooks/<id>/deliveries/<delivery_id>/actions/redeliver`.
- **submit reverts with `DuplicateContribution`**: that `(repo, prOrIssueId)` was already recorded onchain. Use a new PR.
- **MetaMask -32002**: a previous wallet request is still pending. Close the MetaMask popup before retrying.
