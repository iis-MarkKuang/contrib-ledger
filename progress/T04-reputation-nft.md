# T04 声誉 NFT

- 状态：完成
- 日期：2026-10-17
- 分支：`dev/ky`（尚未提交）

## 做了什么

验签通过后给贡献者 mint ERC-721。名称 `Contribution Reputation`，符号 `CREP`。记录的 `minted` 设为 true，并发出 `ReputationMinted`。

## 验证

`forge test --match-contract ReputationNftTest --network monad`：1 通过。`ownerOf` 是贡献者，余额是 1。

## 没做

没有做成 soulbound，没有 tokenURI 服务。

## 坑

无。
