/**
 * 溶洞探秘互动小游戏 - 主应用入口
 * 
 * 职责：
 * - 初始化所有组件
 * - 实现游戏启动流程
 * - 实现游戏主循环
 * - 连接所有组件的事件和回调
 * 
 * 验证需求: 1.1, 8.1
 */

import StateManager from './utils/StateManager.js';
import APIClient from './utils/APIClient.js';
import errorHandler from './utils/ErrorHandler.js';
import toast from './components/Toast.js';
import LoadingIndicator from './components/LoadingIndicator.js';
import { SceneRenderer } from './components/SceneRenderer.js';
import { InteractionManager } from './components/InteractionManager.js';
import { QuizModal } from './components/QuizModal.js';
import { ScoreDisplay } from './components/ScoreDisplay.js';
import { LoginModal } from './components/LoginModal.js';
import { RankingPage } from './components/RankingPage.js';
import { GameController } from './controllers/GameController.js';

/**
 * 主应用类
 */
class App {
  constructor() {
    this.components = null;
    this.gameController = null;
    this.isInitialized = false;
    this.loadingIndicator = new LoadingIndicator();
    
    // 设置全局错误处理
    this.setupErrorHandling();
  }

  /**
   * 设置错误处理
   */
  setupErrorHandling() {
    // 监听错误事件
    errorHandler.onError((errorInfo) => {
      console.error('Error caught:', errorInfo);
      
      // 根据错误类型显示不同的提示
      if (errorInfo.type === 'network') {
        toast.error(errorInfo.message, 5000);
      } else if (errorInfo.type === 'api') {
        toast.error(errorInfo.message, 4000);
      } else if (errorInfo.type === 'resource') {
        toast.warning('部分资源加载失败', 3000);
      } else {
        toast.error(errorInfo.message || '发生错误，请重试', 3000);
      }
    });
  }

  /**
   * 初始化应用
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('App already initialized');
      return;
    }

    console.log('Initializing Cave Exploration Game...');

    // 显示加载指示器
    this.loadingIndicator.show('正在加载游戏...');

    try {
      // 初始化所有组件
      this.components = this.createComponents();

      // 初始化场景渲染器
      const canvas = document.getElementById('game-canvas');
      if (!canvas) {
        throw new Error('Canvas element not found');
      }

      this.components.sceneRenderer.initialize(canvas);

      // 初始化交互点位置（至少10个）
      this.initializeInteractionPoints();

      // 加载题目列表
      this.loadingIndicator.updateText('正在加载题目...');
      await this.loadQuestions();

      // 将题目 ID 分配给交互点
      this.assignQuestionsToPoints();

      // 创建游戏控制器（必须在初始化交互管理器之前创建，以便注册事件回调）
      this.gameController = new GameController(this.components);

      // 初始化交互管理器（在 GameController 创建之后，这样事件回调已经注册）
      // 同时传入交互点数组
      this.components.interactionManager.initialize(
        canvas,
        this.components.stateManager.game.interactionPoints
      );

      // 设置窗口大小变化监听
      this.setupWindowResize();

      // 标记为已初始化
      this.isInitialized = true;

      console.log('App initialized successfully');
      console.log('Interaction points:', this.components.stateManager.game.interactionPoints);

      // 隐藏加载指示器
      this.loadingIndicator.hide();

      // 显示成功提示
      toast.success('游戏加载完成！', 2000);

      // 启动游戏（显示登录界面）
      this.start();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.loadingIndicator.hide();
      toast.error('游戏初始化失败，请刷新页面重试', 5000);
    }
  }

  /**
   * 创建所有组件
   * @returns {Object} 组件对象
   */
  createComponents() {
    const stateManager = new StateManager();
    const apiClient = new APIClient();
    const sceneRenderer = new SceneRenderer();
    const interactionManager = new InteractionManager();
    const quizModal = new QuizModal();
    const scoreDisplay = new ScoreDisplay();
    const loginModal = new LoginModal(apiClient);
    const rankingPage = new RankingPage();

    return {
      stateManager,
      apiClient,
      sceneRenderer,
      interactionManager,
      quizModal,
      scoreDisplay,
      loginModal,
      rankingPage,
    };
  }

  /**
   * 初始化交互点位置
   * 定义至少10个交互点，分布在溶洞场景中
   */
  initializeInteractionPoints() {
    // 先获取题目列表（此时还未加载，所以先定义占位符）
    // 实际的 questionId 会在加载题目后更新
    const interactionPoints = [
      { id: 'p1', x: 0.15, y: 0.25, state: 'active', questionId: null },
      { id: 'p2', x: 0.35, y: 0.35, state: 'active', questionId: null },
      { id: 'p3', x: 0.55, y: 0.28, state: 'active', questionId: null },
      { id: 'p4', x: 0.75, y: 0.40, state: 'active', questionId: null },
      { id: 'p5', x: 0.25, y: 0.55, state: 'active', questionId: null },
      { id: 'p6', x: 0.45, y: 0.60, state: 'active', questionId: null },
      { id: 'p7', x: 0.65, y: 0.65, state: 'active', questionId: null },
      { id: 'p8', x: 0.85, y: 0.70, state: 'active', questionId: null },
      { id: 'p9', x: 0.30, y: 0.80, state: 'active', questionId: null },
      { id: 'p10', x: 0.60, y: 0.85, state: 'active', questionId: null },
      { id: 'p11', x: 0.20, y: 0.45, state: 'active', questionId: null },
      { id: 'p12', x: 0.80, y: 0.55, state: 'active', questionId: null },
    ];

    // 添加交互点到状态管理器
    this.components.stateManager.setInteractionPoints(interactionPoints);

    // 添加交互点到场景渲染器
    interactionPoints.forEach((point) => {
      this.components.sceneRenderer.addInteractionPoint(point);
    });

    // 添加交互点到交互管理器
    this.components.interactionManager.setInteractionPoints(interactionPoints);

    console.log(`Initialized ${interactionPoints.length} interaction points`);
  }

  /**
   * 将题目 ID 分配给交互点（随机选择，不重复）
   */
  assignQuestionsToPoints() {
    const questions = this.components.stateManager.game.questions;
    const interactionPoints = this.components.stateManager.game.interactionPoints;

    console.log('[assignQuestionsToPoints] Total questions:', questions.length);
    console.log('[assignQuestionsToPoints] Interaction points:', interactionPoints.length);

    // 使用 Fisher-Yates 洗牌算法随机打乱题目顺序
    const shuffledQuestions = [...questions];
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
    }

    // 将前12道题目分配给交互点（保证不重复）
    interactionPoints.forEach((point, index) => {
      if (index < shuffledQuestions.length) {
        point.questionId = shuffledQuestions[index].id;
        console.log(`[assignQuestionsToPoints] Point ${point.id} -> Question: ${shuffledQuestions[index].text.substring(0, 20)}...`);
      }
    });

    console.log('[assignQuestionsToPoints] Assignment complete');
  }

  /**
   * 加载题目列表
   */
  async loadQuestions() {
    try {
      const response = await this.components.apiClient.getQuestions();
      const questions = response.questions || [];

      // 设置题目列表到状态管理器
      this.components.stateManager.setQuestions(questions);

      console.log(`Loaded ${questions.length} questions`);
    } catch (error) {
      console.error('Failed to load questions:', error);
      throw new Error('加载题目失败');
    }
  }

  /**
   * 设置窗口大小变化监听
   */
  setupWindowResize() {
    window.addEventListener('resize', () => {
      if (this.components.sceneRenderer) {
        this.components.sceneRenderer.handleResize();
      }
    });
  }

  /**
   * 启动游戏
   */
  start() {
    if (!this.isInitialized) {
      console.error('App not initialized');
      return;
    }

    console.log('Starting game...');

    // 启动游戏控制器（显示登录界面）
    this.gameController.start();
  }

  /**
   * 清理资源
   */
  dispose() {
    if (this.gameController) {
      this.gameController.dispose();
    }

    if (this.loadingIndicator) {
      this.loadingIndicator.dispose();
    }

    this.components = null;
    this.gameController = null;
    this.isInitialized = false;
  }
}

// 创建应用实例
const app = new App();

// 暴露到全局以便调试
window.app = app;

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app.initialize();
  });
} else {
  app.initialize();
}

// 导出供测试使用
export default App;
export { app };
