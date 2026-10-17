# Skills and MCP

## 已安装的 skills

来源：`therealharpaljadeja/monskills`，zip 快照 commit `a37083fa5c49cd3a04a6935be381e9d49e2261ed`（包内日期 2026-10-12）。

`npx skills add` 通过 git clone 失败（连不上 `github.com:443`）。skills 是从 GitHub zip 解压到 `.cursor/skills/` 的，不是 CLI 的 symlink 安装。更新时重新取 zip 或在网络可用时重跑：

```bash
npx skills add therealharpaljadeja/monskills -a cursor -y
```

入口是 `.cursor/skills/monskill/SKILL.md`。它的路由表：

| 任务 | Skill |
| --- | --- |
| 从零搭应用 | `scaffold` |
| 为什么用 Monad | `why-monad` |
| 异步执行、并行、reserve balance、EIP-7702、实时数据 | `concepts` |
| 合约地址 | `addresses` |
| 本仓库合约更新后部署 Anvil 和测试网 | `deploy-registry`（仓库自己的，不是上游 monskills） |
| 代理钱包、CREATE2 部署 | `wallet` |
| 前端钱包（Para） | `wallet-integration` |
| Gas | `gas` |
| 某个设施是否支持 Monad | `tooling-and-infra` |
| 历史事件索引 | `indexer` |

只读任务需要的那一个。中文稿是同目录的 `SKILL.zh.md`，有的 skill 没有中文稿。

上游 hooks（`hooks/hooks.json`）是 Claude Code 插件的 PreToolUse，用来拦住未登录就跑 Alchemy / Para / Envio。本仓库没有把它们装进 Cursor hooks。规则仍然有效：不要替用户安装这些 CLI，也不要替用户登录。

## MCP

没有接入任何 MCP。

- 官方 [Monad MCP 指南](https://docs.monad.xyz/guides/monad-mcp) 是教你自己建一个查余额的 stdio 服务（`monad-developers/monad-mcp-tutorial`），不是现成的远程服务。
- `https://app.monad.com/mcp` 是另一家数据管道产品，不是这条 L1。
- 公开搜到的托管链上 MCP 是第三方服务。在用户点名之前不要写入 `.cursor/mcp.json`。

要查余额、回执、代码，用项目里的 `cast` 或一个带 chain id `10143` 的 RPC 调用，并引用 [monad-testnet.md](monad-testnet.md) 里的端点。
