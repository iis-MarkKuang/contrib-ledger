# T14 测试网部署

## 目标

把 `ContributionRegistry` 部署到 Monad 测试网 chain id 10143，把地址写入前端和后端的环境变量示例（不含私钥）。用浏览器打开该地址，能看到合约代码已验证，或明确记录验证接口当时不可用。

## Non-goals

不改合约逻辑。不重新做前端功能。

## 约束

- 发交易前读 `gas` skill 和 `docs/monad-testnet.md`。不要用 Notion 的 50 gwei。
- 私钥和带密钥的 RPC 不进仓库。
- 验证 URL 若与文档不一致，停下来报备后再发验证交易。
- 领水由用户自己完成。代理领水前先问。

## 上下文

依赖 T05、T13。挡住 T15、T16。

## 测试验证

`cast code <地址> --rpc-url https://testnet-rpc.monad.xyz` 非空。浏览器上该地址可打开。

## 完成状态

完成。进度：[progress/T14-testnet-deploy.md](../progress/T14-testnet-deploy.md)。源码验证未做，verifier URL 待确认。
