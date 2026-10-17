# T01 Foundry 骨架

- 状态：完成
- 日期：2026-10-17
- 分支：`dev/ky`（尚未提交）

## 做了什么

`contracts/foundry.toml` 使用 `network = "monad"`、solc 0.8.28。依赖是 forge-std 和 OpenZeppelin Contracts 5.4.0，remapping 写在 `contracts/remappings.txt`。Foundry 版本是 1.8.5。

## 验证

`forge build` 退出码 0。

## 没做

没有在这张票里写存储、验签或 NFT。这些在 T02–T04，所以现在的 `ContributionRegistry.sol` 已经不是空壳。

## 坑

[官方 foundryup 在这台机器上下不下来](../pitfalls.md#foundry-install)，[第一次 forge build 会安静很久](../pitfalls.md#first-solc)，[根目录忽略 lib 会把合约依赖一起忽略](../pitfalls.md#gitignore-lib)。
