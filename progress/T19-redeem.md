# T19 积分兑换徽章

## 状态
完成

## 做了什么
- 新合约 `contracts/src/RedeemVault.sol`：
  - ERC721 徽章，name `Contribution Badge`，symbol `CBADGE`。
  - 构造接收 `ContributionRegistry` 地址，immutable 存储。
  - `availableScore(contributor) = registry.getContributorScore(contributor) - usedScore[contributor]`。
  - `redeemBadge(uint256 scoreCost)`：要求 `msg.sender` 持有至少 1 个声誉 NFT（`registry.balanceOf > 0`）且可用积分 ≥ `scoreCost`；扣减 `usedScore`，铸造徽章 NFT。
  - 积分在 registry 里不可减少；vault 用 `usedScore` 记账已兑换部分。
  - 仅 `msg.sender` 能为自己兑换。
- 测试 `contracts/test/RedeemVault.t.sol`：5 个用例（兑换成功、连续兑换累计、积分不足 revert、无 NFT revert、零成本 revert）。
- 部署脚本 `Deploy.s.sol` 同时部署 `ContributionRegistry` 和 `RedeemVault`，输出两个地址。
- 前端 `web/src/ledger.ts` 新增 `redeemAddressFor(choice)`（读 `VITE_REDEEM_ADDRESS` / `VITE_ANVIL_REDEEM_ADDRESS`）、`readRedeemStatus`、`redeemBadge`。
- 前端 `web/src/App.tsx` 新增 `RedeemPanel`：显示可用积分/已兑换/徽章数，按钮用 35 积分兑换 1 个徽章，兑换后刷新看板。
- `web/src/vite-env.d.ts` 加 `VITE_REDEEM_ADDRESS` 和 `VITE_ANVIL_REDEEM_ADDRESS` 可选字段。
- Anvil 部署：ContributionRegistry `0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0`，RedeemVault `0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9`。`.env` 的 `VITE_ANVIL_CONTRACT_ADDRESS` 和 `VITE_ANVIL_REDEEM_ADDRESS` 已更新。

## 验证
- `forge test --match-contract 'RedeemVaultTest|ContributionStorageTest|SubmitContributionTest|ReputationNftTest' --network monad` → 12 通过。
- `cd server && npm test` → 5 通过。`npx tsc --noEmit` 通过。
- `cd web && npm test` → 12 通过。`npx tsc --noEmit` 通过。
- Anvil 端到端（`scripts/e2e-anvil.mjs`）：维护者签名 → contributor 提交 PR#777（35 分）→ score 70 → 兑换 35 积分 → available 35、badges 1。逻辑正确。

## 不在范围
- 测试网部署 `RedeemVault`：未做。需要用户确认后再花 maintainer 的 MON。`VITE_REDEEM_ADDRESS` 未设置，测试网前端兑换面板会显示"没有配置兑换合约地址"。
- 不修改 `ContributionRegistry` 合约逻辑（只读）。
- 不做可交易代币（ERC20）。
- 不做积分过期、分级。

## 下一步
- 用户确认后在测试网部署 `RedeemVault`，写入 `VITE_REDEEM_ADDRESS`。
- T17 模拟投票按钮。
