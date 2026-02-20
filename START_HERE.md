# 🎯 从这里开始 - Vercel 部署

## 📍 你现在的位置

你已经有了：
- ✅ 完整的游戏代码
- ✅ 所有部署文档
- ✅ 二维码生成脚本

现在只需要 3 个步骤就能完成部署！

---

## 🚀 三步部署流程

### 步骤 1: 准备 GitHub 仓库（5分钟）

#### 1.1 检查 Git 是否安装

打开命令行，运行：
```bash
git --version
```

如果显示版本号，说明已安装。如果没有，请：
- Windows: 下载 https://git-scm.com/download/win
- Mac: 运行 `brew install git` 或下载安装包
- Linux: 运行 `sudo apt-get install git`

#### 1.2 初始化 Git 仓库

```bash
cd cave-exploration-game
git init
git add .
git commit -m "Initial commit: Cave Exploration Game"
```

#### 1.3 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名称：`cave-exploration-game`（或任意名称）
3. 选择 Public 或 Private（都可以）
4. **不要**勾选 "Initialize this repository with a README"
5. 点击 "Create repository"

#### 1.4 推送代码到 GitHub

GitHub 会显示命令，复制并运行：
```bash
git remote add origin https://github.com/你的用户名/仓库名.git
git branch -M main
git push -u origin main
```

✅ **完成！** 代码已经在 GitHub 上了。

---

### 步骤 2: 部署到 Vercel（2分钟）

#### 2.1 访问 Vercel

打开浏览器，访问：https://vercel.com/new

#### 2.2 登录

使用 GitHub 账号登录（推荐）

#### 2.3 导入项目

1. 在 "Import Git Repository" 中找到你的仓库
2. 点击 "Import"

#### 2.4 配置项目

在配置页面填写：

| 配置项 | 值 |
|--------|-----|
| Framework Preset | `Vite` |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

#### 2.5 部署

点击 "Deploy" 按钮，等待 1-2 分钟。

#### 2.6 获取域名

部署成功后，你会看到：
```
🎉 https://cave-exploration-game.vercel.app
```

**复制这个域名！** 你马上就要用到。

✅ **完成！** 游戏已经在线了。

---

### 步骤 3: 生成固定二维码（1分钟）

#### 3.1 运行生成脚本

在命令行中运行：
```bash
cd cave-exploration-game
node generate-fixed-qrcode.js
```

#### 3.2 输入域名

当提示 "请输入游戏地址:" 时，粘贴你的 Vercel 域名：
```
请输入游戏地址: https://cave-exploration-game.vercel.app
```

按回车。

#### 3.3 获得二维码

脚本会生成 3 个文件：
- `game-qrcode-small.png` (300x300)
- `game-qrcode-medium.png` (500x500)
- `game-qrcode-large.png` (1000x1000)

✅ **完成！** 二维码已生成。

---

## 🎉 恭喜！部署完成

现在你可以：

### 1. 测试游戏
访问你的 Vercel 域名，确保游戏正常运行。

### 2. 测试二维码
用手机扫描生成的二维码，应该能打开游戏。

### 3. 分享给朋友
- 发送二维码图片
- 或直接分享域名链接

---

## 📱 二维码使用建议

### 屏幕显示
使用 `game-qrcode-small.png`

### 打印使用
使用 `game-qrcode-medium.png` 或 `game-qrcode-large.png`

### 打印尺寸建议
- 小尺寸：5cm x 5cm
- 中尺寸：10cm x 10cm
- 大尺寸：20cm x 20cm

---

## ⚠️ 注意事项

### 关于后端

目前只部署了前端。如果需要完整功能（排行榜等），需要部署后端：

#### 选项 A: 暂时不部署后端
游戏的核心功能（场景、答题）可以正常使用，只是排行榜功能暂时不可用。

#### 选项 B: 部署后端到 Railway
1. 访问 https://railway.app
2. 使用 GitHub 登录
3. 选择 "Deploy from GitHub repo"
4. 选择你的仓库
5. Root Directory: `backend`
6. 部署完成后，在 Vercel 添加环境变量：
   - Name: `VITE_API_BASE_URL`
   - Value: `https://你的railway地址`
7. 重新部署前端

---

## 🆘 遇到问题？

### 问题 1: Git 命令不工作
**解决**: 确保已安装 Git，并重启命令行。

### 问题 2: GitHub 推送失败
**解决**: 
- 检查是否已登录 GitHub
- 确认仓库地址正确
- 可能需要配置 SSH 密钥或使用 Personal Access Token

### 问题 3: Vercel 部署失败
**解决**: 
- 检查 Root Directory 是否设置为 `frontend`
- 查看部署日志中的错误信息
- 确认 `frontend/package.json` 中有 `build` 脚本

### 问题 4: 二维码生成失败
**解决**: 
- 确保已安装 Node.js
- 检查网络连接（需要访问二维码 API）
- 确认输入的 URL 格式正确（包含 https://）

### 问题 5: 扫码后无法访问
**解决**: 
- 确认 Vercel 域名可以在浏览器中访问
- 检查手机网络连接
- 尝试在手机浏览器中直接输入域名

---

## 📚 更多帮助

- **快速指南**: `deploy-to-vercel.md`
- **详细指南**: `VERCEL_DEPLOYMENT_GUIDE.md`
- **检查清单**: `DEPLOYMENT_CHECKLIST.md`
- **二维码方案**: `FIXED_QRCODE_GUIDE.md`

---

## 💡 提示

- Vercel 免费版每月 100GB 流量，对小型游戏完全够用
- 域名永久有效，二维码永久可用
- 每次推送代码到 GitHub，Vercel 会自动重新部署
- 可以在 Vercel 控制台查看访问统计

---

## ✅ 检查清单

部署前：
- [ ] Git 已安装
- [ ] GitHub 账号已创建
- [ ] Vercel 账号已创建

部署后：
- [ ] 代码已推送到 GitHub
- [ ] Vercel 部署成功
- [ ] 获得了 Vercel 域名
- [ ] 生成了二维码文件
- [ ] 测试了游戏功能
- [ ] 测试了二维码扫描

---

## 🎯 准备好了吗？

**开始第一步**: 初始化 Git 仓库

```bash
cd cave-exploration-game
git init
git add .
git commit -m "Initial commit: Cave Exploration Game"
```

**祝你部署顺利！** 🚀

有任何问题随时查看文档或寻求帮助。
