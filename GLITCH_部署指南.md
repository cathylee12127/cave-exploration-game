# Glitch 部署指南 - 完全免费

## 关于 Glitch

Glitch 是一个完全免费的平台，特别适合快速部署和分享项目。

**优点：**
- ✅ 完全免费，无需信用卡
- ✅ 有图形界面，操作简单
- ✅ 自动提供 HTTPS 域名
- ✅ 可以直接从 GitHub 导入

**限制：**
- 5 分钟无访问会休眠
- 项目大小限制 200MB
- 每小时 4000 次请求限制

---

## 部署步骤

### 步骤 1：注册 Glitch

1. 访问：https://glitch.com
2. 点击右上角 "Sign in"
3. 选择 "Sign in with GitHub"（推荐）
4. 授权 Glitch 访问你的 GitHub

### 步骤 2：从 GitHub 导入项目

1. 登录后，点击右上角 "New Project"
2. 选择 "Import from GitHub"
3. 输入你的仓库地址：
   ```
   cathylee12127/cave-exploration-game
   ```
4. 点击 "OK"

### 步骤 3：等待导入完成

Glitch 会自动：
- 克隆你的 GitHub 仓库
- 安装依赖
- 启动项目

这个过程大约需要 2-3 分钟。

### 步骤 4：配置项目

导入完成后，Glitch 会尝试自动运行项目。由于我们的项目是前后端分离的，需要做一些调整：

1. **点击左侧的文件列表**
2. **找到并打开 `package.json`**
3. **检查 `start` 脚本**

Glitch 会自动运行 `npm start`，我们需要确保它能同时启动前后端。

### 步骤 5：查看项目

1. 点击顶部的 "Show" 按钮
2. 选择 "In a New Window"
3. 你会看到项目的公网地址，类似：
   ```
   https://your-project-name.glitch.me
   ```

### 步骤 6：生成二维码

使用 Glitch 给你的地址生成二维码：

```bash
node generate-fixed-qrcode.js
```

输入你的 Glitch 地址即可。

---

## 常见问题

### Q: 项目休眠了怎么办？

A: 5 分钟无访问会自动休眠。有人访问时会自动唤醒（需要 10-20 秒）。

### Q: 如何更新代码？

A: 有两种方式：
1. 在 Glitch 编辑器中直接修改
2. 推送到 GitHub 后，在 Glitch 中点击 "Tools" → "Import and Export" → "Import from GitHub"

### Q: 如何查看日志？

A: 点击底部的 "Logs" 按钮查看运行日志。

### Q: 项目太大怎么办？

A: Glitch 限制 200MB。如果超过，可以：
1. 删除 `node_modules` 文件夹（Glitch 会自动安装）
2. 删除不必要的文件
3. 使用 `.gitignore` 排除大文件

---

## 注意事项

1. **数据持久化**：Glitch 的免费版数据不持久化，重启后会丢失。如果需要保存数据，需要使用外部数据库。

2. **性能限制**：免费版有性能限制，适合个人项目和演示。

3. **自定义域名**：免费版不支持自定义域名，只能使用 `.glitch.me` 域名。

---

## 替代方案

如果 Glitch 不满足需求，可以考虑：
- **Railway**：每月 $5 免费额度，性能更好
- **Vercel + Railway**：前端用 Vercel，后端用 Railway

---

**下一步：** 访问 https://glitch.com 开始部署！
