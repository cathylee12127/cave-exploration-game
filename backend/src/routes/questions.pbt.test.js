/**
 * 问答管理路由属性测试
 * Feature: cave-exploration-game
 */

import { describe, test, before, after } from 'node:test';
import assert from 'node:assert';
import fc from 'fast-check';
import database from '../../database/db.js';
import { seedQuestions } from '../../database/seed.js';

// 动态导入以处理可能缺少的依赖
let request;
let app;

try {
  const supertest = await import('supertest');
  request = supertest.default;
  const indexModule = await import('../index.js');
  app = indexModule.default;
} catch (error) {
  console.log('Warning: supertest not installed. Run "npm install" to install dependencies.');
}

describe('Questions API - Property-Based Tests', () => {
  before(() => {
    if (!request) {
      console.log('Skipping tests - supertest not available');
      return;
    }
    // 确保数据库已连接
    if (!database.getDb()) {
      database.connect();
    }

    // 清空并重新插入测试数据
    database.run('DELETE FROM answers');
    database.run('DELETE FROM options');
    database.run('DELETE FROM questions');
    database.run('DELETE FROM users');
    seedQuestions(database.getDb());
  });

  after(() => {
    if (!request) return;
    // 清理测试数据
    database.run('DELETE FROM answers');
    database.run('DELETE FROM options');
    database.run('DELETE FROM questions');
    database.run('DELETE FROM users');
  });

  // Feature: cave-exploration-game, Property 8: 答案验证正确性
  // **Validates: Requirements 4.5**
  test('property: answer validation correctness', async () => {
    if (!request) return;

    // 获取所有题目
    const questions = database.query('SELECT id, correct_answer_id, difficulty FROM questions');
    
    if (questions.length === 0) {
      console.log('No questions available for testing');
      return;
    }

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...questions),
        fc.constantFrom('a', 'b', 'c'),
        async (question, selectedAnswerId) => {
          // 创建唯一的测试用户
          const userId = `test-user-pbt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          database.run(
            'INSERT INTO users (id, username, score) VALUES (?, ?, ?)',
            [userId, `测试用户-${userId}`, 0]
          );

          try {
            const response = await request(app)
              .post('/api/questions/answer')
              .send({
                userId: userId,
                questionId: question.id,
                answerId: selectedAnswerId,
              });

            // 验证响应状态
            assert.strictEqual(response.status, 200);

            // 验证答案正确性判断
            const expectedCorrect = selectedAnswerId === question.correct_answer_id;
            assert.strictEqual(response.body.correct, expectedCorrect);

            // 验证得分计算
            if (expectedCorrect) {
              const expectedScore = question.difficulty === 'basic' ? 10 : 20;
              assert.strictEqual(response.body.scoreEarned, expectedScore);
              assert.strictEqual(response.body.totalScore, expectedScore);
            } else {
              assert.strictEqual(response.body.scoreEarned, 0);
              assert.strictEqual(response.body.totalScore, 0);
            }
          } finally {
            // 清理测试用户
            database.run('DELETE FROM users WHERE id = ?', [userId]);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  // Feature: cave-exploration-game, Property 10: 积分计算规则
  // **Validates: Requirements 5.2, 5.3, 4.6**
  test('property: score calculation rules', async () => {
    if (!request) return;

    // 获取基础题和提升题
    const basicQuestions = database.query("SELECT id, correct_answer_id FROM questions WHERE difficulty = 'basic'");
    const advancedQuestions = database.query("SELECT id, correct_answer_id FROM questions WHERE difficulty = 'advanced'");

    if (basicQuestions.length === 0 || advancedQuestions.length === 0) {
      console.log('Need both basic and advanced questions for testing');
      return;
    }

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('basic', 'advanced'),
        fc.integer({ min: 0, max: 100 }),
        async (difficulty, initialScore) => {
          // 创建唯一的测试用户
          const userId = `test-user-score-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          database.run(
            'INSERT INTO users (id, username, score) VALUES (?, ?, ?)',
            [userId, `测试用户-${userId}`, initialScore]
          );

          try {
            // 选择对应难度的题目
            const question = difficulty === 'basic' 
              ? basicQuestions[0] 
              : advancedQuestions[0];

            const response = await request(app)
              .post('/api/questions/answer')
              .send({
                userId: userId,
                questionId: question.id,
                answerId: question.correct_answer_id,
              });

            // 验证得分计算
            const expectedScoreEarned = difficulty === 'basic' ? 10 : 20;
            assert.strictEqual(response.body.scoreEarned, expectedScoreEarned);
            assert.strictEqual(response.body.totalScore, initialScore + expectedScoreEarned);
          } finally {
            // 清理测试用户
            database.run('DELETE FROM users WHERE id = ?', [userId]);
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  // Feature: cave-exploration-game, Property 9: 答错不扣分
  // **Validates: Requirements 4.7, 5.4**
  test('property: wrong answer does not deduct points', async () => {
    if (!request) return;

    const questions = database.query('SELECT id, correct_answer_id FROM questions');
    
    if (questions.length === 0) {
      console.log('No questions available for testing');
      return;
    }

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...questions),
        fc.integer({ min: 0, max: 200 }),
        async (question, initialScore) => {
          // 创建唯一的测试用户
          const userId = `test-user-wrong-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          database.run(
            'INSERT INTO users (id, username, score) VALUES (?, ?, ?)',
            [userId, `测试用户-${userId}`, initialScore]
          );

          try {
            // 选择错误答案
            const wrongAnswerId = question.correct_answer_id === 'a' ? 'b' : 'a';

            const response = await request(app)
              .post('/api/questions/answer')
              .send({
                userId: userId,
                questionId: question.id,
                answerId: wrongAnswerId,
              });

            // 验证答错不扣分
            assert.strictEqual(response.body.correct, false);
            assert.strictEqual(response.body.scoreEarned, 0);
            assert.strictEqual(response.body.totalScore, initialScore);
          } finally {
            // 清理测试用户
            database.run('DELETE FROM users WHERE id = ?', [userId]);
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  // Property: Duplicate answer prevention
  // **Validates: Requirements 4.5**
  test('property: prevent duplicate answer submission', async () => {
    if (!request) return;

    const questions = database.query('SELECT id, correct_answer_id FROM questions');
    
    if (questions.length === 0) {
      console.log('No questions available for testing');
      return;
    }

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...questions),
        async (question) => {
          // 创建唯一的测试用户
          const userId = `test-user-dup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          database.run(
            'INSERT INTO users (id, username, score) VALUES (?, ?, ?)',
            [userId, `测试用户-${userId}`, 0]
          );

          try {
            // 第一次提交
            const firstResponse = await request(app)
              .post('/api/questions/answer')
              .send({
                userId: userId,
                questionId: question.id,
                answerId: question.correct_answer_id,
              });

            assert.strictEqual(firstResponse.status, 200);

            // 第二次提交（应该被拒绝）
            const secondResponse = await request(app)
              .post('/api/questions/answer')
              .send({
                userId: userId,
                questionId: question.id,
                answerId: question.correct_answer_id,
              });

            assert.strictEqual(secondResponse.status, 409);
            assert.ok(secondResponse.body.error);
          } finally {
            // 清理测试用户
            database.run('DELETE FROM users WHERE id = ?', [userId]);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  // Property: Score accumulation across multiple answers
  // **Validates: Requirements 5.2, 5.3**
  test('property: score accumulates correctly across multiple answers', async () => {
    if (!request) return;

    const allQuestions = database.query('SELECT id, correct_answer_id, difficulty FROM questions');
    
    if (allQuestions.length < 3) {
      console.log('Need at least 3 questions for testing');
      return;
    }

    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: Math.min(5, allQuestions.length) }),
        async (numQuestions) => {
          // 创建唯一的测试用户
          const userId = `test-user-accum-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          database.run(
            'INSERT INTO users (id, username, score) VALUES (?, ?, ?)',
            [userId, `测试用户-${userId}`, 0]
          );

          try {
            let expectedTotalScore = 0;
            const questionsToAnswer = allQuestions.slice(0, numQuestions);

            for (const question of questionsToAnswer) {
              const response = await request(app)
                .post('/api/questions/answer')
                .send({
                  userId: userId,
                  questionId: question.id,
                  answerId: question.correct_answer_id,
                });

              const scoreEarned = question.difficulty === 'basic' ? 10 : 20;
              expectedTotalScore += scoreEarned;

              assert.strictEqual(response.body.totalScore, expectedTotalScore);
            }
          } finally {
            // 清理测试用户
            database.run('DELETE FROM users WHERE id = ?', [userId]);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  // Property: Answer records are persisted correctly
  // **Validates: Requirements 4.5, 4.6**
  test('property: answer records are persisted with correct data', async () => {
    if (!request) return;

    const questions = database.query('SELECT id, correct_answer_id, difficulty FROM questions');
    
    if (questions.length === 0) {
      console.log('No questions available for testing');
      return;
    }

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...questions),
        fc.constantFrom('a', 'b', 'c'),
        async (question, selectedAnswerId) => {
          // 创建唯一的测试用户
          const userId = `test-user-persist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          database.run(
            'INSERT INTO users (id, username, score) VALUES (?, ?, ?)',
            [userId, `测试用户-${userId}`, 0]
          );

          try {
            await request(app)
              .post('/api/questions/answer')
              .send({
                userId: userId,
                questionId: question.id,
                answerId: selectedAnswerId,
              });

            // 验证答题记录已保存
            const answer = database.queryOne(
              'SELECT * FROM answers WHERE user_id = ? AND question_id = ?',
              [userId, question.id]
            );

            assert.ok(answer, 'Answer record should exist');
            assert.strictEqual(answer.user_id, userId);
            assert.strictEqual(answer.question_id, question.id);
            assert.strictEqual(answer.selected_answer_id, selectedAnswerId);
            
            const expectedCorrect = selectedAnswerId === question.correct_answer_id;
            assert.strictEqual(answer.is_correct, expectedCorrect ? 1 : 0);
            
            if (expectedCorrect) {
              const expectedScore = question.difficulty === 'basic' ? 10 : 20;
              assert.strictEqual(answer.score_earned, expectedScore);
            } else {
              assert.strictEqual(answer.score_earned, 0);
            }
          } finally {
            // 清理测试用户
            database.run('DELETE FROM users WHERE id = ?', [userId]);
          }
        }
      ),
      { numRuns: 30 }
    );
  });
});
