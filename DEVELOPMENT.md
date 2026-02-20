# 开发指南

## 项目结构

```
cave-exploration-game/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/      # 游戏组件
│   │   ├── styles/          # CSS 样式
│   │   ├── utils/           # 工具函数
│   │   └── main.js          # 主入口
│   ├── public/              # 静态资源
│   ├── index.html           # HTML 页面
│   ├── package.json         # 前端依赖
│   ├── vite.config.js       # Vite 配置
│   └── vitest.config.js     # Vitest 配置
├── backend/                  # 后端服务
│   ├── src/
│   │   ├── routes/          # API 路由
│   │   ├── models/          # 数据模型
│   │   └── index.js         # 服务器入口
│   ├── database/            # 数据库文件
│   └── package.json         # 后端依赖
├── shared/                   # 共享代码
│   └── types.js             # 类型定义
└── README.md                 # 项目说明
```

## 开发环境设置

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装步骤

1. **安装后端依赖**

```bash
cd backend
npm install
```

2. **安装前端依赖**

```bash
cd ../frontend
npm install
```

### 运行开发服务器

1. **启动后端服务器**

```bash
cd backend
npm run dev
```

后端服务器将在 `http://localhost:3000` 运行

2. **启动前端开发服务器**

```bash
cd frontend
npm run dev
```

前端应用将在 `http://localhost:5173` 运行，并自动在浏览器中打开

## 开发工作流

### 代码规范

项目使用 ESLint 和 Prettier 确保代码质量和一致性。

**运行代码检查：**

```bash
# 前端
cd frontend
npm run lint

# 后端
cd backend
npm run lint
```

**格式化代码：**

```bash
# 前端
cd frontend
npm run format

# 后端
cd backend
npm run format
```

### 测试

**运行前端测试：**

```bash
cd frontend
npm test
```

**运行后端测试：**

```bash
cd backend
npm test
```

### 构建生产版本

**构建前端：**

```bash
cd frontend
npm run build
```

构建输出将在 `frontend/dist/` 目录

**预览生产构建：**

```bash
cd frontend
npm run preview
```

## API 端点

### 用户管理

- `POST /api/users/register` - 注册新用户
- `GET /api/users/check/:username` - 检查姓名可用性

### 问答管理

- `GET /api/questions` - 获取所有题目
- `POST /api/questions/answer` - 提交答案

### 积分和排名

- `GET /api/scores/:userId` - 获取用户积分
- `GET /api/rankings` - 获取排名列表

## 组件说明

### 前端组件

- **SceneRenderer** - 场景渲染器，负责绘制溶洞场景
- **InteractionManager** - 交互管理器，处理用户点击和悬停
- **QuizModal** - 问答弹窗组件
- **ScoreDisplay** - 积分显示组件
- **RankingPage** - 排名页面组件
- **StateManager** - 状态管理器

### 后端模块

- **routes/** - API 路由处理器
- **models/** - 数据库模型和查询
- **database/** - SQLite 数据库文件

## 数据库

项目使用 SQLite 作为数据库，数据库文件存储在 `backend/database/` 目录。

### 数据表

- **users** - 用户信息
- **questions** - 题目
- **options** - 题目选项
- **answers** - 答题记录

## 调试技巧

### 前端调试

1. 使用浏览器开发者工具（F12）
2. 查看控制台日志
3. 使用 Vue DevTools 或 React DevTools（如果使用框架）

### 后端调试

1. 查看终端日志
2. 使用 Postman 或 curl 测试 API
3. 使用 Node.js 调试器

```bash
node --inspect src/index.js
```

## 常见问题

### 端口冲突

如果端口被占用，可以修改配置文件：

- 前端：修改 `frontend/vite.config.js` 中的 `server.port`
- 后端：修改 `backend/src/index.js` 中的 `PORT` 或设置环境变量

### CORS 错误

确保后端已启用 CORS 中间件，并且前端请求的 URL 正确。

### 数据库错误

如果数据库文件损坏，删除 `backend/database/*.db` 文件并重新初始化。

## 贡献指南

1. 创建功能分支
2. 编写代码和测试
3. 运行代码检查和测试
4. 提交 Pull Request

## 资源链接

- [Express 文档](https://expressjs.com/)
- [Vite 文档](https://vitejs.dev/)
- [Vitest 文档](https://vitest.dev/)
- [Canvas API 文档](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
