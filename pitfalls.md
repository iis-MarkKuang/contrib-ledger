# Pitfalls

新坑追加在文末。同一原因已经有标题就补在那一节，不要再开一节。进度记录只链接到这里的锚点。

不要把私钥、带密钥的 RPC、webhook secret 写进本文件。

## Forge 的 expectRevert 只覆盖紧接着的那一次调用 {#expect-revert}

`test_duplicateWorkFails` 第一次失败，信息是 `next call did not revert as expected`。`vm.expectRevert` 写在 `_sign()` 前面，而 `_sign()` 里的 `hashContribution` 是一次成功的 staticcall，Forge 把它当成了本该回滚的那一次调用。签名要在 `expectRevert` 之前算完，断言紧贴着 `submitContribution`。

## 官方 foundryup 在这台机器上下不下来 {#foundry-install}

`foundry.paradigm.xyz` 和 `raw.githubusercontent.com` 上的 foundryup 连接被重置。实际安装是 Foundry 1.8.5 的 GitHub release，二进制放在 `~/.foundry/bin`，`~/.zshrc` 里加了这条 PATH。新开的 shell 如果找不到 `forge`，先确认这条 PATH。不要改用已废弃的 `monad-developers/foundry-monad`，也不要使用 `anvil --monad`。本地链命令是 `anvil --network monad`。

## monskills 的 git clone 超时 {#skills-clone}

`npx skills add therealharpaljadeja/monskills` 两次都没克隆下来。skills 是从该仓库的 zip 拷进 `.cursor/skills/` 的。以后要更新 skill，先看 clone 是否仍然失败，不要假设目录里的内容和上游 HEAD 一致。

## Notion 数字不能直接写进配置 {#notion-conflicts}

`RESOURCES.md` 的 Notion 页和现行官方页有冲突，包括 gas、水龙头、浏览器和 Wrapped MON 地址。采用哪边写在 [docs/monad-testnet.md](docs/monad-testnet.md)。Notion 示例里还有一条路径里嵌了密钥的 RPC，不要复制。发交易前再读 `.cursor/skills/gas/SKILL.md`。

## 本地 Anvil 的 gas 估价不是测试网 gas {#anvil-gas}

`anvil --network monad` 上 `forge script` 报过 base fee 1 gwei。这是本地节点的估价。测试网按 gas limit 收费，最低 base fee 以 [docs/monad-testnet.md](docs/monad-testnet.md) 和 gas skill 为准，不要把这次估价写进前端或部署脚本。

## Cloudflare 路由没有变成公网 webhook {#cloudflare-webhook}

当时在跑的 `cloudflared` 把已发布的 hostname 指到本机 `8787`，但权威 DNS 仍然是 NXDOMAIN：这个账号的 zone 列表是空的，私有 hostname 也不会创建公网解析。那台机器的 IPv6 地址也不是能打到本机服务的 origin。Webhook 改走 smee.io，频道 URL 和 secret 只放在 `.env`。拿到频道链接的人能看到转发的 payload。`/webhook` 还不存在时不要启动 `smee-client`。

## 第一次 forge build 会安静很久 {#first-solc}

空合约第一次编译时大约一分半没有输出，随后才打印 Solc 0.8.28 成功。时间花在下载编译器，不是死锁。

## 根目录忽略 lib 会把合约依赖一起忽略 {#gitignore-lib}

`.gitignore` 如果写 `lib/`，`contracts/lib` 里的 forge-std 和 OpenZeppelin 也会被忽略。现在只忽略 `contracts/lib/**/.git`，依赖目录可以进版本库。

## 测试网 eth_getLogs 最多跨 100 个区块 {#getlogs-range}

`https://testnet-rpc.monad.xyz` 在 `toBlock - fromBlock > 100` 时返回 HTTP 413，错误码 `-32614`，信息是 `eth_getLogs is limited to a 100 range`。不能从区块 0 一次拉到最新块。差值为 100 的窗口可以成功。看板按这个窗口分批查，测试网只看最近大约 2000 个区块。

## MetaMask 的添加网络弹窗不能连发 {#metamask-pending}

上一个 `wallet_addEthereumChain` 的弹窗还没关时，再发一次会返回 `-32002`：`already pending`。页面应提示先处理已有弹窗，不要把 ethers 的原文直接丢出来。

## ethers 会包住 MetaMask 的 4902 {#metamask-4902}

钱包里还没有这条链时，MetaMask 对 `wallet_switchEthereumChain` 返回 `4902`。ethers v6 把它包成 `UNKNOWN_ERROR`，顶层 `code` 不再是 `4902`。要在 `error` 字段和报错文本里认出 `4902`，然后调用 `wallet_addEthereumChain`。本地 Anvil 的 chain id 是 `0x7a69`。

## Vite 默认不读仓库根目录的 .env {#vite-env}

`VITE_*` 写在仓库根目录的 `.env`。在 `web/` 里跑 Vite 时，默认只读 `web/.env`。`web/vite.config.ts` 把 `envDir` 指到上一级，页面才能看到 `VITE_CHAIN_ID`。

## 后端不会自动读 .env {#env-file}

`GITHUB_WEBHOOK_SECRET` 写在仓库根目录的 `.env` 里。`tsx src/index.ts` 看不到这个文件，进程里没有变量时 webhook 一律 401。`server` 的 `dev` 和 `start` 要用 `node --env-file=../.env`。`.env` 权限保持 `600`。

## Anvil 默认私钥只用于本地测试 {#anvil-keys}

Anvil 的默认账户是公开测试钥。T05 的部署命令和 T08 的测试用过它们。可以出现在本地命令和测试里，不能写进 `.env` 以外的仓库文件，也不能当作测试网维护者密钥。

## 两条网络不能共用一个合约地址 {#contract-per-network}

页面以前只读 `VITE_CONTRACT_ADDRESS`。切到 Anvil 之后，RPC 变成 `127.0.0.1:8545`，合约地址还是测试网那一个，本地节点上没有这份代码。现在测试网用 `VITE_CONTRACT_ADDRESS`，Anvil 用 `VITE_ANVIL_CONTRACT_ADDRESS`。贡献列表在切换时先清空，避免旧网络的记录留在页面上。

## 委托代码不是注册表 {#eip-7702-code}

Anvil 默认账户 `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` 在 Monad 测试网上的 `eth_getCode` 不是 `0x`，而是 `0xef0100` 加 20 字节地址。这是 EIP-7702 委托，不是 `ContributionRegistry`。判断合约要排除这种 23 字节代码，否则页面会把它显示成一份没有贡献的合约。MetaMask 账户换链后地址不变，不要把它写成某一条链专属的地址。
