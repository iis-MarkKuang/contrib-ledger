# T10 前端壳与钱包

- 状态：完成
- 日期：2026-10-17
- 分支：`dev/ky`（尚未提交）

## 做了什么

`web/` 用 ethers v6 连接 MetaMask。当前链不是 `VITE_CHAIN_ID` 时提示切换。`10143` 使用文档里的 Monad Testnet、MON 和 `https://testnet-rpc.monad.xyz`。`31337` 使用调用方传入的本地 RPC，链名 Anvil。Vite 从仓库根目录读 `.env`。

## 验证

`npm test` 4 个测试通过，覆盖错链、测试网参数、本地 Anvil，以及网络框的两条目标。`npm run build` 通过。打开页面，默认选中 Monad 测试网；点「本地 Anvil」后选中项切过去，再点测试网能切回来。没有 MetaMask，所以没有真正改钱包网络。

页面后来加了网络框。默认 Monad 测试网，可改到本地 Anvil。选中后让 MetaMask 切链。演示部署目标仍是测试网。

## 没做

没有读合约，没有提交，没有并发按钮，没有模拟投票。

## 坑

[Vite 默认不读仓库根目录的 .env](../pitfalls.md#vite-env)。
