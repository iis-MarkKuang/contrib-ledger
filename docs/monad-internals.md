# Monad internals

讲「为什么是 Monad」或改和执行模型有关的代码时，先读 `.cursor/skills/concepts/SKILL.md` 和它指向的 `references/`。下面是 Notion 给的官方架构页，2026-10-17 只核对了链接，没有把正文抄进来。

| 主题 | 页 |
| --- | --- |
| MonadBFT | https://docs.monad.xyz/monad-arch/consensus/monad-bft |
| 异步执行（共识与执行解耦） | https://docs.monad.xyz/monad-arch/consensus/asynchronous-execution |
| 并行执行 | https://docs.monad.xyz/monad-arch/execution/parallel-execution |
| MonadDb | https://docs.monad.xyz/monad-arch/execution/monaddb |

和写合约直接相关的差异另见：

- [Monad for Developers](https://docs.monad.xyz/introduction/monad-for-developers.md)
- [Differences between Monad and Ethereum](https://docs.monad.xyz/developer-essentials/differences.md)
- [Reserve balance](https://docs.monad.xyz/developer-essentials/reserve-balance.md)
- [Execution events](https://docs.monad.xyz/execution-events/index.md)（含 Rust API）

Demo 叙事可以用这些机制的名字和影响：多笔互不冲突的 `submitContribution` 可以并行执行；异步执行意味着 gas 按 limit 收取，确认体验和以太坊不同。不要在没读对应页的情况下发明时延数字或共识步骤。
