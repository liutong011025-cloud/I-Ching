# 易经 E-Guide

一个支持中文、英文的《易经》文化介绍与三币起卦网站。首页介绍阴阳、八卦与起卦方法，`/consult` 提供系统投币、手动录入、六爻进度、本卦与变卦、AI 解读和水墨意境图。

## 本地运行

建议 Node.js 24。安装原项目依赖后运行：

```sh
npm install
npm run dev
```

构建与检查：

```sh
npm run typecheck
npm test
npm run build
# 若本机 Turbopack 无法启动子进程，可使用：
node node_modules/next/dist/bin/next build --webpack
```

## GitHub 与 Vercel

沿用既有 GitHub 仓库和 Vercel 项目。将本分支作为预览版本，确认后合并至原有生产分支。不要创建另一套托管账户。构建命令仍为 `npm run build`，框架为 Next.js。

在原 Vercel 项目的 Environment Variables 配置以下服务端变量，并按需分别勾选 Preview、Production：

- `DIFY_API_KEY`：Dify 应用 API Key。
- `DIFY_API_BASE`：可选，默认 `https://api.dify.ai/v1`。
- `ARK_API_KEY`：火山方舟 API Key。
- `ARK_API_BASE`：可选，默认 `https://ark.cn-beijing.volces.com/api/v3`。
- `SEEDREAM_MODEL_ID`：可选，已开通的图片模型或推理接入点。

新版本仅在服务端兼容旧 `NEXT_PUBLIC_DIFY_API_KEY` 与 `NEXT_PUBLIC_DIFY_API_BASE`，方便过渡。配置新的 `DIFY_*` 后，应删除旧公开变量并重新部署。

**本仓库此前追踪过 `.env.local`。本版本将其移出追踪，但这不会清除 Git 历史中的内容。请到 Dify 和火山方舟后台撤销、轮换已经公开的密钥，再更新 Vercel 变量。不要将真实密钥提交到仓库。** 本地从 `.env.example` 新建被忽略的 `.env.local`。

## 图片生成引擎与逻辑

图片由火山方舟 ModelArk 的 `POST /images/generations` 生成，模型为豆包 Seedream 系列。它和文字解读服务是两条独立请求。

1. 完成六轮起卦，浏览器向同源 `/api/generate-hexagram-image` 发送问题、卦序、语言。
2. 服务端验证输入，再从内置六十四卦取可信资料。
3. 提示词结合问题中的具体事物、卦象意象与传统水墨美学，要求无文字、无水印、3:4 竖幅。3:4 是提示词要求，接口使用 `size: '2K'`，并非硬性指定长宽。
4. 优先使用 `SEEDREAM_MODEL_ID`；未指定时依次尝试 `doubao-seedream-5-0-lite-260128`、`doubao-seedream-5-0-260128`、`doubao-seedream-4-0-250828`。只在模型不存在或未开通时切换，鉴权或安全拒绝不切模型。
5. 请求单图、`response_format: 'url'`、`stream: false`、`watermark: false`。返回的 HTTPS 图像地址通过校验后才送回浏览器。
6. 图片可保存到设备或通过系统分享。下载代理限制为 4 MiB，超过时可打开原图自行保存。

单次图片请求超时为45秒，总截止为100秒。明确的429/502/503/504最多重试一次；超时不会自动重发，以降低重复生成的可能。服务商仍可能对已接受的请求计费。

成功的图文在当前标签页缓存20分钟；同一生成中的请求合并，避免组件重挂载、返回页面或中英切换重复生图。文字按语言分别缓存。显式重新生成会清除对应图片缓存。

文字解读走 `/api/interpret-hexagram`，在服务端调用 Dify 的 `chat-messages`。**具体文字模型由 Dify 应用配置，仓库没有指定。** 没有可用服务时显示本地化的预置卦象导读，并明确标识，图片区域提供重试。

## 设计与手机体验

- 墨黑、暗金为主，配合纸白、陶土与苔绿。
- 自绘可缩放六爻标志，桌面导航与手机折叠菜单。
- 八卦色块支持点击、触摸与键盘，详情随选择变色。
- 系统投币时钱币翻转、整页短促晃动；支持的手机提供轻触感。系统开启减少动态效果时停止晃动和触感。
- 同一标签页暂存问题和已确认进度，重新开始会清除。没有账户或云端历史记录。
- 首页使用本地 WebP 资源，保留原始照片供溯源。两张显示资源合计远小于原图下载体积。

## 资料与图像

真实藏品图像的来源、授权、署名和裁切说明见 [`public/images/credits.json`](public/images/credits.json)。

- 《夏山图》（局部），传屈鼎，约1050年，大都会艺术博物馆，CC0/公共领域。
- 《周易本义》书页（局部），东京大学综合图书馆鴎外文库，公共领域。
- 基础内容参考斯坦福哲学百科与哥伦比亚大学教学材料，网站内提供原始来源链接。

卦象导读为现代简述，AI 内容不作为经典原文。此项目用于文化探索、娱乐与个人思考，随机卦象不具有预测效力。
