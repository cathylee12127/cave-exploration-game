// 测试服务器启动
import('./src/index.js').catch(err => {
  console.error('Server startup error:', err);
  process.exit(1);
});
