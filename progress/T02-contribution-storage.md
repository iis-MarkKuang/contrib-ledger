# T02 贡献存储与查询

- 状态：完成
- 日期：2026-10-17
- 分支：`dev/ky`（尚未提交）

## 做了什么

合约保存贡献结构体，并按地址累加 `uint256` 积分。`getContribution` 对未知 id 回滚。测试写入走 `ContributionRegistryHarness`，正式合约没有测试专用的写入口。

## 验证

`forge test --match-contract ContributionStorageTest --network monad`：2 通过。读回一条记录；同一贡献者 10 分再加 25 分，总分 35。

## 没做

没有验签，没有 NFT。

## 坑

无。
