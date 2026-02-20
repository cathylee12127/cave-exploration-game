/**
 * 数据库初始化脚本
 * 创建数据库表结构
 */

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

// 数据库文件路径
const DB_PATH = path.join(__dirname, 'cave-game.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

/**
 * 初始化数据库
 * @returns {Promise<Database>} 数据库实例
 */
async function initDatabase() {
  try {
    // 创建或打开数据库
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });
    console.log('✅ 数据库连接成功');

    // 读取 schema.sql 文件
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');

    // 执行 schema 创建表
    await db.exec(schema);
    console.log('✅ 数据库表结构创建成功');
    console.log('   - Users 表');
    console.log('   - Questions 表');
    console.log('   - Options 表');
    console.log('   - Answers 表');
    console.log('   - 所有索引和外键约束');

    return db;
  } catch (err) {
    console.error('❌ 数据库初始化失败:', err.message);
    throw err;
  }
}

/**
 * 验证表结构
 * @param {Database} db 数据库实例
 */
async function verifyTables(db) {
  try {
    const query = `
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name;
    `;

    const rows = await db.all(query);

    console.log('\n📋 数据库表列表:');
    rows.forEach((row) => {
      console.log(`   - ${row.name}`);
    });

    // 验证必需的表是否存在
    const tableNames = rows.map((row) => row.name);
    const requiredTables = ['users', 'questions', 'options', 'answers'];
    const missingTables = requiredTables.filter(
      (table) => !tableNames.includes(table)
    );

    if (missingTables.length > 0) {
      throw new Error(`缺少必需的表: ${missingTables.join(', ')}`);
    }

    console.log('✅ 所有必需的表都已创建');
  } catch (err) {
    console.error('❌ 验证表结构失败:', err.message);
    throw err;
  }
}

/**
 * 验证索引
 * @param {Database} db 数据库实例
 */
async function verifyIndexes(db) {
  try {
    const query = `
      SELECT name FROM sqlite_master 
      WHERE type='index' 
      ORDER BY name;
    `;

    const rows = await db.all(query);

    console.log('\n📊 数据库索引列表:');
    rows.forEach((row) => {
      console.log(`   - ${row.name}`);
    });

    // 验证必需的索引是否存在
    const indexNames = rows.map((row) => row.name);
    const requiredIndexes = [
      'idx_username',
      'idx_score_time',
      'idx_question',
      'idx_user_answers',
      'idx_user_question',
    ];
    const missingIndexes = requiredIndexes.filter(
      (index) => !indexNames.includes(index)
    );

    if (missingIndexes.length > 0) {
      throw new Error(`缺少必需的索引: ${missingIndexes.join(', ')}`);
    }

    console.log('✅ 所有必需的索引都已创建');
  } catch (err) {
    console.error('❌ 验证索引失败:', err.message);
    throw err;
  }
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始初始化数据库...\n');

    const db = await initDatabase();
    await verifyTables(db);
    await verifyIndexes(db);

    // 关闭数据库连接
    await db.close();
    console.log('\n✅ 数据库初始化完成！');
    console.log(`📁 数据库文件: ${DB_PATH}`);
  } catch (error) {
    console.error('\n❌ 数据库初始化失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本，执行初始化
if (require.main === module) {
  main();
}

// 导出函数供其他模块使用
module.exports = { initDatabase, verifyTables, verifyIndexes, DB_PATH };
