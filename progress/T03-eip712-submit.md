# T03 EIP-712 提交

- 状态：完成
- 日期：2026-10-17
- 分支：`dev/ky`（尚未提交）

## 做了什么

`submitContribution` 用维护者签名恢复地址。域是 `ContributionRegistry` / `1`。类型串与 `SOLUTION.md` 相同。nonce 全局一次性。同一个 `(repo, prOrIssueId)` 不能再记。`contributor` 可以不是 `msg.sender`。

## 验证

`forge test --match-contract SubmitContributionTest --network monad`：4 通过。覆盖合法签名、改字段后签名失效、重用 nonce、重复的工作项。

## 没做

没有 mint。链下签名在 T08。

## 坑

[Forge 的 expectRevert 只覆盖紧接着的那一次调用](../pitfalls.md#expect-revert)。修完后 4 个测试才全部通过。
