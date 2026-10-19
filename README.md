# 纸间 · Paper Room

[打开打字机](https://typewriter.paws.rodeo/) · [制作档案](https://typewriter.paws.rodeo/archive) · [视频拆解](https://typewriter.paws.rodeo/breakdown/)

可以真正输入文字的机械打字机网页，使用 Blender 渲染的独立导轨、滑块、灯臂和七档灯头素材。

## 内容

- `public/`：无需构建的 HTML、CSS、JavaScript 和全部网页素材。
- `public/archive.html`：七项任务的制作展示与原视频对照。
- `public/breakdown/`：三步原流程、十二个带时间的关键节点及历史任务草案。
- `blender/`：原创建模、渲染脚本及资产坐标清单；生成文件写入 `blender/generated/`。
- `wrangler.jsonc`：Cloudflare Workers Static Assets 部署配置。

## 本地运行

需要 Node.js 22 或更新版本。

```sh
npm ci
npm run dev
```

也可以通过任意静态 HTTP 服务打开 `public/`。

## 发布

```sh
npm ci
npx wrangler login
npm run deploy
```

部署使用当前 Cloudflare 账户。只上传 `public/`；GitHub 推送不会自动触发部署。首次部署结果见 DEPLOYMENT.md。

## 重新生成 Blender 素材

脚本面向 Blender 4.5 LTS；Python 是 Blender 原生 API 的运行语言。

```sh
blender --background --python blender/build-scene.py
blender --background --python blender/build-scene.py -- --render
```

第一条生成可编辑几何工程；第二条还生成透明 PNG、合成工程与资产清单。网页已经包含导出的 WebP，不需要安装 Blender 即可运行。部署整理只调整脚本的输出路径，未重新执行建模和渲染。

## 行为与边界

支持中文组合输入、屏幕键盘、光标/滑块/灯头联动、台灯开关、字数上限、草稿自动保存和文字导出。草稿保存在当前浏览器的 localStorage，域名改变不会自动迁移草稿。

此前完成浏览器交互与三种视口检查；真实 iOS/Android 设备仍未验收，视觉还原保留用户反馈。

## 来源

参考七的三次方[原视频](https://www.douyin.com/video/7697547042670791962)，视频中提及 Jerry Nkongolo 的创作灵感。截图仅作研究对照；机械模型与渲染素材为本项目原创实现。原作者工程未公开，当前效果并非逐像素复刻。
