/**
 * 用户管理路由
 * 处理用户注册、验证等操作
 */

import express from 'express';
import { randomUUID } from 'crypto';
import { getDb } from '../../database/db.js';

const router = express.Router();

/**
 * POST /api/users/register
 * 注册新用户
 */
router.post('/register', async (req, res) => {
  try {
    const { username } = req.body;

    // 验证姓名非空
    if (!username || typeof username !== 'string') {
      return res.status(400).json({
        success: false,
        error: '姓名不能为空',
      });
    }

    // 验证姓名去除空格后非空
    const trimmedUsername = username.trim();
    if (trimmedUsername.length === 0) {
      return res.status(400).json({
        success: false,
        error: '姓名不能为空',
      });
    }

    // 验证姓名长度不超过50字符
    if (trimmedUsername.length > 50) {
      return res.status(400).json({
        success: false,
        error: '姓名不能超过50个字符',
      });
    }

    // 生成用户ID
    const userId = randomUUID();

    // 插入用户记录（初始积分为0）
    // 允许重复姓名，每次都创建新的用户记录
    try {
      const db = await getDb();
      await db.run(
        'INSERT INTO users (id, username, score) VALUES (?, ?, 0)',
        [userId, trimmedUsername]
      );

      return res.status(200).json({
        success: true,
        userId: userId,
        message: '注册成功',
      });
    } catch (dbError) {
      // 数据库错误
      console.error('数据库错误:', dbError);
      return res.status(500).json({
        success: false,
        error: '注册失败，请稍后重试',
      });
    }
  } catch (error) {
    console.error('注册失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误',
    });
  }
});

/**
 * GET /api/users/check/:username
 * 检查姓名是否可用
 */
router.get('/check/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // 验证姓名非空
    if (!username || username.trim().length === 0) {
      return res.status(400).json({
        available: false,
        error: '姓名不能为空',
      });
    }

    const trimmedUsername = username.trim();

    // 查询数据库检查姓名是否存在
    const db = await getDb();
    const existingUser = await db.get(
      'SELECT id FROM users WHERE username = ?',
      [trimmedUsername]
    );

    return res.json({
      available: !existingUser,
    });
  } catch (error) {
    console.error('检查姓名失败:', error);
    return res.status(500).json({
      available: false,
      error: '服务器错误',
    });
  }
});

/**
 * POST /api/users/:userId/complete
 * 标记用户完成游戏
 */
router.post('/:userId/complete', async (req, res) => {
  try {
    const { userId } = req.params;

    // 验证 userId 参数
    if (!userId || userId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '用户ID不能为空',
      });
    }

    const db = await getDb();
    
    // 更新 completed_at 字段
    const result = await db.run(
      'UPDATE users SET completed_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: '用户不存在',
      });
    }

    return res.status(200).json({
      success: true,
      message: '游戏完成标记成功',
    });
  } catch (error) {
    console.error('标记游戏完成失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误',
    });
  }
});

export default router;
