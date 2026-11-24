# 已认可报告成为正式入口 · 2026-11-25

- 视频拆解 V2：https://typewriter.paws.rodeo/
- 开发者复现教程 V6：https://typewriter.paws.rodeo/tutorial
- 原打字机体验：https://typewriter.paws.rodeo/demo/

本次站点源码提交：a16e4b22d3bfdf5c37d4f96adf54e24024ffb7e8。两份认可原件在 docs/approved/，公开报告只调整站内导航及效果链接；原写作页、手机入口、档案和素材保持可用。

正式域 71 个公开文件的完整 GET 长度与 SHA-256 均匹配冻结快照。Mac mini 上的 Ego 浏览器实测首页 12 个截图节点、教程 8 步及 12 张图片、Human / Agent 切换和 390px 阅读布局；保留的 /demo/ 页面、图片及输入区正常加载，未改写已有草稿或重新测试输入功能。/mobile 两种入口转向 /demo/?view=mobile。

Cloudflare 使用现有 OAuth 与官方 Scripts/Assets 接口发布纯静态快照；域映射与替换前首页在上传前后均核对。部署回执 ID：eb04b441b38843b7b155fee308da90c8。deployments API 当前拒绝读取，因此没有活动版本 UUID / 流量比例的独立读回证据。用户当前设备尚未直接验收，以上浏览器结论限于 Mac mini。

替换前完整 public 快照及清单另存本机任务档案；Git 也保留旧源码 f7dcdf06aa54c296cc7c92d0b2197438e1fbef9f，可用于准确重建并重新发布旧站点。只回退完整静态快照，不删除共享资源或修改其他域名。本次未执行回退。
