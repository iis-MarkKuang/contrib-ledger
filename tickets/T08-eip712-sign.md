# T08 链下 EIP-712 签名

## 目标

后端用维护者私钥对 `SOLUTION.md` 里的类型串签名，输出前端可直接提交的字段。用 T03 的合约在 Anvil 上 `submitContribution` 能通过。

## Non-goals

不接收 GitHub 事件。不批量生成 50 条。

## 约束

- 域分隔符、类型串、chain id 与合约不一致时停下来改到一致，不要在前端硬编码另一套。
- 私钥只来自环境变量。验证时用 Anvil 的公开测试私钥，不把真实维护者私钥写进测试。

## 上下文

依赖 T03、T06。挡住 T09、T12。

## 测试验证

Anvil 上部署合约，后端签一条，`cast send` 或一个小脚本提交成功，错误私钥签的同一条失败。

## 完成状态

完成。Anvil 上维护者签名可以 `submitContribution`，另一把私钥签的同一类载荷被拒绝。进度：[progress/T08-eip712-sign.md](../progress/T08-eip712-sign.md)。
