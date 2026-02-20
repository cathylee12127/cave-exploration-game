import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { LoginModal } from './LoginModal.js';

describe('LoginModal', () => {
  let modal;
  let mockApiClient;

  beforeEach(() => {
    mockApiClient = {
      checkUsername: vi.fn(),
      registerUser: vi.fn()
    };

    modal = new LoginModal(mockApiClient);
  });

  afterEach(() => {
    modal.dispose();
  });

  describe('constructor', () => {
    test('should create modal DOM structure', () => {
      expect(modal.modal).toBeDefined();
      expect(modal.modal.overlay).toBeInstanceOf(HTMLElement);
      expect(modal.modal.container).toBeInstanceOf(HTMLElement);
      expect(modal.modal.title).toBeInstanceOf(HTMLElement);
      expect(modal.modal.subtitle).toBeInstanceOf(HTMLElement);
      expect(modal.modal.input).toBeInstanceOf(HTMLElement);
      expect(modal.modal.errorMessage).toBeInstanceOf(HTMLElement);
      expect(modal.modal.startButton).toBeInstanceOf(HTMLElement);
    });

    test('should initialize with hidden state', () => {
      expect(modal.isVisible).toBe(false);
    });

    test('should initialize empty callbacks array', () => {
      expect(modal.successCallbacks).toEqual([]);
    });

    test('should append modal to document body', () => {
      expect(document.body.contains(modal.modal.overlay)).toBe(true);
    });

    test('should set correct title text', () => {
      expect(modal.modal.title.textContent).toBe('溶洞探秘');
    });

    test('should set correct subtitle text', () => {
      expect(modal.modal.subtitle.textContent).toBe('请输入您的姓名开始探秘之旅');
    });

    test('should disable start button initially', () => {
      expect(modal.modal.startButton.disabled).toBe(true);
    });
  });

  describe('show', () => {
    test('should display modal', () => {
      modal.show();

      expect(modal.isVisible).toBe(true);
      expect(modal.modal.overlay.style.display).toBe('flex');
    });

    test('should clear input value', () => {
      modal.modal.input.value = 'test';
      modal.show();

      expect(modal.modal.input.value).toBe('');
    });

    test('should focus input', () => {
      modal.show();

      expect(document.activeElement).toBe(modal.modal.input);
    });

    test('should clear error message', () => {
      modal.showError('Test error');
      modal.show();

      expect(modal.modal.errorMessage.style.opacity).toBe('0');
    });

    test('should disable start button', () => {
      modal.show();

      expect(modal.modal.startButton.disabled).toBe(true);
    });
  });

  describe('hide', () => {
    beforeEach(() => {
      modal.show();
    });

    test('should hide modal', () => {
      modal.hide();

      expect(modal.isVisible).toBe(false);
      expect(modal.modal.overlay.style.display).toBe('none');
    });
  });

  describe('validateUsername', () => {
    test('should reject empty username', () => {
      const result = modal.validateUsername('');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('姓名不能为空');
    });

    test('should reject whitespace-only username', () => {
      const result = modal.validateUsername('   ');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('姓名不能为空');
    });

    test('should reject username longer than 50 characters', () => {
      const result = modal.validateUsername('a'.repeat(51));

      expect(result.valid).toBe(false);
      expect(result.error).toBe('姓名不能超过50个字符');
    });

    test('should reject username with special characters', () => {
      const result = modal.validateUsername('test@123');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('姓名只能包含中文、英文、数字和下划线');
    });

    test('should accept valid Chinese username', () => {
      const result = modal.validateUsername('张三');

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should accept valid English username', () => {
      const result = modal.validateUsername('John');

      expect(result.valid).toBe(true);
    });

    test('should accept username with numbers', () => {
      const result = modal.validateUsername('user123');

      expect(result.valid).toBe(true);
    });

    test('should accept username with underscores', () => {
      const result = modal.validateUsername('user_name');

      expect(result.valid).toBe(true);
    });

    test('should accept mixed Chinese, English, and numbers', () => {
      const result = modal.validateUsername('张三John123');

      expect(result.valid).toBe(true);
    });

    test('should accept username at max length', () => {
      const result = modal.validateUsername('a'.repeat(50));

      expect(result.valid).toBe(true);
    });
  });

  describe('handleInputChange', () => {
    beforeEach(() => {
      modal.show();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('should clear error on input change', () => {
      modal.showError('Test error');
      modal.modal.input.value = 'test';
      modal.handleInputChange();

      expect(modal.modal.errorMessage.style.opacity).toBe('0');
    });

    test('should show error for invalid input', () => {
      modal.modal.input.value = 'test@123';
      modal.handleInputChange();

      expect(modal.modal.errorMessage.textContent).toContain('只能包含');
    });

    test('should not show error for empty input', () => {
      modal.modal.input.value = '';
      modal.handleInputChange();

      expect(modal.modal.errorMessage.style.opacity).toBe('0');
    });

    test('should check username availability after delay', async () => {
      mockApiClient.checkUsername.mockResolvedValue({ available: true });

      modal.modal.input.value = 'validuser';
      modal.handleInputChange();

      vi.advanceTimersByTime(500);
      await vi.runAllTimersAsync();

      expect(mockApiClient.checkUsername).toHaveBeenCalledWith('validuser');
    });

    test('should debounce username availability check', async () => {
      mockApiClient.checkUsername.mockResolvedValue({ available: true });

      modal.modal.input.value = 'v';
      modal.handleInputChange();

      vi.advanceTimersByTime(200);

      modal.modal.input.value = 'va';
      modal.handleInputChange();

      vi.advanceTimersByTime(200);

      modal.modal.input.value = 'val';
      modal.handleInputChange();

      vi.advanceTimersByTime(500);
      await vi.runAllTimersAsync();

      expect(mockApiClient.checkUsername).toHaveBeenCalledTimes(1);
      expect(mockApiClient.checkUsername).toHaveBeenCalledWith('val');
    });
  });

  describe('checkUsernameAvailability', () => {
    beforeEach(() => {
      modal.show();
    });

    test('should show error if username is taken', async () => {
      mockApiClient.checkUsername.mockResolvedValue({ available: false });

      await modal.checkUsernameAvailability('takenuser');

      expect(modal.modal.errorMessage.textContent).toContain('已被使用');
      expect(modal.modal.startButton.disabled).toBe(true);
    });

    test('should clear error if username is available', async () => {
      mockApiClient.checkUsername.mockResolvedValue({ available: true });

      await modal.checkUsernameAvailability('availableuser');

      expect(modal.modal.errorMessage.style.opacity).toBe('0');
      expect(modal.modal.startButton.disabled).toBe(false);
    });

    test('should handle network error gracefully', async () => {
      mockApiClient.checkUsername.mockRejectedValue(new Error('Network error'));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await modal.checkUsernameAvailability('testuser');

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(modal.modal.startButton.disabled).toBe(false);
      consoleErrorSpy.mockRestore();
    });

    test('should not check if already checking', async () => {
      mockApiClient.checkUsername.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      modal.checkUsernameAvailability('user1');
      modal.checkUsernameAvailability('user2');

      expect(mockApiClient.checkUsername).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleSubmit', () => {
    beforeEach(() => {
      modal.show();
    });

    test('should validate username before submitting', async () => {
      modal.modal.input.value = 'test@123';

      await modal.handleSubmit();

      expect(mockApiClient.registerUser).not.toHaveBeenCalled();
      expect(modal.modal.errorMessage.textContent).toContain('只能包含');
    });

    test('should call registerUser API with trimmed username', async () => {
      mockApiClient.registerUser.mockResolvedValue({ success: true, userId: 'u1' });

      modal.modal.input.value = '  testuser  ';

      await modal.handleSubmit();

      expect(mockApiClient.registerUser).toHaveBeenCalledWith('testuser');
    });

    test('should disable button and input during registration', async () => {
      mockApiClient.registerUser.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      modal.modal.input.value = 'testuser';
      modal.handleSubmit();

      expect(modal.modal.startButton.disabled).toBe(true);
      expect(modal.modal.input.disabled).toBe(true);
      expect(modal.modal.startButton.textContent).toBe('注册中...');
    });

    test('should trigger success callback on successful registration', async () => {
      mockApiClient.registerUser.mockResolvedValue({ success: true, userId: 'u1' });
      const callback = vi.fn();
      modal.onSuccess(callback);

      modal.modal.input.value = 'testuser';

      await modal.handleSubmit();

      expect(callback).toHaveBeenCalledWith('u1', 'testuser');
    });

    test('should hide modal on successful registration', async () => {
      mockApiClient.registerUser.mockResolvedValue({ success: true, userId: 'u1' });

      modal.modal.input.value = 'testuser';

      await modal.handleSubmit();

      expect(modal.isVisible).toBe(false);
    });

    test('should show error on registration failure', async () => {
      mockApiClient.registerUser.mockResolvedValue({ success: false, error: '姓名已存在' });

      modal.modal.input.value = 'testuser';

      await modal.handleSubmit();

      expect(modal.modal.errorMessage.textContent).toBe('姓名已存在');
      expect(modal.modal.input.disabled).toBe(false);
      expect(modal.modal.startButton.textContent).toBe('开始探秘');
    });

    test('should show error on network failure', async () => {
      mockApiClient.registerUser.mockRejectedValue(new Error('Network error'));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      modal.modal.input.value = 'testuser';

      await modal.handleSubmit();

      expect(modal.modal.errorMessage.textContent).toContain('网络连接失败');
      expect(modal.modal.input.disabled).toBe(false);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('showError', () => {
    test('should display error message', () => {
      modal.showError('Test error');

      expect(modal.modal.errorMessage.textContent).toBe('Test error');
      expect(modal.modal.errorMessage.style.opacity).toBe('1');
    });
  });

  describe('clearError', () => {
    test('should clear error message', () => {
      modal.showError('Test error');
      modal.clearError();

      expect(modal.modal.errorMessage.textContent).toBe('');
      expect(modal.modal.errorMessage.style.opacity).toBe('0');
    });
  });

  describe('updateButtonState', () => {
    test('should enable button', () => {
      modal.updateButtonState(true);

      expect(modal.modal.startButton.disabled).toBe(false);
      expect(modal.modal.startButton.style.cursor).toBe('pointer');
    });

    test('should disable button', () => {
      modal.updateButtonState(false);

      expect(modal.modal.startButton.disabled).toBe(true);
      expect(modal.modal.startButton.style.cursor).toBe('not-allowed');
    });

    test('should add hover effect when enabled', () => {
      modal.updateButtonState(true);

      expect(modal.modal.startButton.onmouseenter).toBeDefined();
      expect(modal.modal.startButton.onmouseleave).toBeDefined();
    });

    test('should remove hover effect when disabled', () => {
      modal.updateButtonState(true);
      modal.updateButtonState(false);

      expect(modal.modal.startButton.onmouseenter).toBeNull();
      expect(modal.modal.startButton.onmouseleave).toBeNull();
    });
  });

  describe('onSuccess', () => {
    test('should register success callback', () => {
      const callback = vi.fn();
      modal.onSuccess(callback);

      expect(modal.successCallbacks).toContain(callback);
    });

    test('should trigger multiple callbacks', async () => {
      mockApiClient.registerUser.mockResolvedValue({ success: true, userId: 'u1' });
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      modal.onSuccess(callback1);
      modal.onSuccess(callback2);

      modal.modal.input.value = 'testuser';
      await modal.handleSubmit();

      expect(callback1).toHaveBeenCalledWith('u1', 'testuser');
      expect(callback2).toHaveBeenCalledWith('u1', 'testuser');
    });

    test('should not register non-function callbacks', () => {
      modal.onSuccess('not a function');
      modal.onSuccess(123);

      expect(modal.successCallbacks.length).toBe(0);
    });

    test('should handle callback errors gracefully', async () => {
      mockApiClient.registerUser.mockResolvedValue({ success: true, userId: 'u1' });
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error');
      });
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      modal.onSuccess(errorCallback);
      modal.modal.input.value = 'testuser';
      await modal.handleSubmit();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('isModalVisible', () => {
    test('should return false initially', () => {
      expect(modal.isModalVisible()).toBe(false);
    });

    test('should return true when modal is shown', () => {
      modal.show();

      expect(modal.isModalVisible()).toBe(true);
    });

    test('should return false after hiding', () => {
      modal.show();
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
      modal.show();
      modal.onSuccess(() => {});

      modal.dispose();

      expect(modal.modal).toBeNull();
      expect(modal.successCallbacks).toEqual([]);
      expect(modal.isVisible).toBe(false);
      expect(modal.isChecking).toBe(false);
    });

    test('should clear check timeout', () => {
      modal.checkTimeout = setTimeout(() => {}, 1000);

      modal.dispose();

      expect(modal.checkTimeout).toBeNull();
    });

    test('should not throw error when disposing twice', () => {
      modal.dispose();
      expect(() => modal.dispose()).not.toThrow();
    });
  });

  describe('input focus effects', () => {
    beforeEach(() => {
      modal.show();
    });

    test('should apply focus styles', () => {
      const focusEvent = new FocusEvent('focus');
      modal.modal.input.dispatchEvent(focusEvent);

      expect(modal.modal.input.style.borderColor).toBe('rgba(212, 196, 168, 0.6)');
    });

    test('should remove focus styles on blur', () => {
      const focusEvent = new FocusEvent('focus');
      modal.modal.input.dispatchEvent(focusEvent);

      const blurEvent = new FocusEvent('blur');
      modal.modal.input.dispatchEvent(blurEvent);

      expect(modal.modal.input.style.borderColor).toBe('rgba(212, 196, 168, 0.3)');
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
      expect(modal.modal.container.style.borderRadius).toBe('20px');
    });

    test('should set max width', () => {
      expect(modal.modal.container.style.maxWidth).toBe('450px');
    });
  });

  describe('edge cases', () => {
    test('should handle rapid show/hide calls', () => {
      modal.show();
      modal.hide();
      modal.show();
      modal.hide();

      expect(() => modal.show()).not.toThrow();
    });

    test('should handle submit without callbacks', async () => {
      mockApiClient.registerUser.mockResolvedValue({ success: true, userId: 'u1' });

      modal.modal.input.value = 'testuser';

      expect(async () => await modal.handleSubmit()).not.toThrow();
    });

    test('should handle very long username', () => {
      const result = modal.validateUsername('a'.repeat(100));

      expect(result.valid).toBe(false);
    });

    test('should trim whitespace from username', async () => {
      mockApiClient.registerUser.mockResolvedValue({ success: true, userId: 'u1' });

      modal.modal.input.value = '  test  ';
      await modal.handleSubmit();

      expect(mockApiClient.registerUser).toHaveBeenCalledWith('test');
    });
  });

  describe('accessibility', () => {
    test('should use input element for username', () => {
      expect(modal.modal.input.tagName).toBe('INPUT');
    });

    test('should use button element for submit', () => {
      expect(modal.modal.startButton.tagName).toBe('BUTTON');
    });

    test('should have placeholder text', () => {
      expect(modal.modal.input.placeholder).toBe('请输入姓名');
    });

    test('should set max length attribute', () => {
      expect(modal.modal.input.maxLength).toBe(50);
    });
  });
});
