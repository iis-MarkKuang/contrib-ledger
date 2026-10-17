# Fork Monad

决定：本次 demo **不 fork**。不克隆 Monad 节点，不用 `contract.dev` Stagenet，也不把 `anvil --fork-url` 当作默认开发链。

## 三个「fork」不是一回事

| 说法 | 是什么 | 本次 |
| --- | --- | --- |
| Fork Monad 客户端 | 改 L1 实现。`github.com/monad-developers` 是生态仓库，不是要改的节点源码 | 不做。demo 是链上的应用合约 |
| `contract.dev` | 托管控制台：监控、告警，以及可 pin 到活链状态的 Stagenet。CLI 是 `@contract-dev/cli`，链名可用 `monad`。文档：https://docs.contract.dev/cli | 不接入。要 `contract-dev login`。验收要求的是公开测试网上的合约地址，私有 Stagenet 替代不了 |
| `anvil --fork-url` | 本地拉一份测试网状态 | 只在某张票必须读已有合约代码时才开。当前合约是新部署的，不依赖 Uniswap / WMON |

本地默认是空链加 Monad 执行规则：`anvil --network monad`。演示部署目标仍是 Monad 测试网。

官方 Foundry 已包含 Monad 执行环境。不要去 fork 或改用已废弃的 `monad-developers/foundry-monad` 旧工具链。见 [stack.md](stack.md)。

若要改这个决定（接 contract.dev、fork 测试网状态、或改节点），先停下来报备。
