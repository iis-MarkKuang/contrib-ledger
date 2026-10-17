# T18 多人评分

## 目标
估值从维护者一人定分，改成社区多人评分，聚合后维护者签名上链。合约零改动。

## 范围
- 后端：
  - webhook 收到 PR merged → 创建评分任务（不立即签名），存到 `voting` 列表。
  - `POST /vote` { repo, prOrIssueId, score, signature } — 评分者用 MetaMask 对 `keccak256(repo, prOrIssueId, score)` 做个人签名（EIP-191 `personal_sign`），后端 `ecrecover` 出地址作为身份。同一地址对同一 PR 只评一次。score 范围 1-100。
  - `GET /votes/:repo/:prOrIssueId` — 返回该 PR 的所有评分、评分者地址、是否已达阈值。
  - `GET /voting` — 返回所有待评分任务（已 merged 未达阈值）。
  - 达到阈值（3 人）后，后端取平均分（向下取整），维护者按现有 EIP-712 流程签名，载荷进入 pending 列表，任务从 `voting` 移除。
  - 保留 `/pending/seed` 3 条单条演示记录（不经过投票，直接签名）。
- 前端：
  - 新增「评分」面板：列出待评分 PR，评分者连接 MetaMask 后输入分数（1-100）并签名提交。
  - 显示每个 PR 的当前投票数、各评分者地址和分数、距阈值还差几人。
  - 达到阈值后 PR 自动出现在 pending 列表。
- 合约：零改动。上链的仍是单个维护者 EIP-712 签名载荷。

## 不在范围
- 链上投票合约（需求 ⛔ DAO）。
- 评分者资格准入（演示阶段任何人可评）。
- 超时自动通过（演示不设，避免水 PR）。
- 评分者代币激励。

## 依赖
- T14（已部署 registry）。

## 验证
- `cd server && npm test` 通过（新增 vote 测试）。
- `cd web && npm test` 通过。`npx tsc --noEmit` 通过。
- `cd server && npx tsc --noEmit` 通过。
- 端到端：webhook 收到真实 PR → 3 个不同 MetaMask 账户评分 → 达阈值 → pending 出现载荷 → 贡献者提交上链。
