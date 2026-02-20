import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScoreDisplay } from './ScoreDisplay.js';

describe('ScoreDisplay', () => {
  let display;

  beforeEach(() => {
    display = new ScoreDisplay();
  });

  afterEach(() => {
    display.dispose();
  });

  describe('constructor', () => {
    test('should create display DOM structure', () => {
      expect(display.container).toBeInstanceOf(HTMLElement);
      expect(display.scoreValue).toBeInstanceOf(HTMLElement);
      expect(display.scoreLabel).toBeInstanceOf(HTMLElement);
      expect(display.animationElement).toBeInstanceOf(HTMLElement);
    });

    test('should initialize with score 0', () => {
      expect(display.currentScore).toBe(0);
      expect(display.scoreValue.textContent).toBe('0');
    });

    test('should append display to document body', () => {
      expect(document.body.contains(display.container)).toBe(true);
    });

    test('should set correct label text', () => {
      expect(display.scoreLabel.textContent).toBe('当前积分');
    });

    test('should position at top-right by default', () => {
      expect(display.container.style.top).toBe('20px');
      expect(display.container.style.right).toBe('20px');
    });
  });

  describe('updateScore', () => {
    test('should update score value', () => {
      display.updateScore(50);

      expect(display.currentScore).toBe(50);
      expect(display.scoreValue.textContent).toBe('50');
    });

    test('should update score from 0 to positive', () => {
      display.updateScore(10);

      expect(display.currentScore).toBe(10);
    });

    test('should update score multiple times', () => {
      display.updateScore(10);
      display.updateScore(20);
      display.updateScore(30);

      expect(display.currentScore).toBe(30);
      expect(display.scoreValue.textContent).toBe('30');
    });

    test('should trigger pulse animation when score increases', () => {
      const pulseAnimationSpy = vi.spyOn(display, 'pulseAnimation');

      display.updateScore(10);

      expect(pulseAnimationSpy).toHaveBeenCalled();
    });

    test('should not trigger pulse animation when score stays same', () => {
      display.updateScore(10);
      const pulseAnimationSpy = vi.spyOn(display, 'pulseAnimation');

      display.updateScore(10);

      expect(pulseAnimationSpy).not.toHaveBeenCalled();
    });

    test('should throw error for invalid score', () => {
      expect(() => display.updateScore('invalid')).toThrow('Invalid score value');
      expect(() => display.updateScore(null)).toThrow('Invalid score value');
      expect(() => display.updateScore(undefined)).toThrow('Invalid score value');
    });

    test('should throw error for negative score', () => {
      expect(() => display.updateScore(-10)).toThrow('Invalid score value');
    });

    test('should handle large score values', () => {
      display.updateScore(999999);

      expect(display.currentScore).toBe(999999);
      expect(display.scoreValue.textContent).toBe('999999');
    });
  });

  describe('animateScoreChange', () => {
    test('should create animation element for positive delta', () => {
      display.animateScoreChange(10);

      const animElements = display.animationElement.children;
      expect(animElements.length).toBeGreaterThan(0);
      expect(animElements[0].textContent).toBe('+10');
    });

    test('should create animation element for negative delta', () => {
      display.animateScoreChange(-10);

      const animElements = display.animationElement.children;
      expect(animElements.length).toBeGreaterThan(0);
      expect(animElements[0].textContent).toBe('-10');
    });

    test('should use green color for positive delta', () => {
      display.animateScoreChange(20);

      const animElement = display.animationElement.children[0];
      expect(animElement.style.color).toBe('rgb(74, 222, 128)'); // #4ade80
    });

    test('should use red color for negative delta', () => {
      display.animateScoreChange(-10);

      const animElement = display.animationElement.children[0];
      expect(animElement.style.color).toBe('rgb(255, 107, 107)'); // #ff6b6b
    });

    test('should remove animation element after 1 second', (done) => {
      display.animateScoreChange(10);

      expect(display.animationElement.children.length).toBe(1);

      setTimeout(() => {
        expect(display.animationElement.children.length).toBe(0);
        done();
      }, 1100);
    });

    test('should handle multiple animations simultaneously', () => {
      display.animateScoreChange(10);
      display.animateScoreChange(20);

      expect(display.animationElement.children.length).toBe(2);
    });

    test('should throw error for invalid delta', () => {
      expect(() => display.animateScoreChange('invalid')).toThrow('Invalid delta value');
      expect(() => display.animateScoreChange(null)).toThrow('Invalid delta value');
    });

    test('should create animation styles on first call', () => {
      display.animateScoreChange(10);

      const styleElement = document.getElementById('score-animation-styles');
      expect(styleElement).toBeDefined();
      expect(styleElement.textContent).toContain('@keyframes scoreFloat');
    });

    test('should not duplicate animation styles', () => {
      display.animateScoreChange(10);
      display.animateScoreChange(20);

      const styleElements = document.querySelectorAll('#score-animation-styles');
      expect(styleElements.length).toBe(1);
    });
  });

  describe('pulseAnimation', () => {
    test('should apply pulse animation', () => {
      display.pulseAnimation();

      expect(display.scoreValue.style.animation).toContain('scorePulse');
    });

    test('should remove animation after 300ms', (done) => {
      display.pulseAnimation();

      setTimeout(() => {
        expect(display.scoreValue.style.animation).toBe('');
        done();
      }, 350);
    });
  });

  describe('show', () => {
    test('should show display', () => {
      display.hide();
      display.show();

      expect(display.container.style.display).toBe('block');
    });
  });

  describe('hide', () => {
    test('should hide display', () => {
      display.hide();

      expect(display.container.style.display).toBe('none');
    });
  });

  describe('getCurrentScore', () => {
    test('should return current score', () => {
      display.updateScore(50);

      expect(display.getCurrentScore()).toBe(50);
    });

    test('should return 0 initially', () => {
      expect(display.getCurrentScore()).toBe(0);
    });
  });

  describe('reset', () => {
    test('should reset score to 0', () => {
      display.updateScore(100);
      display.reset();

      expect(display.currentScore).toBe(0);
      expect(display.scoreValue.textContent).toBe('0');
    });

    test('should reset from any score value', () => {
      display.updateScore(999);
      display.reset();

      expect(display.getCurrentScore()).toBe(0);
    });
  });

  describe('setPosition', () => {
    test('should set position to top-right', () => {
      display.setPosition('top-right');

      expect(display.container.style.top).toBe('20px');
      expect(display.container.style.right).toBe('20px');
      expect(display.container.style.bottom).toBe('');
      expect(display.container.style.left).toBe('');
    });

    test('should set position to top-left', () => {
      display.setPosition('top-left');

      expect(display.container.style.top).toBe('20px');
      expect(display.container.style.left).toBe('20px');
      expect(display.container.style.bottom).toBe('');
      expect(display.container.style.right).toBe('');
    });

    test('should set position to bottom-right', () => {
      display.setPosition('bottom-right');

      expect(display.container.style.bottom).toBe('20px');
      expect(display.container.style.right).toBe('20px');
      expect(display.container.style.top).toBe('');
      expect(display.container.style.left).toBe('');
    });

    test('should set position to bottom-left', () => {
      display.setPosition('bottom-left');

      expect(display.container.style.bottom).toBe('20px');
      expect(display.container.style.left).toBe('20px');
      expect(display.container.style.top).toBe('');
      expect(display.container.style.right).toBe('');
    });

    test('should default to top-right for invalid position', () => {
      display.setPosition('invalid');

      expect(display.container.style.top).toBe('20px');
      expect(display.container.style.right).toBe('20px');
    });

    test('should clear previous position when changing', () => {
      display.setPosition('bottom-left');
      display.setPosition('top-right');

      expect(display.container.style.bottom).toBe('');
      expect(display.container.style.left).toBe('');
    });
  });

  describe('dispose', () => {
    test('should remove display from DOM', () => {
      const container = display.container;

      display.dispose();

      expect(document.body.contains(container)).toBe(false);
    });

    test('should remove animation styles', () => {
      display.animateScoreChange(10);
      const styleElement = document.getElementById('score-animation-styles');

      display.dispose();

      expect(document.head.contains(styleElement)).toBe(false);
    });

    test('should clear all properties', () => {
      display.updateScore(50);
      display.dispose();

      expect(display.container).toBeNull();
      expect(display.scoreValue).toBeNull();
      expect(display.scoreLabel).toBeNull();
      expect(display.animationElement).toBeNull();
      expect(display.currentScore).toBe(0);
    });

    test('should not throw error when disposing twice', () => {
      display.dispose();
      expect(() => display.dispose()).not.toThrow();
    });
  });

  describe('styling', () => {
    test('should apply cave theme colors', () => {
      expect(display.container.style.background).toContain('rgba(45, 27, 61');
      expect(display.container.style.background).toContain('rgba(26, 42, 58');
    });

    test('should apply backdrop blur', () => {
      expect(display.container.style.backdropFilter).toBe('blur(10px)');
    });

    test('should apply border radius', () => {
      expect(display.container.style.borderRadius).toBe('16px');
    });

    test('should apply box shadow', () => {
      expect(display.container.style.boxShadow).toContain('rgba(0, 0, 0, 0.5)');
    });

    test('should set fixed positioning', () => {
      expect(display.container.style.position).toBe('fixed');
    });

    test('should set high z-index', () => {
      expect(display.container.style.zIndex).toBe('1000');
    });
  });

  describe('integration', () => {
    test('should update and animate score together', (done) => {
      display.updateScore(10);
      display.animateScoreChange(10);

      expect(display.currentScore).toBe(10);
      expect(display.animationElement.children.length).toBe(1);

      setTimeout(() => {
        expect(display.animationElement.children.length).toBe(0);
        done();
      }, 1100);
    });

    test('should handle rapid score updates', () => {
      for (let i = 1; i <= 10; i++) {
        display.updateScore(i * 10);
      }

      expect(display.currentScore).toBe(100);
      expect(display.scoreValue.textContent).toBe('100');
    });

    test('should handle score update with animation', () => {
      display.updateScore(10);
      display.animateScoreChange(10);
      display.updateScore(20);
      display.animateScoreChange(10);

      expect(display.currentScore).toBe(20);
      expect(display.animationElement.children.length).toBe(2);
    });
  });

  describe('edge cases', () => {
    test('should handle score of 0', () => {
      display.updateScore(10);
      display.updateScore(0);

      expect(display.currentScore).toBe(0);
      expect(display.scoreValue.textContent).toBe('0');
    });

    test('should handle very large scores', () => {
      display.updateScore(Number.MAX_SAFE_INTEGER);

      expect(display.currentScore).toBe(Number.MAX_SAFE_INTEGER);
    });

    test('should handle animation with delta of 0', () => {
      display.animateScoreChange(0);

      const animElement = display.animationElement.children[0];
      expect(animElement.textContent).toBe('0');
    });

    test('should handle multiple resets', () => {
      display.updateScore(50);
      display.reset();
      display.updateScore(30);
      display.reset();

      expect(display.currentScore).toBe(0);
    });

    test('should handle show/hide cycles', () => {
      display.hide();
      display.show();
      display.hide();
      display.show();

      expect(display.container.style.display).toBe('block');
    });
  });

  describe('responsive design', () => {
    test('should set min-width', () => {
      expect(display.container.style.minWidth).toBe('120px');
    });

    test('should center text', () => {
      expect(display.container.style.textAlign).toBe('center');
    });
  });
});
