# Contrib Ledger 演示步骤

开源贡献认证 demo：GitHub PR → 链下多人评分 → 维护者 EIP-712 签名 → 贡献者提交到 Monad 测试网 → 积分兑换徽章 NFT。

## 前置准备

演示前确保以下服务已启动（终端里跑着）：

1. **后端**（端口 8787）：`cd server && env -u CHAIN_ID -u CONTRACT_ADDRESS -u VITE_CONTRACT_ADDRESS -u VITE_ANVIL_CONTRACT_ADDRESS -u VITE_ANVIL_REDEEM_ADDRESS -u VITE_REDEEM_ADDRESS node --env-file=../.env --import tsx src/index.ts`
2. **前端**（端口 5173）：`cd web && env -u VITE_CONTRACT_ADDRESS -u VITE_ANVIL_CONTRACT_ADDRESS -u VITE_ANVIL_REDEEM_ADDRESS -u VITE_REDEEM_ADDRESS npm run dev`
3. **cloudflared tunnel**：`cloudflared tunnel --url http://127.0.0.1:8787`，拿到 `https://<随机>.trycloudflare.com` 公网地址
4. **GitHub webhook** 已指向 tunnel（`iis-MarkKuang/contrib-ledger-demo` 仓库）

测试网合约地址：
- ContributionRegistry：`0xE3c13083E5fE8f2E5cadbC22823665e44e2d7D17`
- RedeemVault：`0x18055bc2d01a3f6457cc8489e4f86ca851ae45e7`

---

## 第一步：连接钱包

1. 打开浏览器访问 `http://127.0.0.1:5173`
2. 确认网络框选中 **Monad 测试网**（Chain 10143）
3. 点「连接 MetaMask」，在 MetaMask 弹窗里确认连接
4. 顶部显示你的钱包地址和当前链

> 如果 MetaMask 提示余额不足，用 faucet 领 1 MON：
> ```bash
> curl -X POST https://agents.devnads.com/v1/faucet \
>   -H 'content-type: application/json' \
>   -d '{"chainId":10143,"address":"<你的地址>"}'
> ```

---

## 第二步：创建真实 GitHub PR（触发 webhook）

在 `iis-MarkKuang/contrib-ledger-demo` 仓库创建并合并一个 PR：

```bash
cd /tmp && gh repo clone iis-MarkKuang/contrib-ledger-demo && cd contrib-ledger-demo
git config user.name "iis-MarkKuang" && git config user.email "iis-MarkKuang@users.noreply.github.com"
git checkout -b demo/<分支名>
# 修改或新增一个文件
git add -A && git commit -m "<提交信息>"
git push -u origin demo/<分支名>
gh pr create --title "<PR 标题>" --body "Demo PR" --base main --head demo/<分支名>
gh pr merge <PR编号> --merge --admin
```

合并后约 4 秒，webhook 触发，后端创建一个**评分任务**（不立即签名）。

---

## 第三步：社区多人评分（T18 核心）

回到浏览器，「社区评分」面板会显示刚合并的 PR，状态 `0/3 票`。

需要 **3 个不同评分者**打分（模拟去中心化估值）：

1. 用 MetaMask 当前账户，展开 PR，输入分数（1-100），点「签名评分」
   - MetaMask 弹 `personal_sign` 请求（**不需要 gas**，只是签名认证身份）
   - 确认后显示「1/3 票」
2. 切换 MetaMask 到另一个账户（匿名模式新建账户即可），重复评分
   - 显示「2/3 票」
3. 再切换第三个账户评分
   - 达到 3/3 票，后端自动 **取平均分 + 维护者 EIP-712 签名**
   - PR 从「社区评分」消失，出现在「待提交」列表

> 也可以用脚本快速投 3 票：
> ```bash
> cp scripts/vote-e2e.mjs server/vote-e2e.mjs
> cd server && node vote-e2e.mjs iis-MarkKuang/contrib-ledger-demo <PR编号> 80 60 75
> ```

---

## 第四步：贡献者提交上链

「待提交」面板现在有一条载荷（contributor = 你的地址，分数 = 平均分）：

1. 点「提交这条」
2. MetaMask 弹交易请求（这次是**链上交易**，需要付 gas）
3. 确认交易，等待上链（测试网约 1-2 秒）
4. 看板「贡献」面板刷新，显示新贡献记录：贡献者地址、PR 编号、分数、区块号
5. 底部查询框输入你的地址，点「查询积分和 NFT」，显示你的累计积分和声誉 NFT

---

## 第五步：积分兑换徽章 NFT（T19 核心）

「积分兑换」面板显示你的可用积分、已兑换、持有徽章数：

1. 确认可用积分 ≥ 35
2. 点「用 35 积分兑换徽章」
3. MetaMask 弹交易请求，确认
4. 上链后：可用积分 -35，持有徽章 +1
5. 查询框再次查询你的地址，积分不变（积分是累加器，不可减少），但徽章数增加

> **机制说明**：积分在 `ContributionRegistry` 里是 uint256 累加器，永不减少。`RedeemVault` 用 `usedScore` 记账已兑换部分，可用积分 = 总积分 - 已兑换。徽章是独立的 ERC721（symbol CBADGE），和声誉 NFT（CREP）分开。

---

## 第六步（可选）：并发提交演示

展示 Monad 的并行执行能力：

1. 点「预置演示数据」，生成 3 条载荷（contributor = 你的地址）
2. 点「并发提交全部」
3. 前端用 `Promise.all` 同时发出 3 笔交易
4. 进度条显示 `0/3 → 3/3`
5. 看板按区块追加 3 条记录，展示 Monad 并行处理

---

## 演示话术要点

| 步骤 | 强调点 |
|---|---|
| 连接钱包 | 用户掌握自己的私钥，不托管 |
| GitHub PR | 真实开源贡献，不是伪造数据 |
| 多人评分 | 去中心化估值，3 人签名认证，防水 PR |
| 维护者签名 | EIP-712 链下签名，链上验签，私钥不上链 |
| 贡献者提交 | 贡献者自己付 gas 提交，contributor 可以 ≠ msg.sender |
| 兑换徽章 | 积分有实际价值，能换链上资产，但不是可交易代币 |
| 并发提交 | 展示 Monad 并行执行，多笔交易同区块不冲突 |

## 常见问题

- **MetaMask 显示"预计失败"**：余额不够 max fee，领 faucet；或没 NFT 就兑换（先提交贡献）
- **NonceUsed**：后端重启后 nonce 重置，刷新前端拉新载荷
- **DuplicateContribution**：同一 PR 已提交过，用新 PR
- **webhook 没触发**：检查 cloudflared tunnel 是否在跑，webhook URL 是否指向 tunnel
