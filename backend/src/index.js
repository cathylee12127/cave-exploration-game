import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from '../database/db.js';

// 导入路由
import usersRouter from './routes/users.js';
import questionsRouter from './routes/questions.js';
import scoresRouter from './routes/scores.js';

// ES模块中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// 提供前端静态文件（用于 Glitch 等一体化部署）
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
const frontendPublicPath = path.join(__dirname, '../../frontend');

// 尝试提供构建后的文件
app.use(express.static(frontendDistPath));

// 如果没有构建文件，提供开发文件
app.use(express.static(frontendPublicPath));

// 所有其他路由返回 index.html（用于 SPA）
app.get('*', (req, res) => {
  // 如果是 API 请求，返回 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // 尝试返回构建后的 index.html
  const distIndexPath = path.join(frontendDistPath, 'index.html');
  const devIndexPath = path.join(frontendPublicPath, 'index.html');
  
  res.sendFile(distIndexPath, (err) => {
    if (err) {
      res.sendFile(devIndexPath, (err2) => {
        if (err2) {
          res.status(404).send('Frontend not found');
        }
      });
    }
  });
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