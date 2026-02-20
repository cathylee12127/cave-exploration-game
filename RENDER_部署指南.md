# Render.com 部署指南 - 永久在线的游戏

## 为什么选择 Render？

✅ **完全免费** - 无需信用卡
✅ **永久在线** - 关闭电脑也能访问
✅ **自动部署** - 连接 GitHub 后自动更新
✅ **支持全栈** - 前端 + 后端 + 数据库都能部署
✅ **提供 HTTPS** - 自动配置安全证书

---

## 部署步骤

### 第一步：准备 GitHub 仓库

1. **创建 GitHub 账号**（如果还没有）
   - 访问 https://github.com
   - 点击 "Sign up" 注册

2. **创建新仓库**
   - 登录后点击右上角 "+" → "New repository"
   - 仓库名：`cave-exploration-game`
   - 设置为 Public（公开）
   - 点击 "Create repository"

3. **推送代码到 GitHub**
   
   在你的项目文件夹（`cave-exploration-game`）中打开命令行，执行：

   ```bash
   # 初始化 Git（如果还没有）
   git init
   
   # 添加所有文件
   git add .
   
   # 提交
   git commit -m "Initial commit"
   
   # 连接到你的 GitHub 仓库（替换 YOUR_USERNAME）
   git remote add origin https://github.com/YOUR_USERNAME/cave-exploration-game.git
   
   # 推送代码
   git push -u origin main
   ```

   如果提示 `main` 分支不存在，先执行：
   ```bash
   git branch -M main
   ```

---

### 第二步：部署到 Render

1. **注册 Render 账号**
   - 访问 https://render.com
   - 点击 "Get Started" 或 "Sign Up"
   - 选择 "Sign up with GitHub"（用 GitHub 账号登录最方便）

2. **创建新的 Web Service**
   - 登录后点击 "New +" → "Web Service"
   - 选择 "Build and deploy from a Git repository"
   - 点击 "Connect" 连接你的 GitHub 账号
   - 找到 `cave-exploration-game` 仓库，点击 "Connect"

3. **配置后端服务**
   
   **基本设置：**
   - Name: `cave-game-backend`
   - Region: 选择离你最近的（Singapore 或 Oregon）
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Node`
   
   **构建设置：**
   - Build Command: `npm install`
   - Start Command: `node src/index.js`
   
   **实例类型：**
   - 选择 `Free`（免费）
   
   点击 "Create Web Service"

4. **等待部署完成**
   - Render 会自动安装依赖、启动服务
   - 大约 3-5 分钟后，你会看到 "Live" 状态
   - 记下后端地址，类似：`https://cave-game-backend.onrender.com`

5. **部署前端**
   - 再次点击 "New +" → "Static Site"
   - 选择同一个 GitHub 仓库
   - 配置：
     - Name: `cave-game-frontend`
     - Root Directory: `frontend`
     - Build Command: `npm install && npm run build`
     - Publish Directory: `dist`
   - 点击 "Create Static Site"

6. **配置前端 API 地址**
   
   前端需要知道后端的地址。在 Render 的前端服务中：
   - 点击 "Environment" 标签
   - 添加环境变量：
     - Key: `VITE_API_URL`
     - Value: `https://cave-game-backend.onrender.com`（你的后端地址）
   - 保存后会自动重新部署

---

### 第三步：修改代码以支持生产环境

需要修改前端代码，让它能够使用环境变量中的 API 地址：

**修改 `frontend/src/utils/APIClient.js`：**

```javascript
// 在文件开头添加
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 然后在所有 fetch 调用中使用 API_BASE_URL
// 例如：
fetch(`${API_BASE_URL}/api/users/register`, {
  // ...
})
```

修改完成后，重新推送到 GitHub：

```bash
git add .
git commit -m "Add production API URL support"
git push
```

Render 会自动检测到更新并重新部署！

---

## 部署完成后

### 获取游戏地址

前端部署完成后，你会得到一个地址，类似：
```
https://cave-game-frontend.onrender.com
```

这就是你的永久游戏地址！

### 生成新的二维码

使用新地址生成二维码：

```bash
node generate-fixed-qrcode.js
```

输入你的 Render 前端地址即可。

---

## 常见问题

### Q: 免费版有什么限制？

A: 
- 15 分钟无访问会自动休眠
- 有人访问时会自动唤醒（首次加载可能需要 30 秒）
- 每月 750 小时免费运行时间（足够个人使用）

### Q: 如何更新游戏？

A: 只需修改代码后推送到 GitHub：
```bash
git add .
git commit -m "Update game"
git push
```
Render 会自动检测并重新部署！

### Q: 数据会丢失吗？

A: 免费版的 SQLite 数据库在服务重启时会重置。如果需要持久化数据，可以：
1. 升级到付费版（$7/月）
2. 使用 Render 的 PostgreSQL 数据库（免费 90 天）

### Q: 可以自定义域名吗？

A: 可以！在 Render 的服务设置中可以添加自己的域名。

---

## 需要帮助？

如果遇到问题，可以：
1. 查看 Render 的部署日志（Logs 标签）
2. 检查环境变量是否正确配置
3. 确认 GitHub 代码已正确推送

---

**总结：**
1. 把代码推到 GitHub
2. 在 Render 上创建两个服务（后端 + 前端）
3. 配置环境变量
4. 获得永久在线的游戏地址！

整个过程大约 15-20 分钟，完全免费！🎉
