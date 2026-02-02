# MyAINote
AI前沿时讯

这是一个轻量的 Web 应用，用来展示当天最火的与 AI 相关的技术、文章与项目（仅摘要）。

## 运行

1. 安装依赖

```bash
npm install
```

2. 启动

```bash
npm start
```

3. 打开浏览器访问 `http://localhost:3000`

---

部署到 Vercel（推荐）

1. 通过 Vercel 网站将此仓库连接到你的 GitHub/GitLab/Bitbucket，然后在发布到 `main` 分支后会自动部署。
2. 或在本地使用 Vercel CLI：

```bash
npm i -g vercel
vercel login
vercel --prod
```

说明：后端逻辑已移植为 Vercel 的无服务器函数 `api/trending.js`，访问接口为 `GET /api/trending`。函数已配置为 Node 18 运行时，并为 CDN 设置了缓存头（s-maxage=300）。如需更长缓存或接入私有 API，请设置环境变量并在 `vercel` 仪表盘中配置。

提示：如果需要接入更多数据源（如 RSS、新闻 API 或全文摘要服务），可以在 `server.js` 中扩展抓取逻辑并把文章内容用更高级的摘要服务处理。欢迎提需求，我可以帮你接入特定来源或部署到云。

## 排查 404（Vercel）

如果部署后访问根页面（`/`）出现 Vercel 的 `404 NOT_FOUND`：

- 检查部署的「Build Logs」是否有错误（Vercel 仪表盘 → Deployments → 选择最近一次 → View Build Logs）。
- 检查 `public/index.html` 是否被提交并出现在部署记录中（该项目使用 `public` 目录托管静态文件）。
- 确保 `vercel.json` 包含 `builds` 与 `routes`，并且 `api/trending.js` 在仓库中（已包含，若没有请确认 commit 和 push）。
- 使用 CLI 查看实时日志：

```bash
vercel logs <deployment-url> --since 1h
```

- 如果你看到 Vercel 试图以传统 Node 服务器启动（而非无服务器函数 + 静态），可把 `server.js` 排除（已添加 `.vercelignore`）或删除不必要的 `start` 脚本。

如果你愿意，把出错的部署 URL 发给我或把 Build Logs 的错误信息贴上来，我可以直接看日志并定位问题并提交修复。