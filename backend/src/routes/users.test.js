/**
 * 用户管理路由单元测试
 */

import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
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

describe('POST /api/users/register', () => {
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

  it('should register a new user successfully', async () => {
    if (!request) return;
    
    const response = await request(app)
      .post('/api/users/register')
      .send({ username: '张三' })
      .expect(200);

    assert.strictEqual(response.body.success, true);
    assert.ok(response.body.userId);
    assert.strictEqual(response.body.message, '注册成功');

    // 验证用户已插入数据库
    const user = database.queryOne(
      'SELECT * FROM users WHERE username = ?',
      ['张三']
    );
    assert.ok(user);
    assert.strictEqual(user.username, '张三');
    assert.strictEqual(user.score, 0);
  });

  it('should reject empty username', async () => {
    if (!request) return;
    
    const response = await request(app)
      .post('/api/users/register')
      .send({ username: '' })
      .expect(400);

    assert.strictEqual(response.body.success, false);
    assert.strictEqual(response.body.error, '姓名不能为空');
  });

  it('should reject whitespace-only username', async () => {
    if (!request) return;
    
    const response = await request(app)
      .post('/api/users/register')
      .send({ username: '   ' })
      .expect(400);

    assert.strictEqual(response.body.success, false);
    assert.strictEqual(response.body.error, '姓名不能为空');
  });

  it('should reject username longer than 50 characters', async () => {
    if (!request) return;
    
    const longUsername = 'a'.repeat(51);
    const response = await request(app)
      .post('/api/users/register')
      .send({ username: longUsername })
      .expect(400);

    assert.strictEqual(response.body.success, false);
    assert.strictEqual(response.body.error, '姓名不能超过50个字符');
  });

  it('should reject duplicate username', async () => {
    if (!request) return;
    
    // 先注册一个用户
    await request(app)
      .post('/api/users/register')
      .send({ username: '李四' })
      .expect(200);

    // 尝试注册相同姓名
    const response = await request(app)
      .post('/api/users/register')
      .send({ username: '李四' })
      .expect(409);

    assert.strictEqual(response.body.success, false);
    assert.strictEqual(response.body.error, '姓名已存在');
  });

  it('should trim username before validation', async () => {
    if (!request) return;
    
    const response = await request(app)
      .post('/api/users/register')
      .send({ username: '  王五  ' })
      .expect(200);

    assert.strictEqual(response.body.success, true);

    // 验证数据库中存储的是去除空格后的姓名
    const user = database.queryOne(
      'SELECT * FROM users WHERE username = ?',
      ['王五']
    );
    assert.ok(user);
    assert.strictEqual(user.username, '王五');
  });

  it('should initialize user score to 0', async () => {
    if (!request) return;
    
    const response = await request(app)
      .post('/api/users/register')
      .send({ username: '赵六' })
      .expect(200);

    const user = database.queryOne(
      'SELECT * FROM users WHERE id = ?',
      [response.body.userId]
    );
    assert.strictEqual(user.score, 0);
  });

  it('should reject missing username field', async () => {
    if (!request) return;
    
    const response = await request(app)
      .post('/api/users/register')
      .send({})
      .expect(400);

    assert.strictEqual(response.body.success, false);
    assert.strictEqual(response.body.error, '姓名不能为空');
  });

  it('should reject non-string username', async () => {
    if (!request) return;
    
    const response = await request(app)
      .post('/api/users/register')
      .send({ username: 123 })
      .expect(400);

    assert.strictEqual(response.body.success, false);
    assert.strictEqual(response.body.error, '姓名不能为空');
  });
});

describe('GET /api/users/check/:username', () => {
  before(() => {
    if (!request) return;
    if (!database.db) {
      database.connect();
    }
  });

  beforeEach(() => {
    if (!request) return;
    database.run('DELETE FROM users');
  });

  after(() => {
    if (!request) return;
    database.run('DELETE FROM users');
  });

  it('should return available true for non-existent username', async () => {
    if (!request) return;
    
    const response = await request(app)
      .get('/api/users/check/新用户')
      .expect(200);

    assert.strictEqual(response.body.available, true);
  });

  it('should return available false for existing username', async () => {
    if (!request) return;
    
    // 先注册一个用户
    await request(app)
      .post('/api/users/register')
      .send({ username: '已存在用户' });

    const response = await request(app)
      .get('/api/users/check/已存在用户')
      .expect(200);

    assert.strictEqual(response.body.available, false);
  });

  it('should handle empty username', async () => {
    if (!request) return;
    
    const response = await request(app)
      .get('/api/users/check/   ')
      .expect(400);

    assert.strictEqual(response.body.available, false);
  });
});

