# MyAINote - Vue 前端

这是一个用 Vue (Vite) 编写的前端小应用，用来展示当天与 AI / 大模型 相关的最热资讯摘要（按时间倒序），仅展示中文摘要（可选使用翻译服务翻译）。

运行

1. 安装依赖

```bash
npm install
```

2. 本地开发

```bash
npm run dev
```

3. 构建与预览

```bash
npm run build
npm run preview
```

翻译服务（可选）

- 若想自动翻译标题/摘要为中文，可在部署环境中设置 `VITE_TRANSLATE_API` 环境变量为支持的翻译 API，格式为 POST JSON `{ q, source, target }`，并返回 `translatedText` 或 `result` 字段。

说明

- 数据源：Hacker News (Algolia API) 与 Reddit（r/MachineLearning、r/ArtificialIntelligence）
- 仅展示摘要（默认使用标题或自带摘要），可以逐条点击「翻译为中文」按钮以使用翻译 API 将摘要翻成中文。
- 页面采用暗色科技风并支持手动 / 自动刷新（默认每 2 分钟）。

如果你希望我：
- 把此项目部署到 Vercel（我可以添加 `vercel.json` 并配置自动部署）；或
- 使用服务器端聚合和自动翻译（在 Vercel Serverless 函数里调用翻译 API），

请告诉我下一步要实现的目标。