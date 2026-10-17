# T06 后端骨架

## 目标

`server/` 是一个 TypeScript 包，`npm run build` 通过，启动后只有健康检查路由。依赖只加 `express` 和 `typescript`（以及它们直接需要的类型包）。

## Non-goals

不写估值、签名、webhook 解析、链上调用。

## 约束

不安装 ethers 以外的新链库；ethers 留到 T08。不提交 `.env`。

## 上下文

依赖 T01 只是为了让路线图串行。不改 `contracts/`。挡住 T07、T08。

## 测试验证

`npm run build` 退出码 0。`npm start` 后 `curl` 健康检查返回 200。

## 完成状态

未开始
