# 📤 推送代码到 GitHub - 详细图文指南

## 🎯 目标
将你的游戏代码从本地电脑推送到 GitHub。

---

## 第一步：打开命令行

### Windows 用户

#### 方法 1: 使用 PowerShell（推荐）

1. **打开文件资源管理器**
2. **导航到项目文件夹**：
   ```
   找到 cave-exploration-game 文件夹
   ```
3. **在地址栏输入**：
   ```
   powershell
   ```
4. **按回车**
   - PowerShell 会在当前文件夹打开
   - 你会看到类似这样的提示符：
     ```
     PS D:\ai\cave-exploration-game>
     ```

#### 方法 2: 使用 Git Bash

1. **右键点击** `cave-exploration-game` 文件夹
2. **选择** "Git Bash Here"
3. Git Bash 会打开，显示：
   ```
   user@computer MINGW64 /d/ai/cave-exploration-game
   $
   ```

#### 方法 3: 手动导航

1. **打开 PowerShell**（Win + X → Windows PowerShell）
2. **切换到项目目录**：
   ```powershell
   cd D:\ai\cave-exploration-game
   ```
   （根据你的实际路径修改）

### Mac/Linux 用户

1. **打开终端**
2. **切换到项目目录**：
   ```bash
   cd /path/to/cave-exploration-game
   ```

---

## 第二步：初始化 Git 仓库

在命令行中输入以下命令：

### 2.1 初始化 Git
```bash
git init
```

**你会看到**：
```
Initialized empty Git repository in D:/ai/cave-exploration-game/.git/
```

### 2.2 添加所有文件
```bash
git add .
```

**说明**：这会添加所有文件到 Git

### 2.3 提交代码
```bash
git commit -m "Initial commit: Cave Exploration Game"
```

**你会看到**：
```
[main (root-commit) abc1234] Initial commit: Cave Exploration Game
 XX files changed, XXXX insertions(+)
 create mode 100644 ...
```

✅ **完成！** 本地 Git 仓库已创建。

---

## 第三步：在 GitHub 创建仓库

### 3.1 访问 GitHub

在浏览器中打开：https://github.com/new

### 3.2 填写仓库信息

| 字段 | 填写内容 |
|------|----------|
| **Repository name** | `cave-exploration-game` |
| **Description** | `溶洞探秘互动小游戏` |
| **Public/Private** | 选择 Public（公开）或 Private（私有） |
| **Initialize this repository** | ⚠️ **不要勾选任何选项** |

### 3.3 创建仓库

点击绿色按钮 "Create repository"

### 3.4 复制推送命令

GitHub 会显示一个页面，标题是 "Quick setup"。

在 "…or push an existing repository from the command line" 部分，你会看到类似这样的命令：

```bash
git remote add origin https://github.com/你的用户名/cave-exploration-game.git
git branch -M main
git push -u origin main
```

**📋 复制这些命令！**

---

## 第四步：推送代码到 GitHub

### 4.1 回到命令行

回到刚才打开的 PowerShell/终端窗口。

### 4.2 粘贴并运行命令

**一次粘贴一行**，按回车执行：

#### 命令 1: 添加远程仓库
```bash
git remote add origin https://github.com/你的用户名/cave-exploration-game.git
```

**替换**：把 `你的用户名` 改成你的 GitHub 用户名

**例如**：
```bash
git remote add origin https://github.com/zhangsan/cave-exploration-game.git
```

**你会看到**：没有输出（这是正常的）

#### 命令 2: 重命名分支
```bash
git branch -M main
```

**你会看到**：没有输出（这是正常的）

#### 命令 3: 推送代码
```bash
git push -u origin main
```

**你会看到**：
```
Enumerating objects: XXX, done.
Counting objects: 100% (XXX/XXX), done.
Delta compression using up to X threads
Compressing objects: 100% (XXX/XXX), done.
Writing objects: 100% (XXX/XXX), XX.XX MiB | XX.XX MiB/s, done.
Total XXX (delta XX), reused 0 (delta 0)
To https://github.com/你的用户名/cave-exploration-game.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

✅ **完成！** 代码已推送到 GitHub。

---

## 第五步：验证

### 5.1 刷新 GitHub 页面

回到浏览器，刷新 GitHub 仓库页面。

### 5.2 检查文件

你应该能看到所有文件，包括：
- `frontend/` 文件夹
- `backend/` 文件夹
- `README.md`
- 等等

✅ **成功！** 代码已经在 GitHub 上了。

---

## 🆘 常见问题

### 问题 1: "git: command not found"

**原因**：Git 没有安装

**解决**：
1. 下载 Git: https://git-scm.com/download/win
2. 安装后重启命令行
3. 重新运行命令

### 问题 2: "Permission denied"

**原因**：没有 GitHub 访问权限

**解决方法 A - 使用 Personal Access Token**：

1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 点击 "Generate token"
5. **复制 token**（只显示一次！）
6. 推送时，用户名输入你的 GitHub 用户名，密码输入 token

**解决方法 B - 使用 SSH**：

1. 生成 SSH 密钥：
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
2. 添加到 GitHub：https://github.com/settings/keys
3. 使用 SSH URL：
   ```bash
   git remote set-url origin git@github.com:你的用户名/cave-exploration-game.git
   ```

### 问题 3: "fatal: remote origin already exists"

**原因**：已经添加过远程仓库

**解决**：
```bash
# 删除旧的
git remote remove origin

# 重新添加
git remote add origin https://github.com/你的用户名/cave-exploration-game.git
```

### 问题 4: 推送很慢或卡住

**原因**：网络问题或文件太大

**解决**：
1. 检查网络连接
2. 等待一段时间（大文件需要时间）
3. 如果一直卡住，按 `Ctrl + C` 取消，重新运行

### 问题 5: "Updates were rejected"

**原因**：远程仓库有你本地没有的内容

**解决**：
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

## 📝 完整命令总结

在 `cave-exploration-game` 文件夹中，按顺序运行：

```bash
# 1. 初始化 Git
git init

# 2. 添加所有文件
git add .

# 3. 提交
git commit -m "Initial commit: Cave Exploration Game"

# 4. 添加远程仓库（替换你的用户名）
git remote add origin https://github.com/你的用户名/cave-exploration-game.git

# 5. 重命名分支
git branch -M main

# 6. 推送
git push -u origin main
```

---

## ✅ 检查清单

推送前：
- [ ] 已打开命令行
- [ ] 已切换到 `cave-exploration-game` 文件夹
- [ ] 已在 GitHub 创建仓库
- [ ] 已复制 GitHub 提供的命令

推送后：
- [ ] 命令执行成功（没有错误）
- [ ] GitHub 页面能看到所有文件
- [ ] 准备好进行下一步（Vercel 部署）

---

## 🎯 下一步

代码推送成功后，继续 `START_HERE.md` 的**步骤 2: 部署到 Vercel**。

---

## 💡 提示

- 命令行中可以用 `Ctrl + V` 或右键粘贴
- 如果命令太长，可以分行复制粘贴
- 推送过程中不要关闭命令行窗口
- 第一次推送可能需要输入 GitHub 用户名和密码

---

**需要帮助？** 查看上面的常见问题部分，或者告诉我你遇到的具体错误信息。
