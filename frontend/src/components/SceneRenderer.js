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
    this.animationTime = 0;
    this.isAnimating = false;
    
    // 背景图片
    this.backgroundImage = null;
    this.imageLoaded = false;
    this.useImageBackground = true; // 是否使用图片背景
    
    // 色调配色方案
    this.colors = {
      // 深蓝、暗紫色调
      deepBlue: '#0d1821',
      darkPurple: '#1a0f2e',
      midPurple: '#2d1b3d',
      lightPurple: '#4a3a5a',
      
      // 土黄、灰褐色调
      earthYellow: '#8b7355',
      darkBrown: '#3d2f24',
      grayBrown: '#5a4a3a',
      lightBrown: '#a89070',
      warmBrown: '#c4a882',
      
      // 高光和阴影
      highlight: '#f0e6d2',
      midHighlight: '#d4c4a8',
      shadow: '#0a0c10',
      deepShadow: '#050608',
      
      // 水和湿润效果
      waterBlue: '#4a7c8c',
      waterHighlight: '#8fb8c8',
      wetSheen: 'rgba(138, 184, 200, 0.3)',
      
      // 交互点颜色
      pointActive: 'rgba(255, 220, 150, 0.7)',
      pointHover: 'rgba(255, 240, 180, 0.95)',
      pointCompleted: 'rgba(150, 150, 140, 0.3)',
    };
    
    // 动态光源位置（模拟手电筒）
    this.lightSource = {
      x: 0.3,
      y: 0.4,
      intensity: 1.0,
      flickerPhase: 0
    };
    
    // 水滴动画
    this.waterDrops = [];
    this.initWaterDrops();
  }

  /**
   * 初始化水滴动画
   */
  initWaterDrops() {
    // 创建多个水滴，从钟乳石尖端滴落
    const dropPositions = [
      { x: 0.15, startY: 0.25 },
      { x: 0.35, startY: 0.18 },
      { x: 0.55, startY: 0.22 },
      { x: 0.75, startY: 0.20 },
    ];
    
    dropPositions.forEach((pos, index) => {
      this.waterDrops.push({
        x: pos.x,
        startY: pos.startY,
        y: pos.startY,
        speed: 0.0005 + Math.random() * 0.0003,
        phase: Math.random() * Math.PI * 2,
        delay: index * 1000 + Math.random() * 2000
      });
    });
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
    
    // 加载背景图片
    this.loadBackgroundImage();
    
    // 启动动画循环
    this.startAnimation();

    console.log('SceneRenderer initialized');
  }
  
  /**
   * 加载背景图片
   */
  loadBackgroundImage() {
    this.backgroundImage = new Image();
    
    // 尝试加载图片（支持 jpg 和 png）
    this.backgroundImage.onload = () => {
      this.imageLoaded = true;
      this.useImageBackground = true;
      console.log('✅ Cave background image loaded successfully!');
      console.log('Image size:', this.backgroundImage.width, 'x', this.backgroundImage.height);
      this.render();
    };
    
    this.backgroundImage.onerror = (error) => {
      console.log('❌ Failed to load cave-background.jpg, trying .png...');
      
      // 如果 jpg 失败，尝试 png
      if (this.backgroundImage.src.includes('.jpg')) {
        this.backgroundImage.src = '/cave-background.png';
      } else {
        console.log('❌ No background image found, using Canvas rendering');
        this.imageLoaded = false;
        this.useImageBackground = false;
        this.render();
      }
    };
    
    // 尝试加载 jpg 格式
    console.log('🔍 Trying to load: /cave-background.jpg');
    this.backgroundImage.src = '/cave-background.jpg';
  }
  
  /**
   * 启动动画循环
   */
  startAnimation() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    const animate = (timestamp) => {
      if (!this.isAnimating) return;
      
      this.animationTime = timestamp;
      this.updateAnimations(timestamp);
      this.render();
      
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }
  
  /**
   * 更新动画状态
   */
  updateAnimations(timestamp) {
    // 更新光源闪烁
    this.lightSource.flickerPhase = timestamp * 0.001;
    this.lightSource.intensity = 0.95 + Math.sin(this.lightSource.flickerPhase * 2) * 0.05;
    
    // 更新水滴位置
    this.waterDrops.forEach(drop => {
      if (timestamp > drop.delay) {
        drop.y += drop.speed;
        
        // 水滴落到底部后重置
        if (drop.y > 0.95) {
          drop.y = drop.startY;
          drop.delay = timestamp + 3000 + Math.random() * 2000;
        }
      }
    });
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

    // 1. 绘制背景（图片或 Canvas 绘制）
    if (this.useImageBackground && this.imageLoaded) {
      this.drawImageBackground();
    } else {
      this.drawCanvasBackground();
    }

    // 2. 绘制动态光影效果（覆盖在背景上）
    this.drawDynamicLighting();
    
    // 3. 绘制水滴动画
    this.drawWaterDrops();
    
    // 4. 绘制湿润反光效果
    this.drawWetSurfaces();

    // 5. 绘制交互点
    this.drawInteractionPoints();
  }
  
  /**
   * 绘制图片背景
   */
  drawImageBackground() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    
    if (!this.backgroundImage) {
      console.warn('⚠️ Background image object not found');
      return;
    }
    
    if (!this.backgroundImage.complete) {
      console.warn('⚠️ Background image not fully loaded yet');
      return;
    }
    
    console.log('🎨 Drawing image background...');
    
    ctx.save();
    
    // 计算图片缩放比例（保持宽高比，填满画布）
    const imgRatio = this.backgroundImage.width / this.backgroundImage.height;
    const canvasRatio = width / height;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imgRatio > canvasRatio) {
      // 图片更宽，以高度为准
      drawHeight = height;
      drawWidth = height * imgRatio;
      offsetX = (width - drawWidth) / 2;
      offsetY = 0;
    } else {
      // 图片更高，以宽度为准
      drawWidth = width;
      drawHeight = width / imgRatio;
      offsetX = 0;
      offsetY = (height - drawHeight) / 2;
    }
    
    // 绘制图片
    ctx.drawImage(this.backgroundImage, offsetX, offsetY, drawWidth, drawHeight);
    
    // 添加暗角效果（让边缘更暗）
    const vignette = ctx.createRadialGradient(
      width * 0.5, height * 0.4, 0,
      width * 0.5, height * 0.4, Math.max(width, height) * 0.8
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.6, 'rgba(0, 0, 0, 0.2)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    
    ctx.restore();
  }
  
  /**
   * 绘制 Canvas 背景（当没有图片时使用）
   */
  drawCanvasBackground() {
    // 使用原来的绘制方法
    this.drawBackground();
    this.drawDistantWalls();
  }

  /**
   * 绘制溶洞背景（深蓝、暗紫色调融合）
   */
  drawBackground() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    // 创建多层径向渐变背景（更深邃的感觉）
    const centerX = width * 0.5;
    const centerY = height * 0.3;
    const radius = Math.max(width, height) * 1.2;

    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius
    );

    gradient.addColorStop(0, this.colors.lightPurple);
    gradient.addColorStop(0.3, this.colors.midPurple);
    gradient.addColorStop(0.6, this.colors.darkPurple);
    gradient.addColorStop(1, this.colors.deepBlue);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 添加更深的暗角效果
    const vignette = ctx.createRadialGradient(
      centerX, centerY, radius * 0.3,
      centerX, centerY, radius
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // 添加增强的岩壁纹理效果
    this.drawEnhancedRockTexture();
  }

  /**
   * 绘制增强的岩壁纹理
   */
  drawEnhancedRockTexture() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    ctx.save();

    // 绘制大块岩石纹理（不规则形状）- 增加数量
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 100 + 50;
      const segments = 6 + Math.floor(Math.random() * 4);

      ctx.fillStyle = `rgba(${45 + Math.random() * 30}, ${35 + Math.random() * 20}, ${25 + Math.random() * 15}, ${0.20 + Math.random() * 0.20})`;
      
      ctx.beginPath();
      for (let j = 0; j < segments; j++) {
        const angle = (j / segments) * Math.PI * 2;
        const radius = size * (0.7 + Math.random() * 0.3);
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        
        if (j === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.fill();
    }

    // 添加细小的岩石颗粒 - 增加数量
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 20 + 5;

      ctx.fillStyle = `rgba(90, 74, 58, ${Math.random() * 0.25})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 添加裂缝效果 - 增加数量和复杂度
    for (let i = 0; i < 25; i++) {
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      const length = Math.random() * 150 + 80;
      const angle = Math.random() * Math.PI * 2;
      
      ctx.strokeStyle = `rgba(10, 12, 16, ${0.4 + Math.random() * 0.3})`;
      ctx.lineWidth = 1 + Math.random() * 3;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      
      // 绘制不规则裂缝
      let currentX = startX;
      let currentY = startY;
      const segments = 6 + Math.floor(Math.random() * 6);
      
      for (let j = 0; j < segments; j++) {
        currentX += Math.cos(angle + (Math.random() - 0.5) * 0.6) * (length / segments);
        currentY += Math.sin(angle + (Math.random() - 0.5) * 0.6) * (length / segments);
        ctx.lineTo(currentX, currentY);
      }
      ctx.stroke();
    }
    
    // 添加岩石凹凸效果（阴影和高光）
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 40 + 20;
      
      // 阴影
      const shadowGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      shadowGradient.addColorStop(0, 'rgba(10, 8, 6, 0.3)');
      shadowGradient.addColorStop(1, 'rgba(10, 8, 6, 0)');
      ctx.fillStyle = shadowGradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // 高光
      const highlightGradient = ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x - size * 0.3, y - size * 0.3, size * 0.5);
      highlightGradient.addColorStop(0, 'rgba(120, 100, 80, 0.15)');
      highlightGradient.addColorStop(1, 'rgba(120, 100, 80, 0)');
      ctx.fillStyle = highlightGradient;
      ctx.beginPath();
      ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
  
  /**
   * 绘制远景岩壁（景深效果）
   */
  drawDistantWalls() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    
    ctx.save();
    ctx.globalAlpha = 0.4;
    
    // 左侧远景岩壁
    const leftWall = ctx.createLinearGradient(0, 0, width * 0.3, 0);
    leftWall.addColorStop(0, this.colors.deepShadow);
    leftWall.addColorStop(0.5, this.colors.darkBrown);
    leftWall.addColorStop(1, 'rgba(61, 47, 36, 0)');
    
    ctx.fillStyle = leftWall;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(width * 0.15, height * 0.3, width * 0.1, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    
    // 右侧远景岩壁
    const rightWall = ctx.createLinearGradient(width, 0, width * 0.7, 0);
    rightWall.addColorStop(0, this.colors.deepShadow);
    rightWall.addColorStop(0.5, this.colors.darkBrown);
    rightWall.addColorStop(1, 'rgba(61, 47, 36, 0)');
    
    ctx.fillStyle = rightWall;
    ctx.beginPath();
    ctx.moveTo(width, 0);
    ctx.quadraticCurveTo(width * 0.85, height * 0.4, width * 0.9, height);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  /**
   * 绘制动态光影效果（模拟手电筒）
   */
  drawDynamicLighting() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    
    const lightX = width * this.lightSource.x;
    const lightY = height * this.lightSource.y;
    const intensity = this.lightSource.intensity;

    ctx.save();

    // 主光源（手电筒效果 - 更明显的光束）
    const mainLight = ctx.createRadialGradient(
      lightX, lightY, 0,
      lightX, lightY, width * 0.45
    );
    
    if (this.useImageBackground && this.imageLoaded) {
      // 图片背景：使用更强的光效
      mainLight.addColorStop(0, `rgba(255, 245, 220, ${0.35 * intensity})`);
      mainLight.addColorStop(0.2, `rgba(240, 230, 210, ${0.20 * intensity})`);
      mainLight.addColorStop(0.5, `rgba(200, 180, 150, ${0.10 * intensity})`);
      mainLight.addColorStop(1, 'rgba(200, 180, 150, 0)');
    } else {
      // Canvas 背景：使用原来的光效
      mainLight.addColorStop(0, `rgba(240, 230, 210, ${0.25 * intensity})`);
      mainLight.addColorStop(0.2, `rgba(212, 196, 168, ${0.15 * intensity})`);
      mainLight.addColorStop(0.5, `rgba(168, 144, 112, ${0.08 * intensity})`);
      mainLight.addColorStop(1, 'rgba(168, 144, 112, 0)');
    }

    ctx.fillStyle = mainLight;
    ctx.fillRect(0, 0, width, height);

    // 次光源（环境反射光）
    const secondaryLight = ctx.createRadialGradient(
      width * 0.75, height * 0.65, 0,
      width * 0.75, height * 0.65, width * 0.35
    );
    
    if (this.useImageBackground && this.imageLoaded) {
      secondaryLight.addColorStop(0, `rgba(180, 170, 150, ${0.15 * intensity})`);
      secondaryLight.addColorStop(0.5, `rgba(160, 150, 130, ${0.08 * intensity})`);
      secondaryLight.addColorStop(1, 'rgba(160, 150, 130, 0)');
    } else {
      secondaryLight.addColorStop(0, `rgba(138, 124, 102, ${0.12 * intensity})`);
      secondaryLight.addColorStop(0.5, `rgba(138, 124, 102, ${0.05 * intensity})`);
      secondaryLight.addColorStop(1, 'rgba(138, 124, 102, 0)');
    }

    ctx.fillStyle = secondaryLight;
    ctx.fillRect(0, 0, width, height);
    
    // 添加光束效果（从光源向外扩散）
    const beamAlpha = this.useImageBackground && this.imageLoaded ? 0.08 : 0.05;
    ctx.globalAlpha = beamAlpha * intensity;
    ctx.fillStyle = this.colors.highlight;
    
    // 绘制几条光束
    for (let i = 0; i < 3; i++) {
      const angle = (i - 1) * 0.3;
      const beamLength = width * 0.6;
      const beamWidth = width * 0.15;
      
      ctx.beginPath();
      ctx.moveTo(lightX, lightY);
      ctx.lineTo(
        lightX + Math.cos(angle) * beamLength - beamWidth / 2,
        lightY + Math.sin(angle) * beamLength
      );
      ctx.lineTo(
        lightX + Math.cos(angle) * beamLength + beamWidth / 2,
        lightY + Math.sin(angle) * beamLength
      );
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
  }

  /**
   * 绘制水滴动画
   */
  drawWaterDrops() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    
    ctx.save();
    
    this.waterDrops.forEach(drop => {
      if (drop.y > drop.startY) {
        const x = drop.x * width;
        const y = drop.y * height;
        
        // 绘制水滴（椭圆形）
        ctx.fillStyle = this.colors.waterHighlight;
        ctx.globalAlpha = 0.6;
        
        ctx.beginPath();
        ctx.ellipse(x, y, 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制水滴高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(x - 0.5, y - 1, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    ctx.restore();
  }
  
  /**
   * 绘制湿润表面反光效果
   */
  drawWetSurfaces() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    
    ctx.save();
    
    // 在钟乳石和石笋表面添加湿润反光
    const wetAreas = [
      // 钟乳石湿润区域
      { x: 0.15, y: 0.12, width: 0.03, height: 0.15 },
      { x: 0.35, y: 0.08, width: 0.025, height: 0.12 },
      { x: 0.55, y: 0.10, width: 0.028, height: 0.14 },
      { x: 0.75, y: 0.09, width: 0.022, height: 0.13 },
      
      // 石笋湿润区域
      { x: 0.25, y: 0.75, width: 0.035, height: 0.20 },
      { x: 0.45, y: 0.78, width: 0.032, height: 0.18 },
      { x: 0.65, y: 0.76, width: 0.033, height: 0.19 },
    ];
    
    wetAreas.forEach(area => {
      const x = area.x * width;
      const y = area.y * height;
      const w = area.width * width;
      const h = area.height * height;
      
      // 创建垂直渐变（水流痕迹）
      const wetGradient = ctx.createLinearGradient(x, y, x, y + h);
      wetGradient.addColorStop(0, 'rgba(138, 184, 200, 0)');
      wetGradient.addColorStop(0.3, this.colors.wetSheen);
      wetGradient.addColorStop(0.7, this.colors.wetSheen);
      wetGradient.addColorStop(1, 'rgba(138, 184, 200, 0)');
      
      ctx.fillStyle = wetGradient;
      ctx.fillRect(x - w / 2, y, w, h);
      
      // 添加高光条纹
      ctx.strokeStyle = 'rgba(200, 220, 230, 0.3)';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      
      ctx.beginPath();
      ctx.moveTo(x + w * 0.2, y);
      ctx.lineTo(x + w * 0.15, y + h);
      ctx.stroke();
    });
    
    ctx.restore();
  }

  /**
   * 绘制钟乳石（从顶部垂坠）
   */
  drawStalactites() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    // 绘制更多钟乳石，增加密度
    const stalactites = [
      { x: width * 0.10, length: height * 0.28, width: 45 },
      { x: width * 0.15, length: height * 0.25, width: 40 },
      { x: width * 0.22, length: height * 0.20, width: 32 },
      { x: width * 0.35, length: height * 0.18, width: 30 },
      { x: width * 0.42, length: height * 0.24, width: 38 },
      { x: width * 0.55, length: height * 0.22, width: 35 },
      { x: width * 0.65, length: height * 0.19, width: 33 },
      { x: width * 0.75, length: height * 0.20, width: 28 },
      { x: width * 0.82, length: height * 0.17, width: 30 },
      { x: width * 0.88, length: height * 0.15, width: 25 },
      { x: width * 0.93, length: height * 0.12, width: 22 },
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

    // 创建钟乳石路径（锥形，更自然的曲线）
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x - width / 2, y + length * 0.2, x - width / 3, y + length * 0.6);
    ctx.quadraticCurveTo(x - width / 4, y + length * 0.85, x, y + length);
    ctx.quadraticCurveTo(x + width / 4, y + length * 0.85, x + width / 3, y + length * 0.6);
    ctx.quadraticCurveTo(x + width / 2, y + length * 0.2, x, y);
    ctx.closePath();

    // 创建更复杂的渐变（模拟碳酸钙结晶光泽和立体感）
    const gradient = ctx.createLinearGradient(x - width / 2, y, x + width / 2, y);
    gradient.addColorStop(0, this.colors.shadow);
    gradient.addColorStop(0.15, this.colors.darkBrown);
    gradient.addColorStop(0.3, this.colors.grayBrown);
    gradient.addColorStop(0.5, this.colors.warmBrown);
    gradient.addColorStop(0.7, this.colors.grayBrown);
    gradient.addColorStop(0.85, this.colors.darkBrown);
    gradient.addColorStop(1, this.colors.shadow);

    ctx.fillStyle = gradient;
    ctx.fill();

    // 添加深色阴影边缘
    ctx.strokeStyle = this.colors.deepShadow;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    
    // 添加纹理线条（碳酸钙沉积层）
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = this.colors.darkBrown;
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 5; i++) {
      const layerY = y + length * (0.2 + i * 0.15);
      const layerWidth = width * (1 - i * 0.15);
      
      ctx.beginPath();
      ctx.moveTo(x - layerWidth / 3, layerY);
      ctx.quadraticCurveTo(x, layerY + 3, x + layerWidth / 3, layerY);
      ctx.stroke();
    }

    // 添加明亮高光（光照面）
    ctx.globalAlpha = 0.7;
    const highlightGradient = ctx.createLinearGradient(
      x + width / 4, y,
      x + width / 4, y + length * 0.7
    );
    highlightGradient.addColorStop(0, 'rgba(240, 230, 210, 0.6)');
    highlightGradient.addColorStop(0.5, 'rgba(212, 196, 168, 0.3)');
    highlightGradient.addColorStop(1, 'rgba(212, 196, 168, 0)');
    
    ctx.strokeStyle = highlightGradient;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + width / 5, y + length * 0.05);
    ctx.lineTo(x + width / 6, y + length * 0.6);
    ctx.stroke();
    
    // 添加尖端水滴聚集效果
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = this.colors.waterBlue;
    ctx.beginPath();
    ctx.ellipse(x, y + length - 2, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * 绘制石笋（从底部向上）
   */
  drawStalagmites() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    // 绘制更多石笋，增加密度和变化
    const stalagmites = [
      { x: width * 0.08, height: height * 0.25, width: 42 },
      { x: width * 0.18, height: height * 0.32, width: 52 },
      { x: width * 0.25, height: height * 0.30, width: 50 },
      { x: width * 0.35, height: height * 0.27, width: 46 },
      { x: width * 0.45, height: height * 0.25, width: 45 },
      { x: width * 0.58, height: height * 0.29, width: 49 },
      { x: width * 0.65, height: height * 0.28, width: 48 },
      { x: width * 0.75, height: height * 0.24, width: 43 },
      { x: width * 0.82, height: height * 0.22, width: 40 },
      { x: width * 0.90, height: height * 0.20, width: 38 },
    ];

    stalagmites.forEach(stalagmite => {
      this.drawStalagmite(
        stalagmite.x,
        height,
        stalagmite.height,
        stalagmite.width
      );
    });

    // 绘制石柱（钟乳石和石笋连接）- 增加数量
    this.drawColumn(width * 0.42, height * 0.24, height * 0.27, 38);
    this.drawColumn(width * 0.58, height * 0.22, height * 0.29, 35);
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

    // 创建石笋路径（底部粗壮，顶部尖锐，更自然的曲线）
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x - width / 2, y - height * 0.25, x - width / 3, y - height * 0.55);
    ctx.quadraticCurveTo(x - width / 4, y - height * 0.8, x, y - height);
    ctx.quadraticCurveTo(x + width / 4, y - height * 0.8, x + width / 3, y - height * 0.55);
    ctx.quadraticCurveTo(x + width / 2, y - height * 0.25, x, y);
    ctx.closePath();

    // 创建更丰富的渐变
    const gradient = ctx.createLinearGradient(x - width / 2, y, x + width / 2, y);
    gradient.addColorStop(0, this.colors.deepShadow);
    gradient.addColorStop(0.15, this.colors.shadow);
    gradient.addColorStop(0.3, this.colors.darkBrown);
    gradient.addColorStop(0.5, this.colors.earthYellow);
    gradient.addColorStop(0.7, this.colors.grayBrown);
    gradient.addColorStop(0.85, this.colors.shadow);
    gradient.addColorStop(1, this.colors.deepShadow);

    ctx.fillStyle = gradient;
    ctx.fill();
    
    // 添加边缘阴影
    ctx.strokeStyle = this.colors.deepShadow;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    ctx.stroke();

    // 添加水流侵蚀痕迹（更明显的垂直线条）
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = this.colors.shadow;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const offsetX = (Math.random() - 0.5) * width * 0.4;
      const startHeight = 0.2 + Math.random() * 0.3;
      const endHeight = 0.7 + Math.random() * 0.2;
      
      ctx.beginPath();
      ctx.moveTo(x + offsetX, y - height * startHeight);
      ctx.lineTo(x + offsetX, y - height * endHeight);
      ctx.stroke();
    }
    
    // 添加横向纹理（沉积层）
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = this.colors.darkBrown;
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 6; i++) {
      const layerY = y - height * (0.15 + i * 0.12);
      const layerWidth = width * (0.9 - i * 0.12);
      
      ctx.beginPath();
      ctx.moveTo(x - layerWidth / 3, layerY);
      ctx.quadraticCurveTo(x, layerY - 2, x + layerWidth / 3, layerY);
      ctx.stroke();
    }

    // 添加明亮高光（受光面）
    ctx.globalAlpha = 0.6;
    const highlightGradient = ctx.createLinearGradient(
      x - width / 4, y - height * 0.8,
      x - width / 4, y - height * 0.1
    );
    highlightGradient.addColorStop(0, 'rgba(240, 230, 210, 0)');
    highlightGradient.addColorStop(0.3, 'rgba(212, 196, 168, 0.5)');
    highlightGradient.addColorStop(0.7, 'rgba(196, 176, 148, 0.3)');
    highlightGradient.addColorStop(1, 'rgba(196, 176, 148, 0)');
    
    ctx.strokeStyle = highlightGradient;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - width / 5, y - height * 0.7);
    ctx.lineTo(x - width / 6, y - height * 0.15);
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
      let radius = 6;
      let glowRadius = 12;
      let pulseEffect = 1;

      switch (point.state) {
        case 'hover':
          color = this.colors.pointHover;
          radius = 8;
          glowRadius = 16;
          pulseEffect = 1.2;
          break;
        case 'completed':
          color = this.colors.pointCompleted;
          radius = 4;
          glowRadius = 6;
          pulseEffect = 0.8;
          break;
        case 'active':
        default:
          color = this.colors.pointActive;
          // 添加脉冲效果
          pulseEffect = 1 + Math.sin(this.animationTime * 0.003) * 0.15;
          break;
      }

      // 应用脉冲效果
      radius *= pulseEffect;
      glowRadius *= pulseEffect;

      // 绘制外发光（多层）
      for (let i = 0; i < 3; i++) {
        const layerRadius = glowRadius * (1 + i * 0.3);
        const layerAlpha = 0.3 / (i + 1);
        
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, layerRadius);
        glowGradient.addColorStop(0, color);
        glowGradient.addColorStop(1, `rgba(255, 220, 150, 0)`);

        ctx.globalAlpha = layerAlpha;
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, layerRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 绘制核心光点
      ctx.globalAlpha = 1;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // 添加高光
      if (point.state !== 'completed') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(x - radius / 3, y - radius / 3, radius / 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // 添加光晕环（仅活跃状态）
      if (point.state === 'active') {
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  /**
   * 清理资源
   */
  dispose() {
    this.isAnimating = false;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    this.interactionPoints = [];
    this.waterDrops = [];
    this.canvas = null;
    this.ctx = null;

    console.log('SceneRenderer disposed');
  }
}
