/**
 * LoadingIndicator - 加载指示器组件
 * 
 * 职责：显示加载状态
 * 
 * 功能：
 * - 显示加载动画
 * - 溶洞主题样式
 * - 可自定义加载文本
 * - 全屏或局部显示
 * 
 * 验证需求: 8.2, 9.1
 */

export class LoadingIndicator {
  constructor(options = {}) {
    this.container = null;
    this.isVisible = false;
    this.options = {
      fullscreen: true,
      text: '加载中...',
      ...options,
    };
    
    this.createIndicator();
  }

  /**
   * 创建加载指示器 DOM 结构
   */
  createIndicator() {
    // 创建容器
    const container = document.createElement('div');
    container.className = 'loading-indicator-container';
    container.style.cssText = `
      position: ${this.options.fullscreen ? 'fixed' : 'absolute'};
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      backdrop-filter: blur(5px);
    `;

    // 创建加载内容
    const content = document.createElement('div');
    content.className = 'loading-content';
    content.style.cssText = `
      text-align: center;
      color: #d4c4a8;
    `;

    // 创建加载动画（旋转的溶洞图标）
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.style.cssText = `
      width: 60px;
      height: 60px;
      margin: 0 auto 20px;
      border: 4px solid rgba(212, 196, 168, 0.2);
      border-top-color: #d4c4a8;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `;

    // 创建加载文本
    const text = document.createElement('div');
    text.className = 'loading-text';
    text.textContent = this.options.text;
    text.style.cssText = `
      font-size: 16px;
      color: #d4c4a8;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    `;

    // 添加旋转动画样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    // 组装
    content.appendChild(spinner);
    content.appendChild(text);
    container.appendChild(content);

    this.container = container;
    this.textElement = text;
  }

  /**
   * 显示加载指示器
   * @param {string} text - 加载文本（可选）
   */
  show(text = null) {
    if (text) {
      this.textElement.textContent = text;
    }

    this.isVisible = true;
    this.container.style.display = 'flex';

    // 添加到 body（如果还没有添加）
    if (!this.container.parentNode) {
      document.body.appendChild(this.container);
    }
  }

  /**
   * 隐藏加载指示器
   */
  hide() {
    this.isVisible = false;
    this.container.style.display = 'none';
  }

  /**
   * 更新加载文本
   * @param {string} text - 新的加载文本
   */
  updateText(text) {
    this.textElement.textContent = text;
  }

  /**
   * 检查是否可见
   * @returns {boolean} 是否可见
   */
  isIndicatorVisible() {
    return this.isVisible;
  }

  /**
   * 清理资源
   */
  dispose() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    this.textElement = null;
    this.isVisible = false;
  }
}

export default LoadingIndicator;
