# T06 后端骨架

- 状态：完成
- 日期：2026-10-17
- 分支：`dev/ky`（尚未提交）

## 做了什么

`server/` 是 TypeScript 包。`GET /health` 返回 `{ "ok": true, "service": "contrib-ledger" }`，端口默认 8787。依赖是 express 和 TypeScript 工具链。

## 验证

`npm run build` 退出码 0。`npm start` 后 `curl http://127.0.0.1:8787/health` 返回 HTTP 200 和上面的 JSON。进程随后已停。

## 没做

没有估值、签名、webhook。ethers 是 T08 才加的。

## 坑

无。
