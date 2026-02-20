/**
 * QRCodeDisplay - 二维码显示组件
 * 
 * 职责：显示游戏访问二维码
 * 
 * 功能：
 * - 显示可扫描的二维码
 * - 溶洞主题样式
 * - 提示文字
 * - 下载功能
 * - 可在登录页面/排名页面显示
 * 
 * 验证需求: 7.1, 7.3, 7.4
 */

import QRCodeGenerator from '../utils/QRCodeGenerator.js';

export class QRCodeDisplay {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.qrGenerator = new QRCodeGenerator();
    this.isVisible = false;
    
    this.createDisplay();
  }

  /**
   * 创建二维码显示 DOM 结构
   */
  createDisplay() {
    // 创建容器
    const container = document.createElement('div');
    container.className = 'qrcode-display-container';
    container.style.cssText = `
      background: linear-gradient(135deg, rgba(45, 27, 61, 0.95), rgba(26, 42, 58, 0.95));
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      border: 2px solid rgba(212, 196, 168, 0.3);
      text-align: center;
      max-width: 320px;
    `;

    // 创建标题
    const title = document.createElement('div');
    title.className = 'qrcode-title';
    title.textContent = '📱 扫码畅玩';
    title.style.cssText = `
      color: #d4c4a8;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 12px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    `;

    // 创建副标题
    const subtitle = document.createElement('div');
    subtitle.className = 'qrcode-subtitle';
    subtitle.textContent = '使用手机扫描二维码即可开始游戏';
    subtitle.style.cssText = `
      color: rgba(212, 196, 168, 0.7);
      font-size: 14px;
      margin-bottom: 20px;
    `;

    // 创建 Canvas 容器
    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'qrcode-canvas-container';
    canvasContainer.style.cssText = `
      background: #d4c4a8;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 16px;
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
    `;

    // 创建 Canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'qrcode-canvas';
    canvas.style.cssText = `
      display: block;
      width: 100%;
      height: auto;
      border-radius: 8px;
    `;

    canvasContainer.appendChild(canvas);

    // 创建提示文字
    const hint = document.createElement('div');
    hint.className = 'qrcode-hint';
    hint.textContent = '支持微信、浏览器等扫码';
    hint.style.cssText = `
      color: rgba(212, 196, 168, 0.6);
      font-size: 12px;
      margin-bottom: 12px;
    `;

    // 创建下载按钮
    const downloadButton = document.createElement('button');
    downloadButton.className = 'qrcode-download-button';
    downloadButton.textContent = '💾 下载二维码';
    downloadButton.style.cssText = `
      width: 100%;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      background: rgba(139, 115, 85, 0.6);
      color: #d4c4a8;
      cursor: pointer;
      transition: all 0.3s ease;
    `;

    downloadButton.addEventListener('mouseenter', () => {
      downloadButton.style.background = 'rgba(139, 115, 85, 0.8)';
      downloadButton.style.transform = 'scale(1.02)';
    });

    downloadButton.addEventListener('mouseleave', () => {
      downloadButton.style.background = 'rgba(139, 115, 85, 0.6)';
      downloadButton.style.transform = 'scale(1)';
    });

    downloadButton.addEventListener('click', () => {
      this.downloadQRCode();
    });

    // 组装
    container.appendChild(title);
    container.appendChild(subtitle);
    container.appendChild(canvasContainer);
    container.appendChild(hint);
    container.appendChild(downloadButton);

    this.container = container;
    this.canvas = canvas;
  }

  /**
   * 生成二维码
   * @param {string} url - URL（可选，默认使用局域网 IP 地址）
   */
  generate(url = null) {
    let targetURL = url;
    
    // 如果没有提供 URL,使用局域网 IP 地址
    if (!targetURL) {
      const currentURL = this.qrGenerator.getCurrentURL();
      // 如果当前 URL 是 localhost,提示用户使用局域网地址
      if (currentURL.includes('localhost') || currentURL.includes('127.0.0.1')) {
        this.showLocalHostWarning();
        return;
      }
      targetURL = currentURL;
    }
    
    const options = {
      size: 256,
      margin: 2,
      colorDark: '#2d1b3d', // 深紫色（溶洞主题）
      colorLight: '#ffffff', // 白色背景（确保可扫描）
      errorCorrectionLevel: 'M',
    };

    const success = this.qrGenerator.generateToCanvas(targetURL, this.canvas, options);
    
    if (!success) {
      console.error('Failed to generate QR code');
      this.showError();
    }
  }

  /**
   * 显示 localhost 警告
   */
  showLocalHostWarning() {
    const ctx = this.canvas.getContext('2d');
    this.canvas.width = 256;
    this.canvas.height = 256;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);
    
    ctx.fillStyle = '#2d1b3d';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillText('请使用局域网地址', 128, 100);
    ctx.fillText('访问游戏', 128, 130);
    
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText('运行以下命令获取地址:', 128, 170);
    ctx.fillText('node enable-mobile-access.js', 128, 190);
  }

  /**
   * 显示错误状态
   */
  showError() {
    const ctx = this.canvas.getContext('2d');
    ctx.fillStyle = '#ff6b6b';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('二维码生成失败', this.canvas.width / 2, this.canvas.height / 2);
  }

  /**
   * 下载二维码
   */
  downloadQRCode() {
    try {
      const dataURL = this.canvas.toDataURL('image/png');
      this.qrGenerator.download(dataURL, 'cave-exploration-qrcode.png');
    } catch (error) {
      console.error('Failed to download QR code:', error);
      alert('下载失败，请重试');
    }
  }

  /**
   * 显示二维码显示器
   */
  show() {
    this.isVisible = true;
    this.container.style.display = 'block';
  }

  /**
   * 隐藏二维码显示器
   */
  hide() {
    this.isVisible = false;
    this.container.style.display = 'none';
  }

  /**
   * 获取容器元素
   * @returns {HTMLElement} 容器元素
   */
  getContainer() {
    return this.container;
  }

  /**
   * 检查是否可见
   * @returns {boolean} 是否可见
   */
  isDisplayVisible() {
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
    this.canvas = null;
    this.qrGenerator = null;
    this.isVisible = false;
  }
}
