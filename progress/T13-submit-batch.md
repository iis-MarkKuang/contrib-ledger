# T13 并发提交

- 状态：完成
- 日期：2026-10-17
- 分支：`dev/ky`

## 做了什么

后端加了 `POST /pending/batch`，一次性签出最多 100 条载荷（默认 50），每条 nonce 互异、`(repo, prOrIssueId)` 互异、分数固定 35（不走产能上限，演示并发用）。前端 `SubmitPanel` 加了「生成 50 条」和「并发提交全部」两个按钮。并发提交用 `Promise.all` 同时发出所有交易，显示进度 `done/total`，失败项留在列表并显示错误。看板每行加了区块高度。

## 验证

全量回归：forge 7、server 5、web 12，全过。`tsc --noEmit` 通过。后端 `POST /pending/batch` 生成 50 条，全部 35 分，nonce 1-50。浏览器面板显示 50 条待提交，按钮在没连接 MetaMask 时禁用。

## 没做

没有在浏览器里实际并发提交（自动化浏览器没有 MetaMask）。测试网部署是 T14。
