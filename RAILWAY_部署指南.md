# Railway 部署指南 - 完全免费

## 为什么选择 Railway？

✅ **每月 $5 免费额度**（约 500 小时运行时间）  
✅ **不需要信用卡**  
✅ **自动检测项目类型**  
✅ **支持前后端一起部署**  
✅ **提供 HTTPS 域名**  
✅ **GitHub 集成，自动部署**

---

## 部署步骤

### 步骤 1：注册 Railway

1. 访问：https://railway.app
2. 点击 "Login" 或 "Start a New Project"
3. 选择 "Login with GitHub"
4. 授权 Railway 访问你的 GitHub

### 步骤 2：创建新项目

1. 登录后，点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 找到并选择 `cave-exploration-game`
4. 点击 "Deploy Now"

### 步骤 3：Railway 自动部署

Railway 会自动：
- 检测到这是一个 Node.js 项目
- 读取 `package.json` 中的启动命令
- 安装依赖并启动服务

**等待 3-5 分钟**，部署完成后会显示 "Active" 状态。

### 步骤 4：获取公网地址

1. 在项目页面，点击你的服务
2. 点击 "Settings" 标签
3. 找到 "Domains" 部分
4. 点击 "Generate Domain"
5. Railway 会生成一个地址，类似：
   ```
   https://your-project.up.railway.app
   ```

### 步骤 5：生成二维码

使用 Railway 给你的地址生成二维码：

```bash
node generate-fixed-qrcode.js
```

输入你的 Railway 地址即可。

---

## 配置说明

Railway 会自动使用项目根目录的 `package.json`，它会：

1. 运行 `npm install` 安装依赖
2. 运行 `npm start` 启动服务
3. 自动分配端口（通过 `PORT` 环境变量）

我们的 `server.js` 已经配置好了，会同时启动前后端。

---

## 常见问题

### Q: 免费额度够用吗？

A: 每月 $5 额度 = 约 500 小时运行时间。如果每天运行 16 小时，可以用一个月。

### Q: 如何查看日志？

A: 
1. 在项目页面点击你的服务
2. 点击 "Deployments" 标签
3. 点击最新的部署
4. 查看 "Build Logs" 和 "Deploy Logs"

### Q: 如何更新代码？

A: 
1. 修改代码后推送到 GitHub：
   ```bash
   git add .
   git commit -m "更新游戏"
   git push
   ```
2. Railway 会自动检测并重新部署

### Q: 项目会休眠吗？

A: Railway 免费版不会自动休眠，但如果超过免费额度会暂停。

### Q: 数据会丢失吗？

A: Railway 免费版的文件系统是临时的，重启后会重置。如需持久化数据，可以：
1. 升级到付费版（$5/月起）
2. 使用 Railway 的 PostgreSQL 插件（有免费额度）

---

## 故障排查

### 部署失败？

1. **检查日志**：点击 "Deployments" → 查看错误信息
2. **常见问题**：
   - 端口配置：确保使用 `process.env.PORT`
   - 依赖安装：检查 `package.json` 是否正确
   - 启动命令：确认 `npm start` 能正常运行

### 无法访问？

1. **检查域名**：确认已生成域名
2. **检查状态**：服务应该显示 "Active"
3. **查看日志**：确认服务已启动

---

## 优化建议

### 1. 添加健康检查

Railway 会定期检查服务是否运行。我们的后端已经有 `/health` 接口。

### 2. 设置环境变量

如果需要配置环境变量：
1. 点击服务 → "Variables" 标签
2. 添加变量（如 `NODE_ENV=production`）

### 3. 监控使用量

在 Railway 控制台可以查看：
- 运行时间
- 内存使用
- 网络流量
- 剩余额度

---

## 下一步

部署完成后：
1. ✅ 获取 Railway 域名
2. ✅ 生成二维码
3. ✅ 分享给朋友
4. ✅ 游戏永久在线！

---

**准备好了吗？访问 https://railway.app 开始部署！**
