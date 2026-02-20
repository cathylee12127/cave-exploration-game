import { describe, test, expect, beforeEach, vi } from 'vitest';
import { InteractionManager } from './InteractionManager.js';

describe('InteractionManager', () => {
  let manager;
  let canvas;
  let mockInteractionPoints;

  beforeEach(() => {
    // 创建模拟 canvas
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);

    // 模拟 getBoundingClientRect
    canvas.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
      right: 800,
      bottom: 600
    }));

    // 创建模拟交互点
    mockInteractionPoints = [
      { id: 'p1', x: 100, y: 100, state: 'active', questionId: 'q1' },
      { id: 'p2', x: 300, y: 200, state: 'active', questionId: 'q2' },
      { id: 'p3', x: 500, y: 400, state: 'completed', questionId: 'q3' }
    ];

    manager = new InteractionManager();
  });

  describe('initialize', () => {
    test('should initialize with canvas and interaction points', () => {
      manager.initialize(canvas, mockInteractionPoints);

      expect(manager.canvas).toBe(canvas);
      expect(manager.interactionPoints).toEqual(mockInteractionPoints);
    });

    test('should add event listeners to canvas', () => {
      const addEventListenerSpy = vi.spyOn(canvas, 'addEventListener');
      
      manager.initialize(canvas, mockInteractionPoints);

      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
    });
  });

  describe('detectClick', () => {
    beforeEach(() => {
      manager.initialize(canvas, mockInteractionPoints);
    });

    test('should detect click on interaction point', () => {
      const detected = manager.detectClick(100, 100);

      expect(detected).toBeDefined();
      expect(detected.id).toBe('p1');
    });

    test('should detect click within click radius', () => {
      const detected = manager.detectClick(110, 110);

      expect(detected).toBeDefined();
      expect(detected.id).toBe('p1');
    });

    test('should not detect click outside click radius', () => {
      const detected = manager.detectClick(200, 200);

      expect(detected).toBeNull();
    });

    test('should not detect click on completed interaction point', () => {
      const detected = manager.detectClick(500, 400);

      expect(detected).toBeNull();
    });

    test('should return null when no interaction points are near', () => {
      const detected = manager.detectClick(700, 500);

      expect(detected).toBeNull();
    });
  });

  describe('detectHover', () => {
    beforeEach(() => {
      manager.initialize(canvas, mockInteractionPoints);
    });

    test('should detect hover on interaction point', () => {
      const detected = manager.detectHover(100, 100);

      expect(detected).toBeDefined();
      expect(detected.id).toBe('p1');
    });

    test('should detect hover within click radius', () => {
      const detected = manager.detectHover(115, 115);

      expect(detected).toBeDefined();
      expect(detected.id).toBe('p1');
    });

    test('should not detect hover outside click radius', () => {
      const detected = manager.detectHover(200, 200);

      expect(detected).toBeNull();
    });

    test('should not detect hover on completed interaction point', () => {
      const detected = manager.detectHover(500, 400);

      expect(detected).toBeNull();
    });
  });

  describe('getCanvasCoordinates', () => {
    beforeEach(() => {
      manager.initialize(canvas, mockInteractionPoints);
    });

    test('should convert screen coordinates to canvas coordinates', () => {
      const coords = manager.getCanvasCoordinates(400, 300);

      expect(coords.x).toBe(400);
      expect(coords.y).toBe(300);
    });

    test('should handle scaled canvas', () => {
      canvas.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 400,
        height: 300,
        right: 400,
        bottom: 300
      }));

      const coords = manager.getCanvasCoordinates(200, 150);

      expect(coords.x).toBe(400);
      expect(coords.y).toBe(300);
    });

    test('should handle canvas offset', () => {
      canvas.getBoundingClientRect = vi.fn(() => ({
        left: 100,
        top: 50,
        width: 800,
        height: 600,
        right: 900,
        bottom: 650
      }));

      const coords = manager.getCanvasCoordinates(200, 150);

      expect(coords.x).toBe(100);
      expect(coords.y).toBe(100);
    });
  });

  describe('calculateDistance', () => {
    test('should calculate distance between two points', () => {
      const distance = manager.calculateDistance(0, 0, 3, 4);

      expect(distance).toBe(5);
    });

    test('should return 0 for same point', () => {
      const distance = manager.calculateDistance(100, 100, 100, 100);

      expect(distance).toBe(0);
    });

    test('should calculate distance for negative coordinates', () => {
      const distance = manager.calculateDistance(-3, -4, 0, 0);

      expect(distance).toBe(5);
    });
  });

  describe('onPointClick', () => {
    beforeEach(() => {
      manager.initialize(canvas, mockInteractionPoints);
    });

    test('should register click callback', () => {
      const callback = vi.fn();
      manager.onPointClick(callback);

      expect(manager.clickCallbacks).toContain(callback);
    });

    test('should trigger click callback when point is clicked', () => {
      const callback = vi.fn();
      manager.onPointClick(callback);

      const point = mockInteractionPoints[0];
      manager.triggerClickCallbacks(point);

      expect(callback).toHaveBeenCalledWith(point);
    });

    test('should trigger multiple click callbacks', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      manager.onPointClick(callback1);
      manager.onPointClick(callback2);

      const point = mockInteractionPoints[0];
      manager.triggerClickCallbacks(point);

      expect(callback1).toHaveBeenCalledWith(point);
      expect(callback2).toHaveBeenCalledWith(point);
    });

    test('should not register non-function callbacks', () => {
      manager.onPointClick('not a function');

      expect(manager.clickCallbacks.length).toBe(0);
    });

    test('should handle callback errors gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error');
      });
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      manager.onPointClick(errorCallback);
      manager.triggerClickCallbacks(mockInteractionPoints[0]);

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('onPointHover', () => {
    beforeEach(() => {
      manager.initialize(canvas, mockInteractionPoints);
    });

    test('should register hover callback', () => {
      const callback = vi.fn();
      manager.onPointHover(callback);

      expect(manager.hoverCallbacks).toContain(callback);
    });

    test('should trigger hover callback when point is hovered', () => {
      const callback = vi.fn();
      manager.onPointHover(callback);

      const point = mockInteractionPoints[0];
      manager.triggerHoverCallbacks(point);

      expect(callback).toHaveBeenCalledWith(point);
    });

    test('should trigger hover callback with null when no point is hovered', () => {
      const callback = vi.fn();
      manager.onPointHover(callback);

      manager.triggerHoverCallbacks(null);

      expect(callback).toHaveBeenCalledWith(null);
    });

    test('should not register non-function callbacks', () => {
      manager.onPointHover(123);

      expect(manager.hoverCallbacks.length).toBe(0);
    });
  });

  describe('handleClick', () => {
    beforeEach(() => {
      manager.initialize(canvas, mockInteractionPoints);
    });

    test('should trigger click callback on mouse click', () => {
      const callback = vi.fn();
      manager.onPointClick(callback);

      const event = new MouseEvent('click', {
        clientX: 100,
        clientY: 100
      });
      manager.handleClick(event);

      expect(callback).toHaveBeenCalled();
      expect(callback.mock.calls[0][0].id).toBe('p1');
    });

    test('should not trigger callback when clicking outside points', () => {
      const callback = vi.fn();
      manager.onPointClick(callback);

      const event = new MouseEvent('click', {
        clientX: 700,
        clientY: 500
      });
      manager.handleClick(event);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('handleMouseMove', () => {
    beforeEach(() => {
      manager.initialize(canvas, mockInteractionPoints);
    });

    test('should trigger hover callback on mouse move', () => {
      const callback = vi.fn();
      manager.onPointHover(callback);

      const event = new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 100
      });
      manager.handleMouseMove(event);

      expect(callback).toHaveBeenCalled();
      expect(callback.mock.calls[0][0].id).toBe('p1');
    });

    test('should trigger callback with null when moving away from point', () => {
      const callback = vi.fn();
      manager.onPointHover(callback);

      // 先悬停在点上
      let event = new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 100
      });
      manager.handleMouseMove(event);

      callback.mockClear();

      // 移开
      event = new MouseEvent('mousemove', {
        clientX: 700,
        clientY: 500
      });
      manager.handleMouseMove(event);

      expect(callback).toHaveBeenCalledWith(null);
    });

    test('should not trigger callback when hovering same point', () => {
      const callback = vi.fn();
      manager.onPointHover(callback);

      const event1 = new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 100
      });
      manager.handleMouseMove(event1);

      callback.mockClear();

      const event2 = new MouseEvent('mousemove', {
        clientX: 105,
        clientY: 105
      });
      manager.handleMouseMove(event2);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('handleTouchStart', () => {
    beforeEach(() => {
      manager.initialize(canvas, mockInteractionPoints);
    });

    test('should trigger click callback on touch', () => {
      const callback = vi.fn();
      manager.onPointClick(callback);

      const event = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      
      manager.handleTouchStart(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
      expect(callback.mock.calls[0][0].id).toBe('p1');
    });
  });

  describe('updateInteractionPoints', () => {
    beforeEach(() => {
      manager.initialize(canvas, mockInteractionPoints);
    });

    test('should update interaction points', () => {
      const newPoints = [
        { id: 'p4', x: 600, y: 500, state: 'active', questionId: 'q4' }
      ];

      manager.updateInteractionPoints(newPoints);

      expect(manager.interactionPoints).toEqual(newPoints);
    });

    test('should affect click detection after update', () => {
      const newPoints = [
        { id: 'p4', x: 600, y: 500, state: 'active', questionId: 'q4' }
      ];

      manager.updateInteractionPoints(newPoints);

      const detected1 = manager.detectClick(100, 100);
      expect(detected1).toBeNull();

      const detected2 = manager.detectClick(600, 500);
      expect(detected2).toBeDefined();
      expect(detected2.id).toBe('p4');
    });
  });

  describe('dispose', () => {
    beforeEach(() => {
      manager.initialize(canvas, mockInteractionPoints);
    });

    test('should remove event listeners', () => {
      const removeEventListenerSpy = vi.spyOn(canvas, 'removeEventListener');
      
      manager.dispose();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
    });

    test('should clear all properties', () => {
      manager.dispose();

      expect(manager.canvas).toBeNull();
      expect(manager.interactionPoints).toEqual([]);
      expect(manager.clickCallbacks).toEqual([]);
      expect(manager.hoverCallbacks).toEqual([]);
      expect(manager.currentHoveredPoint).toBeNull();
    });

    test('should not throw error if canvas is null', () => {
      manager.canvas = null;

      expect(() => manager.dispose()).not.toThrow();
    });
  });

  describe('edge cases', () => {
    test('should handle empty interaction points array', () => {
      manager.initialize(canvas, []);

      const detected = manager.detectClick(100, 100);

      expect(detected).toBeNull();
    });

    test('should handle multiple points at same location', () => {
      const overlappingPoints = [
        { id: 'p1', x: 100, y: 100, state: 'active', questionId: 'q1' },
        { id: 'p2', x: 100, y: 100, state: 'active', questionId: 'q2' }
      ];

      manager.initialize(canvas, overlappingPoints);

      const detected = manager.detectClick(100, 100);

      expect(detected).toBeDefined();
      expect(detected.id).toBe('p1'); // 返回第一个匹配的点
    });

    test('should handle very large canvas coordinates', () => {
      const coords = manager.getCanvasCoordinates(10000, 10000);

      expect(coords.x).toBeGreaterThan(0);
      expect(coords.y).toBeGreaterThan(0);
    });

    test('should handle negative canvas coordinates', () => {
      canvas.getBoundingClientRect = vi.fn(() => ({
        left: 100,
        top: 100,
        width: 800,
        height: 600,
        right: 900,
        bottom: 700
      }));

      manager.initialize(canvas, mockInteractionPoints);

      const coords = manager.getCanvasCoordinates(50, 50);

      expect(coords.x).toBeLessThan(0);
      expect(coords.y).toBeLessThan(0);
    });
  });
});
