/**
 * 主应用类测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import App from './main.js';

describe('App', () => {
  let app;

  beforeEach(() => {
    // 创建 canvas 元素
    const canvas = document.createElement('canvas');
    canvas.id = 'game-canvas';
    document.body.appendChild(canvas);

    app = new App();
  });

  afterEach(() => {
    if (app) {
      app.dispose();
    }

    // 清理 DOM
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      document.body.removeChild(canvas);
    }
  });

  describe('初始化', () => {
    it('应该创建 App 实例', () => {
      expect(app).toBeDefined();
      expect(app.isInitialized).toBe(false);
    });

    it('应该初始化所有组件', async () => {
      // Mock API 调用
      vi.spyOn(app, 'loadQuestions').mockResolvedValue();

      await app.initialize();

      expect(app.isInitialized).toBe(true);
      expect(app.components).toBeDefined();
      expect(app.components.stateManager).toBeDefined();
      expect(app.components.apiClient).toBeDefined();
      expect(app.components.sceneRenderer).toBeDefined();
      expect(app.components.interactionManager).toBeDefined();
      expect(app.components.quizModal).toBeDefined();
      expect(app.components.scoreDisplay).toBeDefined();
      expect(app.components.loginModal).toBeDefined();
      expect(app.components.rankingPage).toBeDefined();
      expect(app.gameController).toBeDefined();
    });

    it('应该初始化至少10个交互点', async () => {
      vi.spyOn(app, 'loadQuestions').mockResolvedValue();

      await app.initialize();

      const interactionPoints = app.components.stateManager.game.interactionPoints;
      expect(interactionPoints.length).toBeGreaterThanOrEqual(10);
    });

    it('应该处理初始化失败', async () => {
      // Mock 失败的 API 调用
      vi.spyOn(app, 'loadQuestions').mockRejectedValue(new Error('Network error'));
      vi.spyOn(app, 'showError').mockImplementation(() => {});

      await app.initialize();

      expect(app.showError).toHaveBeenCalled();
    });
  });

  describe('交互点初始化', () => {
    it('应该定义交互点位置', async () => {
      vi.spyOn(app, 'loadQuestions').mockResolvedValue();

      await app.initialize();

      const points = app.components.stateManager.game.interactionPoints;

      points.forEach((point) => {
        expect(point).toHaveProperty('id');
        expect(point).toHaveProperty('x');
        expect(point).toHaveProperty('y');
        expect(point).toHaveProperty('state');
        expect(point).toHaveProperty('questionId');

        // 验证坐标在 0-1 范围内
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(1);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(1);

        // 验证初始状态为 active
        expect(point.state).toBe('active');
      });
    });

    it('应该将交互点与题目关联', async () => {
      vi.spyOn(app, 'loadQuestions').mockResolvedValue();

      await app.initialize();

      const points = app.components.stateManager.game.interactionPoints;

      points.forEach((point) => {
        expect(point.questionId).toMatch(/^q\d+$/);
      });
    });
  });

  describe('启动游戏', () => {
    it('应该显示登录界面', async () => {
      vi.spyOn(app, 'loadQuestions').mockResolvedValue();

      await app.initialize();

      const showSpy = vi.spyOn(app.components.loginModal, 'show');

      app.start();

      expect(showSpy).toHaveBeenCalled();
    });

    it('应该在未初始化时拒绝启动', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      app.start();

      expect(consoleSpy).toHaveBeenCalledWith('App not initialized');

      consoleSpy.mockRestore();
    });
  });

  describe('窗口大小变化', () => {
    it('应该监听窗口大小变化', async () => {
      vi.spyOn(app, 'loadQuestions').mockResolvedValue();

      await app.initialize();

      const handleResizeSpy = vi.spyOn(app.components.sceneRenderer, 'handleResize');

      // 触发 resize 事件
      window.dispatchEvent(new Event('resize'));

      expect(handleResizeSpy).toHaveBeenCalled();
    });
  });

  describe('清理资源', () => {
    it('应该清理所有组件', async () => {
      vi.spyOn(app, 'loadQuestions').mockResolvedValue();

      await app.initialize();

      const disposeSpy = vi.spyOn(app.gameController, 'dispose');

      app.dispose();

      expect(disposeSpy).toHaveBeenCalled();
      expect(app.components).toBeNull();
      expect(app.gameController).toBeNull();
      expect(app.isInitialized).toBe(false);
    });
  });
});
