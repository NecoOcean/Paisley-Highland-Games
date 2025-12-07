# Cloudflare 全栈部署指南

本指南详细介绍如何将 Paisley Highland Games 项目完整部署到 Cloudflare 平台（Pages + Workers + D1）。

## 目录

- [架构概述](#架构概述)
- [前置条件](#前置条件)
- [第一步：安装 Wrangler CLI](#第一步安装-wrangler-cli)
- [第二步：创建 D1 数据库](#第二步创建-d1-数据库)
- [第三步：部署 Workers API](#第三步部署-workers-api)
- [第四步：部署前端到 Pages](#第四步部署前端到-pages)
- [第五步：配置环境变量](#第五步配置环境变量)
- [本地开发](#本地开发)
- [常见问题](#常见问题)

---

## 架构概述

```
┌─────────────────────────────────────────────────────────────┐
│                      Cloudflare Edge                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────┐         ┌─────────────────────────┐  │
│   │ Cloudflare      │         │ Cloudflare Workers      │  │
│   │ Pages           │────────▶│ (API)                   │  │
│   │ (React 前端)    │         │                         │  │
│   │                 │         │   ┌─────────────────┐   │  │
│   │ paisley-        │         │   │ Cloudflare D1   │   │  │
│   │ highland-       │         │   │ (SQLite)        │   │  │
│   │ games.pages.dev │         │   └─────────────────┘   │  │
│   └─────────────────┘         └─────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| 组件 | 技术 | 说明 |
|------|------|------|
| **前端** | Cloudflare Pages | React SPA，全球 CDN 分发 |
| **后端** | Cloudflare Workers | Hono 框架，边缘计算 |
| **数据库** | Cloudflare D1 | 无服务器 SQLite |
| **认证** | JWT (jose) | 无状态令牌认证 |

---

## 前置条件

- [Node.js](https://nodejs.org/) 18+
- [Cloudflare 账号](https://dash.cloudflare.com/sign-up)（免费）
- [Git](https://git-scm.com/)

---

## 第一步：安装 Wrangler CLI

Wrangler 是 Cloudflare 的官方 CLI 工具。

```bash
# 全局安装
npm install -g wrangler

# 验证安装
wrangler --version

# 登录 Cloudflare
wrangler login
```

登录后，浏览器会打开授权页面，点击 "Allow" 完成授权。

---

## 第二步：创建 D1 数据库

### 2.1 创建数据库

```bash
cd workers

# 创建 D1 数据库
wrangler d1 create paisley-highland-games-db
```

命令执行后会输出类似：

```
✅ Successfully created DB 'paisley-highland-games-db'

[[d1_databases]]
binding = "DB"
database_name = "paisley-highland-games-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2.2 更新配置

复制输出的 `database_id`，更新 `workers/wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "paisley-highland-games-db"
database_id = "你的数据库ID"  # 替换这里
```

### 2.3 执行数据库迁移

```bash
# 创建表结构（远程）
wrangler d1 execute paisley-highland-games-db --remote --file=./migrations/0001_init.sql

# 生成种子数据
node scripts/generate-seed.js > migrations/0002_seed_generated.sql

# 导入种子数据（远程）
wrangler d1 execute paisley-highland-games-db --remote --file=./migrations/0002_seed_generated.sql
```

> **注意**：使用 `--remote` 标志来操作生产数据库，不带此标志则操作本地数据库。

---

## 第三步：部署 Workers API

### 3.1 安装依赖

```bash
cd workers
npm install
```

### 3.2 配置 JWT 密钥

在 Cloudflare Dashboard 中设置 JWT_SECRET：

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → 选择你的 Worker
3. 点击 **Settings** → **Variables**
4. 添加变量：
   - 名称：`JWT_SECRET`
   - 值：生成一个强随机字符串（建议 32+ 字符）
   - 类型：选择 **Encrypt**（加密）

或者使用 CLI：

```bash
wrangler secret put JWT_SECRET
# 按提示输入你的密钥
```

### 3.3 部署

```bash
# 部署到 Cloudflare
wrangler deploy
```

部署成功后，会显示 Worker URL：

```
Published paisley-highland-games-api
  https://paisley-highland-games-api.YOUR_SUBDOMAIN.workers.dev
```

**记录这个 URL**，后续配置前端需要使用。

### 3.4 验证部署

```bash
# 测试 API 健康检查
curl https://paisley-highland-games-api.YOUR_SUBDOMAIN.workers.dev/api/health
```

应该返回：

```json
{"status":"ok","timestamp":"...","environment":"production"}
```

---

## 第四步：部署前端到 Pages

### 方式一：通过 Cloudflare Dashboard（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → **Create application** → **Pages**
3. 选择 **Connect to Git**
4. 授权并选择你的 GitHub 仓库
5. 配置构建设置：

| 配置项 | 值 |
|--------|-----|
| Project name | `paisley-highland-games` |
| Production branch | `main` |
| Framework preset | `Vite` |
| Root directory | `frontend` |
| Build command | `npm run build` |
| Build output directory | `dist` |

6. 展开 **Environment variables**，添加：

| 变量名 | 值 |
|--------|-----|
| `VITE_API_URL` | `https://paisley-highland-games-api.YOUR_SUBDOMAIN.workers.dev/api` |

7. 点击 **Save and Deploy**

### 方式二：通过 CLI

```bash
cd frontend

# 设置环境变量
export VITE_API_URL=https://paisley-highland-games-api.YOUR_SUBDOMAIN.workers.dev/api

# 构建
npm run build

# 部署（首次需要创建项目）
wrangler pages deploy dist --project-name=paisley-highland-games
```

---

## 第五步：配置环境变量

### Workers 环境变量

| 变量名 | 说明 | 设置方式 |
|--------|------|----------|
| `JWT_SECRET` | JWT 签名密钥 | Dashboard 或 `wrangler secret put` |
| `ENVIRONMENT` | 环境标识 | wrangler.toml 中配置 |

### Pages 环境变量

| 变量名 | 说明 | 设置位置 |
|--------|------|----------|
| `VITE_API_URL` | Workers API 地址 | Dashboard → Pages → Settings → Environment variables |

---

## 本地开发

### 启动 Workers 本地开发服务器

```bash
cd workers

# 安装依赖
npm install

# 初始化本地数据库
wrangler d1 execute paisley-highland-games-db --local --file=./migrations/0001_init.sql
node scripts/generate-seed.js > migrations/0002_seed_generated.sql
wrangler d1 execute paisley-highland-games-db --local --file=./migrations/0002_seed_generated.sql

# 启动开发服务器（端口 8787）
npm run dev
```

### 启动前端开发服务器

```bash
cd frontend

# 安装依赖
npm install

# 创建本地环境变量文件
cp .env.example .env.local
# 编辑 .env.local，设置：
# VITE_API_URL=http://localhost:8787/api

# 启动开发服务器（端口 5173）
npm run dev
```

### 同时运行原有后端（可选）

如果你想继续使用原有的 Express 后端进行开发：

```bash
cd backend
npm install
npm run seed
npm run dev  # 端口 3001
```

前端环境变量设置为 `VITE_API_URL=http://localhost:3001/api`

---

## 配置自定义域名

### Workers 自定义域名

1. 进入 Cloudflare Dashboard → Workers & Pages → 选择 Worker
2. 点击 **Triggers** → **Custom Domains**
3. 添加域名（如 `api.example.com`）
4. 按提示配置 DNS

### Pages 自定义域名

1. 进入 Cloudflare Dashboard → Workers & Pages → 选择 Pages 项目
2. 点击 **Custom domains**
3. 添加域名（如 `www.example.com`）
4. 按提示配置 DNS

---

## 项目结构

改造后的项目结构：

```
Paisley-Highland-Games/
├── backend/                 # 原有 Express 后端（保留用于本地开发）
│   └── ...
├── frontend/                # React 前端
│   ├── .env.example         # 环境变量示例
│   └── ...
├── workers/                 # Cloudflare Workers API（新增）
│   ├── package.json
│   ├── wrangler.toml        # Workers 配置
│   ├── migrations/
│   │   ├── 0001_init.sql    # 数据库 Schema
│   │   └── 0002_seed.sql    # 种子数据模板
│   ├── scripts/
│   │   └── generate-seed.js # 种子数据生成脚本
│   └── src/
│       ├── index.js         # Worker 入口
│       ├── middleware/
│       │   └── auth.js      # 认证中间件
│       ├── routes/          # API 路由
│       │   ├── auth.js
│       │   ├── events.js
│       │   ├── competitors.js
│       │   ├── registrations.js
│       │   ├── announcements.js
│       │   ├── contact.js
│       │   └── results.js
│       └── utils/
│           ├── password.js  # 密码哈希（PBKDF2）
│           └── jwt.js       # JWT 工具
└── DEPLOYMENT.md            # 本文件
```

---

## 技术改造说明

### 原有后端 vs Workers

| 方面 | 原有后端 | Workers |
|------|----------|---------|
| 框架 | Express.js | Hono |
| 数据库 | better-sqlite3 | Cloudflare D1 |
| 密码哈希 | bcryptjs | Web Crypto (PBKDF2) |
| JWT | jsonwebtoken | jose |
| 运行时 | Node.js | Cloudflare Workers (V8) |
| API 端点 | 完全一致 | 完全一致 |

### 密码哈希兼容性

由于 Workers 环境不支持 bcrypt（需要原生模块），改用 Web Crypto API 的 PBKDF2 算法。

**重要**：如果你从原有后端迁移现有用户数据，需要让用户重新设置密码。

---

## 常见问题

### Q1: 部署后 API 请求返回 CORS 错误

**解决方案**：

1. 检查 Workers 代码中 CORS 配置是否包含你的 Pages 域名
2. 编辑 `workers/src/index.js`，在 `allowedOrigins` 中添加你的域名：

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://paisley-highland-games.pages.dev',  // 添加你的 Pages 域名
  'https://www.yourdomain.com',  // 自定义域名
];
```

3. 重新部署 Worker

### Q2: 数据库操作失败

**检查项**：

1. 确认 `wrangler.toml` 中的 `database_id` 正确
2. 确认已执行数据库迁移
3. 查看 Worker 日志：
   ```bash
   wrangler tail
   ```

### Q3: JWT 验证失败

**检查项**：

1. 确认已设置 `JWT_SECRET` 环境变量
2. 使用 Dashboard 检查 Secret 是否正确设置
3. 重新设置：
   ```bash
   wrangler secret put JWT_SECRET
   ```

### Q4: 本地开发数据库为空

**解决方案**：

```bash
cd workers

# 重新初始化本地数据库
wrangler d1 execute paisley-highland-games-db --local --file=./migrations/0001_init.sql
node scripts/generate-seed.js > migrations/0002_seed_generated.sql
wrangler d1 execute paisley-highland-games-db --local --file=./migrations/0002_seed_generated.sql
```

### Q5: 页面刷新返回 404

**解决方案**：

确保 `frontend/public/_redirects` 文件存在：

```
/*    /index.html   200
```

---

## 免费额度说明

Cloudflare 免费层限制：

| 服务 | 免费额度 |
|------|----------|
| **Workers** | 100,000 请求/天 |
| **D1** | 5GB 存储，500万行读取/天，10万行写入/天 |
| **Pages** | 无限站点，500 次构建/月 |

对于中小型项目，免费额度完全足够。

---

## 部署检查清单

- [ ] Wrangler CLI 已安装并登录
- [ ] D1 数据库已创建
- [ ] `wrangler.toml` 中 database_id 已更新
- [ ] 数据库迁移已执行（schema + seed）
- [ ] JWT_SECRET 已设置
- [ ] Workers 已部署
- [ ] Pages 项目已创建
- [ ] VITE_API_URL 环境变量已设置
- [ ] 前端已部署
- [ ] CORS 配置正确
- [ ] API 健康检查通过
- [ ] 登录功能测试通过

---

## 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Hono 框架文档](https://hono.dev/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

---

## 演示账户

部署并执行种子数据后，可使用以下账户：

| 邮箱 | 密码 | 角色 |
|------|------|------|
| admin@paisleyhighlandgames.com | admin123 | admin |
| john@example.com | user123 | competitor |
| mary@example.com | user123 | competitor |
| visitor@example.com | user123 | user |
