# T14 测试网部署

- 状态：完成
- 日期：2026-10-17
- 分支：`dev/ky`

## 做了什么

`ContributionRegistry` 部署到 Monad 测试网 chain id 10143。部署者 `MAINTAINER_PRIVATE_KEY`（对应 `MAINTAINER_ADDRESS`）。合约地址 `0xE3c13083E5fE8f2E5cadbC22823665e44e2d7D17`。写入 `.env` 的 `CONTRACT_ADDRESS` 和 `VITE_CONTRACT_ADDRESS`。

部署前维护者余额只有 0.076 MON，模拟费用约 0.90 MON。用 `agents.devnads.com` 水龙头 API 领了 1 MON，余额变 1.076 MON。模拟通过后广播，部署成功，余额剩 0.606 MON。

## 验证

- `cast code 0xE3c13083E5fE8f2E5cadbC22823665e44e2d7D17 --rpc-url https://testnet-rpc.monad.xyz` 返回 29968 字节，非空，非 EIP-7702 委托。
- `cast call ... maintainer()(address)` 返回 `0x5FCa398a2001cA0707A4E8C3F69618A3f5161a4d`。
- 页面切到测试网，看板显示该合约地址，"还没有贡献记录"。
- 全量回归：forge 7、server 5、web 12，全过。

## 没做

没有做源码验证（`forge verify`）。验证接口 URL 没有确认，T14 约束写了"验证 URL 若与文档不一致，停下来报备后再发验证交易"。留到后续确认 verifier URL 后再做。
