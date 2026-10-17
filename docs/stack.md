# Stack

需求文档允许 Hardhat 或 Foundry。当前默认是下面这套。动手建项目前如果要改，直接说。

| 层 | 默认 | 原因 |
| --- | --- | --- |
| 合约 | Solidity + Foundry ≥ 1.8 | 官方执行环境：`foundry.toml` 里 `network = "monad"`。见 [Foundry on Monad](https://docs.monad.xyz/tooling-and-infra/toolkits/foundry.md) |
| 链下服务与前端 | TypeScript | Webhook、EIP-712 签名、看板。包管理用 npm |
| 钱包 | MetaMask，用户自己签名提交 | 需求文档 v2.0。不要改成嵌入式钱包 |
| 本地链 | `anvil --network monad` | 空链，带 Monad 执行规则。不默认 fork 测试网，见 [monad-fork.md](monad-fork.md) |
| Rust | 本次 demo 不写 | 只有做 execution events / 节点侧工具时才用。入口：[Rust API](https://docs.monad.xyz/execution-events/rust-api.md)、[Rust example](https://docs.monad.xyz/execution-events/getting-started/rust.md) |

## Foundry 约束

- 安装官方发行版（`foundryup`），不要用已废弃的 `foundry.category.xyz` 或 `anvil --monad`。
- `forge --version` 必须 ≥ 1.8.0，否则没有 Monad 执行支持。
- 本地测试、脚本、模拟都走 Monad gas 和 opcode 定价，不要用默认的 Ethereum 执行环境对 gas 下结论。
- 合约体积上限 128 KB，initcode 上限 256 KB。

## 本次明确不引入

- 链上治理、治理代币、可交易奖励代币。
- 去中心化预言机。跨链桥。见 [monad-crosschain.md](monad-crosschain.md)、[monad-tooling.md](monad-tooling.md)。
- 社区挑战合约（需求里的 C）在 A+B 闭环跑通且用户确认还有时间之前不要写。
