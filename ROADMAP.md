# Roadmap

一次只做状态为「下一张」的那一张。做完并跑过该票的验证后，再把下一张标成下一张。

| 顺序 | 票 | 状态 | 依赖 |
| --- | --- | --- | --- |
| 1 | [T01 Foundry 骨架](tickets/T01-foundry-skeleton.md) | 完成 | 无 |
| 2 | [T02 贡献存储与查询](tickets/T02-contribution-storage.md) | 完成 | T01 |
| 3 | [T03 EIP-712 提交](tickets/T03-eip712-submit.md) | 完成 | T02 |
| 4 | [T04 声誉 NFT](tickets/T04-reputation-nft.md) | 完成 | T03 |
| 5 | [T05 本地部署脚本](tickets/T05-anvil-deploy.md) | 完成 | T04 |
| 6 | [T06 后端骨架](tickets/T06-server-skeleton.md) | 完成 | T01 |
| 7 | [T07 估值函数](tickets/T07-valuation.md) | 完成 | T06 |
| 8 | [T08 链下 EIP-712 签名](tickets/T08-eip712-sign.md) | 完成 | T03, T06 |
| 9 | [T09 GitHub webhook](tickets/T09-webhook.md) | 完成 | T07, T08 |
| 10 | [T10 前端壳与钱包](tickets/T10-web-shell.md) | 完成 | T01 |
| 11 | [T11 看板读链](tickets/T11-dashboard.md) | 完成 | T05, T10 |
| 12 | [T12 提交一笔](tickets/T12-submit-one.md) | 完成 | T08, T11 |
| 13 | [T13 并发提交](tickets/T13-submit-batch.md) | 完成 | T12 |
| 14 | [T14 测试网部署](tickets/T14-testnet-deploy.md) | 完成 | T05, T13 |
| 15 | [T15 预置演示数据](tickets/T15-demo-fixtures.md) | 下一张 | T09, T14 |
| 16 | [T17 模拟投票按钮](tickets/T17-mock-vote.md) | 未开始 | T10 |
| — | [T16 社区挑战](tickets/T16-challenge.md) | 搁置 | T14，且用户确认还有时间 |
| — | [T18 多人评分](tickets/T18-multi-scorer.md) | 可选 | T14，且用户确认还有时间 |

T06 和 T10 不依赖合约写完，但 T01 先做，避免同时改两套空目录。
