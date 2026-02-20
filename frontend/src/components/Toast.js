/**
 * Toast - 消息提示组件
 * 
 * 职责：显示临时消息提示
 * 
 * 功能：
 * - 显示成功、错误、警告、信息消息
 * - 自动消失
 * - 溶洞主题样式
 * - 支持多个消息队列
 * 
 * 验证需求: 8.2, 9.1
 */

export class Toast {
  constructor() {
    this.container = null;
    this.toasts = [];
    this.maxToasts = 3;
    this.defaultDuration = 3000; // 3秒
    
    this.createContainer();
  }

  /**
   * 创建消息容器
   */
  createContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    `;

    document.body.appendChild(container);
    this.container = container;
  }

  /**
   * 显示消息
   * @param {string} message - 消息内容
   * @param {string} type - 消息类型 (success, error, warning, info)
   * @param {number} duration - 显示时长（毫秒）
   */
  show(message, type = 'info', duration = this.defaultDuration) {
    // 限制最大消息数量
    if (this.toasts.length >= this.maxToasts) {
      this.removeToast(this.toasts[0]);
    }

    const toast = this.createToast(message, type);
    this.container.appendChild(toast.element);
    this.toasts.push(toast);

    // 淡入动画
    setTimeout(() => {
      toast.element.style.opacity = '1';
      toast.element.style.transform = 'translateX(0)';
    }, 10);

    // 自动移除
    if (duration > 0) {
      toast.timeout = setTimeout(() => {
        this.removeToast(toast);
      }, duration);
    }

    return toast;
  }

  /**
   * 创建消息元素
   * @param {string} message - 消息内容
   * @param {string} type - 消息类型
   * @returns {Object} 消息对象
   */
  createToast(message, type) {
    const element = document.createElement('div');
    element.className = `toast toast-${type}`;
    
    // 根据类型设置样式
    const colors = {
      success: { bg: 'rgba(74, 222, 128, 0.9)', icon: '✓' },
      error: { bg: 'rgba(239, 68, 68, 0.9)', icon: '✕' },
      warning: { bg: 'rgba(251, 191, 36, 0.9)', icon: '⚠' },
      info: { bg: 'rgba(139, 115, 85, 0.9)', icon: 'ℹ' },
    };

    const color = colors[type] || colors.info;

    element.style.cssText = `
      background: ${color.bg};
      color: #ffffff;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 250px;
      max-width: 400px;
      opacity: 0;
      transform: translateX(100px);
      transition: all 0.3s ease;
      pointer-events: auto;
      cursor: pointer;
    `;

    // 创建图标
    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.textContent = color.icon;
    icon.style.cssText = `
      font-size: 20px;
      font-weight: bold;
    `;

    // 创建消息文本
    const text = document.createElement('span');
    text.className = 'toast-text';
    text.textContent = message;
    text.style.cssText = `
      flex: 1;
      font-size: 14px;
      line-height: 1.4;
    `;

    // 创建关闭按钮
    const closeButton = document.createElement('button');
    closeButton.className = 'toast-close';
    closeButton.textContent = '×';
    closeButton.style.cssText = `
      background: none;
      border: none;
      color: #ffffff;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: opacity 0.2s;
    `;

    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.opacity = '1';
    });

    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.opacity = '0.7';
    });

    const toast = { element, type, timeout: null };

    closeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeToast(toast);
    });

    // 点击消息也可以关闭
    element.addEventListener('click', () => {
      this.removeToast(toast);
    });

    element.appendChild(icon);
    element.appendChild(text);
    element.appendChild(closeButton);

    return toast;
  }

  /**
   * 移除消息
   * @param {Object} toast - 消息对象
   */
  removeToast(toast) {
    if (!toast || !toast.element) return;

    // 清除定时器
    if (toast.timeout) {
      clearTimeout(toast.timeout);
    }

    // 淡出动画
    toast.element.style.opacity = '0';
    toast.element.style.transform = 'translateX(100px)';

    setTimeout(() => {
      if (toast.element && toast.element.parentNode) {
        toast.element.parentNode.removeChild(toast.element);
      }

      // 从数组中移除
      const index = this.toasts.indexOf(toast);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    }, 300);
  }

  /**
   * 显示成功消息
   * @param {string} message - 消息内容
   * @param {number} duration - 显示时长
   */
  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  /**
   * 显示错误消息
   * @param {string} message - 消息内容
   * @param {number} duration - 显示时长
   */
  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  /**
   * 显示警告消息
   * @param {string} message - 消息内容
   * @param {number} duration - 显示时长
   */
  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  /**
   * 显示信息消息
   * @param {string} message - 消息内容
   * @param {number} duration - 显示时长
   */
  info(message, duration) {
    return this.show(message, 'info', duration);
  }

  /**
   * 清除所有消息
   */
  clearAll() {
    this.toasts.forEach(toast => this.removeToast(toast));
  }

  /**
   * 清理资源
   */
  dispose() {
    this.clearAll();

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    this.toasts = [];
  }
}

// 创建全局单例
const toast = new Toast();

export default toast;
