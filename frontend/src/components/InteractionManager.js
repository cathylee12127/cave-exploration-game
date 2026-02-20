/**
 * InteractionManager - 交互管理器
 * 
 * 职责：处理用户与交互点的交互（点击和悬停检测）
 * 
 * 功能：
 * - 监听鼠标和触摸事件
 * - 检测点击/触摸位置是否在交互点范围内
 * - 检测悬停位置并提供视觉反馈
 * - 触发相应的回调函数
 */

export class InteractionManager {
  constructor() {
    this.canvas = null;
    this.interactionPoints = [];
    this.clickCallbacks = [];
    this.hoverCallbacks = [];
    this.currentHoveredPoint = null;
    this.clickRadius = 20; // 从 30 减小到 20（点击检测半径）
    
    // 绑定事件处理器
    this.handleClick = this.handleClick.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
  }

  /**
   * 初始化交互监听
   * @param {HTMLCanvasElement} canvas - Canvas 元素
   * @param {Array} interactionPoints - 交互点数组
   */
  initialize(canvas, interactionPoints = []) {
    this.canvas = canvas;
    this.interactionPoints = interactionPoints;
    
    // 监听鼠标事件
    this.canvas.addEventListener('click', this.handleClick);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    
    // 监听触摸事件
    this.canvas.addEventListener('touchstart', this.handleTouchStart);
    this.canvas.addEventListener('touchmove', this.handleTouchMove);
  }

  /**
   * 设置交互点列表
   * @param {Array} interactionPoints - 交互点数组
   */
  setInteractionPoints(interactionPoints) {
    this.interactionPoints = interactionPoints;
  }

  /**
   * 更新交互点列表
   * @param {Array} interactionPoints - 新的交互点数组
   */
  updateInteractionPoints(interactionPoints) {
    this.interactionPoints = interactionPoints;
  }

  /**
   * 处理鼠标点击事件
   * @param {MouseEvent} event - 鼠标事件
   */
  handleClick(event) {
    const coords = this.getCanvasCoordinates(event.clientX, event.clientY);
    console.log('[InteractionManager] Click at canvas coords:', coords);
    
    const point = this.detectClick(coords.x, coords.y);
    console.log('[InteractionManager] Detected point:', point);
    
    if (point) {
      console.log('[InteractionManager] Triggering click callbacks for point:', point.id);
      this.triggerClickCallbacks(point);
    } else {
      console.log('[InteractionManager] No point detected at click location');
    }
  }

  /**
   * 处理鼠标移动事件
   * @param {MouseEvent} event - 鼠标事件
   */
  handleMouseMove(event) {
    const coords = this.getCanvasCoordinates(event.clientX, event.clientY);
    const point = this.detectHover(coords.x, coords.y);
    
    // 只在悬停状态改变时触发回调
    if (point !== this.currentHoveredPoint) {
      this.currentHoveredPoint = point;
      this.triggerHoverCallbacks(point);
    }
  }

  /**
   * 处理触摸开始事件
   * @param {TouchEvent} event - 触摸事件
   */
  handleTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const coords = this.getCanvasCoordinates(touch.clientX, touch.clientY);
    const point = this.detectClick(coords.x, coords.y);
    
    if (point) {
      this.triggerClickCallbacks(point);
    }
  }

  /**
   * 处理触摸移动事件
   * @param {TouchEvent} event - 触摸事件
   */
  handleTouchMove(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const coords = this.getCanvasCoordinates(touch.clientX, touch.clientY);
    const point = this.detectHover(coords.x, coords.y);
    
    if (point !== this.currentHoveredPoint) {
      this.currentHoveredPoint = point;
      this.triggerHoverCallbacks(point);
    }
  }

  /**
   * 将屏幕坐标转换为 Canvas 坐标
   * @param {number} clientX - 屏幕 X 坐标
   * @param {number} clientY - 屏幕 Y 坐标
   * @returns {{x: number, y: number}} Canvas 坐标
   */
  getCanvasCoordinates(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  /**
   * 检测点击位置是否在交互点范围内
   * @param {number} x - Canvas X 坐标（像素）
   * @param {number} y - Canvas Y 坐标（像素）
   * @returns {Object|null} 被点击的交互点，如果没有则返回 null
   */
  detectClick(x, y) {
    console.log('[InteractionManager] detectClick - Total points:', this.interactionPoints.length);
    console.log('[InteractionManager] detectClick - Canvas size:', this.canvas.width, 'x', this.canvas.height);
    
    // 检测 active 或 hover 状态的交互点（hover 状态是鼠标悬停时设置的）
    const clickablePoints = this.interactionPoints.filter(p => p.state === 'active' || p.state === 'hover');
    console.log('[InteractionManager] detectClick - Clickable points:', clickablePoints.length);
    
    for (const point of clickablePoints) {
      // 将相对坐标转换为像素坐标
      const pointX = point.x * this.canvas.width;
      const pointY = point.y * this.canvas.height;
      
      const distance = this.calculateDistance(x, y, pointX, pointY);
      
      console.log(`[InteractionManager] Point ${point.id}: relative(${point.x}, ${point.y}) -> pixel(${pointX}, ${pointY}), distance: ${distance}, radius: ${this.clickRadius}`);
      
      if (distance <= this.clickRadius) {
        console.log(`[InteractionManager] Found point ${point.id}!`);
        return point;
      }
    }
    
    return null;
  }

  /**
   * 检测悬停位置是否在交互点范围内
   * @param {number} x - Canvas X 坐标（像素）
   * @param {number} y - Canvas Y 坐标（像素）
   * @returns {Object|null} 被悬停的交互点，如果没有则返回 null
   */
  detectHover(x, y) {
    // 检测 active 或 hover 状态的交互点
    const hoverablePoints = this.interactionPoints.filter(p => p.state === 'active' || p.state === 'hover');
    
    for (const point of hoverablePoints) {
      // 将相对坐标转换为像素坐标
      const pointX = point.x * this.canvas.width;
      const pointY = point.y * this.canvas.height;
      
      const distance = this.calculateDistance(x, y, pointX, pointY);
      if (distance <= this.clickRadius) {
        return point;
      }
    }
    
    return null;
  }

  /**
   * 计算两点之间的距离
   * @param {number} x1 - 第一个点的 X 坐标
   * @param {number} y1 - 第一个点的 Y 坐标
   * @param {number} x2 - 第二个点的 X 坐标
   * @param {number} y2 - 第二个点的 Y 坐标
   * @returns {number} 距离
   */
  calculateDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 注册点击回调
   * @param {Function} callback - 点击回调函数，接收交互点作为参数
   */
  onPointClick(callback) {
    if (typeof callback === 'function') {
      this.clickCallbacks.push(callback);
    }
  }

  /**
   * 注册悬停回调
   * @param {Function} callback - 悬停回调函数，接收交互点或 null 作为参数
   */
  onPointHover(callback) {
    if (typeof callback === 'function') {
      this.hoverCallbacks.push(callback);
    }
  }

  /**
   * 触发所有点击回调
   * @param {Object} point - 被点击的交互点
   */
  triggerClickCallbacks(point) {
    this.clickCallbacks.forEach(callback => {
      try {
        callback(point);
      } catch (error) {
        console.error('Error in click callback:', error);
      }
    });
  }

  /**
   * 触发所有悬停回调
   * @param {Object|null} point - 被悬停的交互点，如果没有则为 null
   */
  triggerHoverCallbacks(point) {
    this.hoverCallbacks.forEach(callback => {
      try {
        callback(point);
      } catch (error) {
        console.error('Error in hover callback:', error);
      }
    });
  }

  /**
   * 清理资源
   */
  dispose() {
    if (this.canvas) {
      this.canvas.removeEventListener('click', this.handleClick);
      this.canvas.removeEventListener('mousemove', this.handleMouseMove);
      this.canvas.removeEventListener('touchstart', this.handleTouchStart);
      this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    }
    
    this.canvas = null;
    this.interactionPoints = [];
    this.clickCallbacks = [];
    this.hoverCallbacks = [];
    this.currentHoveredPoint = null;
  }
}
