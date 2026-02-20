/**
 * 问答管理路由
 * 处理题目查询、答案提交等操作
 */

import express from 'express';
import { getDb } from '../../database/db.js';
import { randomUUID } from 'crypto';

const router = express.Router();

/**
 * GET /api/questions
 * 获取所有题目和选项
 */
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    
    // 查询所有题目
    const questions = await db.all(
      `SELECT id, text, difficulty, correct_answer_id as correctAnswerId, explanation
       FROM questions
       ORDER BY difficulty, created_at`
    );

    // 为每个题目查询选项
    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        const options = await db.all(
          `SELECT option_id as id, text
           FROM options
           WHERE question_id = ?
           ORDER BY option_id`,
          [question.id]
        );

        return {
          id: question.id,
          text: question.text,
          difficulty: question.difficulty,
          correctAnswerId: question.correctAnswerId,
          explanation: question.explanation,
          options: options,
        };
      })
    );

    return res.status(200).json({
      success: true,
      questions: questionsWithOptions,
    });
  } catch (error) {
    console.error('获取题目列表失败:', error);
    return res.status(500).json({
      success: false,
      error: '获取题目列表失败',
    });
  }
});

/**
 * POST /api/questions/answer
 * 提交答案
 */
router.post('/answer', async (req, res) => {
  const { userId, questionId, answerId } = req.body;

  // 验证请求参数
  if (!userId || !questionId || !answerId) {
    return res.status(400).json({
      success: false,
      error: '缺少必需参数：userId, questionId, answerId',
    });
  }

  try {
    const db = await getDb();
    
    // 1. 验证用户ID有效性
    const user = await db.get(
      'SELECT id, score FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在',
      });
    }

    // 2. 验证题目ID有效性
    const question = await db.get(
      'SELECT id, difficulty, correct_answer_id FROM questions WHERE id = ?',
      [questionId]
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        error: '题目不存在',
      });
    }

    // 3. 检查用户是否已回答该题目（防止重复提交）
    const existingAnswer = await db.get(
      'SELECT id FROM answers WHERE user_id = ? AND question_id = ?',
      [userId, questionId]
    );

    if (existingAnswer) {
      return res.status(409).json({
        success: false,
        error: '该题目已回答，不能重复提交',
      });
    }

    // 4. 判断答案正确性
    const isCorrect = answerId === question.correct_answer_id;

    // 5. 计算得分（基础题10分，提升题20分）
    const scoreEarned = isCorrect
      ? question.difficulty === 'basic'
        ? 10
        : 20
      : 0;

    // 6. 更新用户积分和记录答题记录
    if (scoreEarned > 0) {
      await db.run('UPDATE users SET score = score + ? WHERE id = ?', [
        scoreEarned,
        userId,
      ]);
    }

    // 记录答题记录到 Answers 表
    const answerUuid = randomUUID();
    await db.run(
      `INSERT INTO answers (id, user_id, question_id, selected_answer_id, is_correct, score_earned)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [answerUuid, userId, questionId, answerId, isCorrect ? 1 : 0, scoreEarned]
    );

    // 7. 获取更新后的总积分
    const updatedUser = await db.get(
      'SELECT score FROM users WHERE id = ?',
      [userId]
    );

    // 8. 返回正确性、得分和总积分
    return res.status(200).json({
      success: true,
      correct: isCorrect,
      scoreEarned: scoreEarned,
      totalScore: updatedUser.score,
    });
  } catch (error) {
    console.error('提交答案失败:', error);
    return res.status(500).json({
      success: false,
      error: '提交答案失败',
    });
  }
});

export default router;
