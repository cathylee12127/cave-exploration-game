# 溶洞探秘互动小游戏

基于Web的教育互动游戏，用户通过扫描二维码访问游戏，在高清写实的溶洞场景中探索并回答科学知识问题，获取积分并参与排名。

## 项目结构

```
cave-exploration-game/
├── frontend/          # 前端应用
│   ├── src/          # 源代码
│   ├── public/       # 静态资源
│   └── index.html    # 主页面
├── backend/          # 后端服务
│   ├── src/          # 源代码
│   └── database/     # 数据库文件
├── shared/           # 共享类型定义
└── README.md         # 项目说明
```

## 技术栈

### 前端
- HTML5 + CSS3 + JavaScript/TypeScript
- Canvas API 用于场景渲染
- 响应式设计

### 后端
- Node.js + Express
- SQLite 数据库
- RESTful API

## 开发环境设置

### 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 运行开发服务器

```bash
# 启动后端服务器
cd backend
npm run dev

# 启动前端开发服务器
cd frontend
npm run dev
```

## 功能特性

- 用户身份管理（姓名注册）
- 高清写实溶洞场景渲染
- 交互点探索系统
- 科学知识问答
- 积分系统
- 排名系统
- 二维码访问
- 响应式设计（支持移动端和桌面端）

## 开发规范

- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 TypeScript 类型安全
- 编写单元测试和属性测试

## 许可证

MIT
