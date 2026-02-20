/**
 * 属性测试 - 用户姓名验证
 * Feature: cave-exploration-game, Property 1: 用户姓名验证
 * **验证需求: 1.2, 1.4, 1.5**
 * 
 * 属性描述:
 * 对于任何用户输入的姓名字符串，系统应该拒绝空字符串、纯空格字符串，
 * 以及已存在的姓名，并且只接受非空且唯一的姓名。
 */

import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import fc from 'fast-check';
import database from '../../database/db.js';

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

describe('属性测试 - 用户姓名验证', () => {
  before(() => {
    if (!request) {
      console.log('Skipping property tests - supertest not available');
      return;
    }
    // 确保数据库已初始化
    if (!database.db) {
      database.connect();
    }
  });

  beforeEach(() => {
    if (!request) return;
    // 清空 users 表
    database.run('DELETE FROM users');
  });

  after(() => {
    if (!request) return;
    // 清理测试数据
    database.run('DELETE FROM users');
  });

  it('属性 1: 用户姓名验证 - 拒绝空字符串和纯空格字符串', async () => {
    if (!request) return;

    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(''),                    // 空字符串
          fc.constant('   '),                 // 纯空格
          fc.constant('\t'),                  // 制表符
          fc.constant('\n'),                  // 换行符
          fc.constant('  \t  \n  '),         // 混合空白字符
          fc.string().filter(s => s.trim().length === 0 && s.length > 0) // 任意空白字符串
        ),
        async (username) => {
          const response = await request(app)
            .post('/api/users/register')
            .send({ username });

          // 验证响应状态码为 400（错误请求）
          assert.strictEqual(
            response.status,
            400,
            `空白姓名 "${username}" 应该被拒绝，返回 400 状态码`
          );

          // 验证响应包含错误信息
          assert.strictEqual(response.body.success, false);
          assert.strictEqual(response.body.error, '姓名不能为空');

          return true;
        }
      ),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });

  it('属性 1: 用户姓名验证 - 拒绝超过50字符的姓名', async () => {
    if (!request) return;

    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 51, maxLength: 100 }),
        async (username) => {
          const response = await request(app)
            .post('/api/users/register')
            .send({ username });

          // 验证响应状态码为 400
          assert.strictEqual(
            response.status,
            400,
            `超长姓名（${username.length}字符）应该被拒绝`
          );

          // 验证响应包含错误信息
          assert.strictEqual(response.body.success, false);
          assert.strictEqual(response.body.error, '姓名不能超过50个字符');

          return true;
        }
      ),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });

  it('属性 1: 用户姓名验证 - 接受有效的唯一姓名', async () => {
    if (!request) return;

    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        async (username) => {
          // 清空数据库以确保姓名唯一
          database.run('DELETE FROM users');

          const response = await request(app)
            .post('/api/users/register')
            .send({ username });

          // 验证响应状态码为 200（成功）
          assert.strictEqual(
            response.status,
            200,
            `有效姓名 "${username}" 应该被接受`
          );

          // 验证响应包含成功信息
          assert.strictEqual(response.body.success, true);
          assert.ok(response.body.userId, '应该返回用户ID');
          assert.strictEqual(response.body.message, '注册成功');

          // 验证用户已插入数据库
          const user = database.queryOne(
            'SELECT * FROM users WHERE username = ?',
            [username.trim()]
          );
          assert.ok(user, '用户应该被插入数据库');
          assert.strictEqual(user.username, username.trim());
          assert.strictEqual(user.score, 0, '初始积分应该为0');

          return true;
        }
      ),
      {
        numRuns: 50, // 减少运行次数以避免数据库操作过多
        verbose: true,
      }
    );
  });

  it('属性 1: 用户姓名验证 - 拒绝重复的姓名', async () => {
    if (!request) return;

    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        async (username) => {
          // 清空数据库
          database.run('DELETE FROM users');

          // 第一次注册应该成功
          const firstResponse = await request(app)
            .post('/api/users/register')
            .send({ username });

          assert.strictEqual(
            firstResponse.status,
            200,
            `首次注册姓名 "${username}" 应该成功`
          );

          // 第二次注册相同姓名应该失败
          const secondResponse = await request(app)
            .post('/api/users/register')
            .send({ username });

          assert.strictEqual(
            secondResponse.status,
            409,
            `重复注册姓名 "${username}" 应该被拒绝，返回 409 状态码`
          );

          assert.strictEqual(secondResponse.body.success, false);
          assert.strictEqual(secondResponse.body.error, '姓名已存在');

          return true;
        }
      ),
      {
        numRuns: 50,
        verbose: true,
      }
    );
  });

  it('属性 1: 用户姓名验证 - 姓名应该被去除前后空格', async () => {
    if (!request) return;

    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 40 }).filter(s => s.trim().length > 0),
        fc.nat({ max: 5 }), // 前导空格数量
        fc.nat({ max: 5 }), // 尾随空格数量
        async (username, leadingSpaces, trailingSpaces) => {
          // 清空数据库
          database.run('DELETE FROM users');

          const paddedUsername = ' '.repeat(leadingSpaces) + username + ' '.repeat(trailingSpaces);
          const trimmedUsername = username.trim();

          const response = await request(app)
            .post('/api/users/register')
            .send({ username: paddedUsername });

          if (trimmedUsername.length > 50) {
            // 如果去除空格后仍然超过50字符，应该被拒绝
            assert.strictEqual(response.status, 400);
          } else {
            // 否则应该成功
            assert.strictEqual(
              response.status,
              200,
              `带空格的姓名 "${paddedUsername}" 应该被接受`
            );

            // 验证数据库中存储的是去除空格后的姓名
            const user = database.queryOne(
              'SELECT * FROM users WHERE username = ?',
              [trimmedUsername]
            );
            assert.ok(user, '用户应该被插入数据库');
            assert.strictEqual(
              user.username,
              trimmedUsername,
              '数据库中应该存储去除空格后的姓名'
            );
          }

          return true;
        }
      ),
      {
        numRuns: 50,
        verbose: true,
      }
    );
  });

  it('属性 1: 用户姓名验证 - 拒绝非字符串类型的姓名', async () => {
    if (!request) return;

    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.integer(),
          fc.float(),
          fc.boolean(),
          fc.constant(null),
          fc.constant(undefined),
          fc.array(fc.string()),
          fc.object()
        ),
        async (username) => {
          const response = await request(app)
            .post('/api/users/register')
            .send({ username });

          // 验证响应状态码为 400
          assert.strictEqual(
            response.status,
            400,
            `非字符串姓名（类型: ${typeof username}）应该被拒绝`
          );

          // 验证响应包含错误信息
          assert.strictEqual(response.body.success, false);
          assert.strictEqual(response.body.error, '姓名不能为空');

          return true;
        }
      ),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });

  it('属性 1: 用户姓名验证 - 验证姓名唯一性约束的一致性', async () => {
    if (!request) return;

    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          { minLength: 2, maxLength: 10 }
        ),
        async (usernames) => {
          // 清空数据库
          database.run('DELETE FROM users');

          // 注册所有用户
          const results = [];
          for (const username of usernames) {
            const response = await request(app)
              .post('/api/users/register')
              .send({ username });
            results.push({ username, response });
          }

          // 统计每个姓名的注册次数
          const usernameCount = new Map();
          for (const username of usernames) {
            const trimmed = username.trim();
            usernameCount.set(trimmed, (usernameCount.get(trimmed) || 0) + 1);
          }

          // 验证：每个唯一姓名应该只有一次成功注册
          for (const [username, count] of usernameCount.entries()) {
            const successfulRegistrations = results.filter(
              r => r.username.trim() === username && r.response.status === 200
            );

            assert.strictEqual(
              successfulRegistrations.length,
              1,
              `姓名 "${username}" 应该只有一次成功注册（出现 ${count} 次）`
            );

            // 验证后续的重复注册都失败了
            const failedRegistrations = results.filter(
              r => r.username.trim() === username && r.response.status === 409
            );

            assert.strictEqual(
              failedRegistrations.length,
              count - 1,
              `姓名 "${username}" 的重复注册应该都失败`
            );
          }

          return true;
        }
      ),
      {
        numRuns: 20, // 减少运行次数，因为这个测试涉及多次数据库操作
        verbose: true,
      }
    );
  });
});
