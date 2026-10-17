# T08 链下 EIP-712 签名

- 状态：完成
- 日期：2026-10-17
- 分支：`dev/ky`（尚未提交）

## 做了什么

`server/src/sign.ts` 用 ethers v6 对 `SOLUTION.md` 里的类型串签名。域名称 `ContributionRegistry`，版本 `1`，chain id 和合约地址由调用方传入。`server` 因此增加了 `ethers` 依赖。

## 验证

`npm test` 共 4 个测试通过，其中签名测试会拉起 `anvil --network monad`（端口 8546），部署合约，用维护者钥签名，再由另一个账户调用 `submitContribution`。返回 id 为 1，贡献者积分变为 15。另一把私钥签的载荷被合约拒绝。测试结束时 Anvil 已停。

## 没做

没有接收 GitHub 事件，没有批量签 50 条。测试网 chain id 10143 还没有用这套签名部署验证。

## 坑

[Anvil 默认私钥只用于本地测试](../pitfalls.md#anvil-keys)。
