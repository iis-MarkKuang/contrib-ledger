# T11 看板读链

## 目标

看板列出 `ContributionSubmitted` 事件：贡献者、prId、分数、交易链接。输入地址后显示 `getContributorScore` 和该地址持有的声誉 NFT tokenId。

## Non-goals

不发送交易。不画 TPS。

## 约束

交易链接用 `docs/monad-testnet.md` 里的 Monadscan 或 MonadVision。不要用 Notion 里的旧浏览器域名，除非当时官方页已经打不开并已报备。

## 上下文

依赖 T05、T10。挡住 T12。

## 测试验证

Anvil 上提交一笔（用 cast 即可），刷新页面能看到该分数和一枚 NFT。

## 完成状态

完成。Anvil 上提交一笔后，页面能看到 15 分和声誉 NFT 1。进度：[progress/T11-dashboard.md](../progress/T11-dashboard.md)。
