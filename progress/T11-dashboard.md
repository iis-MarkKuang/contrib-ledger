# T11 看板读链

- 状态：完成
- 日期：2026-10-17
- 分支：`dev/ky`（尚未提交）

## 做了什么

看板列出 `ContributionSubmitted`：贡献者、prId、分数、交易。测试网交易链到 `https://testnet.monadscan.com`。Anvil 上没有浏览器，只显示「本地交易」。输入地址后读取 `getContributorScore`，并用 `ReputationMinted` 加上 `ownerOf` 列出该地址仍持有的 tokenId。

## 验证

Anvil 上部署并提交一笔。刷新页面后看到贡献者 `0x7099…79C8`、PR 7、15 分。查询该地址得到积分 15、声誉 NFT 1。`npm test` 和 `npm run build` 通过。

## 没做

页面不发送交易，不画 TPS。

## 坑

无。
