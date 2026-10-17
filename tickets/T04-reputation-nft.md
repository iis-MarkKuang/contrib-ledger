# T04 声誉 NFT

## 目标

验签成功的提交给 `contributor` mint 一枚 ERC-721，发出 `ReputationMinted`。`Contribution.minted` 为 true。mint 无法完成时整笔 `submitContribution` 回滚。

## Non-goals

不禁止转让。不做 token URI 服务。不在前端展示。

## 约束

使用 OpenZeppelin `ERC721`。不要另写一套 NFT。

## 上下文

依赖 T03。挡住 T05。

## 测试验证

`forge test --match-contract ReputationNftTest --network monad`：提交后 `ownerOf` 是贡献者；余额增加 1。

## 完成状态

完成。`ReputationNftTest` 通过：`ownerOf` 是贡献者，余额为 1。进度：[progress/T04-reputation-nft.md](../progress/T04-reputation-nft.md)。
