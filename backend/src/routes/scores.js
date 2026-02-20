/**
 * 积分和排名管理路由
 * 处理用户积分查询和排名列表查询
 */

import express from 'express';
import { getDb } from '../../database/db.js';

const router = express.Router();

/**
 * GET /api/scores/:userId
 * 获取用户积分
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // 验证 userId 参数
    if (!userId || userId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '用户ID不能为空',
      });
    }

    // 查询用户信息和积分
    const db = await getDb();
    const user = await db.get(
      'SELECT id, username, score FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在',
      });
    }

    return res.status(200).json({
      success: true,
      userId: user.id,
      username: user.username,
      score: user.score,
    });
  } catch (error) {
    console.error('获取用户积分失败:', error);
    return res.status(500).json({
      success: false,
      error: '获取用户积分失败',
    });
  }
});

/**
 * GET /api/rankings
 * 获取排名列表
 */
router.get('/', async (req, res) => {
  try {
    // 获取查询参数，设置默认值
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    // 验证参数有效性
    if (limit < 1 || limit > 1000) {
      return res.status(400).json({
        success: false,
        error: 'limit 参数必须在 1-1000 之间',
      });
    }

    if (offset < 0) {
      return res.status(400).json({
        success: false,
        error: 'offset 参数不能为负数',
      });
    }

    // 查询所有完成游戏的用户（completed_at 不为空）
    // 按积分降序排序，积分相同按时间升序排序
    const db = await getDb();
    const users = await db.all(
      `SELECT username, score, created_at as timestamp
       FROM users
       WHERE completed_at IS NOT NULL
       ORDER BY score DESC, created_at ASC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // 计算排名序号（考虑偏移量）
    const rankings = users.map((user, index) => ({
      rank: offset + index + 1,
      username: user.username,
      score: user.score,
      timestamp: user.timestamp,
    }));

    return res.status(200).json({
      success: true,
      rankings: rankings,
    });
  } catch (error) {
    console.error('获取排名列表失败:', error);
    return res.status(500).json({
      success: false,
      error: '获取排名列表失败',
    });
  }
});

export default router;
