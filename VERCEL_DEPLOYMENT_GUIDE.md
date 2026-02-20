# Vercel 部署指南 - 溶洞探秘游戏

## 🎯 目标

将游戏部署到 Vercel，获得永久有效的固定域名和二维码，任何人都可以扫码访问。

## 📋 前置准备

### 1. 注册 Vercel 账号
- 访问: https://vercel.com
- 使用 GitHub/GitLab/Bitbucket 账号登录（推荐）
- 或使用邮箱注册

### 2. 安装 Vercel CLI（可选）
```bash
npm install -g vercel
```

## 🚀 部署步骤

### 方案 A: 通过 GitHub 部署（推荐）

#### 步骤 1: 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 创建新仓库（可以是私有仓库）
3. 记下仓库地址

#### 步骤 2: 上传代码到 GitHub

```bash
cd cave-exploration-game

# 初始化 git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Cave Exploration Game"

# 添加远程仓库
git remote add origin https://github.com/你的用户名/你的仓库名.git

# 推送到 GitHub
git push -u origin main
```

#### 步骤 3: 在 Vercel 导入项目

1. 登录 Vercel: https://vercel.com/dashboard
2. 点击 "Add New..." → "Project"
3. 选择 "Import Git Repository"
4. 选择你的 GitHub 仓库
5. 点击 "Import"

#### 步骤 4: 配置项目

在 Vercel 配置页面：

**Framework Preset**: 选择 "Vite"

**Root Directory**: 输入 `frontend`

**Build Command**: 
```bash
npm run build
```

**Output Directory**: 
```bash
dist
```

**Install Command**:
```bash
npm install
```

#### 步骤 5: 配置环境变量

点击 "Environment Variables"，添加：

| Name | Value | 说明 |
|------|-------|------|
| `VITE_API_BASE_URL` | `https://你的后端地址/api` | 后端API地址（稍后配置） |

**注意**: 暂时可以留空，先部署前端，后面再配置后端。

#### 步骤 6: 部署

1. 点击 "Deploy" 按钮
2. 等待部署完成（通常 1-2 分钟）
3. 部署成功后，你会获得一个域名，例如：
   ```
   https://cave-exploration-game.vercel.app
   ```

### 方案 B: 通过 Vercel CLI 部署

#### 步骤 1: 登录 Vercel

```bash
vercel login
```

#### 步骤 2: 部署前端

```bash
cd cave-exploration-game/frontend

# 首次部署
vercel

# 按提示操作：
# - Set up and deploy? Yes
# - Which scope? 选择你的账号
# - Link to existing project? No
# - What's your project's name? cave-exploration-game
# - In which directory is your code located? ./
# - Want to override the settings? Yes
#   - Build Command: npm run build
#   - Output Directory: dist
#   - Development Command: npm run dev
```

#### 步骤 3: 获取域名

部署成功后，Vercel 会显示：
```
✅ Production: https://cave-exploration-game.vercel.app
```

## 🔧 后端部署

Vercel 主要用于前端，后端需要单独部署。有几个选择：

### 选项 1: Railway（推荐，免费）

1. 访问 https://railway.app
2. 使用 GitHub 登录
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择你的仓库
5. 配置：
   - Root Directory: `backend`
   - Start Command: `npm start`
6. 部署后获得后端地址，例如：
   ```
   https://cave-game-backend.up.railway.app
   ```

### 选项 2: Render（免费）

1. 访问 https://render.com
2. 创建 "New Web Service"
3. 连接 GitHub 仓库
4. 配置：
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. 获得后端地址

### 选项 3: Vercel Serverless Functions

将后端改造为 Serverless Functions（需要修改代码）。

## 🔗 连接前端和后端

### 步骤 1: 更新前端环境变量

在 Vercel 项目设置中：

1. 进入 "Settings" → "Environment Variables"
2. 添加或更新：
   ```
   VITE_API_BASE_URL = https://你的后端地址
   ```
3. 点击 "Save"

### 步骤 2: 重新部署前端

```bash
# 如果使用 GitHub，推送代码会自动部署
git push

# 或使用 CLI
cd frontend
vercel --prod
```

### 步骤 3: 配置后端 CORS

在后端 `src/index.js` 中，更新 CORS 配置：

```javascript
app.use(cors({
  origin: [
    'http://localhost:5174',
    'https://cave-exploration-game.vercel.app',  // 你的 Vercel 域名
    'https://你的自定义域名.com'  // 如果有自定义域名
  ],
  credentials: true
}));
```

## 📱 生成固定二维码

### 步骤 1: 确认游戏可访问

访问你的 Vercel 域名，确保游戏正常运行：
```
https://cave-exploration-game.vercel.app
```

### 步骤 2: 生成二维码

在本地运行：

```bash
cd cave-exploration-game
node generate-fixed-qrcode.js
```

输入你的 Vercel 域名：
```
请输入游戏地址: https://cave-exploration-game.vercel.app
```

### 步骤 3: 获得二维码文件

脚本会生成 3 个二维码文件：

1. `game-qrcode-small.png` (300x300) - 屏幕显示
2. `game-qrcode-medium.png` (500x500) - 普通打印
3. `game-qrcode-large.png` (1000x1000) - 高清打印

### 步骤 4: 使用二维码

- 打印二维码贴在展示区
- 分享二维码图片给朋友
- 任何人扫码都可以访问游戏
- **二维码永久有效！**

## 🌐 自定义域名（可选）

### 步骤 1: 购买域名

从域名注册商购买域名（如 Namecheap、GoDaddy、阿里云等）

### 步骤 2: 在 Vercel 添加域名

1. 进入项目 "Settings" → "Domains"
2. 输入你的域名，例如：`cave-game.com`
3. 点击 "Add"

### 步骤 3: 配置 DNS

在你的域名注册商处，添加 DNS 记录：

**A 记录**:
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME 记录**（如果使用子域名）:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 步骤 4: 等待生效

DNS 生效通常需要 5 分钟到 48 小时。

### 步骤 5: 重新生成二维码

使用你的自定义域名生成新的二维码：
```bash
node generate-fixed-qrcode.js
# 输入: https://cave-game.com
```

## ✅ 验证部署

### 1. 测试前端

访问你的域名，检查：
- ✅ 页面正常加载
- ✅ 登录功能正常
- ✅ 场景渲染正常

### 2. 测试后端连接

打开浏览器控制台（F12），检查：
- ✅ 没有 CORS 错误
- ✅ API 请求成功
- ✅ 数据正常返回

### 3. 测试二维码

- ✅ 用手机扫描二维码
- ✅ 能够打开游戏
- ✅ 游戏功能正常

## 🔄 更新部署

### 通过 GitHub（自动部署）

```bash
# 修改代码后
git add .
git commit -m "Update game"
git push

# Vercel 会自动检测并重新部署
```

### 通过 CLI

```bash
cd frontend
vercel --prod
```

## 📊 监控和分析

### Vercel Analytics

1. 进入项目 "Analytics"
2. 查看访问量、性能指标
3. 免费版有基础分析功能

### 查看部署日志

1. 进入 "Deployments"
2. 点击任意部署
3. 查看构建日志和运行时日志

## 💰 费用说明

### Vercel 免费版限制

- ✅ 100GB 带宽/月
- ✅ 无限部署
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 自定义域名

对于小型游戏完全够用！

### 升级选项

如果需要更多资源：
- Pro 版: $20/月
- 更多带宽和功能

## 🐛 常见问题

### Q1: 部署失败怎么办？

**A**: 检查构建日志：
1. 进入 "Deployments"
2. 点击失败的部署
3. 查看错误信息
4. 常见问题：
   - 依赖安装失败 → 检查 package.json
   - 构建命令错误 → 检查 vite.config.js
   - 环境变量缺失 → 添加必要的环境变量

### Q2: API 请求失败？

**A**: 检查：
1. 后端是否正常运行
2. CORS 配置是否正确
3. 环境变量 `VITE_API_BASE_URL` 是否正确
4. 后端地址是否可访问

### Q3: 二维码扫描后无法访问？

**A**: 确认：
1. Vercel 域名是否可访问
2. 是否使用 HTTPS（Vercel 自动提供）
3. 手机网络是否正常

### Q4: 如何回滚到之前的版本？

**A**: 
1. 进入 "Deployments"
2. 找到之前的成功部署
3. 点击 "..." → "Promote to Production"

### Q5: 自定义域名不生效？

**A**: 
1. 检查 DNS 配置是否正确
2. 等待 DNS 传播（最多 48 小时）
3. 使用 https://dnschecker.org 检查 DNS 状态

## 📞 获取帮助

- Vercel 文档: https://vercel.com/docs
- Vercel 社区: https://github.com/vercel/vercel/discussions
- Railway 文档: https://docs.railway.app

## 🎉 完成！

恭喜！你的游戏已经成功部署到云端，获得了永久有效的固定二维码。

**下一步**:
1. 分享二维码给朋友
2. 打印二维码贴在展示区
3. 享受游戏带来的乐趣！

---

**提示**: 记得保存你的 Vercel 域名和二维码文件！
