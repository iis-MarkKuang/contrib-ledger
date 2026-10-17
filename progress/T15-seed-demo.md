# T15 预置演示数据（修订）

## 状态
完成

## 做了什么
- 后端 `POST /pending/seed`：用维护者密钥签名 3 条固定演示记录（demo/repo#7、demo/repo#8、demo/other#3），contributor 填 `DEMO_CONTRIBUTOR_ADDRESS`。
- **已删除** `POST /pending/batch` 端点、前端「生成 50 条」按钮、`generateBatch`、`parseBatchCount`（用户要求去掉伪造批量数据）。
- **真实 PR 流已打通**：
  - cloudflared quick tunnel 暴露后端 `https://glenn-journalists-organize-room.trycloudflare.com`（免费，无需域名）。
  - `iis-MarkKuang/contrib-ledger-demo` 仓库 webhook 已更新指向 tunnel `/webhook`，secret 与 `.env` 的 `GITHUB_WEBHOOK_SECRET` 一致。
  - 创建并合并了 2 个真实 PR：
    - [PR #1](https://github.com/iis-MarkKuang/contrib-ledger-demo/pull/1) Add Contributors section to README
    - [PR #2](https://github.com/iis-MarkKuang/contrib-ledger-demo/pull/2) Add MIT LICENSE file
  - webhook 收到 `pull_request` opened/closed 事件（status 200），后端自动生成签名载荷，pending 列表出现 2 条真实记录（repo `iis-MarkKuang/contrib-ledger-demo`，35 分）。

## 验证
- `cd server && npm test` 5 通过。`npx tsc --noEmit` 通过。
- `cd web && npm test` 12 通过。`npx tsc --noEmit` 通过。
- `curl /pending/batch` 返回 404（已删除）。
- `curl /pending` 返回 2 条真实 PR 载荷。
- webhook ping delivery status 200。

## 注意
- cloudflared quick tunnel URL 每次重启会变，webhook URL 需要同步更新。
- tunnel 进程在后台运行，关闭后 webhook 不可达。
