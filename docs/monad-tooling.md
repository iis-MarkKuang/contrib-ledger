# Tooling

本次 demo 的看板用 ethers 读合约事件或轮询即可。下面的索引器、预言机、投资组合 API 都不是 MVP。用户点名要做历史索引或价格时再打开对应链接，并先读对应 skill。

## 索引器

官方目录：[Indexers](https://docs.monad.xyz/tooling-and-infra/indexers/index.md)、[Indexing frameworks](https://docs.monad.xyz/tooling-and-infra/indexers/indexing-frameworks.md)。

Notion 入口：

- Envio HyperIndex 指南：https://docs.monad.xyz/guides/indexers/tg-bot-using-envio
- QuickNode streams：https://docs.monad.xyz/guides/indexers/quicknode-streams

本地 skill：`.cursor/skills/indexer/SKILL.md`。它要求 `envio-cloud` CLI 和登录。不要替用户安装 CLI 或执行 login。

读历史事件时优先批量 RPC，而不是按交易打多次：

- 一个区块的 receipts：`eth_getBlockReceipts`，不要对每笔交易 `eth_getTransactionReceipt`。
- 区块内交易详情：`eth_getBlockByNumber` 且 hydrated。
- trace：`debug_traceBlockByNumber`。Ankr 公共 RPC 不允许 `debug_*`。

## 预言机

本次不做。官方目录：https://docs.monad.xyz/tooling-and-infra/oracles.md

Notion 入口：Chainlink Data Streams、Pyth price feed ids、Pyth EVM 合约地址（https://docs.pyth.network/price-feeds/contract-addresses/evm）。feed id 和合约地址以这些页的当前内容为准。

## 钱包

需求默认是用户自己的 MetaMask。

| 方案 | 何时 | 先读 |
| --- | --- | --- |
| MetaMask | 本次 demo | 需求文档第 5、9 节 |
| Reown / WalletConnect | 用户要求再接 | https://docs.monad.xyz/guides/reown-guide |
| Para 嵌入式钱包 | 用户要求再接 | `.cursor/skills/wallet-integration/SKILL.md` |
| Alchemy Agent Wallet | 用户要求代理钱包再接 | `.cursor/skills/wallet/SKILL.md` |
| Privy / Pimlico 无 gas | 用户要求再接 | Notion 链到 Privy「send a transaction」和 Pimlico gasless 教程。配置必须改到 Monad 测试网 |

`wallet` 和 `wallet-integration` skill 都写明：不要替用户安装 CLI，不要替用户登录。

## 读链上 NFT / 资产的第三方 API

Notion 列了 Codex、Zerion、Alchemy 的 NFT、portfolio、token、webhook API。demo 的声誉 NFT 从我们自己的合约读。不要为了看板去接这些 API。
