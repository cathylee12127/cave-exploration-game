/**
 * 题库初始化脚本测试
 * 验证题库数据的正确性
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedQuestions, verifyQuestions, questionsData } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 使用测试数据库
const TEST_DB_PATH = path.join(__dirname, 'cave-game-test.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

describe('题库初始化脚本测试', () => {
  let db;

  before(() => {
    // 删除旧的测试数据库
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }

    // 创建测试数据库
    db = new Database(TEST_DB_PATH);
    db.pragma('foreign_keys = ON');

    // 创建表结构
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

  it('应该成功插入题库数据', () => {
    seedQuestions(db);

    const count = db.prepare('SELECT COUNT(*) as count FROM questions').get()
      .count;
    assert.ok(count > 0, '题目数量应该大于0');
    assert.strictEqual(count, questionsData.length, '题目数量应该等于数据源长度');
  });

  it('应该包含至少10道题目', () => {
    const count = db.prepare('SELECT COUNT(*) as count FROM questions').get()
      .count;
    assert.ok(count >= 10, '题目数量应该至少为10道');
  });

  it('应该包含基础题（10分）', () => {
    const count = db
      .prepare("SELECT COUNT(*) as count FROM questions WHERE difficulty = 'basic'")
      .get().count;
    assert.ok(count > 0, '应该包含基础题');
  });

  it('应该包含提升题（20分）', () => {
    const count = db
      .prepare("SELECT COUNT(*) as count FROM questions WHERE difficulty = 'advanced'")
      .get().count;
    assert.ok(count > 0, '应该包含提升题');
  });

  it('每道题应该有恰好3个选项', () => {
    const questions = db.prepare('SELECT id FROM questions').all();

    questions.forEach((question) => {
      const optionCount = db
        .prepare('SELECT COUNT(*) as count FROM options WHERE question_id = ?')
        .get(question.id).count;
      assert.strictEqual(
        optionCount,
        3,
        `题目 ${question.id} 应该有3个选项`
      );
    });
  });

  it('每道题应该有1个正确答案', () => {
    const questions = db
      .prepare('SELECT id, correct_answer_id FROM questions')
      .all();

    questions.forEach((question) => {
      const correctOption = db
        .prepare(
          'SELECT COUNT(*) as count FROM options WHERE question_id = ? AND option_id = ?'
        )
        .get(question.id, question.correct_answer_id).count;
      assert.strictEqual(
        correctOption,
        1,
        `题目 ${question.id} 应该有1个正确答案`
      );
    });
  });

  it('每道题应该有2个干扰项', () => {
    const questions = db
      .prepare('SELECT id, correct_answer_id FROM questions')
      .all();

    questions.forEach((question) => {
      const distractorCount = db
        .prepare(
          'SELECT COUNT(*) as count FROM options WHERE question_id = ? AND option_id != ?'
        )
        .get(question.id, question.correct_answer_id).count;
      assert.strictEqual(
        distractorCount,
        2,
        `题目 ${question.id} 应该有2个干扰项`
      );
    });
  });

  it('题目难度应该只能是 basic 或 advanced', () => {
    const questions = db.prepare('SELECT difficulty FROM questions').all();

    questions.forEach((question) => {
      assert.ok(
        question.difficulty === 'basic' || question.difficulty === 'advanced',
        `题目难度应该是 basic 或 advanced，实际为 ${question.difficulty}`
      );
    });
  });

  it('选项ID应该是 a, b, c 之一', () => {
    const options = db.prepare('SELECT option_id FROM options').all();

    options.forEach((option) => {
      assert.ok(
        ['a', 'b', 'c'].includes(option.option_id),
        `选项ID应该是 a, b, c 之一，实际为 ${option.option_id}`
      );
    });
  });

  it('正确答案ID应该是 a, b, c 之一', () => {
    const questions = db
      .prepare('SELECT correct_answer_id FROM questions')
      .all();

    questions.forEach((question) => {
      assert.ok(
        ['a', 'b', 'c'].includes(question.correct_answer_id),
        `正确答案ID应该是 a, b, c 之一，实际为 ${question.correct_answer_id}`
      );
    });
  });

  it('题目文本不应该为空', () => {
    const questions = db.prepare('SELECT text FROM questions').all();

    questions.forEach((question) => {
      assert.ok(
        question.text && question.text.trim().length > 0,
        '题目文本不应该为空'
      );
    });
  });

  it('选项文本不应该为空', () => {
    const options = db.prepare('SELECT text FROM options').all();

    options.forEach((option) => {
      assert.ok(
        option.text && option.text.trim().length > 0,
        '选项文本不应该为空'
      );
    });
  });

  it('题目应该包含溶洞科学知识', () => {
    const questions = db.prepare('SELECT text FROM questions').all();

    // 检查是否包含溶洞相关关键词
    const caveKeywords = [
      '钟乳石',
      '石笋',
      '石柱',
      '溶洞',
      '碳酸钙',
      '石灰岩',
      '石花',
      '石幔',
    ];

    let hasRelevantContent = false;
    questions.forEach((question) => {
      const text = question.text.toLowerCase();
      if (caveKeywords.some((keyword) => text.includes(keyword))) {
        hasRelevantContent = true;
      }
    });

    assert.ok(hasRelevantContent, '题目应该包含溶洞科学知识相关内容');
  });

  it('verifyQuestions 函数应该成功验证题库', () => {
    // 这个测试验证 verifyQuestions 函数不会抛出错误
    assert.doesNotThrow(() => {
      verifyQuestions(db);
    }, '验证函数不应该抛出错误');
  });

  it('基础题和提升题的分布应该合理', () => {
    const basicCount = db
      .prepare("SELECT COUNT(*) as count FROM questions WHERE difficulty = 'basic'")
      .get().count;
    const advancedCount = db
      .prepare("SELECT COUNT(*) as count FROM questions WHERE difficulty = 'advanced'")
      .get().count;

    // 确保两种难度的题目都有一定数量
    assert.ok(basicCount >= 3, '基础题应该至少有3道');
    assert.ok(advancedCount >= 3, '提升题应该至少有3道');
  });

  it('题目ID应该是唯一的', () => {
    const questions = db.prepare('SELECT id FROM questions').all();
    const ids = questions.map((q) => q.id);
    const uniqueIds = new Set(ids);

    assert.strictEqual(
      ids.length,
      uniqueIds.size,
      '题目ID应该是唯一的'
    );
  });

  it('选项ID应该是唯一的', () => {
    const options = db.prepare('SELECT id FROM options').all();
    const ids = options.map((o) => o.id);
    const uniqueIds = new Set(ids);

    assert.strictEqual(
      ids.length,
      uniqueIds.size,
      '选项ID应该是唯一的'
    );
  });

  it('每道题的选项ID应该不重复', () => {
    const questions = db.prepare('SELECT id FROM questions').all();

    questions.forEach((question) => {
      const optionIds = db
        .prepare('SELECT option_id FROM options WHERE question_id = ?')
        .all(question.id)
        .map((o) => o.option_id);

      const uniqueOptionIds = new Set(optionIds);
      assert.strictEqual(
        optionIds.length,
        uniqueOptionIds.size,
        `题目 ${question.id} 的选项ID应该不重复`
      );
    });
  });

  it('外键约束应该正常工作', () => {
    // 尝试插入一个无效的选项（关联不存在的题目）
    const invalidQuestionId = '00000000-0000-0000-0000-000000000000';

    assert.throws(
      () => {
        db.prepare(
          'INSERT INTO options (id, question_id, option_id, text) VALUES (?, ?, ?, ?)'
        ).run('test-id', invalidQuestionId, 'a', 'Test option');
      },
      /FOREIGN KEY constraint failed/,
      '外键约束应该阻止插入无效的关联数据'
    );
  });
});
