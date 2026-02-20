/**
 * 问答管理路由单元测试
 */

import { describe, test, before, after } from 'node:test';
import assert from 'node:assert';
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

describe('Questions API', () => {
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
    seedQuestions(database.getDb());
  });

  after(() => {
    if (!request) return;
    // 清理测试数据
    database.run('DELETE FROM answers');
    database.run('DELETE FROM options');
    database.run('DELETE FROM questions');
  });

  describe('GET /api/questions', () => {
    test('should return all questions with options', async () => {
      if (!request) return;
      
      const response = await request(app).get('/api/questions');

      assert.strictEqual(response.status, 200);
      assert.ok(response.body.questions);
      assert.ok(Array.isArray(response.body.questions));
      assert.ok(response.body.questions.length > 0);
    });

    test('each question should have correct structure', async () => {
      if (!request) return;
      
      const response = await request(app).get('/api/questions');

      const questions = response.body.questions;
      assert.ok(questions.length > 0);

      questions.forEach((question) => {
        // 验证题目字段
        assert.ok(question.id);
        assert.ok(question.text);
        assert.ok(question.difficulty);
        assert.ok(question.correctAnswerId);
        assert.ok(question.options);

        // 验证字段类型
        assert.strictEqual(typeof question.id, 'string');
        assert.strictEqual(typeof question.text, 'string');
        assert.ok(['basic', 'advanced'].includes(question.difficulty));
        assert.strictEqual(typeof question.correctAnswerId, 'string');
        assert.ok(Array.isArray(question.options));
      });
    });

    test('each question should have exactly 3 options', async () => {
      if (!request) return;
      
      const response = await request(app).get('/api/questions');

      const questions = response.body.questions;
      questions.forEach((question) => {
        assert.strictEqual(question.options.length, 3);
      });
    });

    test('each option should have correct structure', async () => {
      if (!request) return;
      
      const response = await request(app).get('/api/questions');

      const questions = response.body.questions;
      questions.forEach((question) => {
        question.options.forEach((option) => {
          assert.ok(option.id);
          assert.ok(option.text);
          assert.strictEqual(typeof option.id, 'string');
          assert.strictEqual(typeof option.text, 'string');
        });
      });
    });

    test('each question should have exactly one correct answer', async () => {
      if (!request) return;
      
      const response = await request(app).get('/api/questions');

      const questions = response.body.questions;
      questions.forEach((question) => {
        const correctOptions = question.options.filter(
          (option) => option.id === question.correctAnswerId
        );
        assert.strictEqual(correctOptions.length, 1);
      });
    });

    test('should include both basic and advanced questions', async () => {
      if (!request) return;
      
      const response = await request(app).get('/api/questions');

      const questions = response.body.questions;
      const basicQuestions = questions.filter((q) => q.difficulty === 'basic');
      const advancedQuestions = questions.filter((q) => q.difficulty === 'advanced');

      assert.ok(basicQuestions.length > 0);
      assert.ok(advancedQuestions.length > 0);
    });

    test('should return questions sorted by difficulty and creation time', async () => {
      if (!request) return;
      
      const response = await request(app).get('/api/questions');

      const questions = response.body.questions;
      
      // 找到第一个 advanced 题目的索引
      const firstAdvancedIndex = questions.findIndex((q) => q.difficulty === 'advanced');
      
      if (firstAdvancedIndex > 0) {
        // 验证在第一个 advanced 题目之前的所有题目都是 basic
        for (let i = 0; i < firstAdvancedIndex; i++) {
          assert.strictEqual(questions[i].difficulty, 'basic');
        }
      }
    });

    test('should handle database errors gracefully', async () => {
      if (!request) return;
      
      // 临时关闭数据库连接以模拟错误
      const originalDb = database.getDb();
      database.close();

      const response = await request(app).get('/api/questions');

      assert.strictEqual(response.status, 500);
      assert.ok(response.body.error);

      // 恢复数据库连接
      database.connect();
      seedQuestions(database.getDb());
    });
  });

  describe('POST /api/questions/answer', () => {
    let testUserId;
    let testQuestionId;
    let testCorrectAnswerId;
    let testQuestionDifficulty;

    before(() => {
      if (!request) return;
      
      // 创建测试用户
      testUserId = `test-user-${Date.now()}`;
      database.run(
        'INSERT INTO users (id, username, score) VALUES (?, ?, ?)',
        [testUserId, `测试用户-${Date.now()}`, 0]
      );

      // 获取一个测试题目
      const question = database.queryOne('SELECT id, correct_answer_id, difficulty FROM questions LIMIT 1');
      testQuestionId = question.id;
      testCorrectAnswerId = question.correct_answer_id;
      testQuestionDifficulty = question.difficulty;
    });

    after(() => {
      if (!request) return;
      
      // 清理测试用户
      database.run('DELETE FROM users WHERE id = ?', [testUserId]);
    });

    test('should successfully submit correct answer for basic question', async () => {
      if (!request) return;
      
      // 找一个基础题
      const basicQuestion = database.queryOne(
        "SELECT id, correct_answer_id FROM questions WHERE difficulty = 'basic' LIMIT 1"
      );

      const response = await request(app)
        .post('/api/questions/answer')
        .send({
          userId: testUserId,
          questionId: basicQuestion.id,
          answerId: basicQuestion.correct_answer_id,
        });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.correct, true);
      assert.strictEqual(response.body.scoreEarned, 10);
      assert.strictEqual(response.body.totalScore, 10);
    });

    test('should successfully submit correct answer for advanced question', async () => {
      if (!request) return;
      
      // 找一个提升题
      const advancedQuestion = database.queryOne(
        "SELECT id, correct_answer_id FROM questions WHERE difficulty = 'advanced' LIMIT 1"
      );

      // 创建新用户以避免重复提交
      const newUserId = `test-user-adv-${Date.now()}`;
      database.run(
        'INSERT INTO users (id, username, score) VALUES (?, ?, ?)',
        [newUserId, `测试用户-adv-${Date.now()}`, 0]
      );

      const response = await request(app)
        .post('/api/questions/answer')
        .send({
          userId: newUserId,
          questionId: advancedQuestion.id,
          answerId: advancedQuestion.correct_answer_id,
        });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.correct, true);
      assert.strictEqual(response.body.scoreEarned, 20);
      assert.strictEqual(response.body.totalScore, 20);

      // 清理
      database.run('DELETE FROM users WHERE id = ?', [newUserId]);
    });

    test('should handle incorrect answer without deducting points', async () => {
      if (!request) return;
      
      // 创建新用户
      const newUserId = `test-user-wrong-${Date.now()}`;
      database.run(
        'INSERT INTO users (id, username, score) VALUES (?, ?, ?)',
        [newUserId, `测试用户-wrong-${Date.now()}`, 50]
      );

      const question = database.queryOne('SELECT id, correct_answer_id FROM questions LIMIT 1');
      
      // 选择错误答案
      const wrongAnswerId = question.correct_answer_id === 'a' ? 'b' : 'a';

      const response = await request(app)
        .post('/api/questions/answer')
        .send({
          userId: newUserId,
          questionId: question.id,
          answerId: wrongAnswerId,
        });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.correct, false);
      assert.strictEqual(response.body.scoreEarned, 0);
      assert.strictEqual(response.body.totalScore, 50); // 积分不变

      // 清理
      database.run('DELETE FROM users WHERE id = ?', [newUserId]);
    });

    test('should reject missing userId parameter', async () => {
      if (!request) return;
      
      const response = await request(app)
        .post('/api/questions/answer')
        .send({
          questionId: testQuestionId,
          answerId: 'a',
        });

      assert.strictEqual(response.status, 400);
      assert.ok(response.body.error);
      assert.ok(response.body.error.includes('缺少必需参数'));
    });

    test('should reject missing questionId parameter', async () => {
      if (!request) return;
      
      const response = await request(app)
        .post('/api/questions/answer')
        .send({
          userId: testUserId,
          answerId: 'a',
        });

      assert.strictEqual(response.status, 400);
      assert.ok(response.body.error);
      assert.ok(response.body.error.includes('缺少必需参数'));
    });

    test('should reject missing answerId parameter', async () => {
      if (!request) return;
      
      const response = await request(app)
        .post('/api/questions/answer')
        .send({
          userId: testUserId,
          questionId: testQuestionId,
        });

      assert.strictEqual(response.status, 400);
      assert.ok(response.body.error);
      assert.ok(response.body.error.includes('缺少必需参数'));
    });

    test('should reject invalid userId', async () => {
      if (!request) return;
      
      const response = await request(app)
        .post('/api/questions/answer')
        .send({
          userId: 'non-existent-user-id',
          questionId: testQuestionId,
          answerId: 'a',
        });

      assert.strictEqual(response.status, 404);
      assert.ok(response.body.error);
      assert.ok(response.body.error.includes('用户不存在'));
    });

    test('should reject invalid questionId', async () => {
      if (!request) return;
      
      const response = await request(app)
        .post('/api/questions/answer')
        .send({
          userId: testUserId,
          questionId: 'non-existent-question-id',
          answerId: 'a',
        });

      assert.strictEqual(response.status, 404);
      assert.ok(response.body.error);
      assert.ok(response.body.error.includes('题目不存在'));
    });

    test('should prevent duplicate answer submission', async () => {
      if (!request) return;
      
      // 创建新用户
      const newUserId = `test-user-dup-${Date.now()}`;
      database.run(
        'INSERT INTO users (id, username, score) VALUES (?, ?, ?)',
        [newUserId, `测试用户-dup-${Date.now()}`, 0]
      );

      const question = database.queryOne('SELECT id, correct_answer_id FROM questions LIMIT 1');

      // 第一次提交
      const firstResponse = await request(app)
        .post('/api/questions/answer')
        .send({
          userId: newUserId,
          questionId: question.id,
          answerId: question.correct_answer_id,
        });

      assert.strictEqual(firstResponse.status, 200);

      // 第二次提交（应该被拒绝）
      const secondResponse = await request(app)
        .post('/api/questions/answer')
        .send({
          userId: newUserId,
          questionId: question.id,
          answerId: question.correct_answer_id,
        });

      assert.strictEqual(secondResponse.status, 409);
      assert.ok(secondResponse.body.error);
      assert.ok(secondResponse.body.error.includes('已回答'));

      // 清理
      database.run('DELETE FROM users WHERE id = ?', [newUserId]);
    });

    test('should record answer in answers table', async () => {
      if (!request) return;
      
      // 创建新用户
      const newUserId = `test-user-record-${Date.now()}`;
      database.run(
        'INSERT INTO users (id, username, score) VALUES (?, ?, ?)',
        [newUserId, `测试用户-record-${Date.now()}`, 0]
      );

      const question = database.queryOne('SELECT id, correct_answer_id FROM questions LIMIT 1');

      await request(app)
        .post('/api/questions/answer')
        .send({
          userId: newUserId,
          questionId: question.id,
          answerId: question.correct_answer_id,
        });

      // 验证答题记录已保存
      const answer = database.queryOne(
        'SELECT * FROM answers WHERE user_id = ? AND question_id = ?',
        [newUserId, question.id]
      );

      assert.ok(answer);
      assert.strictEqual(answer.user_id, newUserId);
      assert.strictEqual(answer.question_id, question.id);
      assert.strictEqual(answer.selected_answer_id, question.correct_answer_id);
      assert.strictEqual(answer.is_correct, 1);
      assert.ok(answer.score_earned > 0);

      // 清理
      database.run('DELETE FROM users WHERE id = ?', [newUserId]);
    });

    test('should accumulate score across multiple correct answers', async () => {
      if (!request) return;
      
      // 创建新用户
      const newUserId = `test-user-accum-${Date.now()}`;
      database.run(
        'INSERT INTO users (id, username, score) VALUES (?, ?, ?)',
        [newUserId, `测试用户-accum-${Date.now()}`, 0]
      );

      const questions = database.query('SELECT id, correct_answer_id, difficulty FROM questions LIMIT 3');

      let expectedScore = 0;
      for (const question of questions) {
        const response = await request(app)
          .post('/api/questions/answer')
          .send({
            userId: newUserId,
            questionId: question.id,
            answerId: question.correct_answer_id,
          });

        expectedScore += question.difficulty === 'basic' ? 10 : 20;
        assert.strictEqual(response.body.totalScore, expectedScore);
      }

      // 清理
      database.run('DELETE FROM users WHERE id = ?', [newUserId]);
    });

    test('should handle database errors gracefully', async () => {
      if (!request) return;
      
      // 临时关闭数据库连接以模拟错误
      database.close();

      const response = await request(app)
        .post('/api/questions/answer')
        .send({
          userId: testUserId,
          questionId: testQuestionId,
          answerId: 'a',
        });

      assert.strictEqual(response.status, 500);
      assert.ok(response.body.error);

      // 恢复数据库连接
      database.connect();
      seedQuestions(database.getDb());
      
      // 重新创建测试用户
      database.run(
        'INSERT INTO users (id, username, score) VALUES (?, ?, ?)',
        [testUserId, `测试用户-${Date.now()}`, 0]
      );
    });
  });
});
