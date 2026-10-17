# Contrib Ledger

开源贡献的「估值 → 维护者签名 → 贡献者自己上链」demo，部署目标是 Monad 测试网。

维护者在链下给已合并的 PR 打分并做 EIP-712 签名。贡献者用自己的钱包把签名提交到 `ContributionRegistry`。合约验签通过后记账、累加积分，并 mint 一枚声誉 NFT。积分不是可转让代币。

仓库：https://github.com/iis-MarkKuang/contrib-ledger

## 现在有什么

合约、链下签名和 webhook 已经能在本地跑通。页面能连 MetaMask，在 Monad 测试网和本地 Anvil 之间切换，并读出贡献、积分和声誉 NFT。自己提交交易还在后面的票里。进度记在 [progress/](progress/)，下一张见 [ROADMAP.md](ROADMAP.md)。

| 路径 | 状态 |
| --- | --- |
| `contracts/` | `ContributionRegistry`：EIP-712 验签、积分、声誉 NFT。`forge test` 通过 |
| `server/` | 健康检查、估值、EIP-712 签名、`POST /webhook` |
| `web/` | 连接 MetaMask，选择网络，看板读链 |
| `SOLUTION.md` | 架构、依赖、时序图 |

不做的事：DAO、预言机、跨链、可交易代币、contract.dev、嵌入式钱包。社区挑战先搁置。

## 布局

```text
GitHub webhook
    → server   估值 + EIP-712 签名（私钥只在这里）
    → web      MetaMask 发交易
    → ContributionRegistry @ Monad testnet
    → web      读事件，显示积分和 NFT
```

细节和时序图在 [SOLUTION.md](SOLUTION.md)。需求在 `requirements/`。

## 本地运行

需要 Foundry ≥ 1.8，并且 `forge` 在 `PATH` 里。

```bash
cp .env.example .env
cd server && npm install && npm run dev
```

```bash
cd web && npm install && npm run dev
```

健康检查：`curl http://127.0.0.1:8787/health`

```bash
cd contracts
forge test --network monad
anvil --network monad
```

`foundry.toml` 里已经写了 `network = "monad"`。本地链是空的 Anvil，不 fork 测试网。签名用的 chain id 默认是测试网 `10143`。Anvil 上的测试单独使用 `31337`。

## 配置

变量名在 [.env.example](.env.example)。`.env` 不要提交。

链参数以 [docs/monad-testnet.md](docs/monad-testnet.md) 为准：chain id `10143`，默认 RPC `https://testnet-rpc.monad.xyz`。这个公开 RPC 不需要 key。
