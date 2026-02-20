/**
 * LoginModal - 登录弹窗
 * 
 * 职责：显示姓名输入界面，处理用户注册
 * 
 * 功能：
 * - 显示姓名输入框和开始按钮
 * - 实现输入验证（非空、长度限制）
 * - 实时姓名可用性检查
 * - 显示错误提示信息
 * - 调用注册 API
 * - 注册成功后触发回调
 * - 显示二维码（扫码畅玩）
 * 
 * 验证需求: 1.1, 1.2, 1.4, 1.5, 9.1, 9.2, 7.1, 7.3
 */

import { QRCodeDisplay } from './QRCodeDisplay.js';

export class LoginModal {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.modal = null;
    this.qrCodeDisplay = null;
    this.successCallbacks = [];
    this.isVisible = false;
    this.isChecking = false;
    this.checkTimeout = null;
    
    this.createModal();
  }

  /**
   * 创建登录弹窗 DOM 结构
   */
  createModal() {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'login-modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
      opacity: 1;
    `;

    // 创建弹窗容器
    const container = document.createElement('div');
    container.className = 'login-modal-container';
    container.style.cssText = `
      background: linear-gradient(135deg, rgba(45, 27, 61, 0.95), rgba(26, 42, 58, 0.95));
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      max-width: 900px;
      width: 90%;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
      border: 2px solid rgba(212, 196, 168, 0.3);
      display: flex;
      gap: 40px;
      flex-wrap: wrap;
      justify-content: center;
    `;

    // 创建标题
    const title = document.createElement('h1');
    title.className = 'login-modal-title';
    title.textContent = '溶洞探秘';
    title.style.cssText = `
      color: #d4c4a8;
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 12px 0;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    `;

    // 创建副标题
    const subtitle = document.createElement('p');
    subtitle.className = 'login-modal-subtitle';
    subtitle.textContent = '请输入您的姓名开始探秘之旅';
    subtitle.style.cssText = `
      color: rgba(212, 196, 168, 0.8);
      font-size: 16px;
      margin: 0 0 32px 0;
    `;

    // 创建输入框容器
    const inputContainer = document.createElement('div');
    inputContainer.className = 'login-modal-input-container';
    inputContainer.style.cssText = `
      position: relative;
      margin-bottom: 16px;
    `;

    // 创建输入框
    const input = document.createElement('input');
    input.className = 'login-modal-input';
    input.type = 'text';
    input.placeholder = '请输入姓名';
    input.maxLength = 50;
    input.style.cssText = `
      width: 100%;
      padding: 16px 20px;
      font-size: 16px;
      border: 2px solid rgba(212, 196, 168, 0.3);
      border-radius: 12px;
      background: rgba(90, 74, 58, 0.3);
      color: #d4c4a8;
      outline: none;
      transition: all 0.3s ease;
      box-sizing: border-box;
    `;

    // 输入框焦点效果
    input.addEventListener('focus', () => {
      input.style.borderColor = 'rgba(212, 196, 168, 0.6)';
      input.style.background = 'rgba(90, 74, 58, 0.5)';
    });

    input.addEventListener('blur', () => {
      input.style.borderColor = 'rgba(212, 196, 168, 0.3)';
      input.style.background = 'rgba(90, 74, 58, 0.3)';
    });

    // 输入框实时验证
    input.addEventListener('input', () => {
      this.handleInputChange();
    });

    inputContainer.appendChild(input);

    // 创建错误提示
    const errorMessage = document.createElement('div');
    errorMessage.className = 'login-modal-error';
    errorMessage.style.cssText = `
      color: #ff6b6b;
      font-size: 14px;
      text-align: left;
      margin-top: 8px;
      min-height: 20px;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // 创建开始按钮
    const startButton = document.createElement('button');
    startButton.className = 'login-modal-button';
    startButton.textContent = '开始探秘';
    startButton.disabled = true;
    startButton.style.cssText = `
      width: 100%;
      padding: 16px 20px;
      font-size: 18px;
      font-weight: 600;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(139, 115, 85, 0.5), rgba(90, 74, 58, 0.5));
      color: rgba(212, 196, 168, 0.5);
      cursor: not-allowed;
      transition: all 0.3s ease;
      margin-top: 24px;
    `;

    startButton.addEventListener('click', () => {
      console.log('[LoginModal] Button clicked, disabled:', startButton.disabled);
      if (!startButton.disabled) {
        console.log('[LoginModal] Button enabled, calling handleSubmit');
        this.handleSubmit();
      } else {
        console.log('[LoginModal] Button disabled, ignoring click');
      }
    });

    // 创建左侧登录区域容器
    const loginSection = document.createElement('div');
    loginSection.className = 'login-section';
    loginSection.style.cssText = `
      flex: 1;
      min-width: 300px;
      text-align: center;
    `;

    // 组装登录区域
    loginSection.appendChild(title);
    loginSection.appendChild(subtitle);
    loginSection.appendChild(inputContainer);
    loginSection.appendChild(errorMessage);
    loginSection.appendChild(startButton);

    // 创建右侧二维码区域
    const qrSection = document.createElement('div');
    qrSection.className = 'qr-section';
    qrSection.style.cssText = `
      flex: 0 0 auto;
      display: flex;
      align-items: center;
    `;

    // 创建二维码显示器
    const qrCodeDisplay = new QRCodeDisplay();
    qrSection.appendChild(qrCodeDisplay.getContainer());

    // 组装弹窗
    container.appendChild(loginSection);
    container.appendChild(qrSection);
    overlay.appendChild(container);

    // 添加到 body
    document.body.appendChild(overlay);

    this.modal = {
      overlay,
      container,
      title,
      subtitle,
      input,
      errorMessage,
      startButton
    };

    this.qrCodeDisplay = qrCodeDisplay;
  }

  /**
   * 显示登录弹窗
   */
  show() {
    this.isVisible = true;
    this.modal.overlay.style.display = 'flex';
    this.modal.input.value = '';
    this.modal.input.focus();
    this.clearError();
    this.updateButtonState(false);
    
    // 生成二维码
    if (this.qrCodeDisplay) {
      this.qrCodeDisplay.generate();
      this.qrCodeDisplay.show();
    }
  }

  /**
   * 隐藏登录弹窗
   */
  hide() {
    this.isVisible = false;
    this.modal.overlay.style.display = 'none';
  }

  /**
   * 处理输入变化
   */
  handleInputChange() {
    const username = this.modal.input.value.trim();

    // 清除之前的检查定时器
    if (this.checkTimeout) {
      clearTimeout(this.checkTimeout);
    }

    // 清空错误信息
    this.clearError();

    // 验证输入
    const validation = this.validateUsername(username);
    
    if (!validation.valid) {
      if (username.length > 0) {
        this.showError(validation.error);
      }
      this.updateButtonState(false);
      return;
    }

    // 验证通过，启用按钮（不再检查姓名可用性）
    this.updateButtonState(true);
  }

  /**
   * 验证用户名
   * @param {string} username - 用户名
   * @returns {{valid: boolean, error?: string}} 验证结果
   */
  validateUsername(username) {
    if (!username || username.length === 0) {
      return { valid: false, error: '姓名不能为空' };
    }

    if (username.length > 50) {
      return { valid: false, error: '姓名不能超过50个字符' };
    }

    // 检查是否只包含中文、英文、数字和下划线
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(username)) {
      return { valid: false, error: '姓名只能包含中文、英文、数字和下划线' };
    }

    return { valid: true };
  }

  /**
   * 检查姓名可用性
   * @param {string} username - 用户名
   */
  async checkUsernameAvailability(username) {
    if (this.isChecking) return;

    this.isChecking = true;

    try {
      const result = await this.apiClient.checkUsername(username);

      if (!result.available) {
        this.showError('该姓名已被使用，请选择其他姓名');
        this.updateButtonState(false);
      } else {
        this.clearError();
        this.updateButtonState(true);
      }
    } catch (error) {
      console.error('Failed to check username:', error);
      // 网络错误时仍允许提交，由后端最终验证
      this.clearError();
      this.updateButtonState(true);
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * 处理提交
   */
  async handleSubmit() {
    console.log('[LoginModal] handleSubmit called');
    const username = this.modal.input.value.trim();
    console.log('[LoginModal] Username:', username);

    // 再次验证
    const validation = this.validateUsername(username);
    console.log('[LoginModal] Validation result:', validation);
    if (!validation.valid) {
      this.showError(validation.error);
      return;
    }

    // 禁用按钮和输入框
    this.updateButtonState(false);
    this.modal.input.disabled = true;
    this.modal.startButton.textContent = '注册中...';
    console.log('[LoginModal] Starting registration...');

    try {
      console.log('[LoginModal] Calling apiClient.registerUser...');
      const result = await this.apiClient.registerUser(username);
      console.log('[LoginModal] Registration result:', result);

      if (result.success) {
        // 注册成功，触发回调
        console.log('[LoginModal] Registration successful, triggering callbacks');
        this.triggerSuccessCallbacks(result.userId, username);
        this.hide();
      } else {
        // 注册失败，显示错误
        console.error('[LoginModal] Registration failed:', result.error);
        this.showError(result.error || '注册失败，请重试');
        this.modal.input.disabled = false;
        this.modal.startButton.textContent = '开始探秘';
        this.updateButtonState(true);
      }
    } catch (error) {
      console.error('[LoginModal] Registration error:', error);
      this.showError('网络连接失败，请检查网络后重试');
      this.modal.input.disabled = false;
      this.modal.startButton.textContent = '开始探秘';
      this.updateButtonState(true);
    }
  }

  /**
   * 显示错误信息
   * @param {string} message - 错误信息
   */
  showError(message) {
    this.modal.errorMessage.textContent = message;
    this.modal.errorMessage.style.opacity = '1';
  }

  /**
   * 清空错误信息
   */
  clearError() {
    this.modal.errorMessage.textContent = '';
    this.modal.errorMessage.style.opacity = '0';
  }

  /**
   * 更新按钮状态
   * @param {boolean} enabled - 是否启用
   */
  updateButtonState(enabled) {
    this.modal.startButton.disabled = !enabled;

    if (enabled) {
      this.modal.startButton.style.background = 'linear-gradient(135deg, rgba(139, 115, 85, 0.8), rgba(90, 74, 58, 0.8))';
      this.modal.startButton.style.color = '#d4c4a8';
      this.modal.startButton.style.cursor = 'pointer';
      this.modal.startButton.style.transform = 'scale(1)';

      // 添加悬停效果
      this.modal.startButton.onmouseenter = () => {
        if (!this.modal.startButton.disabled) {
          this.modal.startButton.style.background = 'linear-gradient(135deg, rgba(139, 115, 85, 1), rgba(90, 74, 58, 1))';
          this.modal.startButton.style.transform = 'scale(1.02)';
        }
      };

      this.modal.startButton.onmouseleave = () => {
        if (!this.modal.startButton.disabled) {
          this.modal.startButton.style.background = 'linear-gradient(135deg, rgba(139, 115, 85, 0.8), rgba(90, 74, 58, 0.8))';
          this.modal.startButton.style.transform = 'scale(1)';
        }
      };
    } else {
      this.modal.startButton.style.background = 'linear-gradient(135deg, rgba(139, 115, 85, 0.5), rgba(90, 74, 58, 0.5))';
      this.modal.startButton.style.color = 'rgba(212, 196, 168, 0.5)';
      this.modal.startButton.style.cursor = 'not-allowed';
      this.modal.startButton.style.transform = 'scale(1)';
      this.modal.startButton.onmouseenter = null;
      this.modal.startButton.onmouseleave = null;
    }
  }

  /**
   * 注册成功回调
   * @param {Function} callback - 回调函数，接收 userId 和 username 作为参数
   */
  onSuccess(callback) {
    if (typeof callback === 'function') {
      this.successCallbacks.push(callback);
    }
  }

  /**
   * 触发成功回调
   * @param {string} userId - 用户 ID
   * @param {string} username - 用户名
   */
  triggerSuccessCallbacks(userId, username) {
    this.successCallbacks.forEach(callback => {
      try {
        callback(userId, username);
      } catch (error) {
        console.error('Error in success callback:', error);
      }
    });
  }

  /**
   * 检查弹窗是否可见
   * @returns {boolean} 是否可见
   */
  isModalVisible() {
    return this.isVisible;
  }

  /**
   * 清理资源
   */
  dispose() {
    if (this.checkTimeout) {
      clearTimeout(this.checkTimeout);
    }

    if (this.qrCodeDisplay) {
      this.qrCodeDisplay.dispose();
    }

    if (this.modal && this.modal.overlay) {
      document.body.removeChild(this.modal.overlay);
    }

    this.modal = null;
    this.qrCodeDisplay = null;
    this.successCallbacks = [];
    this.isVisible = false;
    this.isChecking = false;
  }
}
