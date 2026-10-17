# T05 本地部署脚本

## 目标

一条 Forge script 把 `ContributionRegistry` 部署到本机 `anvil --network monad`，构造参数是维护者地址。脚本打印合约地址。

## Non-goals

不部署测试网，不验证浏览器，不领水。

## 约束

脚本从环境变量读维护者地址，不读私钥文件进仓库。RPC 只用 `http://127.0.0.1:8545`。

## 上下文

依赖 T04。挡住 T11、T14。

## 测试验证

Anvil 运行中执行 script，`cast code <地址>` 不是空。

## 完成状态

完成。本地部署到 `0x5FbDB2315678afecb367f032d93F642f64180aa3`，`cast code` 非空。进度：[progress/T05-anvil-deploy.md](../progress/T05-anvil-deploy.md)。
