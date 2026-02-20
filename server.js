/**
 * 统一启动脚本 - 用于 Glitch 等平台
 * 同时启动后端 API 和前端静态服务
 */

const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// 启动后端 API
console.log('🚀 启动后端服务...');
const backendProcess = spawn('node', ['backend/src/index.js'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: PORT }
});

backendProcess.on('error', (error) => {
  console.error('❌ 后端启动失败:', error);
});

// 等待后端启动
setTimeout(() => {
  console.log('✅ 后端服务已启动');
  console.log(`🌐 游戏地址: http://localhost:${PORT}`);
  console.log(`📡 API 地址: http://localhost:${PORT}/api`);
}, 2000);

// 处理进程退出
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭...');
  backendProcess.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，正在关闭...');
  backendProcess.kill();
  process.exit(0);
});
