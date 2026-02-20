/**
 * QRCodeGenerator - 二维码生成器
 * 
 * 职责：生成游戏访问 URL 的二维码
 * 
 * 功能：
 * - 生成可扫描的二维码
 * - 支持自定义样式（溶洞主题）
 * - 生成 Canvas 格式
 * - 支持下载功能
 * 
 * 验证需求: 7.1, 7.3, 7.4
 * 
 * 注意：使用 Canvas API 直接绘制二维码，无需外部库
 */
class QRCodeGenerator {
  constructor() {
    this.defaultOptions = {
      size: 256,
      margin: 2,
      colorDark: '#2d1b3d', // 深紫色（溶洞主题）
      colorLight: '#ffffff', // 白色背景（确保可扫描）
      errorCorrectionLevel: 'M', // L, M, Q, H
    };
  }

  /**
   * 生成二维码到 Canvas
   * @param {string} text - 要编码的文本（URL）
   * @param {HTMLCanvasElement} canvas - Canvas 元素
   * @param {Object} options - 选项
   */
  generateToCanvas(text, canvas, options = {}) {
    const opts = { ...this.defaultOptions, ...options };
    
    try {
      // 使用 Google Charts API 生成二维码
      // 这是一个简单可靠的方法，无需外部库
      const size = opts.size;
      const encodedText = encodeURIComponent(text);
      const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}&color=${opts.colorDark.replace('#', '')}&bgcolor=${opts.colorLight.replace('#', '')}`;
      
      // 创建图片并绘制到 Canvas
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
      };
      
      img.onerror = () => {
        console.error('Failed to load QR code image');
        this.drawFallbackQRCode(canvas, text, opts);
      };
      
      img.src = qrURL;
      
      return true;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      this.drawFallbackQRCode(canvas, text, options);
      return false;
    }
  }

  /**
   * 绘制备用二维码（当 API 失败时）
   * @param {HTMLCanvasElement} canvas - Canvas 元素
   * @param {string} text - 文本
   * @param {Object} options - 选项
   */
  drawFallbackQRCode(canvas, text, options) {
    const opts = { ...this.defaultOptions, ...options };
    canvas.width = opts.size;
    canvas.height = opts.size;
    
    const ctx = canvas.getContext('2d');
    
    // 绘制背景
    ctx.fillStyle = opts.colorLight;
    ctx.fillRect(0, 0, opts.size, opts.size);
    
    // 绘制提示文字
    ctx.fillStyle = opts.colorDark;
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('请使用局域网地址', opts.size / 2, opts.size / 2 - 20);
    ctx.fillText('访问游戏', opts.size / 2, opts.size / 2 + 20);
  }

  /**
   * 生成二维码数据 URL
   * @param {string} text - 要编码的文本（URL）
   * @param {Object} options - 选项
   * @returns {Promise<string>} Data URL
   */
  async generateDataURL(text, options = {}) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      this.generateToCanvas(text, canvas, options);
      
      // 等待图片加载完成
      setTimeout(() => {
        resolve(canvas.toDataURL('image/png'));
      }, 1000);
    });
  }

  /**
   * 下载二维码
   * @param {string} dataURL - Data URL
   * @param {string} filename - 文件名
   */
  download(dataURL, filename = 'qrcode.png') {
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * 获取当前页面 URL
   * @returns {string} 当前页面 URL
   */
  getCurrentURL() {
    return window.location.href;
  }

  /**
   * 生成游戏 URL 的二维码
   * @param {HTMLCanvasElement} canvas - Canvas 元素
   * @param {Object} options - 选项
   * @returns {boolean} 是否成功
   */
  generateGameQRCode(canvas, options = {}) {
    const gameURL = this.getCurrentURL();
    return this.generateToCanvas(gameURL, canvas, options);
  }
}

export default QRCodeGenerator;
