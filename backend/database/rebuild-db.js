/**
 * 强制重建数据库（删除旧表并重新创建）
 */

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    console.log('🚀 开始重建数据库...\n');
    
    const dbPath = path.join(__dirname, 'cave-game.db');
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // 删除所有表
    console.log('🗑️  删除旧表...');
    await db.exec(`
      DROP TABLE IF EXISTS answers;
      DROP TABLE IF EXISTS options;
      DROP TABLE IF EXISTS questions;
      DROP TABLE IF EXISTS users;
    `);
    console.log('✅ 旧表已删除');
    
    // 读取并执行 schema.sql
    console.log('\n📝 创建新表...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await db.exec(schema);
    
    console.log('✅ 数据库表结构创建成功');
    console.log('   - Users 表（允许重复姓名）');
    console.log('   - Questions 表');
    console.log('   - Options 表');
    console.log('   - Answers 表');
    
    // 验证表结构
    const result = await db.get(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='users'"
    );
    
    console.log('\n📋 Users 表结构:');
    console.log(result.sql);
    
    await db.close();
    console.log('\n✅ 数据库重建完成！');
  } catch (error) {
    console.error('\n❌ 数据库重建失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
