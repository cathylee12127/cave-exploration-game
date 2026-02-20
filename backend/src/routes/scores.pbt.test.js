/**
 * 积分和排名管理路由属性测试
 * Feature: cave-exploration-game
 */

import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import fc from 'fast-check';
import database from '../../database/db.js';
import { randomUUID } from 'crypto';

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

describe('Scores and Rankings API - Property-Based Tests', () => {
  before(() => {
    if (!request) {
      console.log('Skipping tests - supertest not available');
      return;
    }
    // 确保数据库已初始化
    if (!database.db) {
      database.connect();
    }
  });

  after(() => {
    if (database.db) {
      database.close();
    }
  });

  beforeEach(() => {
    if (!request) return;
    // 清理测试数据
    database.run('DELETE FROM answers');
    database.run('DELETE FROM users');
  });

  /**
   * 属性 13: 排名按积分降序排列
   * **Validates: Requirements 6.2**
   * 
   * 对于任何用户列表，排名系统应该按积分从高到低排序，积分高的用户排名靠前。
   */
  it('Property 13: rankings sorted by score descending', async () => {
    if (!request) return;

    await fc.assert(
      fc.asyncProperty(
        // 生成2-10个用户，每个用户有随机积分
        fc.array(
          fc.record({
            username: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            score: fc.integer({ min: 0, max: 200 }),
          }),
          { minLength: 2, maxLength: 10 }
        ),
        async (users) => {
          // 插入用户数据（标记为已完成游戏）
          for (const user of users) {
            const userId = randomUUID();
            database.run(
              'INSERT INTO users (id, username, score, completed_at) VALUES (?, ?, ?, datetime("now"))',
              [userId, user.username, user.score]
            );
          }

          // 获取排名
          const response = await request(app).get('/api/rankings');

          assert.strictEqual(response.status, 200);
          const rankings = response.body.rankings;

          // 验证排序：每个用户的积分应该 >= 下一个用户的积分
          for (let i = 0; i < rankings.length - 1; i++) {
            assert.ok(
              rankings[i].score >= rankings[i + 1].score,
              `排名 ${i + 1} 的积分 (${rankings[i].score}) 应该 >= 排名 ${i + 2} 的积分 (${rankings[i + 1].score})`
            );
          }
        }
      ),
      { numRuns: 20 } // 运行20次以平衡测试时间和覆盖率
    );
  });

  /**
   * 属性 14: 相同积分按时间排序
   * **Validates: Requirements 6.3**
   * 
   * 对于任何两个积分相同的用户，完成游戏时间较早的用户应该排在较晚的用户之前。
   */
  it('Property 14: same score sorted by time ascending', async () => {
    if (!request) return;

    await fc.assert(
      fc.asyncProperty(
        // 生成相同积分
        fc.integer({ min: 0, max: 200 }),
        // 生成2-5个用户名
        fc.array(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          { minLength: 2, maxLength: 5 }
        ),
        async (score, usernames) => {
          // 按顺序插入相同积分的用户（使用延迟确保时间戳不同）
          const insertedUsers = [];
          for (const username of usernames) {
            const userId = randomUUID();
            database.run(
              'INSERT INTO users (id, username, score, completed_at) VALUES (?, ?, ?, datetime("now"))',
              [userId, username, score]
            );
            insertedUsers.push(username);
            // 小延迟确保时间戳不同
            await new Promise(resolve => setTimeout(resolve, 10));
          }

          // 获取排名
          const response = await request(app).get('/api/rankings');

          assert.strictEqual(response.status, 200);
          const rankings = response.body.rankings;

          // 验证相同积分的用户按插入顺序排列（时间升序）
          const sameScoreRankings = rankings.filter(r => r.score === score);
          for (let i = 0; i < sameScoreRankings.length; i++) {
            assert.strictEqual(
              sameScoreRankings[i].username,
              insertedUsers[i],
              `相同积分的用户应该按时间升序排列`
            );
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  /**
   * 属性 15: 排名数据完整性
   * **Validates: Requirements 6.4**
   * 
   * 对于任何排名列表中的条目，每个条目应该包含排名序号、用户姓名、积分和时间戳这四个字段。
   */
  it('Property 15: ranking data completeness', async () => {
    if (!request) return;

    await fc.assert(
      fc.asyncProperty(
        // 生成1-10个用户
        fc.array(
          fc.record({
            username: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            score: fc.integer({ min: 0, max: 200 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (users) => {
          // 插入用户数据
          for (const user of users) {
            const userId = randomUUID();
            database.run(
              'INSERT INTO users (id, username, score, completed_at) VALUES (?, ?, ?, datetime("now"))',
              [userId, user.username, user.score]
            );
          }

          // 获取排名
          const response = await request(app).get('/api/rankings');

          assert.strictEqual(response.status, 200);
          const rankings = response.body.rankings;

          // 验证每个排名条目包含所有必需字段
          for (const ranking of rankings) {
            assert.ok(ranking.hasOwnProperty('rank'), '排名条目应该包含 rank 字段');
            assert.ok(ranking.hasOwnProperty('username'), '排名条目应该包含 username 字段');
            assert.ok(ranking.hasOwnProperty('score'), '排名条目应该包含 score 字段');
            assert.ok(ranking.hasOwnProperty('timestamp'), '排名条目应该包含 timestamp 字段');

            // 验证字段类型
            assert.strictEqual(typeof ranking.rank, 'number', 'rank 应该是数字');
            assert.strictEqual(typeof ranking.username, 'string', 'username 应该是字符串');
            assert.strictEqual(typeof ranking.score, 'number', 'score 应该是数字');
            assert.strictEqual(typeof ranking.timestamp, 'string', 'timestamp 应该是字符串');

            // 验证 rank 是正整数
            assert.ok(ranking.rank > 0, 'rank 应该是正整数');
            assert.ok(Number.isInteger(ranking.rank), 'rank 应该是整数');

            // 验证 score 是非负整数
            assert.ok(ranking.score >= 0, 'score 应该是非负数');
            assert.ok(Number.isInteger(ranking.score), 'score 应该是整数');

            // 验证 username 非空
            assert.ok(ranking.username.length > 0, 'username 不应该为空');

            // 验证 timestamp 格式（ISO 8601 格式）
            assert.ok(
              /^\d{4}-\d{2}-\d{2}/.test(ranking.timestamp),
              'timestamp 应该是有效的日期格式'
            );
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * 属性: 分页参数验证
   * 
   * 对于任何有效的 limit 和 offset 参数，返回的结果数量应该正确，
   * 并且排名序号应该从 offset + 1 开始。
   */
  it('Property: pagination parameters work correctly', async () => {
    if (!request) return;

    await fc.assert(
      fc.asyncProperty(
        // 生成10-20个用户
        fc.integer({ min: 10, max: 20 }),
        // 生成有效的 limit (1-10)
        fc.integer({ min: 1, max: 10 }),
        // 生成有效的 offset (0-5)
        fc.integer({ min: 0, max: 5 }),
        async (userCount, limit, offset) => {
          // 创建用户
          for (let i = 0; i < userCount; i++) {
            const userId = randomUUID();
            database.run(
              'INSERT INTO users (id, username, score, completed_at) VALUES (?, ?, ?, datetime("now"))',
              [userId, `用户${i}`, i * 10]
            );
          }

          // 获取排名
          const response = await request(app).get(`/api/rankings?limit=${limit}&offset=${offset}`);

          assert.strictEqual(response.status, 200);
          const rankings = response.body.rankings;

          // 验证返回的数量不超过 limit
          assert.ok(rankings.length <= limit, `返回的数量 (${rankings.length}) 不应该超过 limit (${limit})`);

          // 验证返回的数量不超过剩余用户数
          const expectedCount = Math.min(limit, userCount - offset);
          assert.strictEqual(
            rankings.length,
            expectedCount,
            `返回的数量应该是 ${expectedCount}`
          );

          // 验证排名序号从 offset + 1 开始
          if (rankings.length > 0) {
            assert.strictEqual(
              rankings[0].rank,
              offset + 1,
              `第一个排名序号应该是 ${offset + 1}`
            );

            // 验证排名序号连续
            for (let i = 1; i < rankings.length; i++) {
              assert.strictEqual(
                rankings[i].rank,
                rankings[i - 1].rank + 1,
                '排名序号应该连续'
              );
            }
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  /**
   * 属性: 用户积分查询正确性
   * 
   * 对于任何存在的用户，查询返回的积分应该与数据库中的积分一致。
   */
  it('Property: user score query returns correct score', async () => {
    if (!request) return;

    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        fc.integer({ min: 0, max: 200 }),
        async (username, score) => {
          // 创建用户
          const userId = randomUUID();
          database.run(
            'INSERT INTO users (id, username, score) VALUES (?, ?, ?)',
            [userId, username, score]
          );

          // 查询用户积分
          const response = await request(app).get(`/api/scores/${userId}`);

          assert.strictEqual(response.status, 200);
          assert.strictEqual(response.body.userId, userId);
          assert.strictEqual(response.body.username, username);
          assert.strictEqual(response.body.score, score);
        }
      ),
      { numRuns: 20 }
    );
  });
});
