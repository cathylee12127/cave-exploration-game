/**
 * 共享类型定义
 * 用于前后端数据结构的一致性
 */

/**
 * @typedef {Object} User
 * @property {string} id - 用户唯一标识
 * @property {string} username - 用户姓名
 * @property {number} score - 用户积分
 * @property {Date} createdAt - 创建时间
 * @property {Date|null} completedAt - 完成时间
 */

/**
 * @typedef {Object} Question
 * @property {string} id - 题目唯一标识
 * @property {string} text - 题目文本
 * @property {Option[]} options - 选项列表
 * @property {string} correctAnswerId - 正确答案ID
 * @property {'basic'|'advanced'} difficulty - 难度级别
 */

/**
 * @typedef {Object} Option
 * @property {string} id - 选项ID (a, b, c)
 * @property {string} text - 选项文本
 */

/**
 * @typedef {Object} InteractionPoint
 * @property {string} id - 交互点唯一标识
 * @property {number} x - X坐标（相对于画布的百分比 0-1）
 * @property {number} y - Y坐标（相对于画布的百分比 0-1）
 * @property {'active'|'completed'|'hover'} state - 交互点状态
 * @property {string} questionId - 关联的题目ID
 */

/**
 * @typedef {Object} Ranking
 * @property {number} rank - 排名
 * @property {string} username - 用户姓名
 * @property {number} score - 积分
 * @property {Date} timestamp - 完成时间
 */

/**
 * @typedef {Object} AnswerSubmission
 * @property {string} userId - 用户ID
 * @property {string} questionId - 题目ID
 * @property {string} answerId - 选择的答案ID
 */

/**
 * @typedef {Object} AnswerResult
 * @property {boolean} correct - 是否正确
 * @property {number} scoreEarned - 获得的积分
 * @property {number} totalScore - 总积分
 */

/**
 * @typedef {'login'|'playing'|'finished'} GamePhase
 */

export {};
