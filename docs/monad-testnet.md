# Monad testnet

数字会变。写配置或发交易前，重新打开官方页和 `addresses` / `gas` skill，并用 RPC 核对。不要从本文件抄地址进代码。

官方页（2026-10-17 读过）：[Network Information - Testnet](https://docs.monad.xyz/developer-essentials/testnets)、[Gas Pricing](https://docs.monad.xyz/developer-essentials/gas-pricing.md)。

## 当前采用的网络参数

以官方测试网页为准，不采用 `RESOURCES.md` 里 Notion 的旧数字：

| 项 | 值 | 出处 |
| --- | --- | --- |
| Chain ID | `10143`（hex `0x279F`） | 官方测试网页与 Notion 一致 |
| 网络名 | Monad Testnet | 官方测试网页 |
| 原生代币 | MON | 官方测试网页 |
| 默认 RPC | `https://testnet-rpc.monad.xyz` | 官方测试网页，QuickNode，50 rps |
| 备用 RPC | `https://rpc.ankr.com/monad_testnet`、`https://rpc-testnet.monadinfra.com` | 官方测试网页 |
| WebSocket | `wss://testnet-rpc.monad.xyz`、`wss://rpc-testnet.monadinfra.com` | 官方测试网页 |
| 水龙头 | `https://faucet.monad.xyz` | 官方测试网页 |
| 浏览器 | `https://testnet.monadvision.com`、`https://testnet.monadscan.com` | 官方测试网页 |
| 文档中的客户端版本 | `v0.16.5` / `MONAD_TEN` | 官方测试网页。测试网曾于 2025-12-16 从 genesis 重置 |

Notion 仍写水龙头 `https://testnet.monad.xyz`，浏览器 `testnet.monadexplorer.com` 和 `monad-testnet.socialscan.io`。这些链接先不要写进配置。领水或开浏览器时如果官方链接打不开，再问用户。

## Gas

官方页：按 **gas limit** 收费，不是按 gas used。最低 base fee 是 **100 MON-gwei**（`100 * 10^-9 MON`）。单笔 gas limit 上限 30M，区块 gas limit 150M。

Notion 写「最低 50 gwei」。这和现行文档冲突。发交易前读 `.cursor/skills/gas/SKILL.md`，按那里的数字设置 `maxFeePerGas`，不要用 50 gwei。

MetaMask 在 `eth_estimateGas` revert 时可能把 gas limit 设得很大。Monad 会按 limit 全额扣费。gas 已知时显式设置 limit。

## 地址

不要使用 Notion「典型智能合约地址」表里的地址。该表和官方测试网页已经不一致：官方 Wrapped MON 是 `0xFb8bf4c1CC7a94c73D209a149eA2AbEa852BC541`，Notion 的 WrappedMonad 是另一个地址。CreateX、Multicall3、Permit2 两边目前相同，也不要因此相信表里的其余行。

要用任何地址时：

1. 读 `.cursor/skills/addresses/SKILL.md`。
2. 对目标链 `eth_getCode`。没代码就停。
3. 地址进代码时在注释里写来源（skill 文件或官方页）和核对日期。

## 验证合约

官方 Foundry 文档写了 Monad-aware bytecode replay，但没有在本页给出完整命令。Notion 里的 Foundry 示例带有一条路径里嵌了密钥的 RPC，**不要复制进仓库、脚本、日志或聊天**。Hardhat 示例用的是另一条旧 RPC。

验证前读官方 Foundry 页，并向用户确认当前的 verifier URL。Notion 记录的 Sourcify 根是 `https://sourcify-api-monad.blockvision.org`，API key 留空。把它当成待核对的线索，不是已验证配置。
