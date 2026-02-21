# 🚀 Vercel 部署 - 超简单版

## 你的代码已经在 GitHub 上了！

仓库地址：`https://github.com/cathylee12127/cave-exploration-game`

---

## 📋 只需 3 步（5分钟完成）

### 步骤 1: 访问 Vercel（1分钟）

1. 打开浏览器
2. 访问：**https://vercel.com/new**
3. 点击 **Continue with GitHub**（用 GitHub 账号登录）

---

### 步骤 2: 导入项目（2分钟）

#### 2.1 找到你的仓库

在页面上找到：`cathylee12127/cave-exploration-game`

点击右边的 **Import** 按钮

#### 2.2 配置项目（重要！）

在配置页面，找到 **Root Directory** 部分：

1. 点击 **Edit** 按钮
2. 选择 **frontend** 文件夹
3. 点击 **Continue**

#### 2.3 其他配置（自动检测）

Vercel 会自动检测到：
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

**不需要修改这些！**

---

### 步骤 3: 部署（2分钟）

1. 点击底部的 **Deploy** 按钮
2. 等待 1-2 分钟（会看到构建进度）
3. 看到 🎉 **Congratulations!** 就成功了

---

## 🎯 获取你的游戏地址

部署成功后，你会看到一个地址，类似：

```
https://cave-exploration-game-xxx.vercel.app
```

**这就是你的永久游戏地址！**

点击 **Visit** 按钮测试游戏。

---

## 📱 生成二维码

### 方法 1: 在本地生成（推荐）

1. 复制你的 Vercel 地址
2. 打开命令行（PowerShell）
3. 运行：
   ```bash
   cd cave-exploration-game
   node generate-qrcode-auto.js
   ```
4. 粘贴你的 Vercel 地址
5. 按回车

会生成 3 个二维码文件：
- `game-qrcode-small.png`
- `game-qrcode-medium.png`
- `game-qrcode-large.png`

### 方法 2: 在线生成

访问：https://www.qr-code-generator.com/

1. 输入你的 Vercel 地址
2. 点击 "Create QR Code"
3. 下载二维码图片

---

## ✅ 测试

### 测试 1: 浏览器访问

在电脑浏览器中打开你的 Vercel 地址，应该能看到游戏。

### 测试 2: 手机扫码

用手机扫描二维码，应该能打开游戏。

---

## ⚠️ 重要提示

### 关于排行榜功能

Vercel 只部署了前端，所以：

✅ **可以使用的功能**：
- 登录（输入姓名）
- 查看溶洞场景
- 点击交互点
- 回答问题
- 查看积分

❌ **暂时不可用的功能**：
- 排行榜（需要后端支持）
- 多用户数据保存

### 如果需要完整功能

需要额外部署后端，可以选择：
- Replit（最简单）
- Railway（需要找入口）
- Render（需要信用卡）

查看 `REPLIT_部署指南.md` 了解如何部署完整版本。

---

## 🎉 完成！

现在你有了：
- ✅ 一个永久的游戏网址
- ✅ 可以扫描的二维码
- ✅ 可以分享给朋友

---

## 🔄 更新游戏

如果你修改了代码，只需：

1. 在本地修改代码
2. 推送到 GitHub：
   ```bash
   git add .
   git commit -m "更新游戏"
   git push
   ```
3. Vercel 会自动重新部署（1-2分钟）

---

## 🆘 遇到问题？

### 问题 1: 找不到仓库

**解决**：确保你已经用 GitHub 账号登录 Vercel

### 问题 2: 部署失败

**解决**：
1. 检查是否选择了 **frontend** 作为 Root Directory
2. 查看部署日志中的错误信息
3. 确认 GitHub 仓库中有 `frontend` 文件夹

### 问题 3: 页面空白

**解决**：
1. 打开浏览器开发者工具（F12）
2. 查看 Console 中的错误
3. 可能是 API 地址配置问题（因为没有后端）

### 问题 4: 二维码生成失败

**解决**：
1. 确保输入的地址包含 `https://`
2. 检查网络连接
3. 使用在线二维码生成器

---

## 📞 需要帮助？

告诉我：
- 在哪一步遇到问题
- 看到什么错误信息
- 截图发给我

我会帮你解决！😊

---

## 🎯 快速命令参考

```bash
# 生成二维码
cd cave-exploration-game
node generate-qrcode-auto.js

# 更新代码
git add .
git commit -m "更新"
git push
```

---

**准备好了吗？** 

访问 **https://vercel.com/new** 开始部署！🚀
