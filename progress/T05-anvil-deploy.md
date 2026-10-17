# T05 本地部署脚本

- 状态：完成
- 日期：2026-10-17
- 分支：`dev/ky`（尚未提交）

## 做了什么

`contracts/script/Deploy.s.sol` 从 `MAINTAINER_ADDRESS` 读维护者地址并部署 `ContributionRegistry`。部署者私钥只在命令行传入，不写进脚本。

## 验证

`anvil --network monad` 的 chain id 是 31337。脚本广播成功，合约地址 `0x5FbDB2315678afecb367f032d93F642f64180aa3`。`cast code` 返回非空字节码。验证后本地节点已停。

## 没做

没有部署到 Monad 测试网。广播记录在 `broadcast/`，已被 gitignore。

## 坑

[本地 Anvil 的 gas 估价不是测试网 gas](../pitfalls.md#anvil-gas)，[Anvil 默认私钥只用于本地测试](../pitfalls.md#anvil-keys)。
