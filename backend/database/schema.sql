-- 溶洞探秘互动小游戏 - 数据库表结构
-- 创建日期: 2024
-- 数据库: SQLite

-- ============================================
-- Users 表 - 存储用户信息
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  score INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  completed_at TIMESTAMP NULL
);

-- 为 username 创建索引以加速姓名查询（移除 UNIQUE 约束，允许重复姓名）
CREATE INDEX IF NOT EXISTS idx_username ON users(username);

-- 为排名查询创建复合索引（按积分降序，时间升序）
CREATE INDEX IF NOT EXISTS idx_score_time ON users(score DESC, created_at ASC);

-- ============================================
-- Questions 表 - 存储题库
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
  id VARCHAR(36) PRIMARY KEY,
  text TEXT NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK(difficulty IN ('basic', 'advanced')),
  correct_answer_id VARCHAR(10) NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================
-- Options 表 - 存储题目选项
-- ============================================
CREATE TABLE IF NOT EXISTS options (
  id VARCHAR(36) PRIMARY KEY,
  question_id VARCHAR(36) NOT NULL,
  option_id VARCHAR(10) NOT NULL,
  text TEXT NOT NULL,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- 为 question_id 创建索引以加速选项查询
CREATE INDEX IF NOT EXISTS idx_question ON options(question_id);

-- ============================================
-- Answers 表 - 存储用户答题记录
-- ============================================
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

-- 为 user_id 创建索引以加速用户答题记录查询
CREATE INDEX IF NOT EXISTS idx_user_answers ON answers(user_id);

-- 创建唯一索引防止用户重复回答同一题目
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_question ON answers(user_id, question_id);
