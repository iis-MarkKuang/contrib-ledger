# T09 GitHub webhook

## 目标

`POST /webhook` 校验 `X-Hub-Signature-256`。只处理已合并的 `pull_request` 和已关闭且标记完成的 `issues`。通过则调用 T07 和 T08，把待提交 JSON 存到内存列表，供前端读取。

## Non-goals

不自己上链。不接 GitHub App 安装流。不持久化数据库。

## 约束

`GITHUB_WEBHOOK_SECRET` 只来自环境变量。校验失败返回 401，不签名。

## 上下文

依赖 T07、T08。挡住 T15。

## 测试验证

用固定 secret 构造一条合法签名的 merged pull_request fixture，`curl` 后列表里出现一条待提交记录。错误签名返回 401。未合并的 PR 不产生记录。

## 完成状态

完成。合法签名的 merged pull request 进入 `GET /pending`；错误签名返回 401；未合并的 PR 不产生记录。进度：[progress/T09-webhook.md](../progress/T09-webhook.md)。
