# T18 多人评分

## 状态
完成

## 做了什么
- **后端**：
  - `server/src/voting.ts`：评分任务和投票存储。阈值 3 人。`addVotingTask`、`listTasks`、`listVotes`、`addVote`、`hasVoted`、`isReady`、`averageScore`、`removeTask`。
  - `webhook.ts`：merged PR 不再直接签名，改为创建评分任务（`addVotingTask`）。新增 `finalizeVote(repo, prOrIssueId, kind, title, score)` 在达阈值后用平均分签名。
  - `app.ts` 新增端点：
    - `GET /voting` — 列出待评分任务
    - `GET /votes/:repo/:prOrIssueId` — 查询某 PR 的所有评分
    - `POST /vote` — 评分者提交评分（EIP-191 `personal_sign` 签 `repo:prOrIssueId:score`，后端 `verifyMessage` 恢复地址）。达阈值后自动 finalize。
  - `verifyVoteSignature`：用 ethers `verifyMessage` 恢复评分者地址。
- **前端**：
  - `web/src/vote.ts`：`fetchTasks`、`fetchVotes`、`submitVote`（MetaMask `personal_sign`）。
  - `App.tsx` 新增 `VotePanel`：列出待评分 PR，展开显示各评分者地址和分数，输入 1-100 分并签名提交。达阈值后刷新 pending。
  - `App.css` 加 `.vote-panel` / `.vote-list` / `.vote-scores` / `.vote-input` 样式。
- **合约**：零改动。上链的仍是单个维护者 EIP-712 签名载荷。
- `SOLUTION.md` 加「多人评分（链下）」章节，含 mermaid 流程图。

## 验证
- `forge test` 12 通过（合约未改）。
- `cd server && npm test` 5 通过（webhook 测试更新为断言 voting 列表）。`npx tsc --noEmit` 通过。
- `cd web && npm test` 12 通过。`npx tsc --noEmit` 通过。
- 端到端（`scripts/vote-e2e.mjs`）：
  - PR #3 (Add CHANGELOG.md) webhook 触发 → voting task 创建（0/3）
  - 3 个随机钱包评分 80/60/75 → 平均 71 → 达阈值 → 维护者签名 → pending 出现 `iis-MarkKuang/contrib-ledger-demo#3` 分数 71
  - voting 任务清空，pending 1 条

## 设计要点
- 评分者用 MetaMask `personal_sign` 签名认证身份，同一地址对同一 PR 只评一次。
- 平均分向下取整作为 `valuationScore`。
- 合约不存评分、不存评分者——全部链下。上链验签逻辑不变。
- 演示时用户用 MetaMask 匿名模式多登录几个账户模拟多人。
- `/pending/seed` 3 条单条记录不经过投票，直接签名（用于快速单条演示）。
