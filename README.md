# Contrib Ledger

开源贡献的「估值 → 维护者签名 → 贡献者自己上链」demo，部署目标是 Monad 测试网。

维护者在链下给已合并的 PR 打分并做 EIP-712 签名。贡献者用自己的钱包把签名提交到 `ContributionRegistry`。合约验签通过后记账、累加积分，并 mint 一枚声誉 NFT。积分不是可转让代币。

仓库：https://github.com/iis-MarkKuang/contrib-ledger

## 现在有什么

目录和空壳已经在。合约还不能编译：这台机器没有 Foundry。服务只有一个健康检查。页面只有一段说明。

| 路径 | 状态 |
| --- | --- |
| `contracts/` | Foundry 配置和空的 `ContributionRegistry`。存储、验签、NFT 还没写 |
| `server/` | `GET /health` |
| `web/` | 一页说明 |
| `SOLUTION.md` | 架构、依赖、时序图 |
| `ROADMAP.md` | 实现顺序。下一张是 T01 |

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

后端和页面不需要密钥。

```bash
cp .env.example .env
cd server && npm install && npm run dev
```

```bash
cd web && npm install && npm run dev
```

健康检查：`curl http://127.0.0.1:8787/health`

合约要等 Foundry ≥ 1.8 装好之后：

```bash
cd contracts
forge build
anvil --network monad
```

`foundry.toml` 里已经写了 `network = "monad"`。本地链是空的 Anvil，不 fork 测试网。

## 配置

变量名在 [.env.example](.env.example)。`.env` 不要提交。

链参数以 [docs/monad-testnet.md](docs/monad-testnet.md) 为准：chain id `10143`，默认 RPC `https://testnet-rpc.monad.xyz`。这个公开 RPC 不需要 key。
