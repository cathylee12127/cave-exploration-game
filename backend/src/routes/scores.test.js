/**
 * 积分和排名管理路由单元测试
 */

import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
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

describe('Scores and Rankings API', () => {
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

  describe('GET /api/scores/:userId', () => {
    it('should return user score successfully', async () => {
      if (!request) return;
      
      // 创建测试用户
      const userId = randomUUID();
      database.run(
        'INSERT INTO users (id, username, score) VALUES (?, ?, ?)',
        [userId, '测试用户', 50]
      );

      const response = await request(app).get(`/api/scores/${userId}`);

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.body, {
        userId: userId,
        username: '测试用户',
        score: 50,
      });
    });

    it('should return 404 when user does not exist', async () => {
      if (!request) return;
      
      const nonExistentUserId = randomUUID();

      const response = await request(app).get(`/api/scores/${nonExistentUserId}`);

      assert.strictEqual(response.status, 404);
      assert.ok(response.body.error);
      assert.strictEqual(response.body.error, '用户不存在');
    });

    it('should return 400 when userId is empty', async () => {
      if (!request) return;
      
      const response = await request(app).get('/api/scores/ ');

      assert.strictEqual(response.status, 400);
      assert.ok(response.body.error);
      assert.strictEqual(response.body.error, '用户ID不能为空');
    });

    it('should return user with zero score', async () => {
      if (!request) return;
      
      // 创建积分为0的用户
      const userId = randomUUID();
      database.run(
        'INSERT INTO users (id, username, score) VALUES (?, ?, ?)',
        [userId, '新用户', 0]
      );

      const response = await request(app).get(`/api/scores/${userId}`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.score, 0);
    });

    it('should return user with maximum score', async () => {
      if (!request) return;
      
      // 创建高分用户
      const userId = randomUUID();
      database.run(
        'INSERT INTO users (id, username, score) VALUES (?, ?, ?)',
        [userId, '高分用户', 200]
      );

      const response = await request(app).get(`/api/scores/${userId}`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.score, 200);
    });
  });

  describe('GET /api/rankings', () => {
    it('should return empty rankings when no users completed game', async () => {
      if (!request) return;
      
      // 创建未完成游戏的用户（completed_at 为 NULL）
      const userId = randomUUID();
      database.run(
        'INSERT INTO users (id, username, score) VALUES (?, ?, ?)',
        [userId, '未完成用户', 50]
      );

      const response = await request(app).get('/api/rankings');

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.body.rankings, []);
    });

    it('should return rankings sorted by score descending', async () => {
      if (!request) return;
      
      // 创建多个完成游戏的用户
      const users = [
        { username: '用户A', score: 50 },
        { username: '用户B', score: 100 },
        { username: '用户C', score: 30 },
      ];

      for (const user of users) {
        const userId = randomUUID();
        database.run(
          'INSERT INTO users (id, username, score, completed_at) VALUES (?, ?, ?, datetime("now"))',
          [userId, user.username, user.score]
        );
      }

      const response = await request(app).get('/api/rankings');

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.rankings.length, 3);
      
      // 验证按积分降序排列
      assert.strictEqual(response.body.rankings[0].username, '用户B');
      assert.strictEqual(response.body.rankings[0].score, 100);
      assert.strictEqual(response.body.rankings[0].rank, 1);
      
      assert.strictEqual(response.body.rankings[1].username, '用户A');
      assert.strictEqual(response.body.rankings[1].score, 50);
      assert.strictEqual(response.body.rankings[1].rank, 2);
      
      assert.strictEqual(response.body.rankings[2].username, '用户C');
      assert.strictEqual(response.body.rankings[2].score, 30);
      assert.strictEqual(response.body.rankings[2].rank, 3);
    });

    it('should sort by timestamp when scores are equal', async () => {
      if (!request) return;
      
      // 创建相同积分的用户，按时间顺序
      const users = [
        { username: '用户1', score: 50, delay: 0 },
        { username: '用户2', score: 50, delay: 100 },
        { username: '用户3', score: 50, delay: 200 },
      ];

      for (const user of users) {
        const userId = randomUUID();
        // 使用不同的时间戳
        await new Promise(resolve => setTimeout(resolve, user.delay));
        database.run(
          'INSERT INTO users (id, username, score, completed_at) VALUES (?, ?, ?, datetime("now"))',
          [userId, user.username, user.score]
        );
      }

      const response = await request(app).get('/api/rankings');

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.rankings.length, 3);
      
      // 验证相同积分时按时间升序排列（先完成的排前面）
      assert.strictEqual(response.body.rankings[0].username, '用户1');
      assert.strictEqual(response.body.rankings[1].username, '用户2');
      assert.strictEqual(response.body.rankings[2].username, '用户3');
    });

    it('should support pagination with limit parameter', async () => {
      if (!request) return;
      
      // 创建5个用户
      for (let i = 1; i <= 5; i++) {
        const userId = randomUUID();
        database.run(
          'INSERT INTO users (id, username, score, completed_at) VALUES (?, ?, ?, datetime("now"))',
          [userId, `用户${i}`, i * 10]
        );
      }

      const response = await request(app).get('/api/rankings?limit=3');

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.rankings.length, 3);
      
      // 验证返回前3名
      assert.strictEqual(response.body.rankings[0].score, 50);
      assert.strictEqual(response.body.rankings[1].score, 40);
      assert.strictEqual(response.body.rankings[2].score, 30);
    });

    it('should support pagination with offset parameter', async () => {
      if (!request) return;
      
      // 创建5个用户
      for (let i = 1; i <= 5; i++) {
        const userId = randomUUID();
        database.run(
          'INSERT INTO users (id, username, score, completed_at) VALUES (?, ?, ?, datetime("now"))',
          [userId, `用户${i}`, i * 10]
        );
      }

      const response = await request(app).get('/api/rankings?offset=2');

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.rankings.length, 3);
      
      // 验证跳过前2名，从第3名开始
      assert.strictEqual(response.body.rankings[0].rank, 3);
      assert.strictEqual(response.body.rankings[0].score, 30);
    });

    it('should support both limit and offset parameters', async () => {
      if (!request) return;
      
      // 创建10个用户
      for (let i = 1; i <= 10; i++) {
        const userId = randomUUID();
        database.run(
          'INSERT INTO users (id, username, score, completed_at) VALUES (?, ?, ?, datetime("now"))',
          [userId, `用户${i}`, i * 10]
        );
      }

      const response = await request(app).get('/api/rankings?limit=3&offset=5');

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.rankings.length, 3);
      
      // 验证从第6名开始，返回3条
      assert.strictEqual(response.body.rankings[0].rank, 6);
      assert.strictEqual(response.body.rankings[1].rank, 7);
      assert.strictEqual(response.body.rankings[2].rank, 8);
    });

    it('should return 400 when limit is invalid', async () => {
      if (!request) return;
      
      const response = await request(app).get('/api/rankings?limit=0');

      assert.strictEqual(response.status, 400);
      assert.ok(response.body.error);
      assert.ok(response.body.error.includes('limit'));
    });

    it('should return 400 when limit exceeds maximum', async () => {
      if (!request) return;
      
      const response = await request(app).get('/api/rankings?limit=2000');

      assert.strictEqual(response.status, 400);
      assert.ok(response.body.error);
      assert.ok(response.body.error.includes('limit'));
    });

    it('should return 400 when offset is negative', async () => {
      if (!request) return;
      
      const response = await request(app).get('/api/rankings?offset=-1');

      assert.strictEqual(response.status, 400);
      assert.ok(response.body.error);
      assert.ok(response.body.error.includes('offset'));
    });

    it('should use default values when parameters are not provided', async () => {
      if (!request) return;
      
      // 创建1个用户
      const userId = randomUUID();
      database.run(
        'INSERT INTO users (id, username, score, completed_at) VALUES (?, ?, ?, datetime("now"))',
        [userId, '用户1', 50]
      );

      const response = await request(app).get('/api/rankings');

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.rankings.length, 1);
      assert.strictEqual(response.body.rankings[0].rank, 1);
    });

    it('should include all required fields in ranking data', async () => {
      if (!request) return;
      
      // 创建测试用户
      const userId = randomUUID();
      database.run(
        'INSERT INTO users (id, username, score, completed_at) VALUES (?, ?, ?, datetime("now"))',
        [userId, '测试用户', 50]
      );

      const response = await request(app).get('/api/rankings');

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.rankings.length, 1);
      
      const ranking = response.body.rankings[0];
      assert.ok(ranking.hasOwnProperty('rank'));
      assert.ok(ranking.hasOwnProperty('username'));
      assert.ok(ranking.hasOwnProperty('score'));
      assert.ok(ranking.hasOwnProperty('timestamp'));
      
      assert.strictEqual(typeof ranking.rank, 'number');
      assert.strictEqual(typeof ranking.username, 'string');
      assert.strictEqual(typeof ranking.score, 'number');
      assert.strictEqual(typeof ranking.timestamp, 'string');
    });
  });
});
