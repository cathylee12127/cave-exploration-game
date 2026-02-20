# 🚀 5 步部署到 Render - 让游戏永久在线

## 为什么需要这个？

Netlify 只能部署纯前端页面，你的游戏需要后端服务器（用户登录、题目、排行榜）。
Render 可以同时部署前端和后端，而且**完全免费**！

---

## 准备工作

### 1. 注册 GitHub 账号
- 访问 https://github.com
- 点击 "Sign up" 注册（如果已有账号可跳过）

### 2. 安装 Git（如果还没有）
- Windows: 下载 https://git-scm.com/download/win
- 安装后重启命令行

---

## 部署步骤

### 步骤 1：创建 GitHub 仓库

1. 登录 GitHub
2. 点击右上角 "+" → "New repository"
3. 填写：
   - Repository name: `cave-exploration-game`
   - 选择 "Public"（公开）
4. 点击 "Create repository"
5. **记下仓库地址**，类似：`https://github.com/你的用户名/cave-exploration-game.git`

### 步骤 2：推送代码到 GitHub

在 `cave-exploration-game` 文件夹中打开命令行（cmd），执行：

```bash
# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 设置主分支名称
git branch -M main

# 连接到 GitHub（替换成你的仓库地址）
git remote add origin https://github.com/你的用户名/cave-exploration-game.git

# 推送代码
git push -u origin main
```

**如果提示输入用户名和密码：**
- 用户名：你的 GitHub 用户名
- 密码：需要使用 Personal Access Token（不是登录密码）
  - 生成方法：GitHub → Settings → Developer settings → Personal access tokens → Generate new token
  - 权限选择：repo（全选）

### 步骤 3：部署后端到 Render

1. **注册 Render**
   - 访问 https://render.com
   - 点击 "Get Started"
   - 选择 "Sign up with GitHub"（推荐）

2. **创建后端服务**
   - 点击 "New +" → "Web Service"
   - 点击 "Build and deploy from a Git repository"
   - 找到 `cave-exploration-game` 仓库，点击 "Connect"

3. **配置后端**
   - **Name**: `cave-game-backend`
   - **Region**: Singapore（或 Oregon）
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Instance Type**: `Free`

4. 点击 "Create Web Service"

5. **等待部署**（3-5 分钟）
   - 看到 "Live" 绿色标志就成功了
   - **记下后端地址**，类似：`https://cave-game-backend.onrender.com`

### 步骤 4：部署前端到 Render

1. **创建前端服务**
   - 再次点击 "New +" → "Static Site"
   - 选择同一个 GitHub 仓库
   - 点击 "Connect"

2. **配置前端**
   - **Name**: `cave-game-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **添加环境变量**（重要！）
   - 在配置页面找到 "Environment Variables"
   - 点击 "Add Environment Variable"
   - Key: `VITE_API_URL`
   - Value: `https://cave-game-backend.onrender.com`（你的后端地址）

4. 点击 "Create Static Site"

5. **等待部署**（3-5 分钟）
   - 看到 "Live" 就成功了
   - **记下前端地址**，类似：`https://cave-game-frontend.onrender.com`

### 步骤 5：生成新的二维码

使用你的 Render 前端地址生成二维码：

```bash
node generate-fixed-qrcode.js
```

输入：`https://cave-game-frontend.onrender.com`（你的前端地址）

---

## 完成！🎉

现在你的游戏已经永久在线了！

- **游戏地址**: `https://cave-game-frontend.onrender.com`
- **特点**: 
  - 24/7 在线
  - 关闭电脑也能访问
  - 任何人都可以扫码玩
  - 自动 HTTPS 加密

---

## 常见问题

### Q: 首次访问很慢？
A: 免费版 15 分钟无访问会休眠，首次唤醒需要 30 秒左右。之后就正常了。

### Q: 如何更新游戏？
A: 修改代码后推送到 GitHub：
```bash
git add .
git commit -m "更新游戏"
git push
```
Render 会自动检测并重新部署！

### Q: 数据会丢失吗？
A: 免费版重启后数据会重置。如需持久化，可以升级到付费版（$7/月）或使用 PostgreSQL。

### Q: 完全免费吗？
A: 是的！每月 750 小时免费运行时间，足够个人使用。

---

## 需要帮助？

如果遇到问题：
1. 检查 Render 的 Logs 标签查看错误信息
2. 确认环境变量 `VITE_API_URL` 配置正确
3. 确认 GitHub 代码已成功推送

---

**总结：**
1. ✅ 代码推到 GitHub
2. ✅ Render 部署后端
3. ✅ Render 部署前端（配置环境变量）
4. ✅ 生成新二维码
5. ✅ 游戏永久在线！
