/**
 * 数据库表结构测试
 * 验证所有表、索引和外键约束是否正确创建
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_DB_PATH = path.join(__dirname, 'test-cave-game.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

describe('数据库表结构测试', () => {
  let db;

  before(() => {
    // 删除测试数据库（如果存在）
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }

    // 创建测试数据库
    db = new Database(TEST_DB_PATH);

    // 读取并执行 schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schema);
  });

  after(() => {
    // 关闭数据库连接
    if (db) {
      db.close();
    }

    // 删除测试数据库
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  it('应该创建 users 表', () => {
    const result = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
      )
      .get();
    assert.ok(result, 'users 表应该存在');
    assert.strictEqual(result.name, 'users');
  });

  it('应该创建 questions 表', () => {
    const result = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='questions'"
      )
      .get();
    assert.ok(result, 'questions 表应该存在');
    assert.strictEqual(result.name, 'questions');
  });

  it('应该创建 options 表', () => {
    const result = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='options'"
      )
      .get();
    assert.ok(result, 'options 表应该存在');
    assert.strictEqual(result.name, 'options');
  });

  it('应该创建 answers 表', () => {
    const result = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='answers'"
      )
      .get();
    assert.ok(result, 'answers 表应该存在');
    assert.strictEqual(result.name, 'answers');
  });

  it('users 表应该有正确的列', () => {
    const columns = db.prepare('PRAGMA table_info(users)').all();
    const columnNames = columns.map((col) => col.name);

    assert.ok(columnNames.includes('id'), 'users 表应该有 id 列');
    assert.ok(columnNames.includes('username'), 'users 表应该有 username 列');
    assert.ok(columnNames.includes('score'), 'users 表应该有 score 列');
    assert.ok(
      columnNames.includes('created_at'),
      'users 表应该有 created_at 列'
    );
    assert.ok(
      columnNames.includes('completed_at'),
      'users 表应该有 completed_at 列'
    );
  });

  it('questions 表应该有正确的列', () => {
    const columns = db.prepare('PRAGMA table_info(questions)').all();
    const columnNames = columns.map((col) => col.name);

    assert.ok(columnNames.includes('id'), 'questions 表应该有 id 列');
    assert.ok(columnNames.includes('text'), 'questions 表应该有 text 列');
    assert.ok(
      columnNames.includes('difficulty'),
      'questions 表应该有 difficulty 列'
    );
    assert.ok(
      columnNames.includes('correct_answer_id'),
      'questions 表应该有 correct_answer_id 列'
    );
    assert.ok(
      columnNames.includes('created_at'),
      'questions 表应该有 created_at 列'
    );
  });

  it('options 表应该有正确的列', () => {
    const columns = db.prepare('PRAGMA table_info(options)').all();
    const columnNames = columns.map((col) => col.name);

    assert.ok(columnNames.includes('id'), 'options 表应该有 id 列');
    assert.ok(
      columnNames.includes('question_id'),
      'options 表应该有 question_id 列'
    );
    assert.ok(
      columnNames.includes('option_id'),
      'options 表应该有 option_id 列'
    );
    assert.ok(columnNames.includes('text'), 'options 表应该有 text 列');
  });

  it('answers 表应该有正确的列', () => {
    const columns = db.prepare('PRAGMA table_info(answers)').all();
    const columnNames = columns.map((col) => col.name);

    assert.ok(columnNames.includes('id'), 'answers 表应该有 id 列');
    assert.ok(
      columnNames.includes('user_id'),
      'answers 表应该有 user_id 列'
    );
    assert.ok(
      columnNames.includes('question_id'),
      'answers 表应该有 question_id 列'
    );
    assert.ok(
      columnNames.includes('selected_answer_id'),
      'answers 表应该有 selected_answer_id 列'
    );
    assert.ok(
      columnNames.includes('is_correct'),
      'answers 表应该有 is_correct 列'
    );
    assert.ok(
      columnNames.includes('score_earned'),
      'answers 表应该有 score_earned 列'
    );
    assert.ok(
      columnNames.includes('answered_at'),
      'answers 表应该有 answered_at 列'
    );
  });

  it('应该创建 idx_username 索引', () => {
    const result = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_username'"
      )
      .get();
    assert.ok(result, 'idx_username 索引应该存在');
  });

  it('应该创建 idx_score_time 索引', () => {
    const result = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_score_time'"
      )
      .get();
    assert.ok(result, 'idx_score_time 索引应该存在');
  });

  it('应该创建 idx_question 索引', () => {
    const result = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_question'"
      )
      .get();
    assert.ok(result, 'idx_question 索引应该存在');
  });

  it('应该创建 idx_user_answers 索引', () => {
    const result = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_user_answers'"
      )
      .get();
    assert.ok(result, 'idx_user_answers 索引应该存在');
  });

  it('应该创建 idx_user_question 唯一索引', () => {
    const result = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_user_question'"
      )
      .get();
    assert.ok(result, 'idx_user_question 索引应该存在');
  });

  it('username 应该有唯一约束', () => {
    // 插入第一个用户
    db.prepare(
      'INSERT INTO users (id, username, score) VALUES (?, ?, ?)'
    ).run('user1', 'test_user', 0);

    // 尝试插入相同用户名应该失败
    assert.throws(
      () => {
        db.prepare(
          'INSERT INTO users (id, username, score) VALUES (?, ?, ?)'
        ).run('user2', 'test_user', 0);
      },
      {
        name: 'SqliteError',
      },
      '插入重复的 username 应该抛出错误'
    );
  });

  it('options 表应该有外键约束到 questions 表', () => {
    // 启用外键约束
    db.pragma('foreign_keys = ON');

    // 尝试插入没有对应 question 的 option 应该失败
    assert.throws(
      () => {
        db.prepare(
          'INSERT INTO options (id, question_id, option_id, text) VALUES (?, ?, ?, ?)'
        ).run('opt1', 'nonexistent_question', 'a', 'Test option');
      },
      {
        name: 'SqliteError',
      },
      '插入没有对应 question 的 option 应该抛出错误'
    );
  });

  it('answers 表应该有外键约束到 users 和 questions 表', () => {
    // 启用外键约束
    db.pragma('foreign_keys = ON');

    // 尝试插入没有对应 user 的 answer 应该失败
    assert.throws(
      () => {
        db.prepare(
          'INSERT INTO answers (id, user_id, question_id, selected_answer_id, is_correct, score_earned) VALUES (?, ?, ?, ?, ?, ?)'
        ).run('ans1', 'nonexistent_user', 'q1', 'a', 1, 10);
      },
      {
        name: 'SqliteError',
      },
      '插入没有对应 user 的 answer 应该抛出错误'
    );
  });

  it('idx_user_question 应该防止用户重复回答同一题目', () => {
    // 清理之前的测试数据
    db.prepare('DELETE FROM answers').run();
    db.prepare('DELETE FROM users').run();
    db.prepare('DELETE FROM questions').run();

    // 插入测试数据
    db.prepare(
      'INSERT INTO users (id, username, score) VALUES (?, ?, ?)'
    ).run('user1', 'test_user_unique', 0);

    db.prepare(
      'INSERT INTO questions (id, text, difficulty, correct_answer_id) VALUES (?, ?, ?, ?)'
    ).run('q1', 'Test question', 'basic', 'a');

    // 插入第一次答题记录
    db.prepare(
      'INSERT INTO answers (id, user_id, question_id, selected_answer_id, is_correct, score_earned) VALUES (?, ?, ?, ?, ?, ?)'
    ).run('ans1', 'user1', 'q1', 'a', 1, 10);

    // 尝试插入相同用户和题目的答题记录应该失败
    assert.throws(
      () => {
        db.prepare(
          'INSERT INTO answers (id, user_id, question_id, selected_answer_id, is_correct, score_earned) VALUES (?, ?, ?, ?, ?, ?)'
        ).run('ans2', 'user1', 'q1', 'b', 0, 0);
      },
      {
        name: 'SqliteError',
      },
      '插入重复的 user_id 和 question_id 组合应该抛出错误'
    );
  });

  it('difficulty 列应该只接受 basic 或 advanced', () => {
    // 尝试插入无效的 difficulty 值应该失败
    assert.throws(
      () => {
        db.prepare(
          'INSERT INTO questions (id, text, difficulty, correct_answer_id) VALUES (?, ?, ?, ?)'
        ).run('q_invalid', 'Test question', 'invalid_difficulty', 'a');
      },
      {
        name: 'SqliteError',
      },
      '插入无效的 difficulty 值应该抛出错误'
    );
  });

  it('score 列应该有默认值 0', () => {
    // 清理之前的测试数据
    db.prepare('DELETE FROM users').run();

    // 插入用户不指定 score
    db.prepare('INSERT INTO users (id, username) VALUES (?, ?)').run(
      'user_default',
      'test_default_score'
    );

    // 查询用户
    const user = db
      .prepare('SELECT score FROM users WHERE id = ?')
      .get('user_default');

    assert.strictEqual(user.score, 0, 'score 默认值应该是 0');
  });
});
