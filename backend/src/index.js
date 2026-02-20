import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from '../database/db.js';

// 导入路由
import usersRouter from './routes/users.js';
import questionsRouter from './routes/questions.js';
import scoresRouter from './routes/scores.js';

// 初始化配置
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Cave Exploration API is running',
    timestamp: new Date().toISOString()
  });
});

// API 路由
app.use('/api/users', usersRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/scores', scoresRouter);
app.use('/api/rankings', scoresRouter); // rankings 也使用 scores router

// 简单的测试接口
app.get('/api/test', (req, res) => {
  res.send('Backend server is running!');
});

// 初始化数据库并启动服务
async function startServer() {
  try {
    await initDb();
    console.log('Database initialized successfully');
    
    // 启动服务
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// 启动服务
startServer();