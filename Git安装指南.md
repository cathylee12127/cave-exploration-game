# Git 安装指南（Windows）

## 第一步：下载 Git

1. **打开浏览器**，访问：
   ```
   https://git-scm.com/download/win
   ```

2. **下载会自动开始**
   - 文件名类似：`Git-2.xx.x-64-bit.exe`
   - 大小约 50MB
   - 如果没有自动下载，点击页面上的 "Click here to download manually"

## 第二步：安装 Git

1. **双击下载的安装文件**

2. **安装向导 - 一路点击 "Next"**
   
   以下是各个步骤的推荐设置（直接用默认即可）：

   - **许可协议**：点击 "Next"
   
   - **安装位置**：保持默认，点击 "Next"
   
   - **选择组件**：保持默认勾选，点击 "Next"
   
   - **开始菜单文件夹**：保持默认，点击 "Next"
   
   - **选择默认编辑器**：
     - 如果不确定，选择 "Use Notepad as Git's default editor"
     - 点击 "Next"
   
   - **调整 PATH 环境**：
     - 选择 "Git from the command line and also from 3rd-party software"（推荐）
     - 点击 "Next"
   
   - **选择 HTTPS 传输后端**：保持默认，点击 "Next"
   
   - **配置行尾转换**：保持默认，点击 "Next"
   
   - **配置终端模拟器**：保持默认，点击 "Next"
   
   - **配置 git pull 行为**：保持默认，点击 "Next"
   
   - **选择凭据助手**：保持默认，点击 "Next"
   
   - **配置额外选项**：保持默认，点击 "Next"
   
   - **配置实验性选项**：不勾选，点击 "Install"

3. **等待安装完成**（约 1-2 分钟）

4. **点击 "Finish" 完成安装**

## 第三步：验证安装

1. **关闭所有命令行窗口**（重要！）

2. **重新打开命令行**（cmd）

3. **输入以下命令验证**：
   ```bash
   git --version
   ```

4. **如果看到类似输出，说明安装成功**：
   ```
   git version 2.xx.x.windows.x
   ```

## 第四步：配置 Git（首次使用）

安装完成后，需要配置你的身份信息：

```bash
# 配置用户名（可以是任意名字）
git config --global user.name "你的名字"

# 配置邮箱（建议使用 GitHub 注册邮箱）
git config --global user.email "your.email@example.com"
```

## 安装完成！

现在你可以继续部署流程了。告诉我安装完成，我们继续下一步！

---

## 常见问题

### Q: 安装后命令行还是提示找不到 git？
A: 
1. 确保已经关闭并重新打开命令行
2. 如果还不行，重启电脑
3. 检查环境变量中是否有 Git 的路径

### Q: 下载速度很慢？
A: 可以使用国内镜像：
- 淘宝镜像：https://npm.taobao.org/mirrors/git-for-windows/
- 选择最新版本下载

### Q: 需要卸载重装吗？
A: 如果安装过程出错，可以：
1. 控制面板 → 程序和功能 → 卸载 Git
2. 重新下载安装

---

**下一步：** 安装完成后，我们将初始化 Git 仓库并推送到 GitHub！
