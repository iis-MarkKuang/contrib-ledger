# 开源贡献激励系统 · Monad 测试网 Demo 需求文档

> 本文档用于指导 Cursor 在 **1 天（约 8 小时）内**完成一个可在 **Monad 测试网**上演示的 MVP。核心机制围绕「链下估值 + 链上验签 + 多写者并发提交」展开，以凸显 Monad 的并行执行与高吞吐优势。

- 版本：v2.0
- 日期：2026-10-17
- 状态：待开发
- 目标链：Monad 测试网（EVM 兼容 L1，高性能并行执行）

---

## 0. v2.0 相对 v1.0 的关键调整（必读）

v1.0 是「后端私钥签名 → 合约 record + mint NFT」的单写者模型，本质是低频链上记账，换任何 EVM 链都能跑，**没有用到 Monad 的并行执行 / 高吞吐优势**，去中心化叙事也偏弱。v2.0 做三处调整，全部控制在 1 天范围内：

| 改动 | 旧 | 新 | 体现的点 |
|------|----|----|----------|
| **A. 写者模型** | 后端私钥直接调合约 | 维护者 EIP-712 签名，**贡献者自己**持签调合约，合约 `ecrecover` 验签 | 去中心化（链下估值+链上验签）、多写者并行 |
| **B. 并发演示** | 单条串行上链 | 预置 50~100 条贡献，一键并发提交，看板实时滚动 | Monad 并行执行可视化 |
| **C. 社区挑战（弹性项）** | 无 | 估值上链后开时间窗，任何人可质押测试币「挑战」灌水贡献，窗后未挑战才最终生效 | 轻量去中心化博弈 |

> C 是**弹性项**：A+B 先跑通，时间富余（晚上联调阶段还剩 1h+）再加 C，否则砍掉进路线图。不要为了 C 把 A+B 的闭环搞挂。

---

## 1. 项目定位

**一句话：** 开源项目的「贡献 → 链下估值 → 链上验签认证 → 声誉上链」闭环，跑在 Monad 上正是因为它的高吞吐并行执行能扛住成百上千贡献者并发认证。

一个 Web3 开源贡献激励平台：开发者对开源项目提 PR / Issue，维护者用一套估值规则链下评估贡献价值并 EIP-712 签名，贡献者持签名**自己**调 Monad 链上合约完成认证，合约验签后记录估值、累加积分、mint 声誉 NFT。

**为什么是 Monad（pitch 核心叙事）：**
- 并行执行：成百上千贡献者同一 block 内各自提交互不冲突的认证记录，Monad 能并行处理，以太坊 L1 会拥堵——这正是 demo 要演的。
- 高 TPS + 亚秒级软确认：前端看板能近乎实时刷新上链结果。
- 执行/共识解耦：软确认快、最终性异步，贡献认证体验顺滑。

**长期愿景（本次 demo 不做，仅作为路线图口头说明）：**
- 估值规则由社区链上治理（DAO 投票变更公式/权重）
- 评审权限多签化（非单一私钥）
- 贡献数据经去中心化 oracle 上链
- 真实链上代币经济（有市场定价、可组合）

---

## 2. Demo 目标与验收标准

**Demo 要讲清的故事：** 有人提一个 PR → 维护者链下估值并签名 → 贡献者持签提交到 Monad → 合约验签、记录贡献、mint 声誉 NFT → 前端看板实时可见。再点「并发提交」按钮，50+ 条贡献同一 block 滚动上链，凸显 Monad 并行执行。

**验收标准（可演示、可复现）：**
1. 合约成功部署在 Monad 测试网，地址可验证。
2. 单条闭环跑通：维护者签名 → 贡献者提交 → 合约验签记账 + mint NFT → 前端可见。
3. 并发演示跑通：一键提交 50~100 条预置贡献，看板实时滚动，区块高度可见。
4. 演示数据可重复演示（预置 PR/Issue 样例 + 对应签名）。
5. 全程业务逻辑无人工干预（除 demo 现场触发的提交动作）。

---

## 3. 范围界定（重要）

### ✅ 必做（MVP 核心）
- GitHub Webhook 接收 PR / Issue 事件（用于触发链下估值，非上链触发器）
- 链下估值引擎：计算估值分（简化公式）
- **EIP-712 签名生成**（后端用维护者私钥签）
- Solidity 合约：`ecrecover` 验签 + 积分/声誉记账 + mint 声誉 NFT
- 前端看板：展示贡献、估值分、链上积分、声誉 NFT
- **前端「提交我的贡献」按钮**：贡献者持签调合约
- **前端「并发提交演示」按钮**：一键提交 50~100 条预置签名贡献
- 部署脚本 + Monad 测试网水龙头领水 + 合约验证

### 🟡 用简化/模拟版替代（demo 里"演出来"即可，不接真实链上机制）
- 多签评审 → 用**单一演示维护者地址**签 EIP-712
- 社区投票 → 前端放一个**模拟投票按钮**（本地状态，不接链上治理）
- 防刷 → 只保留**"产能上限"**一条规则做示意
- 钱包/贡献者身份 → demo 用一个演示钱包，签名贡献预置好

### 🟢 弹性项（A+B 跑通且时间富余再做，否则砍进路线图）
- **C. 社区挑战机制**：估值上链后开时间窗，任何人可质押测试币挑战灌水贡献，窗后未挑战才最终生效

### ⛔ 明确不做（写入路线图，禁止在本次开发）
- 真实链上投票 / DAO / 治理 token
- 去中心化 oracle / 预言机
- 完整防刷体系（AI 检测、信誉阶梯、黑名单等）
- 真实代币经济 / 可交易代币 / 交易所对接

---

## 4. 核心流程（闭环）

```
开发者提交 PR / Issue
        │
        ▼
GitHub Webhook 接收事件
        │
        ▼
链下估值引擎计算估值分（简化公式）
        │
        ▼
后端用维护者私钥做 EIP-712 签名（contributor, prId, score, repo, nonce）
        │
        ▼
贡献者在前端点「提交我的贡献」→ 用自己的钱包调合约，带上签名
        │
        ▼
合约 ecrecover 验签 → 记录贡献 + 累加积分 + mint 声誉 NFT
        │
        ▼
Monad 测试网上链（并行处理多个贡献者提交，不可篡改）
        │
        ▼
前端看板实时展示积分 / 声誉 NFT
        │
        ▼
（演示高潮）点「并发提交」按钮 → 50~100 条预置签名贡献并发上链
```

---

## 5. 技术架构与技术栈

| 层 | 技术 | 说明 |
|----|------|------|
| 链 | Monad 测试网 | EVM 兼容，Hardhat/Foundry 直接部署 |
| 合约 | Solidity + OpenZeppelin | ERC-721（声誉 NFT）+ 记账逻辑 |
| 开发/部署 | Hardhat 或 Foundry | 脚本部署、verify、领水 |
| 后端 | Node.js / TypeScript | Webhook handler + 估值引擎 + 签名交易 |
| 前端 | React / Vite | ethers.js 读取链上，展示看板 |
| 钱包 | MetaMask | 连接测试网，领水 |

---

## 6. 合约设计（MVP 接口）

> 建议合并为**一个合约**降低复杂度（`ContributionRegistry`），同时持有 ERC-721 声誉逻辑；也可拆两个。demo 优先一个。

**合约：ContributionRegistry（验签 + 记账 + NFT）**

```solidity
// EIP-712 类型哈希（链下签名结构）
// struct ContributionSig { address contributor; uint256 prOrIssueId; uint256 valuationScore; string repo; uint256 nonce; }

// 贡献记录结构
struct Contribution {
    address contributor;      // 贡献者地址（来自签名）
    uint256 prOrIssueId;      // PR/Issue 编号
    uint256 valuationScore;   // 估值分
    uint256 timestamp;        // 记录时间
    string  repo;             // 仓库名
    bool    minted;           // 是否已 mint NFT
}

// 关键方法
submitContribution(
    uint256 prOrIssueId,
    uint256 valuationScore,
    string  repo,
    uint256 nonce,
    bytes   signature          // 维护者 EIP-712 签名
) external                     // 任何人可调，验签通过后写入记录 + 累加积分 + mint NFT

getContributorScore(address)   // 查某人累计积分
getContribution(uint256 id)    // 查单条记录
usedNonce(uint256)              // 防重放
```

**验签逻辑要点：**
- 合约 EIP-712 domain + 类型哈希固定，与后端签名**完全一致**，否则验签失败。
- `ecrecover` 还原出的地址必须等于合约里登记的 `maintainerAddress`。
- `nonce` 一次性使用，防重放。
- `contributor` 字段允许任意地址，贡献者用自己钱包提交即可体现多写者并行。

**ReputationNFT（合并进同一合约）：**
- `mintReputation(to, score)`：internal，验签通过后自动调用
- 按 ERC-721（OpenZeppelin）实现，demo 阶段可不强制不可转让

**事件（供前端监听）：**
- `ContributionSubmitted(contributor, prOrIssueId, valuationScore, timestamp, submitter)`
- `ReputationMinted(to, tokenId)`

**权限控制：** 写操作无需 `onlyOwner`（靠验签），但 `setMaintainer` 等管理接口限 owner。

### 弹性项 C：社区挑战（如做）

```solidity
// 在 Contribution 里加
bool    finalized;       // 时间窗过后未挑战则 true
uint256 challengeEnd;    // 挑战截止时间
uint256 challengeStake;  // 累计质押

challengeContribution(uint256 id) external payable  // 质疑，需质押测试币
finalizeContribution(uint256 id) external           // 窗后任何人可调，置 finalized
```
- 未 finalized 的贡献不计入积分、不 mint NFT（或 mint 但标记 pending）。
- demo 用很短的窗口（如 1 分钟）方便现场演示。

---

## 7. 估值引擎（MVP 简化公式）

**硬闸门：** 只有**已合并**的 PR 才计分（Issue 按"被解决"计分）。

```text
valuationScore =
    base(基础分)
  + quality(质量分：测试覆盖 / CI 通过，封顶)
  + size(规模分：去注释代码量，封顶，防灌水)
  + maintainer(维护者打分，0~N，演示阶段可填固定值)

// 防刷示意：时间窗产能上限
if 贡献者在时间窗内 PR 数 > 阈值 → 超出部分不计分
```

**实现建议：** 规则先写死在配置/常量里，权重公开即可（完整防刷不在本次范围）。估值完成后由后端用维护者私钥做 EIP-712 签名，签名结果（含 nonce）交给前端。

---

## 8. 数据流与触发器

1. GitHub 仓库配置 Webhook → 事件 `pull_request`（merged）/ `issues`（closed）。
2. 后端收到事件 → 调估值引擎算出 `valuationScore` → 生成 `nonce` → 用维护者私钥做 EIP-712 签名。
3. 后端把 `(prOrIssueId, valuationScore, repo, nonce, signature)` 返回前端（或存库待领）。
4. 贡献者在前端连钱包 → 点「提交我的贡献」→ ethers 调 `submitContribution(...)`。
5. 合约 `ecrecover` 验签 → 记录 + 积分 + mint NFT → 事件抛出。
6. 前端订阅事件 / 轮询 → 实时刷新看板。
7. **并发演示**：前端预置 50~100 条已签名贡献，点按钮后用同一钱包（或多个预置钱包）并发发交易，Monad 同 block 并行处理。
8. 预置 2~3 条真实或模拟 PR/Issue 数据 + 对应签名，保证单条闭环确定性。

---

## 9. 前端看板（MVP）

- 页面一：贡献列表（PR/Issue、估值分、状态、链上 Tx 链接、提交者）
- 页面二：单贡献者页面（累计积分、声誉 NFT 列表）
- 钱包连接：MetaMask，切换 Monad 测试网
- **「提交我的贡献」按钮**：从待领列表选一条，连钱包调合约
- **「并发提交演示」按钮**：一键并发提交 50~100 条预置签名贡献，看板实时滚动 + 显示区块高度 / TPS
- 模拟投票按钮：本地状态，点一下显示"社区投票通过"（明确标注为演示）

---

## 10. 部署与运行（Monad 测试网）

- 获取 Monad 测试网 RPC、ChainID、水龙头领测试币
- Hardhat/Foundry 配置网络 → 部署合约 → verify
- 后端环境变量：`MAINTAINER_PRIVATE_KEY`（签 EIP-712 用，不上链）、`RPC_URL`、`CONTRACT_ADDRESS`、`MAINTAINER_ADDRESS`、`GITHUB_WEBHOOK_SECRET`
- 前端环境变量：`VITE_CONTRACT_ADDRESS`、`VITE_RPC_URL`、`VITE_CHAIN_ID`
- 本地起后端 + 前端，录 demo

---

## 11. 一天交付时间线

| 时段 | 任务 |
|------|------|
| 上午（~3h） | 建合约（EIP-712 验签 + 记账 + ERC-721），本地 hardhat node 跑通单条闭环（含签名/验签） |
| 下午前半（~2h） | 部署 Monad 测试网 + 后端 Webhook + 估值引擎 + EIP-712 签名服务 |
| 下午后半（~1.5h） | 前端看板 + 「提交我的贡献」+ 「并发提交演示」按钮 + 预置签名数据 |
| 晚上（~1.5h） | 联调闭环、预置演示数据、录 demo、备应急方案；**时间富余则加 C 社区挑战** |

---

## 12. 给 Cursor 的开发提示

- 用 Hardhat（或 Foundry）+ TypeScript 合约项目骨架；依赖 `@openzeppelin/contracts`、`ethers`。
- **先验签闭环**：合约部署 → 后端签一条 → 前端提交 → 链上记账成功，这是最关键路径，先跑通再美化。
- EIP-712 域分隔符与类型哈希在合约和后端必须**完全一致**，否则验签失败——这是最常见的坑，先写测试。
- 并发演示用 ethers 的同一 provider 发多笔交易即可，不需要多钱包；预置签名里的 `contributor` 可以是同一个演示地址。
- 前端用 ethers 读链上，不依赖复杂状态管理。
- 所有去中心化类机制（DAO、oracle、多签）**不要实现**，仅在 README 标注为路线图。
- 保证本地一键启动：`npx hardhat node` + 部署脚本 + 后端 + 前端，方便 demo 时快速演示。
- C 社区挑战只在 A+B 完全跑通且晚上还有 ≥1h 时才动，否则砍掉。

---

## 13. 风险与注意

- 测试网 RPC / 领水若不可用：准备本地 `hardhat node` 作为兜底演示链，demo 时切换说明即可。
- EIP-712 验签调试可能吃时间：上午就把单条验签闭环跑通，别拖到下午。
- 并发演示别真做压测：50~100 条预置签名足够讲故事，多了反而可能撞 RPC 限流。
- 不要过度工程：本次目标是**跑通闭环 + 演出并行**，不是交付生产级去中心化系统。
- 演示口径：向观众强调「链下估值 + 链上验签 + 多写者并发」正是 Monad 并行执行的用武之地；去中心化的完整形态（DAO、oracle、多签）是路线图。
