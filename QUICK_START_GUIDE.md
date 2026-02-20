# 溶洞探秘游戏 - 快速启动指南

## 🚨 "游戏初始化失败" 问题解决

### 问题原因

游戏初始化失败通常是因为：
1. ❌ 后端服务器没有运行
2. ❌ 数据库没有初始化
3. ❌ 前端无法连接到后端 API
4. ❌ 后端 API 路由没有正确配置（已修复）

### 🔍 快速验证（推荐）

在启动游戏前，运行验证脚本检查所有条件：

```bash
# 在项目根目录运行
cd cave-exploration-game
node verify-setup.js
```

这个脚本会自动检查：
- ✅ 所有必需文件是否存在
- ✅ 数据库是否已初始化
- ✅ 依赖是否已安装
- ✅ 后端服务器是否运行
- ✅ 前端服务器是否运行
- ✅ API 接口是否正常

如果所有检查通过，游戏可以正常运行！

### ✅ 完整启动步骤

#### 步骤 1: 初始化数据库

```bash
# 进入后端目录
cd cave-exploration-game/backend

# 初始化数据库表结构
node database/init-simple.js

# 填充题目数据
node database/seed-simple.js
```

**预期输出**：
```
Database initialized successfully
Database seeded successfully with 12 questions
```

#### 步骤 2: 启动后端服务器

```bash
# 在 backend 目录中
npm start
# 或者使用开发模式
npm run dev
```

**预期输出**：
```
Server is running on http://localhost:3000
Environment: development
CORS Origin: *
```

**验证后端**：
打开浏览器访问 `http://localhost:3000/health`
应该看到：`{"status":"ok","message":"Cave Exploration API is running"}`

#### 步骤 3: 启动前端服务器

**打开新的终端窗口**：

```bash
# 进入前端目录
cd cave-exploration-game/frontend

# 启动开发服务器
npm run dev
```

**预期输出**：
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

#### 步骤 4: 打开游戏

在浏览器中访问：`http://localhost:5173`

**预期结果**：
- ✅ 看到加载指示器 "正在加载游戏..."
- ✅ 看到 "正在加载题目..."
- ✅ 看到 Toast 提示 "游戏加载完成！"
- ✅ 看到登录弹窗

## 🔍 故障排查

### 问题 1: 数据库初始化失败

**错误信息**：
```
Error: SQLITE_ERROR: table users already exists
```

**解决方法**：
```bash
# 删除旧数据库
cd cave-exploration-game/backend
rm database/cave-game.db

# 重新初始化
node database/init.js
node database/seed.js
```

### 问题 2: 后端启动失败

**错误信息**：
```
Error: Cannot find module 'express'
```

**解决方法**：
```bash
cd cave-exploration-game/backend
npm install
```

**错误信息**：
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方法**：
端口 3000 被占用，需要关闭占用的进程或更改端口：

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### 问题 3: 前端启动失败

**错误信息**：
```
Error: Cannot find module 'vite'
```

**解决方法**：
```bash
cd cave-exploration-game/frontend
npm install
```

### 问题 4: 前端无法连接后端

**浏览器控制台错误**：
```
Failed to load questions: Network Error
```

**检查清单**：
1. ✅ 后端服务器正在运行？
2. ✅ 后端地址正确？（默认 `http://localhost:3000`）
3. ✅ 防火墙没有阻止连接？

**验证连接**：
在浏览器中打开：`http://localhost:3000/api/questions`
应该看到 JSON 格式的题目列表。

### 问题 5: 游戏加载但看不到登录弹窗

**可能原因**：
- GameController 初始化失败
- LoginModal 创建失败

**调试方法**：
打开浏览器控制台（F12），查看是否有错误信息。

## 📋 完整检查清单

在启动游戏前，确认以下步骤都已完成：

### 后端检查清单
- [ ] 已安装 Node.js (>= 16.0.0)
- [ ] 已运行 `npm install` 安装依赖
- [ ] 已运行 `node database/init.js` 初始化数据库
- [ ] 已运行 `node database/seed.js` 填充数据
- [ ] 后端服务器正在运行（`npm start` 或 `npm run dev`）
- [ ] 可以访问 `http://localhost:3000/health`
- [ ] 可以访问 `http://localhost:3000/api/questions`

### 前端检查清单
- [ ] 已安装 Node.js (>= 16.0.0)
- [ ] 已运行 `npm install` 安装依赖
- [ ] 前端服务器正在运行（`npm run dev`）
- [ ] 可以访问 `http://localhost:5173`
- [ ] 浏览器控制台没有错误信息

## 🎮 成功启动的标志

当游戏成功启动时，你应该看到：

1. **浏览器标题**：溶洞探秘互动小游戏
2. **加载过程**：
   - "正在加载游戏..." (1-2秒)
   - "正在加载题目..." (1-2秒)
   - "游戏加载完成！" (绿色 Toast 提示)
3. **登录弹窗**：
   - 左侧：姓名输入框
   - 右侧：二维码
   - 标题："溶洞探秘"
4. **背景**：深色溶洞场景

## 🆘 仍然无法启动？

如果按照以上步骤仍然无法启动，请提供以下信息：

1. **操作系统**：Windows / Mac / Linux
2. **Node.js 版本**：运行 `node --version`
3. **后端启动输出**：完整的终端输出
4. **前端启动输出**：完整的终端输出
5. **浏览器控制台错误**：F12 打开控制台，截图所有红色错误
6. **Network 标签**：F12 -> Network，截图失败的请求

## 📝 快速命令参考

### 一键启动脚本（Windows）

创建 `start-game.bat`：
```batch
@echo off
echo Starting Cave Exploration Game...

echo.
echo [1/4] Initializing database...
cd backend
call node database/init.js
call node database/seed.js

echo.
echo [2/4] Starting backend server...
start cmd /k "npm start"

echo.
echo [3/4] Starting frontend server...
cd ../frontend
start cmd /k "npm run dev"

echo.
echo [4/4] Opening browser...
timeout /t 5
start http://localhost:5173

echo.
echo Game started! Check the browser windows.
pause
```

### 一键启动脚本（Mac/Linux）

创建 `start-game.sh`：
```bash
#!/bin/bash

echo "Starting Cave Exploration Game..."

echo ""
echo "[1/4] Initializing database..."
cd backend
node database/init.js
node database/seed.js

echo ""
echo "[2/4] Starting backend server..."
npm start &
BACKEND_PID=$!

echo ""
echo "[3/4] Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "[4/4] Waiting for servers to start..."
sleep 5

echo ""
echo "Opening browser..."
open http://localhost:5173 || xdg-open http://localhost:5173

echo ""
echo "Game started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all servers"

wait
```

运行：
```bash
chmod +x start-game.sh
./start-game.sh
```

## 🎯 下一步

游戏成功启动后：
1. 输入姓名开始游戏
2. 点击溶洞场景中的光点回答问题
3. 完成所有问题后查看排名
4. 扫描二维码在手机上玩

祝你游戏愉快！🎮
