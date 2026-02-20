// 这是db.js文件的完整内容，粘贴到文件里，不是终端！
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径（ES 模块中的 __dirname 替代）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据库文件路径 - 使用 cave-game.db
const dbPath = path.join(__dirname, 'cave-game.db');

// 确保数据库文件夹存在
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// 打开数据库连接
async function getDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

// 初始化数据库表
async function initDb() {
  const db = await getDb();
  
  // 读取并执行 schema.sql
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await db.exec(schema);
  } else {
    // 如果 schema.sql 不存在，创建基本表结构
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        score INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        completed_at TIMESTAMP NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_score_time ON users(score DESC, created_at ASC);
      
      CREATE TABLE IF NOT EXISTS questions (
        id VARCHAR(36) PRIMARY KEY,
        text TEXT NOT NULL,
        difficulty VARCHAR(20) NOT NULL CHECK(difficulty IN ('basic', 'advanced')),
        correct_answer_id VARCHAR(10) NOT NULL,
        explanation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS options (
        id VARCHAR(36) PRIMARY KEY,
        question_id VARCHAR(36) NOT NULL,
        option_id VARCHAR(10) NOT NULL,
        text TEXT NOT NULL,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_question ON options(question_id);
      
      CREATE TABLE IF NOT EXISTS answers (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        question_id VARCHAR(36) NOT NULL,
        selected_answer_id VARCHAR(10) NOT NULL,
        is_correct BOOLEAN NOT NULL,
        score_earned INTEGER NOT NULL,
        answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_user_answers ON answers(user_id);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_user_question ON answers(user_id, question_id);
    `);
  }
  
  return db;
}

// 导出模块
export { getDb, initDb, dbPath };
export default { getDb, initDb, dbPath };