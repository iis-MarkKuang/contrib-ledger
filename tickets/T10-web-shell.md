# T10 前端壳与钱包

## 目标

`web/` 用 Vite + React + ethers v6 启动。页面能连接 MetaMask，并在链 id 不是 10143 时提示切换到 Monad 测试网。切换参数来自 `docs/monad-testnet.md`，不另抄一套 RPC。

## Non-goals

不读合约，不提交交易，不做并发按钮，不做模拟投票。

## 约束

不安装 wagmi、RainbowKit、Para。RPC URL 放环境变量，默认值用公开的 `https://testnet-rpc.monad.xyz`。

## 上下文

依赖 T01 只是为了串行。挡住 T11。

## 测试验证

`npm run build` 通过。本地打开页面，拒绝错误链 id 的判断用一个单测或手动切链记录下来。手动部分如果没做，状态不能标完成。

## 完成状态

未开始
