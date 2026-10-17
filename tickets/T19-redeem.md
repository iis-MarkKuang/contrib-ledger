# T19 积分兑换徽章

## 目标
让 PR 作者（积分持有者）能用积分兑换一个链上徽章 NFT，体现"积分有价值、能换东西"，但不引入可交易代币或真实代币经济。

## 范围
- 新合约 `RedeemVault`：
  - 读取 `ContributionRegistry` 的 `contributorScore(contributor)` 和 `balanceOf(contributor)`（声誉 NFT）。
  - `redeemBadge(uint256 scoreCost)`：要求调用者积分 ≥ `scoreCost` 且至少持有 1 个声誉 NFT；扣减积分（在 vault 侧记账已用积分，不修改 registry 的累加值），铸造一个 ERC721 徽章 `ContributionBadge`，symbol `CBADGE`。
  - 积分是 registry 的累加值，不可减少；vault 用 `usedScore(contributor)` 记录已兑换掉的积分，可用积分 = `contributorScore - usedScore`。
  - 仅 `msg.sender` 能为自己兑换，不可代他人兑换。
- 前端新增「兑换徽章」面板：
  - 显示当前账户的可用积分（`contributorScore - usedScore`）和已持徽章数。
  - 一个按钮：用 35 积分兑换 1 个徽章（与单条贡献分数对齐）。
  - 兑换后刷新看板。
- 部署脚本更新：`Deploy.s.sol` 同时部署 `RedeemVault`，地址写入 `VITE_REDEEM_ADDRESS` / `VITE_ANVIL_REDEEM_ADDRESS`。

## 不在范围
- 不做可交易代币（ERC20）。徽章 NFT 技术上可转让，但 demo 不强调交易。
- 不做链下兑换（法币、实物）。
- 不做积分过期、积分分级。
- 不修改 `ContributionRegistry` 合约逻辑（只读）。

## 依赖
- T14（已部署的 registry 地址）。

## 验证
- `forge test --match-contract RedeemVaultTest --network monad` 通过：兑换成功、积分不足 revert、无 NFT revert、重复兑换扣减正确。
- `cd server && npm test` 仍 5 通过。
- `cd web && npm test` 仍 12 通过。
- `cd web && npx tsc --noEmit` 通过。
- `cd server && npx tsc --noEmit` 通过。
- Anvil 端到端：提交一条贡献 → 兑换一个徽章 → 前端显示可用积分减少、徽章数增加。
