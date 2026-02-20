import { describe, test, expect, beforeEach, vi } from 'vitest';
import { GameController } from './GameController.js';

describe('GameController', () => {
  let controller;
  let mockComponents;

  beforeEach(() => {
    // 创建所有模拟组件
    mockComponents = {
      stateManager: {
        user: {
          id: null,
          username: null,
          score: 0,
          completedQuestions: new Set()
        },
        game: {
          phase: 'login',
          questions: [],
          interactionPoints: []
        },
        setUserId: vi.fn(),
        setUsername: vi.fn(),
        setQuestions: vi.fn(),
        setGamePhase: vi.fn(),
        updateScore: vi.fn(),
        markQuestionCompleted: vi.fn(),
        on: vi.fn()
      },
      apiClient: {
        getQuestions: vi.fn(),
        submitAnswer: vi.fn()
      },
      sceneRenderer: {
        updateInteractionPoint: vi.fn()
      },
      interactionManager: {
        onPointHover: vi.fn(),
        onPointClick: vi.fn(),
        updateInteractionPoints: vi.fn()
      },
      quizModal: {
        show: vi.fn(),
        hide: vi.fn(),
        onAnswerSelected: vi.fn(),
        getCurrentQuestion: vi.fn()
      },
      scoreDisplay: {
        show: vi.fn(),
        hide: vi.fn(),
        reset: vi.fn(),
        updateScore: vi.fn(),
        animateScoreChange: vi.fn()
      },
      loginModal: {
        onSuccess: vi.fn(),
        show: vi.fn()
      },
      rankingPage: {
        show: vi.fn(),
        hide: vi.fn(),
        onRestart: vi.fn()
      }
        updateScore: vi.fn(),
        animateScoreChange: vi.fn()
      },
      loginModal: {
        onSuccess: vi.fn(),
        show: vi.fn()
      }
    };

    controller = new GameController(mockComponents);
  });

  describe('constructor', () => {
    test('should initialize with all components', () => {
      expect(controller.stateManager).toBe(mockComponents.stateManager);
      expect(controller.apiClient).toBe(mockComponents.apiClient);
      expect(controller.sceneRenderer).toBe(mockComponents.sceneRenderer);
      expect(controller.interactionManager).toBe(mockComponents.interactionManager);
      expect(controller.quizModal).toBe(mockComponents.quizModal);
      expect(controller.scoreDisplay).toBe(mockComponents.scoreDisplay);
      expect(controller.loginModal).toBe(mockComponents.loginModal);
    });

    test('should setup event handlers', () => {
      expect(mockComponents.loginModal.onSuccess).toHaveBeenCalled();
      expect(mockComponents.interactionManager.onPointHover).toHaveBeenCalled();
      expect(mockComponents.interactionManager.onPointClick).toHaveBeenCalled();
      expect(mockComponents.quizModal.onAnswerSelected).toHaveBeenCalled();
    });

    test('should initialize isProcessingAnswer to false', () => {
      expect(controller.isProcessingAnswer).toBe(false);
    });
  });

  describe('handleLoginSuccess', () => {
    test('should update state with user info', async () => {
      const mockQuestions = [{ id: 'q1', text: 'Test' }];
      mockComponents.apiClient.getQuestions.mockResolvedValue(mockQuestions);

      await controller.handleLoginSuccess('u1', 'testuser');

      expect(mockComponents.stateManager.setUserId).toHaveBeenCalledWith('u1');
      expect(mockComponents.stateManager.setUsername).toHaveBeenCalledWith('testuser');
    });

    test('should fetch questions from API', async () => {
      const mockQuestions = [{ id: 'q1', text: 'Test' }];
      mockComponents.apiClient.getQuestions.mockResolvedValue(mockQuestions);

      await controller.handleLoginSuccess('u1', 'testuser');

      expect(mockComponents.apiClient.getQuestions).toHaveBeenCalled();
      expect(mockComponents.stateManager.setQuestions).toHaveBeenCalledWith(mockQuestions);
    });

    test('should change game phase to playing', async () => {
      mockComponents.apiClient.getQuestions.mockResolvedValue([]);

      await controller.handleLoginSuccess('u1', 'testuser');

      expect(mockComponents.stateManager.setGamePhase).toHaveBeenCalledWith('playing');
    });

    test('should show score display', async () => {
      mockComponents.apiClient.getQuestions.mockResolvedValue([]);

      await controller.handleLoginSuccess('u1', 'testuser');

      expect(mockComponents.scoreDisplay.show).toHaveBeenCalled();
    });

    test('should handle API error gracefully', async () => {
      mockComponents.apiClient.getQuestions.mockRejectedValue(new Error('API error'));
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await controller.handleLoginSuccess('u1', 'testuser');

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('游戏启动失败，请刷新页面重试');

      alertSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('handlePointHover', () => {
    beforeEach(() => {
      mockComponents.stateManager.game.interactionPoints = [
        { id: 'p1', state: 'active', questionId: 'q1' },
        { id: 'p2', state: 'active', questionId: 'q2' }
      ];
    });

    test('should highlight active point on hover', () => {
      const point = { id: 'p1', state: 'active', questionId: 'q1' };

      controller.handlePointHover(point);

      expect(mockComponents.sceneRenderer.updateInteractionPoint).toHaveBeenCalledWith('p1', 'hover');
    });

    test('should not highlight completed point', () => {
      const point = { id: 'p1', state: 'completed', questionId: 'q1' };

      controller.handlePointHover(point);

      expect(mockComponents.sceneRenderer.updateInteractionPoint).not.toHaveBeenCalledWith('p1', 'hover');
    });

    test('should reset all active points when hover is null', () => {
      controller.handlePointHover(null);

      expect(mockComponents.sceneRenderer.updateInteractionPoint).toHaveBeenCalledWith('p1', 'active');
      expect(mockComponents.sceneRenderer.updateInteractionPoint).toHaveBeenCalledWith('p2', 'active');
    });
  });

  describe('handlePointClick', () => {
    beforeEach(() => {
      mockComponents.stateManager.game.questions = [
        { id: 'q1', text: 'Question 1', options: [] }
      ];
      mockComponents.stateManager.user.completedQuestions = new Set();
    });

    test('should show quiz modal for active point', () => {
      const point = { id: 'p1', state: 'active', questionId: 'q1' };

      controller.handlePointClick(point);

      expect(mockComponents.quizModal.show).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'q1' })
      );
    });

    test('should not show modal for completed question', () => {
      mockComponents.stateManager.user.completedQuestions.add('q1');
      const point = { id: 'p1', state: 'active', questionId: 'q1' };

      controller.handlePointClick(point);

      expect(mockComponents.quizModal.show).not.toHaveBeenCalled();
    });

    test('should handle missing question gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const point = { id: 'p1', state: 'active', questionId: 'q999' };

      controller.handlePointClick(point);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockComponents.quizModal.show).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('handleAnswerSelected', () => {
    beforeEach(() => {
      mockComponents.stateManager.user.id = 'u1';
      mockComponents.quizModal.getCurrentQuestion.mockReturnValue({
        id: 'q1',
        text: 'Test question',
        correctAnswerId: 'a'
      });
    });

    test('should submit answer to API', async () => {
      mockComponents.apiClient.submitAnswer.mockResolvedValue({
        correct: true,
        scoreEarned: 10,
        totalScore: 10
      });

      await controller.handleAnswerSelected('a');

      expect(mockComponents.apiClient.submitAnswer).toHaveBeenCalledWith('u1', 'q1', 'a');
    });

    test('should handle correct answer', async () => {
      mockComponents.apiClient.submitAnswer.mockResolvedValue({
        correct: true,
        scoreEarned: 10,
        totalScore: 10
      });

      await controller.handleAnswerSelected('a');

      expect(mockComponents.scoreDisplay.animateScoreChange).toHaveBeenCalledWith(10);
      expect(mockComponents.stateManager.updateScore).toHaveBeenCalledWith(10);
      expect(mockComponents.stateManager.markQuestionCompleted).toHaveBeenCalledWith('q1');
    });

    test('should handle wrong answer', async () => {
      mockComponents.apiClient.submitAnswer.mockResolvedValue({
        correct: false,
        scoreEarned: 0,
        totalScore: 0
      });

      await controller.handleAnswerSelected('b');

      expect(mockComponents.quizModal.hide).toHaveBeenCalled();
      expect(mockComponents.stateManager.markQuestionCompleted).toHaveBeenCalledWith('q1');
      expect(mockComponents.scoreDisplay.animateScoreChange).not.toHaveBeenCalled();
    });

    test('should prevent multiple simultaneous submissions', async () => {
      mockComponents.apiClient.submitAnswer.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      controller.handleAnswerSelected('a');
      controller.handleAnswerSelected('b');

      expect(mockComponents.apiClient.submitAnswer).toHaveBeenCalledTimes(1);
    });

    test('should handle API error', async () => {
      mockComponents.apiClient.submitAnswer.mockRejectedValue(new Error('API error'));
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await controller.handleAnswerSelected('a');

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('提交答案失败，请重试');

      alertSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    test('should reset processing flag after completion', async () => {
      mockComponents.apiClient.submitAnswer.mockResolvedValue({
        correct: true,
        scoreEarned: 10,
        totalScore: 10
      });

      await controller.handleAnswerSelected('a');

      expect(controller.isProcessingAnswer).toBe(false);
    });
  });

  describe('handleQuestionCompleted', () => {
    beforeEach(() => {
      mockComponents.stateManager.game.interactionPoints = [
        { id: 'p1', state: 'active', questionId: 'q1' }
      ];
      mockComponents.stateManager.game.questions = [
        { id: 'q1', text: 'Test' }
      ];
      mockComponents.stateManager.user.completedQuestions = new Set(['q1']);
    });

    test('should update interaction point to completed', () => {
      controller.handleQuestionCompleted('q1');

      expect(mockComponents.sceneRenderer.updateInteractionPoint).toHaveBeenCalledWith('p1', 'completed');
      expect(mockComponents.interactionManager.updateInteractionPoints).toHaveBeenCalled();
    });

    test('should check game completion', () => {
      const checkGameCompletionSpy = vi.spyOn(controller, 'checkGameCompletion');

      controller.handleQuestionCompleted('q1');

      expect(checkGameCompletionSpy).toHaveBeenCalled();
    });
  });

  describe('checkGameCompletion', () => {
    test('should set game phase to finished when all questions completed', () => {
      mockComponents.stateManager.game.questions = [
        { id: 'q1' },
        { id: 'q2' }
      ];
      mockComponents.stateManager.user.completedQuestions = new Set(['q1', 'q2']);

      controller.checkGameCompletion();

      expect(mockComponents.stateManager.setGamePhase).toHaveBeenCalledWith('finished');
    });

    test('should not finish game when questions remain', () => {
      mockComponents.stateManager.game.questions = [
        { id: 'q1' },
        { id: 'q2' }
      ];
      mockComponents.stateManager.user.completedQuestions = new Set(['q1']);

      controller.checkGameCompletion();

      expect(mockComponents.stateManager.setGamePhase).not.toHaveBeenCalledWith('finished');
    });
  });

  describe('start', () => {
    test('should show login modal', () => {
      controller.start();

      expect(mockComponents.loginModal.show).toHaveBeenCalled();
    });
  });

  describe('delay', () => {
    test('should delay for specified milliseconds', async () => {
      const start = Date.now();
      await controller.delay(100);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(100);
    });
  });

  describe('dispose', () => {
    test('should dispose all components', () => {
      mockComponents.loginModal.dispose = vi.fn();
      mockComponents.quizModal.dispose = vi.fn();
      mockComponents.scoreDisplay.dispose = vi.fn();
      mockComponents.sceneRenderer.dispose = vi.fn();
      mockComponents.interactionManager.dispose = vi.fn();

      controller.dispose();

      expect(mockComponents.loginModal.dispose).toHaveBeenCalled();
      expect(mockComponents.quizModal.dispose).toHaveBeenCalled();
      expect(mockComponents.scoreDisplay.dispose).toHaveBeenCalled();
      expect(mockComponents.sceneRenderer.dispose).toHaveBeenCalled();
      expect(mockComponents.interactionManager.dispose).toHaveBeenCalled();
    });

    test('should handle missing dispose methods', () => {
      controller.loginModal = null;

      expect(() => controller.dispose()).not.toThrow();
    });
  });
});


describe('排名页面集成', () => {
  test('应该在游戏完成后显示排名', async () => {
    const mockRankings = [
      { rank: 1, userId: 'u1', username: '张三', score: 100, timestamp: new Date().toISOString() },
      { rank: 2, userId: 'u2', username: '李四', score: 80, timestamp: new Date().toISOString() },
    ];

    mockComponents.apiClient.getRankings = vi.fn().mockResolvedValue({
      rankings: mockRankings
    });

    mockComponents.stateManager.user = {
      id: 'u1',
      username: '张三',
      score: 100,
      completedQuestions: new Set()
    };

    controller = new GameController(mockComponents);

    await controller.showGameCompletion();

    expect(mockComponents.apiClient.getRankings).toHaveBeenCalledWith(100, 0);
    expect(mockComponents.rankingPage.show).toHaveBeenCalledWith(mockRankings, 'u1');
  });

  test('应该处理获取排名失败', async () => {
    mockComponents.apiClient.getRankings = vi.fn().mockRejectedValue(new Error('Network error'));

    mockComponents.stateManager.user = {
      id: 'u1',
      username: '张三',
      score: 100,
      completedQuestions: new Set()
    };

    // Mock alert
    global.alert = vi.fn();

    controller = new GameController(mockComponents);

    await controller.showGameCompletion();

    expect(mockComponents.apiClient.getRankings).toHaveBeenCalled();
    expect(global.alert).toHaveBeenCalled();
  });

  test('应该处理重新开始', () => {
    mockComponents.stateManager.game.interactionPoints = [
      { id: 'p1', state: 'completed', questionId: 'q1' },
      { id: 'p2', state: 'completed', questionId: 'q2' },
    ];

    controller = new GameController(mockComponents);

    controller.handleRestart();

    expect(mockComponents.rankingPage.hide).toHaveBeenCalled();
    expect(mockComponents.scoreDisplay.hide).toHaveBeenCalled();
    expect(mockComponents.scoreDisplay.reset).toHaveBeenCalled();
    expect(mockComponents.stateManager.reset).toHaveBeenCalled();
    expect(mockComponents.sceneRenderer.updateInteractionPoint).toHaveBeenCalledWith('p1', 'active');
    expect(mockComponents.sceneRenderer.updateInteractionPoint).toHaveBeenCalledWith('p2', 'active');
    expect(mockComponents.loginModal.show).toHaveBeenCalled();
  });
});
