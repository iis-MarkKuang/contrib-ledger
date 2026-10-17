# T09 GitHub webhook

- 状态：完成
- 日期：2026-10-17
- 分支：`dev/ky`（尚未提交）

## 做了什么

`POST /webhook` 校验 `X-Hub-Signature-256`。已合并的 `pull_request` 和 `state_reason` 为 `completed` 的 `issues` 会估值并签名，写入内存列表。`GET /pending` 给前端读。贡献者地址来自 `DEMO_CONTRIBUTOR_ADDRESS`。演示分数是基础 10、质量 10、规模 10、维护者 5，合计 35。

## 验证

`npm test` 通过。另用 curl：合并 PR 返回 200，`GET /pending` 有一条；错误签名返回 401；未合并 PR 返回 `recorded: false`，列表仍是一条。服务随后已停。

## 没做

没有上链，没有数据库。真实的 `.env` secret 没有用于这次验证。

## 坑

无。
