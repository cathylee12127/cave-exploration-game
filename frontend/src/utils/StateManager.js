/**
 * StateManager - 游戏状态管理器
 * 
 * 职责：
 * - 管理游戏全局状态（用户、游戏阶段、题目、交互点）
 * - 提供状态更新方法
 * - 实现状态变化通知机制（观察者模式）
 * 
 * 需求: 1.3, 5.1, 5.5
 */

/**
 * 游戏阶段类型
 * @typedef {'login' | 'playing' | 'finished'} GamePhase
 */

/**
 * 用户状态
 * @typedef {Object} UserState
 * @property {string} id - 用户ID
 * @property {string} username - 用户姓名
 * @property {number} score - 当前积分
 * @property {Set<string>} completedQuestions - 已完成的题目ID集合
 */

/**
 * 题目
 * @typedef {Object} Question
 * @property {string} id - 题目ID
 * @property {string} text - 题目文本
 * @property {Array<{id: string, text: string}>} options - 选项列表
 * @property {string} correctAnswerId - 正确答案ID
 * @property {'basic' | 'advanced'} difficulty - 难度
 */

/**
 * 交互点
 * @typedef {Object} InteractionPoint
 * @property {string} id - 交互点ID
 * @property {number} x - x坐标（百分比，0-1）
 * @property {number} y - y坐标（百分比，0-1）
 * @property {'active' | 'completed' | 'hover'} state - 状态
 * @property {string} questionId - 关联的题目ID
 */

/**
 * 游戏状态
 * @typedef {Object} GameState
 * @property {GamePhase} phase - 游戏阶段
 * @property {Question[]} questions - 题目列表
 * @property {InteractionPoint[]} interactionPoints - 交互点列表
 * @property {Question | null} currentQuestion - 当前显示的题目
 */

class StateManager {
  constructor() {
    /**
     * 用户状态
     * @type {UserState | null}
     */
    this.user = null;

    /**
     * 游戏状态
     * @type {GameState}
     */
    this.game = {
      phase: 'login',
      questions: [],
      interactionPoints: [],
      currentQuestion: null,
    };

    /**
     * 状态变化监听器
     * @type {Map<string, Set<Function>>}
     */
    this._listeners = new Map();
  }

  /**
   * 设置用户姓名并创建用户会话
   * @param {string} username - 用户姓名
   * @param {string} userId - 用户ID
   */
  setUsername(username, userId) {
    if (!username || typeof username !== 'string') {
      throw new Error('用户姓名不能为空');
    }

    if (!userId || typeof userId !== 'string') {
      throw new Error('用户ID不能为空');
    }

    this.user = {
      id: userId,
      username: username.trim(),
      score: 0,
      completedQuestions: new Set(),
    };

    this._emit('userChanged', this.user);
  }

  /**
   * 更新用户积分
   * @param {number} delta - 积分变化量（可以是正数或负数）
   */
  updateScore(delta) {
    if (!this.user) {
      throw new Error('用户未登录');
    }

    if (typeof delta !== 'number' || isNaN(delta)) {
      throw new Error('积分变化量必须是数字');
    }

    const oldScore = this.user.score;
    this.user.score += delta;

    // 确保积分不为负数
    if (this.user.score < 0) {
      this.user.score = 0;
    }

    this._emit('scoreChanged', {
      oldScore,
      newScore: this.user.score,
      delta,
    });
  }

  /**
   * 标记题目为已完成
   * @param {string} questionId - 题目ID
   */
  markQuestionCompleted(questionId) {
    if (!this.user) {
      throw new Error('用户未登录');
    }

    if (!questionId || typeof questionId !== 'string') {
      throw new Error('题目ID不能为空');
    }

    this.user.completedQuestions.add(questionId);

    // 更新对应交互点的状态
    const point = this.game.interactionPoints.find(
      (p) => p.questionId === questionId
    );
    if (point) {
      point.state = 'completed';
    }

    this._emit('questionCompleted', questionId);

    // 检查是否所有题目都已完成
    if (this.user.completedQuestions.size === this.game.questions.length) {
      this._emit('allQuestionsCompleted');
    }
  }

  /**
   * 设置游戏阶段
   * @param {GamePhase} phase - 游戏阶段
   */
  setGamePhase(phase) {
    const validPhases = ['login', 'playing', 'finished'];
    if (!validPhases.includes(phase)) {
      throw new Error(`无效的游戏阶段: ${phase}`);
    }

    const oldPhase = this.game.phase;
    this.game.phase = phase;

    this._emit('phaseChanged', {
      oldPhase,
      newPhase: phase,
    });
  }

  /**
   * 设置题目列表
   * @param {Question[]} questions - 题目列表
   */
  setQuestions(questions) {
    if (!Array.isArray(questions)) {
      throw new Error('题目列表必须是数组');
    }

    this.game.questions = questions;
    this._emit('questionsLoaded', questions);
  }

  /**
   * 设置交互点列表
   * @param {InteractionPoint[]} points - 交互点列表
   */
  setInteractionPoints(points) {
    if (!Array.isArray(points)) {
      throw new Error('交互点列表必须是数组');
    }

    this.game.interactionPoints = points;
    this._emit('interactionPointsLoaded', points);
  }

  /**
   * 设置当前题目
   * @param {Question | null} question - 当前题目
   */
  setCurrentQuestion(question) {
    this.game.currentQuestion = question;
    this._emit('currentQuestionChanged', question);
  }

  /**
   * 更新交互点状态
   * @param {string} pointId - 交互点ID
   * @param {'active' | 'completed' | 'hover'} state - 新状态
   */
  updateInteractionPointState(pointId, state) {
    const point = this.game.interactionPoints.find((p) => p.id === pointId);
    if (!point) {
      throw new Error(`交互点不存在: ${pointId}`);
    }

    const validStates = ['active', 'completed', 'hover'];
    if (!validStates.includes(state)) {
      throw new Error(`无效的交互点状态: ${state}`);
    }

    point.state = state;
    this._emit('interactionPointStateChanged', { pointId, state });
  }

  /**
   * 重置游戏状态（用于重新开始游戏）
   */
  reset() {
    this.user = null;
    this.game = {
      phase: 'login',
      questions: [],
      interactionPoints: [],
      currentQuestion: null,
    };

    this._emit('stateReset');
  }

  /**
   * 注册事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (typeof callback !== 'function') {
      throw new Error('回调必须是函数');
    }

    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }

    this._listeners.get(event).add(callback);
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  off(event, callback) {
    if (!this._listeners.has(event)) {
      return;
    }

    this._listeners.get(event).delete(callback);
  }

  /**
   * 触发事件
   * @private
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   */
  _emit(event, data) {
    if (!this._listeners.has(event)) {
      return;
    }

    this._listeners.get(event).forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`事件监听器执行失败 (${event}):`, error);
      }
    });
  }

  /**
   * 获取当前状态快照（用于调试）
   * @returns {Object} 状态快照
   */
  getSnapshot() {
    return {
      user: this.user
        ? {
            ...this.user,
            completedQuestions: Array.from(this.user.completedQuestions),
          }
        : null,
      game: {
        ...this.game,
      },
    };
  }
}

export default StateManager;
