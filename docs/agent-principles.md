# Agent principles

## 先验证，再下结论

- 改代码前先读相关文件。不要根据文件名猜实现。
- 跑过的命令才算验证。没跑通的测试、没部署成功的合约、没在浏览器里点过的页面，不要说已经完成。
- 外部事实（RPC、chain id、合约地址、gas 下限、验证 URL、skill 内容）以本次读到的文档或命令输出为准，并记下出处。训练数据里的 Monad 参数默认过期。
- 两个出处不一致时，把两边都写出来，停住，问用户。不要选一个看起来更熟的。

## 没定的事先问

下面这些如果用户没有在当次对话里明确说过，就问，不要自己定：

- 换掉需求文档里的范围（例如把模拟投票做成真 DAO，或接上预言机）。
- 换钱包方案（需求是 MetaMask。Para、Alchemy Agent Wallet、Privy 都要先问）。
- 换合约框架（当前默认见 [stack.md](stack.md)）。
- 把私钥、助记词、带路径密钥的 RPC 写进仓库、日志或聊天。
- 替用户执行 `alchemy auth`、`para login`、`envio-cloud login`、`contract-dev login`，或全局安装这些 CLI。
- 接入一个还没在 [monad-skills.md](monad-skills.md) 里写明的 MCP。
- 改 [monad-fork.md](monad-fork.md) 里的决定：fork 节点、接 contract.dev、或把 fork 测试网当成默认环境。

问的时候给出选项和你建议的一项，然后等回复。

## 用 skill，而不是复述记忆

Monad 的地址、gas、脚手架、钱包、索引器、工具目录：先打开 `.cursor/skills/monskill/SKILL.md`，按它的表只加载需要的 skill。skill 叫你再读 `references/` 时再读，不要一次把所有 skill 灌进上下文。

Skill 和官方文档冲突时，以你刚刚打开的那份为准，并在回复里说明你读的是哪一个文件。
