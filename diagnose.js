/**
 * 诊断脚本 - 检查游戏初始化问题
 */

import http from 'http';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testAPI(host, port, path) {
  return new Promise((resolve) => {
    const req = http.get(`http://${host}:${port}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ success: true, status: res.statusCode, data: json });
        } catch (e) {
          resolve({ success: true, status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
    
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

async function main() {
  console.log('\n' + '='.repeat(60));
  log('游戏初始化诊断', 'blue');
  console.log('='.repeat(60) + '\n');
  
  // 1. 测试后端健康检查
  log('1. 测试后端健康检查...', 'yellow');
  const health = await testAPI('localhost', 3000, '/health');
  if (health.success) {
    log(`   ✅ 后端健康检查成功 (${health.status})`, 'green');
    log(`   ${JSON.stringify(health.data)}`, 'reset');
  } else {
    log(`   ❌ 后端健康检查失败: ${health.error}`, 'red');
  }
  
  // 2. 测试后端题目接口
  log('\n2. 测试后端题目接口...', 'yellow');
  const questions = await testAPI('localhost', 3000, '/api/questions');
  if (questions.success && questions.data.success) {
    log(`   ✅ 题目接口成功 (${questions.status})`, 'green');
    log(`   题目数量: ${questions.data.questions?.length || 0}`, 'reset');
  } else {
    log(`   ❌ 题目接口失败`, 'red');
    if (questions.error) {
      log(`   错误: ${questions.error}`, 'red');
    } else {
      log(`   响应: ${JSON.stringify(questions.data)}`, 'red');
    }
  }
  
  // 3. 测试前端服务器（5173）
  log('\n3. 测试前端服务器 (5173)...', 'yellow');
  const frontend5173 = await testAPI('localhost', 5173, '/');
  if (frontend5173.success) {
    log(`   ✅ 前端 5173 可访问`, 'green');
  } else {
    log(`   ❌ 前端 5173 不可访问: ${frontend5173.error}`, 'red');
  }
  
  // 4. 测试前端服务器（5174）
  log('\n4. 测试前端服务器 (5174)...', 'yellow');
  const frontend5174 = await testAPI('localhost', 5174, '/');
  if (frontend5174.success) {
    log(`   ✅ 前端 5174 可访问`, 'green');
  } else {
    log(`   ❌ 前端 5174 不可访问: ${frontend5174.error}`, 'red');
  }
  
  // 5. 测试前端代理（5173）
  log('\n5. 测试前端代理 (5173 -> 3000)...', 'yellow');
  const proxy5173 = await testAPI('localhost', 5173, '/api/questions');
  if (proxy5173.success && proxy5173.data.success) {
    log(`   ✅ 前端代理 5173 工作正常`, 'green');
  } else {
    log(`   ❌ 前端代理 5173 失败`, 'red');
    if (proxy5173.error) {
      log(`   错误: ${proxy5173.error}`, 'red');
    }
  }
  
  // 6. 测试前端代理（5174）
  log('\n6. 测试前端代理 (5174 -> 3000)...', 'yellow');
  const proxy5174 = await testAPI('localhost', 5174, '/api/questions');
  if (proxy5174.success && proxy5174.data.success) {
    log(`   ✅ 前端代理 5174 工作正常`, 'green');
  } else {
    log(`   ❌ 前端代理 5174 失败`, 'red');
    if (proxy5174.error) {
      log(`   错误: ${proxy5174.error}`, 'red');
    }
  }
  
  // 总结
  console.log('\n' + '='.repeat(60));
  log('诊断总结', 'blue');
  console.log('='.repeat(60) + '\n');
  
  if (health.success && questions.success && questions.data.success) {
    log('✅ 后端工作正常', 'green');
  } else {
    log('❌ 后端有问题', 'red');
  }
  
  if (frontend5174.success && proxy5174.success && proxy5174.data.success) {
    log('✅ 前端工作正常 (端口 5174)', 'green');
    log('\n🎮 访问游戏: http://localhost:5174', 'blue');
  } else if (frontend5173.success && proxy5173.success && proxy5173.data.success) {
    log('✅ 前端工作正常 (端口 5173)', 'green');
    log('\n🎮 访问游戏: http://localhost:5173', 'blue');
  } else {
    log('❌ 前端有问题', 'red');
    log('\n建议：', 'yellow');
    log('1. 停止所有前端进程', 'reset');
    log('2. 重启前端: cd frontend && npm run dev', 'reset');
    log('3. 访问显示的端口', 'reset');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

main().catch(console.error);
