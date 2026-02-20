/**
 * 属性测试 - 题目结构完整性
 * Feature: cave-exploration-game, Property 7: 题目结构完整性
 * **验证需求: 4.4**
 * 
 * 属性描述:
 * 对于任何题目，它应该包含恰好3个选项，并且只有1个选项的ID与正确答案ID匹配。
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fc from 'fast-check';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedQuestions } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 使用测试数据库
const TEST_DB_PATH = path.join(__dirname, 'cave-game-pbt-test.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

describe('属性测试 - 题目结构完整性', () => {
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

    // 插入题库数据
    seedQuestions(db);
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

  it('属性 7: 题目结构完整性 - 每道题应该有恰好3个选项且只有1个正确答案', () => {
    // 获取所有题目
    const questions = db
      .prepare(
        `SELECT id, text, difficulty, correct_answer_id
         FROM questions`
      )
      .all();

    // 确保有题目可以测试
    assert.ok(questions.length > 0, '数据库中应该有题目');

    // 使用 fast-check 对每道题目进行属性测试
    fc.assert(
      fc.property(
        fc.constantFrom(...questions),
        (question) => {
          // 获取该题目的所有选项
          const options = db
            .prepare(
              `SELECT option_id, text
               FROM options
               WHERE question_id = ?`
            )
            .all(question.id);

          // 属性 1: 每道题应该有恰好3个选项
          assert.strictEqual(
            options.length,
            3,
            `题目 "${question.text}" 应该有恰好3个选项，实际有 ${options.length} 个`
          );

          // 属性 2: 只有1个选项的ID与正确答案ID匹配
          const correctOptions = options.filter(
            (opt) => opt.option_id === question.correct_answer_id
          );

          assert.strictEqual(
            correctOptions.length,
            1,
            `题目 "${question.text}" 应该有恰好1个正确答案，实际有 ${correctOptions.length} 个`
          );

          // 属性 3: 正确答案ID必须存在于选项中
          const optionIds = options.map((opt) => opt.option_id);
          assert.ok(
            optionIds.includes(question.correct_answer_id),
            `题目 "${question.text}" 的正确答案ID "${question.correct_answer_id}" 必须存在于选项中`
          );

          // 属性 4: 选项ID应该是唯一的（不重复）
          const uniqueOptionIds = new Set(optionIds);
          assert.strictEqual(
            optionIds.length,
            uniqueOptionIds.size,
            `题目 "${question.text}" 的选项ID应该是唯一的`
          );

          // 属性 5: 所有选项都应该有非空文本
          options.forEach((option) => {
            assert.ok(
              option.text && option.text.trim().length > 0,
              `题目 "${question.text}" 的选项 "${option.option_id}" 应该有非空文本`
            );
          });

          return true;
        }
      ),
      {
        numRuns: Math.min(100, questions.length), // 运行次数为题目数量，最多100次
        verbose: true,
      }
    );
  });

  it('属性 7: 题目结构完整性 - 验证题目和选项的关联关系', () => {
    // 获取所有题目
    const questions = db
      .prepare(
        `SELECT id, text, correct_answer_id
         FROM questions`
      )
      .all();

    assert.ok(questions.length > 0, '数据库中应该有题目');

    // 使用 fast-check 验证题目和选项的关联关系
    fc.assert(
      fc.property(
        fc.constantFrom(...questions),
        (question) => {
          // 查询该题目的选项数量
          const optionCount = db
            .prepare(
              `SELECT COUNT(*) as count
               FROM options
               WHERE question_id = ?`
            )
            .get(question.id).count;

          // 每道题必须有恰好3个选项
          assert.strictEqual(
            optionCount,
            3,
            `题目 "${question.text}" 必须有恰好3个选项`
          );

          // 验证正确答案存在
          const correctAnswerExists = db
            .prepare(
              `SELECT COUNT(*) as count
               FROM options
               WHERE question_id = ? AND option_id = ?`
            )
            .get(question.id, question.correct_answer_id).count;

          assert.strictEqual(
            correctAnswerExists,
            1,
            `题目 "${question.text}" 的正确答案 "${question.correct_answer_id}" 必须存在`
          );

          return true;
        }
      ),
      {
        numRuns: Math.min(100, questions.length),
        verbose: true,
      }
    );
  });

  it('属性 7: 题目结构完整性 - 验证选项ID的有效性', () => {
    // 获取所有题目
    const questions = db
      .prepare(
        `SELECT id, text, correct_answer_id
         FROM questions`
      )
      .all();

    assert.ok(questions.length > 0, '数据库中应该有题目');

    // 定义有效的选项ID
    const validOptionIds = ['a', 'b', 'c'];

    fc.assert(
      fc.property(
        fc.constantFrom(...questions),
        (question) => {
          // 获取该题目的所有选项ID
          const options = db
            .prepare(
              `SELECT option_id
               FROM options
               WHERE question_id = ?`
            )
            .all(question.id);

          // 验证所有选项ID都是有效的
          options.forEach((option) => {
            assert.ok(
              validOptionIds.includes(option.option_id),
              `题目 "${question.text}" 的选项ID "${option.option_id}" 必须是 a, b, c 之一`
            );
          });

          // 验证正确答案ID也是有效的
          assert.ok(
            validOptionIds.includes(question.correct_answer_id),
            `题目 "${question.text}" 的正确答案ID "${question.correct_answer_id}" 必须是 a, b, c 之一`
          );

          return true;
        }
      ),
      {
        numRuns: Math.min(100, questions.length),
        verbose: true,
      }
    );
  });

  it('属性 7: 题目结构完整性 - 验证每道题恰好有2个干扰项', () => {
    // 获取所有题目
    const questions = db
      .prepare(
        `SELECT id, text, correct_answer_id
         FROM questions`
      )
      .all();

    assert.ok(questions.length > 0, '数据库中应该有题目');

    fc.assert(
      fc.property(
        fc.constantFrom(...questions),
        (question) => {
          // 获取该题目的所有选项
          const options = db
            .prepare(
              `SELECT option_id
               FROM options
               WHERE question_id = ?`
            )
            .all(question.id);

          // 计算干扰项数量（不是正确答案的选项）
          const distractorCount = options.filter(
            (opt) => opt.option_id !== question.correct_answer_id
          ).length;

          // 每道题应该有恰好2个干扰项
          assert.strictEqual(
            distractorCount,
            2,
            `题目 "${question.text}" 应该有恰好2个干扰项，实际有 ${distractorCount} 个`
          );

          return true;
        }
      ),
      {
        numRuns: Math.min(100, questions.length),
        verbose: true,
      }
    );
  });
});
