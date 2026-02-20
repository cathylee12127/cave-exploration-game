# 快速部署到 Vercel - 5 分钟搞定！

## 🚀 最简单的部署方法

### 方法 1: 通过 Vercel 网站（最简单，推荐）

#### 1️⃣ 准备代码

确保你的代码在 GitHub 上（如果还没有）：

```bash
cd cave-exploration-game

# 初始化 git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Ready for Vercel deployment"

# 创建 GitHub 仓库并推送
# 访问 https://github.com/new 创建仓库
# 然后运行：
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

#### 2️⃣ 部署到 Vercel

1. **访问**: https://vercel.com/new
2. **登录**: 使用 GitHub 账号登录
3. **导入**: 选择你的 GitHub 仓库
4. **配置**:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **点击 Deploy**

等待 1-2 分钟，完成！

#### 3️⃣ 获取域名

部署成功后，你会看到：
```
🎉 https://cave-exploration-game.vercel.app
```

这就是你的游戏地址！

#### 4️⃣ 生成二维码

在本地运行：
```bash
node generate-fixed-qrcode.js
```

输入你的 Vercel 域名：
```
请输入游戏地址: https://cave-exploration-game.vercel.app
```

完成！你会得到 3 个二维码文件。

---

### 方法 2: 通过命令行（适合开发者）

#### 1️⃣ 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2️⃣ 登录

```bash
vercel login
```

#### 3️⃣ 部署

```bash
cd cave-exploration-game/frontend
vercel
```

按提示操作，完成！

---

## ⚠️ 重要提示

### 关于后端

Vercel 主要用于前端。后端有两个选择：

#### 选项 A: 暂时使用前端静态数据（最简单）

如果只是展示和测试，可以暂时不部署后端。游戏会使用本地数据。

#### 选项 B: 部署后端到 Railway（推荐）

1. 访问 https://railway.app
2. 使用 GitHub 登录
3. 选择 "Deploy from GitHub repo"
4. 选择你的仓库
5. Root Directory: `backend`
6. 部署完成后获得后端地址

然后在 Vercel 添加环境变量：
- Name: `VITE_API_BASE_URL`
- Value: `https://你的railway地址`

---

## 📱 测试二维码

1. 用手机扫描生成的二维码
2. 应该能打开游戏
3. 任何人都可以扫码访问！

---

## 🎯 完整流程总结

```
1. 代码推送到 GitHub (5分钟)
   ↓
2. Vercel 导入并部署 (2分钟)
   ↓
3. 获得固定域名 (立即)
   ↓
4. 生成二维码 (1分钟)
   ↓
5. 完成！任何人都可以扫码玩游戏
```

**总耗时**: 约 10 分钟

---

## 💡 提示

- Vercel 免费版每月 100GB 流量，对小型游戏完全够用
- 域名永久有效，二维码永久可用
- 每次推送代码到 GitHub，Vercel 会自动重新部署
- 可以添加自定义域名（如 cave-game.com）

---

## 🆘 遇到问题？

### 问题 1: 部署失败

**解决**: 检查 `frontend/package.json` 中是否有 `"build": "vite build"` 脚本

### 问题 2: 页面空白

**解决**: 检查浏览器控制台（F12）是否有错误信息

### 问题 3: API 请求失败

**解决**: 
1. 确认后端已部署
2. 在 Vercel 设置中添加 `VITE_API_BASE_URL` 环境变量
3. 重新部署前端

---

## 📞 需要帮助？

查看完整指南: `VERCEL_DEPLOYMENT_GUIDE.md`

---

**准备好了吗？开始部署吧！** 🚀
