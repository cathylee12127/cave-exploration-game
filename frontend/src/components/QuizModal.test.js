import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { QuizModal } from './QuizModal.js';

describe('QuizModal', () => {
  let modal;
  let mockQuestion;

  beforeEach(() => {
    modal = new QuizModal();

    mockQuestion = {
      id: 'q1',
      text: '钟乳石是如何形成的？',
      options: [
        { id: 'a', text: '地下水中的碳酸钙沉积' },
        { id: 'b', text: '岩浆冷却凝固' },
        { id: 'c', text: '风化作用' }
      ],
      correctAnswerId: 'a',
      difficulty: 'basic'
    };
  });

  afterEach(() => {
    modal.dispose();
  });

  describe('constructor', () => {
    test('should create modal DOM structure', () => {
      expect(modal.modal).toBeDefined();
      expect(modal.modal.overlay).toBeInstanceOf(HTMLElement);
      expect(modal.modal.container).toBeInstanceOf(HTMLElement);
      expect(modal.modal.questionText).toBeInstanceOf(HTMLElement);
      expect(modal.modal.optionsContainer).toBeInstanceOf(HTMLElement);
      expect(modal.modal.closeButton).toBeInstanceOf(HTMLElement);
    });

    test('should initialize with hidden state', () => {
      expect(modal.isVisible).toBe(false);
      expect(modal.modal.overlay.style.display).toBe('none');
    });

    test('should initialize empty callbacks array', () => {
      expect(modal.answerCallbacks).toEqual([]);
    });

    test('should append modal to document body', () => {
      expect(document.body.contains(modal.modal.overlay)).toBe(true);
    });
  });

  describe('show', () => {
    test('should display modal with question', () => {
      modal.show(mockQuestion);

      expect(modal.isVisible).toBe(true);
      expect(modal.modal.overlay.style.display).toBe('flex');
      expect(modal.modal.questionText.textContent).toBe(mockQuestion.text);
    });

    test('should create option buttons', () => {
      modal.show(mockQuestion);

      const buttons = modal.modal.optionsContainer.querySelectorAll('button');
      expect(buttons.length).toBe(3);
    });

    test('should label options with A, B, C', () => {
      modal.show(mockQuestion);

      const buttons = modal.modal.optionsContainer.querySelectorAll('button');
      expect(buttons[0].textContent).toContain('A.');
      expect(buttons[1].textContent).toContain('B.');
      expect(buttons[2].textContent).toContain('C.');
    });

    test('should set option text correctly', () => {
      modal.show(mockQuestion);

      const buttons = modal.modal.optionsContainer.querySelectorAll('button');
      expect(buttons[0].textContent).toContain('地下水中的碳酸钙沉积');
      expect(buttons[1].textContent).toContain('岩浆冷却凝固');
      expect(buttons[2].textContent).toContain('风化作用');
    });

    test('should set data-option-id attribute', () => {
      modal.show(mockQuestion);

      const buttons = modal.modal.optionsContainer.querySelectorAll('button');
      expect(buttons[0].dataset.optionId).toBe('a');
      expect(buttons[1].dataset.optionId).toBe('b');
      expect(buttons[2].dataset.optionId).toBe('c');
    });

    test('should store current question', () => {
      modal.show(mockQuestion);

      expect(modal.currentQuestion).toBe(mockQuestion);
    });

    test('should throw error for invalid question', () => {
      expect(() => modal.show(null)).toThrow('Invalid question object');
      expect(() => modal.show({})).toThrow('Invalid question object');
      expect(() => modal.show({ text: 'test' })).toThrow('Invalid question object');
    });

    test('should clear previous options when showing new question', () => {
      modal.show(mockQuestion);

      const newQuestion = {
        id: 'q2',
        text: '石笋是如何形成的？',
        options: [
          { id: 'a', text: '选项1' },
          { id: 'b', text: '选项2' }
        ],
        difficulty: 'basic'
      };

      modal.show(newQuestion);

      const buttons = modal.modal.optionsContainer.querySelectorAll('button');
      expect(buttons.length).toBe(2);
    });

    test('should trigger fade-in animation', (done) => {
      modal.show(mockQuestion);

      // 检查初始状态
      expect(modal.modal.overlay.style.display).toBe('flex');

      // 等待动画触发
      setTimeout(() => {
        expect(modal.modal.overlay.style.opacity).toBe('1');
        expect(modal.modal.container.style.transform).toBe('scale(1)');
        done();
      }, 50);
    });
  });

  describe('hide', () => {
    beforeEach(() => {
      modal.show(mockQuestion);
    });

    test('should hide modal', (done) => {
      modal.hide();

      expect(modal.isVisible).toBe(false);

      setTimeout(() => {
        expect(modal.modal.overlay.style.display).toBe('none');
        expect(modal.currentQuestion).toBeNull();
        done();
      }, 350);
    });

    test('should trigger fade-out animation', () => {
      modal.hide();

      expect(modal.modal.overlay.style.opacity).toBe('0');
      expect(modal.modal.container.style.transform).toBe('scale(0.9)');
    });

    test('should not throw error when hiding already hidden modal', () => {
      modal.hide();
      expect(() => modal.hide()).not.toThrow();
    });
  });

  describe('onAnswerSelected', () => {
    test('should register answer callback', () => {
      const callback = vi.fn();
      modal.onAnswerSelected(callback);

      expect(modal.answerCallbacks).toContain(callback);
    });

    test('should trigger callback when answer is selected', () => {
      const callback = vi.fn();
      modal.onAnswerSelected(callback);

      modal.show(mockQuestion);
      modal.handleAnswerSelected('a');

      expect(callback).toHaveBeenCalledWith('a');
    });

    test('should trigger multiple callbacks', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      modal.onAnswerSelected(callback1);
      modal.onAnswerSelected(callback2);

      modal.show(mockQuestion);
      modal.handleAnswerSelected('b');

      expect(callback1).toHaveBeenCalledWith('b');
      expect(callback2).toHaveBeenCalledWith('b');
    });

    test('should not register non-function callbacks', () => {
      modal.onAnswerSelected('not a function');
      modal.onAnswerSelected(123);
      modal.onAnswerSelected(null);

      expect(modal.answerCallbacks.length).toBe(0);
    });

    test('should handle callback errors gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error');
      });
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      modal.onAnswerSelected(errorCallback);
      modal.show(mockQuestion);
      modal.handleAnswerSelected('a');

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('option button interactions', () => {
    beforeEach(() => {
      modal.show(mockQuestion);
    });

    test('should trigger callback on button click', () => {
      const callback = vi.fn();
      modal.onAnswerSelected(callback);

      const buttons = modal.modal.optionsContainer.querySelectorAll('button');
      buttons[0].click();

      expect(callback).toHaveBeenCalledWith('a');
    });

    test('should handle click on different options', () => {
      const callback = vi.fn();
      modal.onAnswerSelected(callback);

      const buttons = modal.modal.optionsContainer.querySelectorAll('button');
      
      buttons[0].click();
      expect(callback).toHaveBeenCalledWith('a');

      buttons[1].click();
      expect(callback).toHaveBeenCalledWith('b');

      buttons[2].click();
      expect(callback).toHaveBeenCalledWith('c');
    });

    test('should apply hover styles on mouseenter', () => {
      const buttons = modal.modal.optionsContainer.querySelectorAll('button');
      const button = buttons[0];

      const mouseEnterEvent = new MouseEvent('mouseenter');
      button.dispatchEvent(mouseEnterEvent);

      expect(button.style.background).toContain('rgba(90, 74, 58, 0.8)');
    });

    test('should remove hover styles on mouseleave', () => {
      const buttons = modal.modal.optionsContainer.querySelectorAll('button');
      const button = buttons[0];

      const mouseEnterEvent = new MouseEvent('mouseenter');
      button.dispatchEvent(mouseEnterEvent);

      const mouseLeaveEvent = new MouseEvent('mouseleave');
      button.dispatchEvent(mouseLeaveEvent);

      expect(button.style.background).toContain('rgba(90, 74, 58, 0.6)');
    });
  });

  describe('close button', () => {
    beforeEach(() => {
      modal.show(mockQuestion);
    });

    test('should hide modal when close button is clicked', (done) => {
      modal.modal.closeButton.click();

      expect(modal.isVisible).toBe(false);

      setTimeout(() => {
        expect(modal.modal.overlay.style.display).toBe('none');
        done();
      }, 350);
    });

    test('should apply hover styles on mouseenter', () => {
      const closeButton = modal.modal.closeButton;

      const mouseEnterEvent = new MouseEvent('mouseenter');
      closeButton.dispatchEvent(mouseEnterEvent);

      expect(closeButton.style.color).toBe('rgba(212, 196, 168, 1)');
    });

    test('should remove hover styles on mouseleave', () => {
      const closeButton = modal.modal.closeButton;

      const mouseEnterEvent = new MouseEvent('mouseenter');
      closeButton.dispatchEvent(mouseEnterEvent);

      const mouseLeaveEvent = new MouseEvent('mouseleave');
      closeButton.dispatchEvent(mouseLeaveEvent);

      expect(closeButton.style.color).toBe('rgba(212, 196, 168, 0.8)');
    });
  });

  describe('getCurrentQuestion', () => {
    test('should return null when no question is shown', () => {
      expect(modal.getCurrentQuestion()).toBeNull();
    });

    test('should return current question when shown', () => {
      modal.show(mockQuestion);

      expect(modal.getCurrentQuestion()).toBe(mockQuestion);
    });

    test('should return null after hiding', (done) => {
      modal.show(mockQuestion);
      modal.hide();

      setTimeout(() => {
        expect(modal.getCurrentQuestion()).toBeNull();
        done();
      }, 350);
    });
  });

  describe('isModalVisible', () => {
    test('should return false initially', () => {
      expect(modal.isModalVisible()).toBe(false);
    });

    test('should return true when modal is shown', () => {
      modal.show(mockQuestion);

      expect(modal.isModalVisible()).toBe(true);
    });

    test('should return false after hiding', () => {
      modal.show(mockQuestion);
      modal.hide();

      expect(modal.isModalVisible()).toBe(false);
    });
  });

  describe('dispose', () => {
    test('should remove modal from DOM', () => {
      const overlay = modal.modal.overlay;
      
      modal.dispose();

      expect(document.body.contains(overlay)).toBe(false);
    });

    test('should clear all properties', () => {
      modal.show(mockQuestion);
      modal.onAnswerSelected(() => {});

      modal.dispose();

      expect(modal.modal).toBeNull();
      expect(modal.answerCallbacks).toEqual([]);
      expect(modal.currentQuestion).toBeNull();
      expect(modal.isVisible).toBe(false);
    });

    test('should not throw error when disposing twice', () => {
      modal.dispose();
      expect(() => modal.dispose()).not.toThrow();
    });
  });

  describe('responsive design', () => {
    test('should set max-width for container', () => {
      expect(modal.modal.container.style.maxWidth).toBe('500px');
    });

    test('should set width to 90% for mobile', () => {
      expect(modal.modal.container.style.width).toBe('90%');
    });

    test('should use flex layout for centering', () => {
      modal.show(mockQuestion);

      expect(modal.modal.overlay.style.display).toBe('flex');
      expect(modal.modal.overlay.style.justifyContent).toBe('center');
      expect(modal.modal.overlay.style.alignItems).toBe('center');
    });
  });

  describe('styling', () => {
    test('should apply cave theme colors', () => {
      expect(modal.modal.container.style.background).toContain('rgba(45, 27, 61');
      expect(modal.modal.container.style.background).toContain('rgba(26, 42, 58');
    });

    test('should apply backdrop blur', () => {
      expect(modal.modal.container.style.backdropFilter).toBe('blur(10px)');
    });

    test('should apply border radius', () => {
      expect(modal.modal.container.style.borderRadius).toBe('16px');
    });

    test('should apply box shadow', () => {
      expect(modal.modal.container.style.boxShadow).toContain('rgba(0, 0, 0, 0.5)');
    });
  });

  describe('edge cases', () => {
    test('should handle question with empty options array', () => {
      const emptyQuestion = {
        id: 'q1',
        text: 'Test question',
        options: [],
        difficulty: 'basic'
      };

      modal.show(emptyQuestion);

      const buttons = modal.modal.optionsContainer.querySelectorAll('button');
      expect(buttons.length).toBe(0);
    });

    test('should handle very long question text', () => {
      const longQuestion = {
        id: 'q1',
        text: 'A'.repeat(500),
        options: [{ id: 'a', text: 'Option A' }],
        difficulty: 'basic'
      };

      expect(() => modal.show(longQuestion)).not.toThrow();
      expect(modal.modal.questionText.textContent).toBe('A'.repeat(500));
    });

    test('should handle very long option text', () => {
      const longOptionQuestion = {
        id: 'q1',
        text: 'Test',
        options: [{ id: 'a', text: 'B'.repeat(200) }],
        difficulty: 'basic'
      };

      expect(() => modal.show(longOptionQuestion)).not.toThrow();
    });

    test('should handle rapid show/hide calls', () => {
      modal.show(mockQuestion);
      modal.hide();
      modal.show(mockQuestion);
      modal.hide();

      expect(() => modal.show(mockQuestion)).not.toThrow();
    });

    test('should handle answer selection without callbacks', () => {
      modal.show(mockQuestion);

      expect(() => modal.handleAnswerSelected('a')).not.toThrow();
    });
  });

  describe('accessibility', () => {
    test('should use button elements for options', () => {
      modal.show(mockQuestion);

      const buttons = modal.modal.optionsContainer.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });

    test('should have cursor pointer on interactive elements', () => {
      modal.show(mockQuestion);

      const buttons = modal.modal.optionsContainer.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button.style.cursor).toBe('pointer');
      });

      expect(modal.modal.closeButton.style.cursor).toBe('pointer');
    });
  });
});
