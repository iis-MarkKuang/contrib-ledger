# T01 Foundry 骨架

## 目标

仓库里有一个能编译的 Foundry 项目：`foundry.toml` 设置 `network = "monad"`，装上 forge-std 和 OpenZeppelin Contracts 5，`forge build` 通过。可以有一个空的 `ContributionRegistry` 壳，没有业务函数。

## Non-goals

不写存储、验签、NFT、部署脚本、后端、前端。

## 约束

- Foundry 必须是官方 ≥ 1.8。版本不够就停下来报备，不要改用旧的 Monad Foundry fork。
- 不添加 Hardhat，不添加 contract.dev。
- 不把 RPC 密钥写进 `foundry.toml`。

## 上下文

挡住 T02、T06、T10。无前置票。

## 测试验证

`forge --version` 显示 ≥ 1.8，并且 `forge build` 退出码为 0。

## 完成状态

完成。Foundry 1.8.5，`forge build` 退出码 0。进度：[progress/T01-foundry-skeleton.md](../progress/T01-foundry-skeleton.md)。
