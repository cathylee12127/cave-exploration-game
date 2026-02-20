# Vercel 部署检查清单 ✅

## 📋 部署前检查

### 1. 代码准备
- [ ] 所有代码已提交到 Git
- [ ] 前端构建脚本正常工作 (`npm run build`)
- [ ] 没有语法错误或警告

### 2. GitHub 准备
- [ ] 已创建 GitHub 账号
- [ ] 已创建 GitHub 仓库
- [ ] 代码已推送到 GitHub

### 3. Vercel 准备
- [ ] 已注册 Vercel 账号
- [ ] 已连接 GitHub 账号

---

## 🚀 部署步骤

### 步骤 1: 推送代码到 GitHub
```bash
cd cave-exploration-game
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```
- [ ] 完成

### 步骤 2: 在 Vercel 导入项目
1. 访问 https://vercel.com/new
2. 选择 GitHub 仓库
3. 配置项目：
   - Framework: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. 点击 Deploy

- [ ] 完成

### 步骤 3: 等待部署完成
- [ ] 部署成功
- [ ] 获得域名: `https://________.vercel.app`

### 步骤 4: 测试游戏
- [ ] 访问域名，游戏正常加载
- [ ] 登录功能正常
- [ ] 场景渲染正常
- [ ] 交互点可点击

---

## 📱 生成二维码

### 步骤 5: 运行二维码生成脚本
```bash
cd cave-exploration-game
node generate-fixed-qrcode.js
```

输入你的 Vercel 域名：
```
请输入游戏地址: https://你的域名.vercel.app
```

- [ ] 完成

### 步骤 6: 验证二维码
- [ ] 生成了 3 个二维码文件
- [ ] 用手机扫描二维码
- [ ] 能够打开游戏
- [ ] 游戏功能正常

---

## 🔧 后端部署（可选）

### 如果需要完整功能（排行榜等）

#### 选项 A: Railway 部署
1. 访问 https://railway.app
2. 连接 GitHub
3. 选择仓库
4. Root Directory: `backend`
5. 部署

- [ ] 完成
- [ ] 获得后端地址: `https://________.railway.app`

#### 配置前端连接后端
1. 在 Vercel 项目设置中
2. 添加环境变量：
   - Name: `VITE_API_BASE_URL`
   - Value: `https://你的railway地址`
3. 重新部署前端

- [ ] 完成

---

## ✅ 最终验证

### 功能测试
- [ ] 用户注册功能正常
- [ ] 答题功能正常
- [ ] 积分显示正常
- [ ] 排行榜显示正常（如果部署了后端）

### 二维码测试
- [ ] 手机扫码能打开游戏
- [ ] 朋友扫码能访问
- [ ] 不同网络环境都能访问

### 性能测试
- [ ] 页面加载速度 < 3 秒
- [ ] 交互响应流畅
- [ ] 移动端体验良好

---

## 📊 部署信息记录

### 前端
- **Vercel 域名**: `https://________________.vercel.app`
- **部署时间**: `____年__月__日`
- **Git Commit**: `________________`

### 后端（如果有）
- **Railway 域名**: `https://________________.railway.app`
- **部署时间**: `____年__月__日`

### 二维码
- **生成时间**: `____年__月__日`
- **文件位置**: `cave-exploration-game/game-qrcode-*.png`

---

## 🎉 完成！

恭喜！你的游戏已经成功部署到云端。

### 下一步
- [ ] 分享二维码给朋友
- [ ] 打印二维码贴在展示区
- [ ] 监控访问量和性能
- [ ] 收集用户反馈

---

## 📝 备注

记录任何问题或特殊配置：

```
_____________________________________
_____________________________________
_____________________________________
```

---

## 🆘 遇到问题？

参考以下文档：
- `VERCEL_DEPLOYMENT_GUIDE.md` - 详细部署指南
- `deploy-to-vercel.md` - 快速部署说明
- `FIXED_QRCODE_GUIDE.md` - 二维码生成指南

或访问：
- Vercel 文档: https://vercel.com/docs
- Railway 文档: https://docs.railway.app
