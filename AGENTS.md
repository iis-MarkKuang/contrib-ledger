# Agent harness

每个任务开始时读本文件。细节在 `docs/`，不要把本文件写长。

产品需求：`requirements/开源贡献激励-Monad测试网Demo需求文档.md`（v2.0）。这是 Monad 测试网上的开源贡献认证 demo：链下估值、EIP-712 验签、贡献者自己提交、并发演示。DAO、预言机、多签、可交易代币不在本次范围。

## 三条硬规则

1. 不要假设。链参数、地址、gas、接口、命令，以仓库里的代码、刚跑过的命令，或下面文档里的出处为准。出处互相矛盾时停下来，指出冲突，不要挑一个写进代码。
2. 需求、本文档和链接文档都没定的选择，先问用户。不要自行换成另一套钱包、框架或链上机制。
3. 碰到 Monad 开发问题，先读本地 skill `.cursor/skills/monskill/SKILL.md`，再只读它点名的那一个 topic skill。不要靠记忆回答。

## 文档

做需求前先读 [SOLUTION.md](SOLUTION.md)，再按 [ROADMAP.md](ROADMAP.md) 只做一张 ticket。流程见 [docs/workflow.md](docs/workflow.md)。

| 何时读 | 文件 |
| --- | --- |
| 怎么验证、何时提问 | [docs/agent-principles.md](docs/agent-principles.md) |
| 方案、票、路线图怎么写 | [docs/workflow.md](docs/workflow.md) |
| 语言、框架、什么时候用 Rust | [docs/stack.md](docs/stack.md) |
| 为什么不 fork Monad | [docs/monad-fork.md](docs/monad-fork.md) |
| 测试网 RPC、gas、验证、地址政策 | [docs/monad-testnet.md](docs/monad-testnet.md) |
| 跨链（本次 demo 不用） | [docs/monad-crosschain.md](docs/monad-crosschain.md) |
| 索引器、预言机、钱包、API | [docs/monad-tooling.md](docs/monad-tooling.md) |
| 共识、异步执行、并行执行 | [docs/monad-internals.md](docs/monad-internals.md) |
| skills 路由与 MCP 现状 | [docs/monad-skills.md](docs/monad-skills.md) |

原始链接清单：`RESOURCES.md`。那是入口，不是可以直接抄进代码的事实表。
