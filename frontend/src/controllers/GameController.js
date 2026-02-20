/**
 * GameController - 游戏控制器
 * 
 * 职责：集成问答逻辑，连接所有组件
 * 
 * 功能：
 * - 用户点击交互点时显示对应题目
 * - 用户选择答案后调用 submitAnswer API
 * - 根据答案正确性显示反馈
 * - 答对时更新积分并显示动画
 * - 答错时直接关闭弹窗
 * - 标记交互点为已完成
 * 
 * 验证需求: 4.5, 4.6, 4.7, 5.2, 5.3
 */

export class GameController {
  constructor(components) {
    this.stateManager = components.stateManager;
    this.apiClient = components.apiClient;
    this.sceneRenderer = components.sceneRenderer;
    this.interactionManager = components.interactionManager;
    this.quizModal = components.quizModal;
    this.scoreDisplay = components.scoreDisplay;
    this.loginModal = components.loginModal;
    this.rankingPage = components.rankingPage;
    
    this.isProcessingAnswer = false;
    
    this.setupEventHandlers();
  }

  /**
   * 设置事件处理器
   */
  setupEventHandlers() {
    // 登录成功处理
    this.loginModal.onSuccess((userId, username) => {
      this.handleLoginSuccess(userId, username);
    });

    // 交互点悬停处理
    this.interactionManager.onPointHover((point) => {
      this.handlePointHover(point);
    });

    // 交互点点击处理
    this.interactionManager.onPointClick((point) => {
      this.handlePointClick(point);
    });

    // 答案选择处理
    this.quizModal.onAnswerSelected((answerId) => {
      this.handleAnswerSelected(answerId);
    });

    // 排名页面重新开始处理
    this.rankingPage.onRestart(() => {
      this.handleRestart();
    });

    // 状态变化监听
    this.stateManager.on('scoreChanged', (data) => {
      this.scoreDisplay.updateScore(data.newScore);
    });

    this.stateManager.on('questionCompleted', (questionId) => {
      this.handleQuestionCompleted(questionId);
    });

    this.stateManager.on('phaseChanged', (data) => {
      this.handleGamePhaseChanged(data.newPhase);
    });
  }

  /**
   * 处理登录成功
   * @param {string} userId - 用户 ID
   * @param {string} username - 用户名
   */
  async handleLoginSuccess(userId, username) {
    try {
      // 更新状态
      this.stateManager.setUsername(username, userId);

      // 题目列表已在 App 初始化时加载，这里不需要再次加载
      // 切换到游戏阶段
      this.stateManager.setGamePhase('playing');

      // 显示游戏容器
      const gameContainer = document.getElementById('game-container');
      if (gameContainer) {
        gameContainer.classList.remove('hidden');
      }

      // 显示积分显示器
      this.scoreDisplay.show();

      console.log('Login successful, game started');
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('游戏启动失败，请刷新页面重试');
    }
  }

  /**
   * 处理交互点悬停
   * @param {Object|null} point - 交互点对象
   */
  handlePointHover(point) {
    if (point && point.state === 'active') {
      // 高亮交互点
      this.sceneRenderer.updateInteractionPoint(point.id, 'hover');
    } else {
      // 取消所有悬停状态
      this.stateManager.game.interactionPoints.forEach(p => {
        if (p.state === 'active') {
          this.sceneRenderer.updateInteractionPoint(p.id, 'active');
        }
      });
    }
  }

  /**
   * 处理交互点点击
   * @param {Object} point - 交互点对象
   */
  handlePointClick(point) {
    console.log('[GameController] Point clicked:', point);
    
    // 检查是否已完成
    if (this.stateManager.user.completedQuestions.has(point.questionId)) {
      console.log('[GameController] Question already answered');
      return;
    }

    console.log('[GameController] Looking for question with ID:', point.questionId);
    console.log('[GameController] Available questions:', this.stateManager.game.questions);

    // 获取题目
    const question = this.stateManager.game.questions.find(
      q => q.id === point.questionId
    );

    if (!question) {
      console.error('[GameController] Question not found:', point.questionId);
      console.error('[GameController] Available question IDs:', this.stateManager.game.questions.map(q => q.id));
      return;
    }

    console.log('[GameController] Found question:', question);

    // 显示问答弹窗
    this.quizModal.show(question);
  }

  /**
   * 处理答案选择
   * @param {string} answerId - 选中的答案 ID
   */
  async handleAnswerSelected(answerId) {
    if (this.isProcessingAnswer) {
      return;
    }

    this.isProcessingAnswer = true;

    const question = this.quizModal.getCurrentQuestion();
    if (!question) {
      this.isProcessingAnswer = false;
      return;
    }

    try {
      // 提交答案到后端
      const result = await this.apiClient.submitAnswer(
        this.stateManager.user.id,
        question.id,
        answerId
      );

      if (result.correct) {
        // 答对了
        await this.handleCorrectAnswer(question, result);
      } else {
        // 答错了
        await this.handleWrongAnswer(question);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('提交答案失败，请重试');
    } finally {
      this.isProcessingAnswer = false;
    }
  }

  /**
   * 处理正确答案
   * @param {Object} question - 题目对象
   * @param {Object} result - API 返回结果
   */
  async handleCorrectAnswer(question, result) {
    // 使用 correctAnswerId 字段
    const correctAnswerId = question.correctAnswerId;

    // 显示反馈（正确答案和知识点）
    this.quizModal.showFeedback(true, correctAnswerId, question.explanation);

    // 显示积分动画
    this.scoreDisplay.animateScoreChange(result.scoreEarned);

    // 更新积分
    this.stateManager.updateScore(result.scoreEarned);

    // 标记题目已完成
    this.stateManager.markQuestionCompleted(question.id);

    // 延迟关闭弹窗，让用户看到反馈
    await this.delay(3000);

    // 隐藏弹窗
    this.quizModal.hide();

    console.log(`Correct! +${result.scoreEarned} points`);
  }

  /**
   * 处理错误答案
   * @param {Object} question - 题目对象
   */
  async handleWrongAnswer(question) {
    // 使用 correctAnswerId 字段
    const correctAnswerId = question.correctAnswerId;

    // 显示反馈（正确答案和知识点）
    this.quizModal.showFeedback(false, correctAnswerId, question.explanation);

    // 标记题目已完成（即使答错也不能再答）
    this.stateManager.markQuestionCompleted(question.id);

    // 延迟关闭弹窗，让用户看到反馈
    await this.delay(3000);

    // 隐藏弹窗
    this.quizModal.hide();

    console.log('Wrong answer');
  }

  /**
   * 处理题目完成
   * @param {string} questionId - 题目 ID
   */
  handleQuestionCompleted(questionId) {
    // 找到对应的交互点
    const point = this.stateManager.game.interactionPoints.find(
      p => p.questionId === questionId
    );

    if (point) {
      // 更新交互点状态为已完成
      point.state = 'completed';
      this.sceneRenderer.updateInteractionPoint(point.id, 'completed');
      this.interactionManager.updateInteractionPoints(this.stateManager.game.interactionPoints);
    }

    // 检查是否所有题目都已完成
    this.checkGameCompletion();
  }

  /**
   * 检查游戏是否完成
   */
  checkGameCompletion() {
    // 游戏完成条件：完成所有交互点对应的题目（12道）
    const totalInteractionPoints = this.stateManager.game.interactionPoints.length;
    const completedQuestions = this.stateManager.user.completedQuestions.size;

    console.log(`[GameController] Completion check: ${completedQuestions}/${totalInteractionPoints} questions completed`);

    if (completedQuestions >= totalInteractionPoints) {
      // 所有交互点的题目已完成
      console.log('[GameController] All questions completed! Finishing game...');
      this.stateManager.setGamePhase('finished');
    }
  }

  /**
   * 处理游戏阶段变化
   * @param {string} phase - 新阶段
   */
  handleGamePhaseChanged(phase) {
    console.log('Game phase changed:', phase);

    if (phase === 'finished') {
      // 游戏结束，显示结算
      this.showGameCompletion();
    }
  }

  /**
   * 显示游戏完成界面
   */
  async showGameCompletion() {
    // 延迟一下，让最后一个交互点动画完成
    await this.delay(500);

    const finalScore = this.stateManager.user.score;
    const username = this.stateManager.user.username;
    const userId = this.stateManager.user.id;

    console.log(`Game completed! User: ${username}, Score: ${finalScore}`);

    // 标记游戏完成
    try {
      await this.apiClient.completeGame(userId);
      console.log('Game completion marked successfully');
    } catch (error) {
      console.error('Failed to mark game completion:', error);
      // 继续显示排行榜，即使标记失败
    }

    // 获取排名列表
    try {
      const response = await this.apiClient.getRankings(100, 0);
      const rankings = response.rankings || [];

      // 显示排名页面
      this.rankingPage.show(rankings, userId);
    } catch (error) {
      console.error('Failed to load rankings:', error);
      
      // 如果获取排名失败，显示简单的完成消息
      alert(`恭喜完成游戏！\n\n姓名：${username}\n最终积分：${finalScore}`);
    }
  }

  /**
   * 处理重新开始
   */
  handleRestart() {
    console.log('Restarting game...');

    // 隐藏排名页面
    this.rankingPage.hide();

    // 隐藏游戏容器
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.classList.add('hidden');
    }

    // 隐藏积分显示
    this.scoreDisplay.hide();

    // 重置状态管理器
    this.stateManager.reset();

    // 重置积分显示
    this.scoreDisplay.reset();

    // 重新初始化交互点（重置状态）
    const interactionPoints = this.stateManager.game.interactionPoints;
    interactionPoints.forEach(point => {
      point.state = 'active';
      this.sceneRenderer.updateInteractionPoint(point.id, 'active');
    });

    // 显示登录界面
    this.loginModal.show();
  }

  /**
   * 启动游戏
   */
  start() {
    // 显示登录弹窗
    this.loginModal.show();
  }

  /**
   * 延迟函数
   * @param {number} ms - 延迟毫秒数
   * @returns {Promise} Promise
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 清理资源
   */
  dispose() {
    // 清理所有组件
    if (this.loginModal) this.loginModal.dispose();
    if (this.quizModal) this.quizModal.dispose();
    if (this.scoreDisplay) this.scoreDisplay.dispose();
    if (this.rankingPage) this.rankingPage.dispose();
    if (this.sceneRenderer) this.sceneRenderer.dispose();
    if (this.interactionManager) this.interactionManager.dispose();
  }
}
