# 部署

## 当前发布

- 日期：2026-10-19。
- GitHub：`wangjs-jacky/paper-room-typewriter`，私有仓库，`main` 分支。
- 网页：https://typewriter.paws.rodeo/
- 制作档案：https://typewriter.paws.rodeo/archive
- 视频拆解：https://typewriter.paws.rodeo/breakdown/
- 平台：Cloudflare Workers Static Assets，服务名 `paper-room-typewriter`。
- Wrangler：4.151.1，package-lock.json 已锁定。
- 活动版本：`a309e042-ef4c-4d1a-af21-7dafbe5f527f`，读回确认接收 100% 流量。

该地址使用长期云端托管，持续时间由账户和服务的保留情况决定，不依赖本地会话运行。

## 发布范围

只部署 `public/` 中的页面和资源。Blender 源脚本、部署配置和 README 保存在 GitHub 中。原始完整视频、本机日志、凭据和原始任务工作区未上传。历史拆解页保留当时的任务草案，当前交付说明见制作档案。

## 后续更新

修改 `public/` 后提交并推送 GitHub，再显式执行：

```sh
npm ci
npm run deploy
```

使用 Cloudflare 已授权的登录，自定义域名为 `typewriter.paws.rodeo`。GitHub 推送后需显式运行部署命令。不要把账户令牌写入仓库。

## 本次发布检查

部署命令成功；活动版本读回一致。经当前终端网络匿名读取首页、制作档案、视频拆解、两个 JS、CSS、资产清单、灯头/滑块 WebP 和成品截图，共 10 个文件，均为 HTTP 200 且 SHA-256 与发布文件一致。

本轮没有重新执行浏览器交互、Blender 渲染或真实手机验收；此前的交互结果和视觉边界见制作档案。新域名与原临时预览各自使用独立 localStorage，草稿不会自动迁移。

## Paws 域名 · 2026-10-19

根据用户选择，将正式入口绑定到 `typewriter.paws.rodeo`。Cloudflare 的变更预览仅新增该域名，无更新、移除或冲突；通过 `wrangler triggers deploy` 应用。原 `workers.dev` 地址是账户自动生成的默认入口。网页内容和部署版本保持一致。

API 读回确认新域名指向正确 Worker，先前七项域名映射保持。新域名下十个关键文件均为 HTTPS 200 且与发布原件 SHA-256 一致；本轮未重新执行浏览器或真实手机交互。
