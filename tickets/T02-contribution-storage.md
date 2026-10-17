# T02 贡献存储与查询

## 目标

`ContributionRegistry` 能保存贡献记录和贡献者累计分，并提供 `getContribution`、`getContributorScore`。写入函数先做成仅测试用的 internal 或仅 owner 的临时入口，方便单测；下一张票会换成验签入口。

## Non-goals

不验签，不 mint，不处理 nonce，不部署。

## 约束

积分是合约内 `uint256` 累加。不要做成 ERC-20。

## 上下文

依赖 T01。挡住 T03。

## 测试验证

`forge test --match-contract ContributionStorageTest --network monad`：写入后能读回字段；同一贡献者两笔分数相加。

## 完成状态

未开始
