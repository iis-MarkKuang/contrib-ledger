# T03 EIP-712 提交

## 目标

`submitContribution` 用与 `SOLUTION.md` 相同的类型串验维护者签名。通过则记账并消耗 nonce。错误签名、用过的 nonce、重复的 `(repo, prOrIssueId)` 都回滚。

## Non-goals

不 mint NFT。不接 GitHub。不写前端。

## 约束

- 类型串改了必须同时改 `SOLUTION.md` 和 T08，不能只改一边。
- `contributor` 不强制等于 `msg.sender`。
- 维护者地址来自构造函数。测试用 `vm.sign`，不要把私钥写进源码。

## 上下文

依赖 T02。挡住 T04、T08。

## 测试验证

`forge test --match-contract SubmitContributionTest --network monad`：合法签名成功；改一个字段后失败；同一 nonce 第二次失败。

## 完成状态

完成。`SubmitContributionTest` 4 个测试通过。进度：[progress/T03-eip712-submit.md](../progress/T03-eip712-submit.md)。
