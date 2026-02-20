# 固定二维码生成指南

## 目标
生成一个固定的二维码,任何人扫码都可以访问游戏,不受局域网限制。

## 三种方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **云服务器部署** | 永久有效、稳定、专业 | 需要部署 | 正式使用、长期运营 |
| **内网穿透** | 快速、无需部署 | 临时地址、速度较慢 | 测试、演示 |
| **局域网** | 简单、免费 | 仅限同一WiFi | 内部使用 |

---

## 方案 1: 云服务器部署 (推荐)

### 为什么推荐?
- ✅ 获得固定的公网域名
- ✅ 二维码永久有效
- ✅ 任何人任何地方都可以访问
- ✅ 访问速度快
- ✅ 专业、稳定

### 步骤 1: 选择部署平台

#### 选项 A: Vercel (最简单,推荐)

**特点**:
- 完全免费
- 自动 HTTPS
- 全球 CDN 加速
- 自动部署

**步骤**:
1. 注册 Vercel: https://vercel.com
2. 安装 Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. 部署前端:
   ```bash
   cd cave-exploration-game/frontend
   vercel
   ```
4. 按提示操作,获得域名如: `https://cave-game.vercel.app`

**注意**: Vercel 主要用于前端,后端需要另外部署或使用 Serverless Functions。

#### 选项 B: Netlify

**特点**:
- 免费
- 拖拽上传
- 自动 HTTPS

**步骤**:
1. 注册 Netlify: https://netlify.com
2. 点击 "Add new site" → "Deploy manually"
3. 拖拽 `frontend` 文件夹
4. 获得域名如: `https://cave-game.netlify.app`

#### 选项 C: Railway (前后端都支持)

**特点**:
- 支持前后端
- 免费额度
- 自动部署

**步骤**:
1. 注册 Railway: https://railway.app
2. 创建新项目
3. 部署前端和后端
4. 获得域名

#### 选项 D: 自己的服务器

如果你有自己的服务器(阿里云、腾讯云等):
1. 上传代码到服务器
2. 安装 Node.js
3. 运行前端和后端
4. 配置域名和 Nginx

### 步骤 2: 生成固定二维码

部署完成后,运行:

```bash
cd cave-exploration-game
node generate-fixed-qrcode.js
```

输入你的游戏地址,例如:
```
https://cave-game.vercel.app
```

会生成三个尺寸的二维码:
- `game-qrcode-small.png` (300x300) - 屏幕显示
- `game-qrcode-medium.png` (500x500) - 普通打印
- `game-qrcode-large.png` (1000x1000) - 高清打印

### 步骤 3: 使用二维码

- 打印二维码贴在展示区
- 分享二维码图片
- 在网站上展示
- 任何人扫码都可以访问

---

## 方案 2: 内网穿透 (快速测试)

### 什么是内网穿透?
将你本地的游戏服务器暴露到公网,获得一个临时的公网地址。

### 工具选择

#### 选项 A: ngrok (推荐,最简单)

**步骤**:

1. **下载 ngrok**:
   - 访问: https://ngrok.com
   - 注册并下载

2. **启动游戏服务器**:
   ```bash
   # 终端 1 - 后端
   cd cave-exploration-game/backend
   npm start

   # 终端 2 - 前端
   cd cave-exploration-game/frontend
   npm run dev
   ```

3. **启动 ngrok**:
   ```bash
   # 终端 3 - 穿透前端
   ngrok http 5174
   ```

4. **获取公网地址**:
   ngrok 会显示:
   ```
   Forwarding  https://abc123.ngrok.io -> http://localhost:5174
   ```

5. **生成二维码**:
   ```bash
   node generate-fixed-qrcode.js
   ```
   输入: `https://abc123.ngrok.io`

**注意**:
- 免费版地址会变化(每次重启)
- 付费版可以获得固定域名
- 速度可能较慢

#### 选项 B: frp (开源,需要服务器)

如果你有自己的服务器,可以使用 frp:
- 下载: https://github.com/fatedier/frp
- 配置服务端和客户端
- 获得固定域名

#### 选项 C: Cloudflare Tunnel (免费)

**步骤**:
1. 安装 cloudflared:
   ```bash
   npm install -g cloudflared
   ```

2. 启动隧道:
   ```bash
   cloudflared tunnel --url http://localhost:5174
   ```

3. 获得公网地址并生成二维码

---

## 方案 3: 局域网 (仅限同一WiFi)

如果只需要在同一WiFi下使用:

1. **获取局域网地址**:
   ```bash
   node enable-mobile-access.js
   ```

2. **生成二维码**:
   ```bash
   node generate-qrcode.js
   ```

3. **限制**: 只有连接同一WiFi的设备可以访问

---

## 推荐方案总结

### 场景 1: 正式使用、长期运营
**推荐**: Vercel / Netlify 部署
- 获得固定域名
- 二维码永久有效
- 专业稳定

### 场景 2: 快速测试、临时演示
**推荐**: ngrok 内网穿透
- 5分钟搞定
- 获得临时公网地址
- 适合演示

### 场景 3: 内部使用、小范围
**推荐**: 局域网访问
- 最简单
- 无需部署
- 仅限同一WiFi

---

## 完整部署教程 (Vercel)

### 步骤 1: 准备代码

1. **创建 GitHub 仓库**:
   - 在 GitHub 创建新仓库
   - 上传游戏代码

2. **配置前端**:
   - 确保 `frontend/package.json` 有 build 脚本
   - 配置 API 地址

### 步骤 2: 部署到 Vercel

1. **连接 GitHub**:
   - 登录 Vercel
   - 点击 "Import Project"
   - 选择你的 GitHub 仓库

2. **配置项目**:
   - Framework: Vite
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: dist

3. **部署**:
   - 点击 "Deploy"
   - 等待部署完成
   - 获得域名: `https://your-game.vercel.app`

### 步骤 3: 部署后端

**选项 A**: 使用 Vercel Serverless Functions
**选项 B**: 部署到 Railway / Render
**选项 C**: 使用自己的服务器

### 步骤 4: 生成固定二维码

```bash
node generate-fixed-qrcode.js
```

输入: `https://your-game.vercel.app`

### 步骤 5: 分发二维码

- 打印二维码
- 分享图片
- 任何人扫码即可玩

---

## 常见问题

### Q: 部署后后端API无法访问?
**A**: 需要配置CORS和API地址:
1. 后端允许跨域访问
2. 前端配置正确的API地址

### Q: 免费部署有限制吗?
**A**: 
- Vercel: 每月100GB带宽
- Netlify: 每月100GB带宽
- 对于小型游戏完全够用

### Q: 可以使用自己的域名吗?
**A**: 可以!
- Vercel/Netlify 都支持自定义域名
- 在设置中添加你的域名
- 配置DNS解析

### Q: 内网穿透的地址会变吗?
**A**: 
- ngrok 免费版: 每次重启会变
- ngrok 付费版: 固定域名
- frp: 可以配置固定域名

### Q: 部署需要多长时间?
**A**: 
- Vercel/Netlify: 5-10分钟
- ngrok: 1分钟
- 自己服务器: 30分钟-1小时

---

## 总结

### 最简单的方案
1. 部署到 Vercel (10分钟)
2. 运行 `node generate-fixed-qrcode.js`
3. 输入 Vercel 给的域名
4. 获得固定二维码
5. 任何人扫码即可玩

### 最快的方案
1. 下载 ngrok (1分钟)
2. 运行 `ngrok http 5174`
3. 运行 `node generate-fixed-qrcode.js`
4. 输入 ngrok 给的地址
5. 获得临时二维码

选择最适合你的方案,开始使用固定二维码吧! 🎉
