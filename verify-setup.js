/**
 * 溶洞探秘游戏 - 环境验证脚本
 * 
 * 用途：验证游戏启动所需的所有条件是否满足
 * 运行：node verify-setup.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// 颜色输出
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

function checkMark(passed) {
  return passed ? '✅' : '❌';
}

// 检查项目
const checks = {
  files: [],
  database: false,
  backend: false,
  frontend: false,
};

console.log('\n' + '='.repeat(60));
log('溶洞探秘游戏 - 环境验证', 'blue');
console.log('='.repeat(60) + '\n');

// 1. 检查必需文件
log('1. 检查必需文件...', 'yellow');

const requiredFiles = [
  'backend/src/index.js',
  'backend/src/routes/users.js',
  'backend/src/routes/questions.js',
  'backend/src/routes/scores.js',
  'backend/database/db.js',
  'backend/database/init.js',
  'backend/database/seed.js',
  'backend/package.json',
  'frontend/src/main.js',
  'frontend/src/utils/StateManager.js',
  'frontend/src/utils/APIClient.js',
  'frontend/src/components/LoginModal.js',
  'frontend/src/components/SceneRenderer.js',
  'frontend/package.json',
  'frontend/index.html',
];

let allFilesExist = true;
requiredFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  checks.files.push({ file, exists });
  
  if (!exists) {
    allFilesExist = false;
    log(`   ${checkMark(false)} ${file}`, 'red');
  }
});

if (allFilesExist) {
  log(`   ${checkMark(true)} 所有必需文件存在`, 'green');
} else {
  log(`   ${checkMark(false)} 部分文件缺失`, 'red');
}

// 2. 检查数据库
log('\n2. 检查数据库...', 'yellow');

const dbPath = path.join(__dirname, 'backend/database/cave-game.db');
checks.database = fs.existsSync(dbPath);

if (checks.database) {
  log(`   ${checkMark(true)} 数据库文件存在: cave-game.db`, 'green');
} else {
  log(`   ${checkMark(false)} 数据库文件不存在`, 'red');
  log('   请运行: cd backend && node database/init.js && node database/seed.js', 'yellow');
}

// 3. 检查 node_modules
log('\n3. 检查依赖安装...', 'yellow');

const backendNodeModules = path.join(__dirname, 'backend/node_modules');
const frontendNodeModules = path.join(__dirname, 'frontend/node_modules');

const backendDepsInstalled = fs.existsSync(backendNodeModules);
const frontendDepsInstalled = fs.existsSync(frontendNodeModules);

if (backendDepsInstalled) {
  log(`   ${checkMark(true)} 后端依赖已安装`, 'green');
} else {
  log(`   ${checkMark(false)} 后端依赖未安装`, 'red');
  log('   请运行: cd backend && npm install', 'yellow');
}

if (frontendDepsInstalled) {
  log(`   ${checkMark(true)} 前端依赖已安装`, 'green');
} else {
  log(`   ${checkMark(false)} 前端依赖未安装`, 'red');
  log('   请运行: cd frontend && npm install', 'yellow');
}

// 4. 检查后端服务器
log('\n4. 检查后端服务器...', 'yellow');

function checkBackend() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/health', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status === 'ok') {
            checks.backend = true;
            log(`   ${checkMark(true)} 后端服务器运行正常`, 'green');
            log(`   ${checkMark(true)} 健康检查通过: ${json.message}`, 'green');
          } else {
            log(`   ${checkMark(false)} 后端服务器响应异常`, 'red');
          }
        } catch (e) {
          log(`   ${checkMark(false)} 后端服务器响应格式错误`, 'red');
        }
        resolve();
      });
    });

    req.on('error', () => {
      log(`   ${checkMark(false)} 后端服务器未运行`, 'red');
      log('   请运行: cd backend && npm start', 'yellow');
      resolve();
    });

    req.setTimeout(2000, () => {
      req.destroy();
      log(`   ${checkMark(false)} 后端服务器连接超时`, 'red');
      resolve();
    });
  });
}

// 5. 检查题目接口
async function checkQuestionsAPI() {
  log('\n5. 检查题目接口...', 'yellow');
  
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/api/questions', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.success && json.questions && json.questions.length > 0) {
            log(`   ${checkMark(true)} 题目接口正常`, 'green');
            log(`   ${checkMark(true)} 已加载 ${json.questions.length} 道题目`, 'green');
          } else {
            log(`   ${checkMark(false)} 题目接口返回数据异常`, 'red');
          }
        } catch (e) {
          log(`   ${checkMark(false)} 题目接口响应格式错误`, 'red');
        }
        resolve();
      });
    });

    req.on('error', () => {
      log(`   ${checkMark(false)} 题目接口无法访问`, 'red');
      log('   请确保后端服务器正在运行', 'yellow');
      resolve();
    });

    req.setTimeout(2000, () => {
      req.destroy();
      log(`   ${checkMark(false)} 题目接口连接超时`, 'red');
      resolve();
    });
  });
}

// 6. 检查前端服务器
async function checkFrontend() {
  log('\n6. 检查前端服务器...', 'yellow');
  
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5173/', (res) => {
      if (res.statusCode === 200) {
        checks.frontend = true;
        log(`   ${checkMark(true)} 前端服务器运行正常`, 'green');
      } else {
        log(`   ${checkMark(false)} 前端服务器响应异常 (${res.statusCode})`, 'red');
      }
      resolve();
    });

    req.on('error', () => {
      log(`   ${checkMark(false)} 前端服务器未运行`, 'red');
      log('   请运行: cd frontend && npm run dev', 'yellow');
      resolve();
    });

    req.setTimeout(2000, () => {
      req.destroy();
      log(`   ${checkMark(false)} 前端服务器连接超时`, 'red');
      resolve();
    });
  });
}

// 执行所有检查
async function runAllChecks() {
  await checkBackend();
  
  if (checks.backend) {
    await checkQuestionsAPI();
  }
  
  await checkFrontend();

  // 总结
  console.log('\n' + '='.repeat(60));
  log('验证总结', 'blue');
  console.log('='.repeat(60) + '\n');

  const allPassed = 
    allFilesExist &&
    checks.database &&
    backendDepsInstalled &&
    frontendDepsInstalled &&
    checks.backend &&
    checks.frontend;

  if (allPassed) {
    log('🎉 所有检查通过！游戏可以正常运行。', 'green');
    log('\n访问游戏: http://localhost:5173', 'blue');
  } else {
    log('⚠️  部分检查未通过，请按照上述提示修复问题。', 'yellow');
    
    console.log('\n建议的修复步骤：\n');
    
    if (!checks.database) {
      log('1. 初始化数据库:', 'yellow');
      log('   cd backend', 'reset');
      log('   node database/init.js', 'reset');
      log('   node database/seed.js', 'reset');
      console.log();
    }
    
    if (!backendDepsInstalled) {
      log('2. 安装后端依赖:', 'yellow');
      log('   cd backend', 'reset');
      log('   npm install', 'reset');
      console.log();
    }
    
    if (!frontendDepsInstalled) {
      log('3. 安装前端依赖:', 'yellow');
      log('   cd frontend', 'reset');
      log('   npm install', 'reset');
      console.log();
    }
    
    if (!checks.backend) {
      log('4. 启动后端服务器:', 'yellow');
      log('   cd backend', 'reset');
      log('   npm start', 'reset');
      console.log();
    }
    
    if (!checks.frontend) {
      log('5. 启动前端服务器:', 'yellow');
      log('   cd frontend', 'reset');
      log('   npm run dev', 'reset');
      console.log();
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// 运行检查
runAllChecks().catch((error) => {
  console.error('验证过程出错:', error);
  process.exit(1);
});
