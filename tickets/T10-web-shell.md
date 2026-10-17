# T10 前端壳与钱包

## 目标

`web/` 用 Vite + React + ethers v6 启动。页面能连接 MetaMask。页面上的网络框默认是 Monad 测试网 `10143`，也可以改到本地 Anvil `31337`。选中后让钱包切到对应的链。测试网参数来自 `docs/monad-testnet.md`。

## Non-goals

不读合约，不提交交易，不做并发按钮，不做模拟投票。

## 约束

不安装 wagmi、RainbowKit、Para。RPC URL 放环境变量，默认值用公开的 `https://testnet-rpc.monad.xyz`。

## 上下文

依赖 T01 只是为了串行。挡住 T11。

## 测试验证

`npm run build` 通过。本地打开页面，拒绝错误链 id 的判断用一个单测或手动切链记录下来。手动部分如果没做，状态不能标完成。

## 完成状态

完成。错链判断有单测；页面在没有 MetaMask 时显示安装提示。进度：[progress/T10-web-shell.md](../progress/T10-web-shell.md)。
