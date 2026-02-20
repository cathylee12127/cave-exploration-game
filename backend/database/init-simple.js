/**
 * 简化的数据库初始化脚本
 */

import { initDb } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    console.log('🚀 开始初始化数据库...\n');
    
    // 使用 db.js 中的 initDb 函数
    const db = await initDb();
    
    // 读取并执行 schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await db.exec(schema);
    
    console.log('✅ 数据库表结构创建成功');
    console.log('   - Users 表');
    console.log('   - Questions 表');
    console.log('   - Options 表');
    console.log('   - Answers 表');
    
    // 验证表
    const tables = await db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name;
    `);
    
    console.log('\n📋 数据库表列表:');
    tables.forEach((table) => {
      console.log(`   - ${table.name}`);
    });
    
    await db.close();
    console.log('\n✅ 数据库初始化完成！');
  } catch (error) {
    console.error('\n❌ 数据库初始化失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
