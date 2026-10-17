# T12 提交一笔

- 状态：完成
- 日期：2026-10-17
- 分支：`dev/ky`

## 做了什么

后端加了 `DELETE /pending/:repo/:prOrIssueId`，前端加了 `submit.ts` 和 `SubmitPanel`。页面从 `GET /pending` 拉待提交列表，每条旁边一个「提交这条」按钮。点击后用已连接的 MetaMask 调 `submitContribution`，成功后从后端列表删除该条并刷新看板。

用户拒绝钱包弹窗时停在待提交列表，不把失败记成已上链。钱包网络不对、未连接、当前网络没有合约地址时按钮禁用或报错。

## 验证

`npx tsc --noEmit` 通过。`npm test`：web 12 个、server 5 个全过。

## 没做

没有在浏览器里点完一遍（自动化浏览器没有 MetaMask）。并发提交是 T13。
