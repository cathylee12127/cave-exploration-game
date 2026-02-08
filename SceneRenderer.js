/**
 * SceneRenderer - 溶洞场景渲染器
 * 负责渲染高清写实的溶洞场景，包括钟乳石、石笋、石柱和光影效果
 * 
 * 验证需求: 2.1, 2.6, 2.7, 9.3
 */

export class SceneRenderer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.interactionPoints = [];
    this.animationFrame = null;
    
    // 色调配色方案
    this.colors = {
      // 深蓝、暗紫色调
      deepBlue: '#1a2a3a',
      darkPurple: '#2d1b3d',
      midPurple: '#3d2a4d',
      
      // 土黄、灰褐色调
      earthYellow: '#8b7355',
      grayBrown: '#5a4a3a',
      lightBrown: '#a89070',
      
      // 高光和阴影
      highlight: '#d4c4a8',
      shadow: '#0f1419',
      
      // 交互点颜色
      pointActive: 'rgba(220, 220, 200, 0.6)',
      pointHover: 'rgba(240, 240, 220, 0.9)',
      pointCompleted: 'rgba(150, 150, 140, 0.3)',
    };
  }

  /**
   * 初始化场景渲染器
   * @param {HTMLCanvasElement} canvas - Canvas 元素
   */
  initialize(canvas) {
    if (!canvas) {
      throw new Error('Canvas element is required');
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    if (!this.ctx) {
      throw new Error('Failed to get 2D context');
    }

    // 设置初始画布尺寸
    this.handleResize();

    console.log('SceneRenderer initialized');
  }

  /**
   * 处理窗口大小变化
   */
  handleResize() {
    if (!this.canvas) return;

    // 设置画布尺寸为窗口尺寸
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // 重新渲染场景
    this.render();
  }

  /**
   * 渲染溶洞场景
   */
  render() {
    if (!this.ctx || !this.canvas) return;

    const { width, height } = this.canvas;

    // 清空画布
    this.ctx.clearRect(0, 0, width, height);

    // 1. 绘制溶洞背景
    this.drawBackground();

    // 2. 绘制光影效果
    this.drawLightEffects();

    // 3. 绘制石柱
    this.drawStalagmites();

    // 4. 绘制钟乳石
    this.drawStalactites();

    // 5. 绘制交互点
    this.drawInteractionPoints();
  }

  /**
   * 绘制溶洞背景（深蓝、暗紫色调融合）
   */
  drawBackground() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    // 创建径向渐变背景（从中心向外）
    const centerX = width * 0.5;
    const centerY = height * 0.4;
    const radius = Math.max(width, height) * 0.8;

    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius
    );

    gradient.addColorStop(0, this.colors.midPurple);
    gradient.addColorStop(0.5, this.colors.darkPurple);
    gradient.addColorStop(1, this.colors.deepBlue);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 添加岩壁纹理效果（使用多个半透明矩形）
    this.drawRockTexture();
  }

  /**
   * 绘制岩壁纹理
   */
  drawRockTexture() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    ctx.save();

    // 绘制随机岩石纹理
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 30 + 10;

      ctx.fillStyle = `rgba(90, 74, 58, ${Math.random() * 0.1})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * 绘制光影效果（径向渐变模拟微光）
   */
  drawLightEffects() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    // 主光源（从左上角）
    const mainLight = ctx.createRadialGradient(
      width * 0.2, height * 0.2, 0,
      width * 0.2, height * 0.2, width * 0.6
    );
    mainLight.addColorStop(0, 'rgba(212, 196, 168, 0.15)');
    mainLight.addColorStop(0.5, 'rgba(212, 196, 168, 0.05)');
    mainLight.addColorStop(1, 'rgba(212, 196, 168, 0)');

    ctx.fillStyle = mainLight;
    ctx.fillRect(0, 0, width, height);

    // 次光源（从右下角）
    const secondaryLight = ctx.createRadialGradient(
      width * 0.8, height * 0.7, 0,
      width * 0.8, height * 0.7, width * 0.5
    );
    secondaryLight.addColorStop(0, 'rgba(168, 144, 112, 0.1)');
    secondaryLight.addColorStop(0.5, 'rgba(168, 144, 112, 0.03)');
    secondaryLight.addColorStop(1, 'rgba(168, 144, 112, 0)');

    ctx.fillStyle = secondaryLight;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * 绘制钟乳石（从顶部垂坠）
   */
  drawStalactites() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    // 绘制多个钟乳石
    const stalactites = [
      { x: width * 0.15, length: height * 0.25, width: 40 },
      { x: width * 0.35, length: height * 0.18, width: 30 },
      { x: width * 0.55, length: height * 0.22, width: 35 },
      { x: width * 0.75, length: height * 0.20, width: 28 },
      { x: width * 0.88, length: height * 0.15, width: 25 },
    ];

    stalactites.forEach(stalactite => {
      this.drawStalactite(stalactite.x, 0, stalactite.length, stalactite.width);
    });
  }

  /**
   * 绘制单个钟乳石
   * @param {number} x - X 坐标
   * @param {number} y - Y 坐标（顶部）
   * @param {number} length - 长度
   * @param {number} width - 宽度
   */
  drawStalactite(x, y, length, width) {
    const ctx = this.ctx;

    ctx.save();

    // 创建钟乳石路径（锥形）
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x - width / 2, y + length * 0.3, x - width / 3, y + length * 0.7);
    ctx.lineTo(x, y + length);
    ctx.lineTo(x + width / 3, y + length * 0.7);
    ctx.quadraticCurveTo(x + width / 2, y + length * 0.3, x, y);
    ctx.closePath();

    // 创建渐变（模拟碳酸钙结晶光泽）
    const gradient = ctx.createLinearGradient(x - width / 2, y, x + width / 2, y);
    gradient.addColorStop(0, this.colors.grayBrown);
    gradient.addColorStop(0.3, this.colors.lightBrown);
    gradient.addColorStop(0.5, this.colors.highlight);
    gradient.addColorStop(0.7, this.colors.lightBrown);
    gradient.addColorStop(1, this.colors.grayBrown);

    ctx.fillStyle = gradient;
    ctx.fill();

    // 添加阴影
    ctx.strokeStyle = this.colors.shadow;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;
    ctx.stroke();

    // 添加高光
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = this.colors.highlight;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + width / 6, y + length * 0.1);
    ctx.lineTo(x + width / 8, y + length * 0.5);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 绘制石笋（从底部向上）
   */
  drawStalagmites() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    // 绘制多个石笋
    const stalagmites = [
      { x: width * 0.25, height: height * 0.30, width: 50 },
      { x: width * 0.45, height: height * 0.25, width: 45 },
      { x: width * 0.65, height: height * 0.28, width: 48 },
      { x: width * 0.82, height: height * 0.22, width: 40 },
    ];

    stalagmites.forEach(stalagmite => {
      this.drawStalagmite(
        stalagmite.x,
        height,
        stalagmite.height,
        stalagmite.width
      );
    });

    // 绘制石柱（钟乳石和石笋连接）
    this.drawColumn(width * 0.55, height * 0.22, height * 0.28, 35);
  }

  /**
   * 绘制单个石笋
   * @param {number} x - X 坐标
   * @param {number} y - Y 坐标（底部）
   * @param {number} height - 高度
   * @param {number} width - 底部宽度
   */
  drawStalagmite(x, y, height, width) {
    const ctx = this.ctx;

    ctx.save();

    // 创建石笋路径（底部粗壮，顶部尖锐）
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x - width / 2, y - height * 0.3, x - width / 4, y - height * 0.7);
    ctx.lineTo(x, y - height);
    ctx.lineTo(x + width / 4, y - height * 0.7);
    ctx.quadraticCurveTo(x + width / 2, y - height * 0.3, x, y);
    ctx.closePath();

    // 创建渐变
    const gradient = ctx.createLinearGradient(x - width / 2, y, x + width / 2, y);
    gradient.addColorStop(0, this.colors.shadow);
    gradient.addColorStop(0.2, this.colors.grayBrown);
    gradient.addColorStop(0.5, this.colors.earthYellow);
    gradient.addColorStop(0.8, this.colors.grayBrown);
    gradient.addColorStop(1, this.colors.shadow);

    ctx.fillStyle = gradient;
    ctx.fill();

    // 添加水流侵蚀痕迹（垂直线条）
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = this.colors.shadow;
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * width * 0.3;
      ctx.beginPath();
      ctx.moveTo(x + offsetX, y - height * 0.8);
      ctx.lineTo(x + offsetX, y - height * 0.2);
      ctx.stroke();
    }

    // 添加高光
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = this.colors.highlight;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - width / 6, y - height * 0.6);
    ctx.lineTo(x - width / 8, y - height * 0.2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 绘制石柱（钟乳石和石笋自然衔接）
   * @param {number} x - X 坐标
   * @param {number} topLength - 钟乳石长度
   * @param {number} bottomHeight - 石笋高度
   * @param {number} width - 宽度
   */
  drawColumn(x, topLength, bottomHeight, width) {
    const { height } = this.canvas;
    const ctx = this.ctx;

    ctx.save();

    // 绘制上部（钟乳石部分）
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.quadraticCurveTo(x - width / 2, topLength * 0.3, x - width / 3, topLength * 0.8);
    ctx.lineTo(x - width / 4, topLength);
    ctx.lineTo(x + width / 4, topLength);
    ctx.lineTo(x + width / 3, topLength * 0.8);
    ctx.quadraticCurveTo(x + width / 2, topLength * 0.3, x, 0);
    ctx.closePath();

    const topGradient = ctx.createLinearGradient(x - width / 2, 0, x + width / 2, 0);
    topGradient.addColorStop(0, this.colors.grayBrown);
    topGradient.addColorStop(0.5, this.colors.lightBrown);
    topGradient.addColorStop(1, this.colors.grayBrown);

    ctx.fillStyle = topGradient;
    ctx.fill();

    // 绘制下部（石笋部分）
    ctx.beginPath();
    ctx.moveTo(x, height);
    ctx.quadraticCurveTo(x - width / 2, height - bottomHeight * 0.3, x - width / 3, height - bottomHeight * 0.8);
    ctx.lineTo(x - width / 4, height - bottomHeight);
    ctx.lineTo(x + width / 4, height - bottomHeight);
    ctx.lineTo(x + width / 3, height - bottomHeight * 0.8);
    ctx.quadraticCurveTo(x + width / 2, height - bottomHeight * 0.3, x, height);
    ctx.closePath();

    const bottomGradient = ctx.createLinearGradient(x - width / 2, height, x + width / 2, height);
    bottomGradient.addColorStop(0, this.colors.shadow);
    bottomGradient.addColorStop(0.5, this.colors.earthYellow);
    bottomGradient.addColorStop(1, this.colors.shadow);

    ctx.fillStyle = bottomGradient;
    ctx.fill();

    // 绘制中间连接部分（自然过渡）
    ctx.beginPath();
    ctx.moveTo(x - width / 4, topLength);
    ctx.lineTo(x - width / 4, height - bottomHeight);
    ctx.lineTo(x + width / 4, height - bottomHeight);
    ctx.lineTo(x + width / 4, topLength);
    ctx.closePath();

    const middleGradient = ctx.createLinearGradient(x - width / 4, topLength, x + width / 4, topLength);
    middleGradient.addColorStop(0, this.colors.grayBrown);
    middleGradient.addColorStop(0.5, this.colors.lightBrown);
    middleGradient.addColorStop(1, this.colors.grayBrown);

    ctx.fillStyle = middleGradient;
    ctx.fill();

    // 添加高光效果
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = this.colors.highlight;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + width / 6, topLength);
    ctx.lineTo(x + width / 6, height - bottomHeight);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 添加交互点
   * @param {Object} point - 交互点对象
   */
  addInteractionPoint(point) {
    if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
      throw new Error('Invalid interaction point');
    }

    this.interactionPoints.push(point);
    this.render();
  }

  /**
   * 更新交互点状态
   * @param {string} id - 交互点 ID
   * @param {string} state - 新状态 ('active' | 'hover' | 'completed')
   */
  updateInteractionPoint(id, state) {
    const point = this.interactionPoints.find(p => p.id === id);
    if (point) {
      point.state = state;
      this.render();
    }
  }

  /**
   * 绘制交互点
   */
  drawInteractionPoints() {
    const ctx = this.ctx;

    this.interactionPoints.forEach(point => {
      const x = point.x * this.canvas.width;
      const y = point.y * this.canvas.height;

      ctx.save();

      // 根据状态选择颜色
      let color;
      let radius = 5;  // 从 8 减小到 5
      let glowRadius = 10;  // 从 15 减小到 10

      switch (point.state) {
        case 'hover':
          color = this.colors.pointHover;
          radius = 6;  // 从 10 减小到 6
          glowRadius = 12;  // 从 20 减小到 12
          break;
        case 'completed':
          color = this.colors.pointCompleted;
          radius = 4;  // 从 6 减小到 4
          glowRadius = 6;  // 从 10 减小到 6
          break;
        case 'active':
        default:
          color = this.colors.pointActive;
          break;
      }

      // 绘制外发光
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      glowGradient.addColorStop(0, color);
      glowGradient.addColorStop(1, 'rgba(220, 220, 200, 0)');

      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // 绘制核心光点
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // 添加高光
      if (point.state !== 'completed') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(x - radius / 3, y - radius / 3, radius / 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  /**
   * 清理资源
   */
  dispose() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    this.interactionPoints = [];
    this.canvas = null;
    this.ctx = null;

    console.log('SceneRenderer disposed');
  }
}
