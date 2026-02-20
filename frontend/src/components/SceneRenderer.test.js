/**
 * SceneRenderer 单元测试
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { SceneRenderer } from './SceneRenderer.js';

describe('SceneRenderer', () => {
  let renderer;
  let canvas;
  let ctx;

  beforeEach(() => {
    // 创建模拟 canvas 和 context
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    // 模拟 2D context 方法
    ctx = canvas.getContext('2d');
    
    renderer = new SceneRenderer();
  });

  afterEach(() => {
    if (renderer) {
      renderer.dispose();
    }
  });

  describe('initialize', () => {
    test('should initialize canvas with correct dimensions', () => {
      renderer.initialize(canvas);

      expect(renderer.canvas).toBe(canvas);
      expect(renderer.ctx).toBeTruthy();
      expect(canvas.width).toBeGreaterThan(0);
      expect(canvas.height).toBeGreaterThan(0);
    });

    test('should throw error if canvas is null', () => {
      expect(() => renderer.initialize(null)).toThrow('Canvas element is required');
    });

    test('should throw error if 2D context is not available', () => {
      const badCanvas = {
        getContext: () => null,
      };

      expect(() => renderer.initialize(badCanvas)).toThrow('Failed to get 2D context');
    });
  });

  describe('render', () => {
    test('should render scene without errors', () => {
      renderer.initialize(canvas);
      
      // 应该不抛出错误
      expect(() => renderer.render()).not.toThrow();
    });

    test('should not render if canvas is not initialized', () => {
      // 不应该抛出错误，只是不渲染
      expect(() => renderer.render()).not.toThrow();
    });

    test('should call drawing methods', () => {
      renderer.initialize(canvas);

      // 监听 context 方法调用
      const fillRectSpy = vi.spyOn(ctx, 'fillRect');
      const beginPathSpy = vi.spyOn(ctx, 'beginPath');

      renderer.render();

      // 验证绘制方法被调用
      expect(fillRectSpy).toHaveBeenCalled();
      expect(beginPathSpy).toHaveBeenCalled();
    });
  });

  describe('handleResize', () => {
    test('should update canvas dimensions on resize', () => {
      renderer.initialize(canvas);

      // 模拟窗口尺寸
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });

      renderer.handleResize();

      expect(canvas.width).toBe(1024);
      expect(canvas.height).toBe(768);
    });

    test('should not throw error if canvas is not initialized', () => {
      expect(() => renderer.handleResize()).not.toThrow();
    });
  });

  describe('addInteractionPoint', () => {
    test('should add interaction point successfully', () => {
      renderer.initialize(canvas);

      const point = {
        id: 'p1',
        x: 0.5,
        y: 0.5,
        state: 'active',
        questionId: 'q1',
      };

      renderer.addInteractionPoint(point);

      expect(renderer.interactionPoints).toHaveLength(1);
      expect(renderer.interactionPoints[0]).toBe(point);
    });

    test('should throw error for invalid point', () => {
      renderer.initialize(canvas);

      expect(() => renderer.addInteractionPoint(null)).toThrow('Invalid interaction point');
      expect(() => renderer.addInteractionPoint({})).toThrow('Invalid interaction point');
      expect(() => renderer.addInteractionPoint({ x: 0.5 })).toThrow('Invalid interaction point');
    });

    test('should add multiple interaction points', () => {
      renderer.initialize(canvas);

      const points = [
        { id: 'p1', x: 0.2, y: 0.3, state: 'active', questionId: 'q1' },
        { id: 'p2', x: 0.5, y: 0.6, state: 'active', questionId: 'q2' },
        { id: 'p3', x: 0.8, y: 0.4, state: 'active', questionId: 'q3' },
      ];

      points.forEach(point => renderer.addInteractionPoint(point));

      expect(renderer.interactionPoints).toHaveLength(3);
    });
  });

  describe('updateInteractionPoint', () => {
    test('should update interaction point state', () => {
      renderer.initialize(canvas);

      const point = {
        id: 'p1',
        x: 0.5,
        y: 0.5,
        state: 'active',
        questionId: 'q1',
      };

      renderer.addInteractionPoint(point);
      renderer.updateInteractionPoint('p1', 'hover');

      expect(point.state).toBe('hover');
    });

    test('should not throw error for non-existent point', () => {
      renderer.initialize(canvas);

      expect(() => renderer.updateInteractionPoint('non-existent', 'hover')).not.toThrow();
    });

    test('should update multiple states', () => {
      renderer.initialize(canvas);

      const point = {
        id: 'p1',
        x: 0.5,
        y: 0.5,
        state: 'active',
        questionId: 'q1',
      };

      renderer.addInteractionPoint(point);

      renderer.updateInteractionPoint('p1', 'hover');
      expect(point.state).toBe('hover');

      renderer.updateInteractionPoint('p1', 'completed');
      expect(point.state).toBe('completed');

      renderer.updateInteractionPoint('p1', 'active');
      expect(point.state).toBe('active');
    });
  });

  describe('drawBackground', () => {
    test('should draw background with gradient', () => {
      renderer.initialize(canvas);

      const createRadialGradientSpy = vi.spyOn(ctx, 'createRadialGradient');
      const fillRectSpy = vi.spyOn(ctx, 'fillRect');

      renderer.drawBackground();

      expect(createRadialGradientSpy).toHaveBeenCalled();
      expect(fillRectSpy).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
    });
  });

  describe('drawLightEffects', () => {
    test('should draw light effects with radial gradients', () => {
      renderer.initialize(canvas);

      const createRadialGradientSpy = vi.spyOn(ctx, 'createRadialGradient');

      renderer.drawLightEffects();

      // 应该创建至少两个径向渐变（主光源和次光源）
      expect(createRadialGradientSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('drawStalactites', () => {
    test('should draw stalactites without errors', () => {
      renderer.initialize(canvas);

      expect(() => renderer.drawStalactites()).not.toThrow();
    });

    test('should call drawStalactite multiple times', () => {
      renderer.initialize(canvas);

      const drawStalactiteSpy = vi.spyOn(renderer, 'drawStalactite');

      renderer.drawStalactites();

      // 应该绘制多个钟乳石
      expect(drawStalactiteSpy).toHaveBeenCalled();
      expect(drawStalactiteSpy.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('drawStalagmites', () => {
    test('should draw stalagmites without errors', () => {
      renderer.initialize(canvas);

      expect(() => renderer.drawStalagmites()).not.toThrow();
    });

    test('should call drawStalagmite multiple times', () => {
      renderer.initialize(canvas);

      const drawStalagmiteSpy = vi.spyOn(renderer, 'drawStalagmite');

      renderer.drawStalagmites();

      // 应该绘制多个石笋
      expect(drawStalagmiteSpy).toHaveBeenCalled();
      expect(drawStalagmiteSpy.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('drawInteractionPoints', () => {
    test('should draw interaction points with correct colors', () => {
      renderer.initialize(canvas);

      const points = [
        { id: 'p1', x: 0.2, y: 0.3, state: 'active', questionId: 'q1' },
        { id: 'p2', x: 0.5, y: 0.6, state: 'hover', questionId: 'q2' },
        { id: 'p3', x: 0.8, y: 0.4, state: 'completed', questionId: 'q3' },
      ];

      points.forEach(point => renderer.addInteractionPoint(point));

      const arcSpy = vi.spyOn(ctx, 'arc');

      renderer.drawInteractionPoints();

      // 每个点应该绘制多个圆（外发光 + 核心光点 + 可能的高光）
      expect(arcSpy).toHaveBeenCalled();
      expect(arcSpy.mock.calls.length).toBeGreaterThan(points.length);
    });

    test('should not throw error with empty points array', () => {
      renderer.initialize(canvas);

      expect(() => renderer.drawInteractionPoints()).not.toThrow();
    });
  });

  describe('dispose', () => {
    test('should clean up resources', () => {
      renderer.initialize(canvas);

      const point = {
        id: 'p1',
        x: 0.5,
        y: 0.5,
        state: 'active',
        questionId: 'q1',
      };

      renderer.addInteractionPoint(point);

      renderer.dispose();

      expect(renderer.canvas).toBeNull();
      expect(renderer.ctx).toBeNull();
      expect(renderer.interactionPoints).toHaveLength(0);
    });

    test('should not throw error if called multiple times', () => {
      renderer.initialize(canvas);

      renderer.dispose();
      expect(() => renderer.dispose()).not.toThrow();
    });
  });

  describe('color scheme', () => {
    test('should use correct color palette', () => {
      expect(renderer.colors.deepBlue).toBe('#1a2a3a');
      expect(renderer.colors.darkPurple).toBe('#2d1b3d');
      expect(renderer.colors.earthYellow).toBe('#8b7355');
      expect(renderer.colors.grayBrown).toBe('#5a4a3a');
    });

    test('should have all required colors defined', () => {
      expect(renderer.colors).toHaveProperty('deepBlue');
      expect(renderer.colors).toHaveProperty('darkPurple');
      expect(renderer.colors).toHaveProperty('earthYellow');
      expect(renderer.colors).toHaveProperty('grayBrown');
      expect(renderer.colors).toHaveProperty('highlight');
      expect(renderer.colors).toHaveProperty('shadow');
      expect(renderer.colors).toHaveProperty('pointActive');
      expect(renderer.colors).toHaveProperty('pointHover');
      expect(renderer.colors).toHaveProperty('pointCompleted');
    });
  });

  describe('integration', () => {
    test('should render complete scene with interaction points', () => {
      renderer.initialize(canvas);

      // 添加交互点
      const points = [
        { id: 'p1', x: 0.3, y: 0.4, state: 'active', questionId: 'q1' },
        { id: 'p2', x: 0.7, y: 0.6, state: 'hover', questionId: 'q2' },
      ];

      points.forEach(point => renderer.addInteractionPoint(point));

      // 渲染场景
      expect(() => renderer.render()).not.toThrow();

      // 验证交互点已添加
      expect(renderer.interactionPoints).toHaveLength(2);
    });

    test('should handle resize and re-render', () => {
      renderer.initialize(canvas);

      const point = { id: 'p1', x: 0.5, y: 0.5, state: 'active', questionId: 'q1' };
      renderer.addInteractionPoint(point);

      // 改变窗口尺寸
      Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true });

      renderer.handleResize();

      // 验证画布尺寸已更新
      expect(canvas.width).toBe(1920);
      expect(canvas.height).toBe(1080);

      // 验证交互点仍然存在
      expect(renderer.interactionPoints).toHaveLength(1);
    });
  });
});
