# 纸间 · Paper Room

一台可以真正写字的网页打字机。点一下纸面，滑块就会跟着字走。按回车，纸面向上送进一行，滑块回到行首。左上角的台灯随着光标转向，也可以随手关掉。

[在线写字](https://typewriter.paws.rodeo/) · [手机直达](https://typewriter.paws.rodeo/mobile) · [制作档案](https://typewriter.paws.rodeo/archive) · [原片拆解](https://typewriter.paws.rodeo/breakdown/)

<img src="public/archive-assets/materials-board.jpg" width="900" alt="纸间的 Blender 材质板，上方是固定灯臂下三种灯头转角，下方是金属导轨与绿色滑块">

## 纸上的细节

- **字头跟着光标走。** 纸面是一块真正可编辑的文本区。浏览器处理选字、粘贴和输入法，网页用一层镜像文字测出折行后的光标位置，再带动滑块和纸面。点击「中文」可以切换到系统键盘。[输入与机械联动](public/app.js)
- **灯臂固定，灯头有自己的转轴。** 鼠尾草绿烤漆灯罩、黄铜接头和拉丝金属导轨用 Blender 建模，再从同一机位渲染。导轨、滑块、灯臂和灯头可独立叠放。灯头有七个角度，每个角度分别渲染亮灯和熄灯状态。[建模脚本](blender/build-scene.py) · [图层与转轴](public/assets/manifest.json)
- **暖光从灯罩开口投到纸面。** 浏览器按光标方向选择最接近的渲染角度，再绕同一枢轴补上小幅转动。光束随灯口的位置变化，边缘在纸面上逐渐淡出。[灯光实现](public/lamp.js)

草稿保存在当前浏览器，写完可以导出为 UTF-8 文本。桌面上的「手机体验」可显示二维码，手机打开后进入全屏版，设备间各自保留草稿。

## 本地运行

使用 Node.js 22 或更新版本。在工程根目录运行以下命令，再打开终端显示的本地地址。

```sh
npm ci
npm run dev
```

`public/` 包含可直接由 HTTP 服务托管的 HTML、CSS、JavaScript 与 WebP 素材。本地开发命令也会读取 [`public/_redirects`](public/_redirects)，可直接体验 `/mobile` 路由。

有 Blender 4.5 LTS 时，可在工程根目录重新生成可编辑场景和透明 PNG。生成结果写入 `blender/generated/`，页面已附带可直接使用的 WebP 素材；如需替换网页中的图层素材，请将新生成的 PNG 转为 WebP 并同步更新 `public/assets/`。

```sh
blender --background --python blender/build-scene.py
blender --background --python blender/build-scene.py -- --render
```

[资源导出脚本](blender/render-assets.py) · [手机二维码脚本](scripts/generate-mobile-qr.mjs) · [部署说明](DEPLOYMENT.md)

## 制作与验证

从 22 秒原片提取 12 个带时间的观察节点，先锁定编辑态与收键盘态的构图，再拆出 Blender 部件与网页交互。制作档案可以切换两种状态，查看实际成品与原片的差异。[12 个观察节点](https://typewriter.paws.rodeo/breakdown/) · [原片与成品对照](https://typewriter.paws.rodeo/archive)

已有桌面浏览器和窄屏视口的输入、中文组合、灯光、草稿恢复及文本导出记录。手机原生输入法的真机验收和后续方向键修正的浏览器交互回归尚待完成。[验证与发布记录](DEPLOYMENT.md)

## 灵感来源

参考七的三次方的公开视频，视频中提及 Jerry Nkongolo 的创作灵感。本项目独立制作了机械几何、材质和网页交互，原片帧用于研究对照。[原视频](https://www.douyin.com/video/7697547042670791962)
