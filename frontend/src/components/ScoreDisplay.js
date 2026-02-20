/**
 * ScoreDisplay - 积分显示组件
 * 
 * 职责：实时显示当前积分
 * 
 * 功能：
 * - 显示当前积分
 * - 积分变化动画（+10/+20）
 * - 固定在屏幕角落
 * - 溶洞主题样式
 * 
 * 验证需求: 5.5, 9.2
 */

export class ScoreDisplay {
  constructor() {
    this.container = null;
    this.scoreValue = null;
    this.scoreLabel = null;
    this.animationElement = null;
    this.currentScore = 0;
    
    this.createDisplay();
  }

  /**
   * 创建积分显示 DOM 结构
   */
  createDisplay() {
    // 创建容器
    const container = document.createElement('div');
    container.className = 'score-display-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, rgba(45, 27, 61, 0.9), rgba(26, 42, 58, 0.9));
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 16px 24px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
      border: 2px solid rgba(212, 196, 168, 0.3);
      z-index: 1000;
      min-width: 120px;
      text-align: center;
      transition: transform 0.3s ease;
    `;

    // 创建标签
    const label = document.createElement('div');
    label.className = 'score-display-label';
    label.textContent = '当前积分';
    label.style.cssText = `
      color: rgba(212, 196, 168, 0.8);
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 1px;
    `;

    // 创建积分数字
    const scoreValue = document.createElement('div');
    scoreValue.className = 'score-display-value';
    scoreValue.textContent = '0';
    scoreValue.style.cssText = `
      color: #d4c4a8;
      font-size: 32px;
      font-weight: 700;
      line-height: 1;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    `;

    // 创建动画元素容器
    const animationContainer = document.createElement('div');
    animationContainer.className = 'score-animation-container';
    animationContainer.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    `;

    // 组装
    container.appendChild(label);
    container.appendChild(scoreValue);
    container.appendChild(animationContainer);

    // 添加到 body
    document.body.appendChild(container);

    this.container = container;
    this.scoreValue = scoreValue;
    this.scoreLabel = label;
    this.animationElement = animationContainer;
  }

  /**
   * 更新显示的积分
   * @param {number} score - 新的积分值
   */
  updateScore(score) {
    if (typeof score !== 'number' || score < 0) {
      throw new Error('Invalid score value');
    }

    const oldScore = this.currentScore;
    this.currentScore = score;

    // 更新显示
    this.scoreValue.textContent = score.toString();

    // 如果积分增加，触发脉冲动画
    if (score > oldScore) {
      this.pulseAnimation();
    }
  }

  /**
   * 显示积分变化动画
   * @param {number} delta - 积分变化量（+10 或 +20）
   */
  animateScoreChange(delta) {
    if (typeof delta !== 'number') {
      throw new Error('Invalid delta value');
    }

    // 创建动画文本
    const animText = document.createElement('div');
    animText.textContent = delta > 0 ? `+${delta}` : delta.toString();
    animText.style.cssText = `
      position: absolute;
      color: ${delta > 0 ? '#4ade80' : '#ff6b6b'};
      font-size: 24px;
      font-weight: 700;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
      animation: scoreFloat 1s ease-out forwards;
      pointer-events: none;
    `;

    // 添加 CSS 动画
    if (!document.getElementById('score-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'score-animation-styles';
      style.textContent = `
        @keyframes scoreFloat {
          0% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -60px);
          }
        }

        @keyframes scorePulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `;
      document.head.appendChild(style);
    }

    // 添加到容器
    this.animationElement.appendChild(animText);

    // 动画结束后移除
    setTimeout(() => {
      if (this.animationElement && this.animationElement.contains(animText)) {
        this.animationElement.removeChild(animText);
      }
    }, 1000);
  }

  /**
   * 脉冲动画
   */
  pulseAnimation() {
    this.scoreValue.style.animation = 'scorePulse 0.3s ease';

    setTimeout(() => {
      this.scoreValue.style.animation = '';
    }, 300);
  }

  /**
   * 显示积分显示器
   */
  show() {
    this.container.style.display = 'block';
  }

  /**
   * 隐藏积分显示器
   */
  hide() {
    this.container.style.display = 'none';
  }

  /**
   * 获取当前积分
   * @returns {number} 当前积分
   */
  getCurrentScore() {
    return this.currentScore;
  }

  /**
   * 重置积分
   */
  reset() {
    this.currentScore = 0;
    this.scoreValue.textContent = '0';
  }

  /**
   * 设置位置
   * @param {string} position - 位置 ('top-right' | 'top-left' | 'bottom-right' | 'bottom-left')
   */
  setPosition(position) {
    // 清除所有位置样式
    this.container.style.top = '';
    this.container.style.right = '';
    this.container.style.bottom = '';
    this.container.style.left = '';

    switch (position) {
      case 'top-right':
        this.container.style.top = '20px';
        this.container.style.right = '20px';
        break;
      case 'top-left':
        this.container.style.top = '20px';
        this.container.style.left = '20px';
        break;
      case 'bottom-right':
        this.container.style.bottom = '20px';
        this.container.style.right = '20px';
        break;
      case 'bottom-left':
        this.container.style.bottom = '20px';
        this.container.style.left = '20px';
        break;
      default:
        // 默认右上角
        this.container.style.top = '20px';
        this.container.style.right = '20px';
    }
  }

  /**
   * 清理资源
   */
  dispose() {
    if (this.container) {
      document.body.removeChild(this.container);
    }

    // 移除动画样式
    const styleElement = document.getElementById('score-animation-styles');
    if (styleElement) {
      document.head.removeChild(styleElement);
    }

    this.container = null;
    this.scoreValue = null;
    this.scoreLabel = null;
    this.animationElement = null;
    this.currentScore = 0;
  }
}
