/**
 * RankingPage - 排名页面组件
 * 
 * 职责：显示排名列表
 * 
 * 功能：
 * - 显示排名列表（按积分降序，相同积分按时间升序）
 * - 高亮当前用户排名
 * - 支持滚动查看更多排名
 * - 提供重新开始按钮
 * - 显示二维码（分享游戏）
 * - 溶洞主题样式
 * - 移动端友好设计
 * 
 * 验证需求: 6.1, 6.4, 6.5, 9.1, 9.2, 7.1, 7.3
 */

import { QRCodeDisplay } from './QRCodeDisplay.js';

export class RankingPage {
  constructor() {
    this.container = null;
    this.rankingList = null;
    this.restartButton = null;
    this.qrCodeDisplay = null;
    this.restartCallbacks = [];
    this.isVisible = false;
    this.currentUserId = null;
    
    this.createPage();
  }

  /**
   * 创建排名页面 DOM 结构
   */
  createPage() {
    // 创建容器
    const container = document.createElement('div');
    container.className = 'ranking-page-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(26, 42, 58, 0.98), rgba(45, 27, 61, 0.98));
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 3000;
      padding: 20px;
      box-sizing: border-box;
      overflow-y: auto;
    `;

    // 创建内容容器
    const content = document.createElement('div');
    content.className = 'ranking-content';
    content.style.cssText = `
      width: 100%;
      max-width: 900px;
      background: linear-gradient(135deg, rgba(45, 27, 61, 0.95), rgba(26, 42, 58, 0.95));
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px 30px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
      border: 2px solid rgba(212, 196, 168, 0.3);
      display: flex;
      gap: 30px;
      flex-wrap: wrap;
    `;

    // 创建标题
    const title = document.createElement('h1');
    title.className = 'ranking-title';
    title.textContent = '🏆 排行榜';
    title.style.cssText = `
      color: #d4c4a8;
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 24px 0;
      text-align: center;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    `;

    // 创建排名列表容器
    const listContainer = document.createElement('div');
    listContainer.className = 'ranking-list-container';
    listContainer.style.cssText = `
      max-height: 400px;
      overflow-y: auto;
      margin-bottom: 24px;
      padding-right: 8px;
    `;

    // 创建排名列表
    const rankingList = document.createElement('div');
    rankingList.className = 'ranking-list';
    rankingList.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;

    listContainer.appendChild(rankingList);

    // 创建重新开始按钮
    const restartButton = document.createElement('button');
    restartButton.className = 'ranking-restart-button';
    restartButton.textContent = '🔄 重新开始';
    restartButton.style.cssText = `
      width: 100%;
      padding: 16px 20px;
      font-size: 18px;
      font-weight: 600;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(139, 115, 85, 0.8), rgba(90, 74, 58, 0.8));
      color: #d4c4a8;
      cursor: pointer;
      transition: all 0.3s ease;
    `;

    restartButton.addEventListener('mouseenter', () => {
      restartButton.style.background = 'linear-gradient(135deg, rgba(139, 115, 85, 1), rgba(90, 74, 58, 1))';
      restartButton.style.transform = 'scale(1.02)';
    });

    restartButton.addEventListener('mouseleave', () => {
      restartButton.style.background = 'linear-gradient(135deg, rgba(139, 115, 85, 0.8), rgba(90, 74, 58, 0.8))';
      restartButton.style.transform = 'scale(1)';
    });

    restartButton.addEventListener('click', () => {
      this.triggerRestartCallbacks();
    });

    // 组装
    content.appendChild(title);
    content.appendChild(listContainer);
    content.appendChild(restartButton);
    container.appendChild(content);

    // 创建左侧排名区域
    const rankingSection = document.createElement('div');
    rankingSection.className = 'ranking-section';
    rankingSection.style.cssText = `
      flex: 1;
      min-width: 300px;
    `;

    rankingSection.appendChild(title);
    rankingSection.appendChild(listContainer);
    rankingSection.appendChild(restartButton);

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

    // 组装
    content.appendChild(rankingSection);
    content.appendChild(qrSection);
    container.appendChild(content);

    // 添加滚动条样式
    const style = document.createElement('style');
    style.textContent = `
      .ranking-list-container::-webkit-scrollbar {
        width: 8px;
      }
      
      .ranking-list-container::-webkit-scrollbar-track {
        background: rgba(90, 74, 58, 0.3);
        border-radius: 4px;
      }
      
      .ranking-list-container::-webkit-scrollbar-thumb {
        background: rgba(212, 196, 168, 0.5);
        border-radius: 4px;
      }
      
      .ranking-list-container::-webkit-scrollbar-thumb:hover {
        background: rgba(212, 196, 168, 0.7);
      }
    `;
    document.head.appendChild(style);

    // 添加到 body
    document.body.appendChild(container);

    this.container = container;
    this.rankingList = rankingList;
    this.restartButton = restartButton;
    this.qrCodeDisplay = qrCodeDisplay;
  }

  /**
   * 显示排名页面
   * @param {Array} rankings - 排名列表
   * @param {string} currentUserId - 当前用户ID（用于高亮）
   */
  show(rankings, currentUserId = null) {
    this.isVisible = true;
    this.currentUserId = currentUserId;
    this.container.style.display = 'flex';

    // 清空现有列表
    this.rankingList.innerHTML = '';

    // 渲染排名列表
    if (rankings && rankings.length > 0) {
      rankings.forEach((ranking) => {
        const item = this.createRankingItem(ranking);
        this.rankingList.appendChild(item);
      });
    } else {
      // 显示空状态
      const emptyState = document.createElement('div');
      emptyState.textContent = '暂无排名数据';
      emptyState.style.cssText = `
        color: rgba(212, 196, 168, 0.6);
        text-align: center;
        padding: 40px 20px;
        font-size: 16px;
      `;
      this.rankingList.appendChild(emptyState);
    }

    // 生成二维码
    if (this.qrCodeDisplay) {
      this.qrCodeDisplay.generate();
      this.qrCodeDisplay.show();
    }
  }

  /**
   * 隐藏排名页面
   */
  hide() {
    this.isVisible = false;
    this.container.style.display = 'none';
    this.currentUserId = null;
  }

  /**
   * 创建排名项
   * @param {Object} ranking - 排名数据
   * @returns {HTMLElement} 排名项元素
   */
  createRankingItem(ranking) {
    const isCurrentUser = this.currentUserId && ranking.userId === this.currentUserId;

    const item = document.createElement('div');
    item.className = 'ranking-item';
    item.style.cssText = `
      display: flex;
      align-items: center;
      padding: 16px 20px;
      background: ${isCurrentUser 
        ? 'linear-gradient(135deg, rgba(139, 115, 85, 0.4), rgba(90, 74, 58, 0.4))' 
        : 'rgba(90, 74, 58, 0.2)'};
      border-radius: 12px;
      border: 2px solid ${isCurrentUser 
        ? 'rgba(212, 196, 168, 0.6)' 
        : 'rgba(212, 196, 168, 0.2)'};
      transition: all 0.3s ease;
    `;

    // 排名徽章
    const rankBadge = document.createElement('div');
    rankBadge.className = 'rank-badge';
    rankBadge.textContent = this.getRankBadge(ranking.rank);
    rankBadge.style.cssText = `
      font-size: 24px;
      font-weight: 700;
      min-width: 50px;
      text-align: center;
      color: ${this.getRankColor(ranking.rank)};
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    `;

    // 用户信息容器
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.style.cssText = `
      flex: 1;
      margin: 0 16px;
      min-width: 0;
    `;

    // 用户名
    const username = document.createElement('div');
    username.className = 'username';
    username.textContent = ranking.username;
    username.style.cssText = `
      color: #d4c4a8;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;

    // 时间戳
    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    timestamp.textContent = this.formatTimestamp(ranking.timestamp);
    timestamp.style.cssText = `
      color: rgba(212, 196, 168, 0.6);
      font-size: 12px;
    `;

    userInfo.appendChild(username);
    userInfo.appendChild(timestamp);

    // 积分
    const score = document.createElement('div');
    score.className = 'score';
    score.textContent = `${ranking.score}分`;
    score.style.cssText = `
      color: #4ade80;
      font-size: 20px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    `;

    // 当前用户标记
    if (isCurrentUser) {
      const currentBadge = document.createElement('div');
      currentBadge.textContent = '你';
      currentBadge.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(212, 196, 168, 0.8);
        color: rgba(45, 27, 61, 1);
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
      `;
      item.style.position = 'relative';
      item.appendChild(currentBadge);
    }

    // 组装
    item.appendChild(rankBadge);
    item.appendChild(userInfo);
    item.appendChild(score);

    return item;
  }

  /**
   * 获取排名徽章
   * @param {number} rank - 排名
   * @returns {string} 徽章文本
   */
  getRankBadge(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }

  /**
   * 获取排名颜色
   * @param {number} rank - 排名
   * @returns {string} 颜色值
   */
  getRankColor(rank) {
    if (rank === 1) return '#ffd700'; // 金色
    if (rank === 2) return '#c0c0c0'; // 银色
    if (rank === 3) return '#cd7f32'; // 铜色
    return '#d4c4a8'; // 默认颜色
  }

  /**
   * 格式化时间戳
   * @param {string} timestamp - ISO 时间戳
   * @returns {string} 格式化后的时间
   */
  formatTimestamp(timestamp) {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;

      // 小于1分钟
      if (diff < 60000) {
        return '刚刚';
      }

      // 小于1小时
      if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes}分钟前`;
      }

      // 小于1天
      if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}小时前`;
      }

      // 小于7天
      if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days}天前`;
      }

      // 显示日期
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}月${day}日`;
    } catch (error) {
      console.error('Failed to format timestamp:', error);
      return '';
    }
  }

  /**
   * 注册重新开始回调
   * @param {Function} callback - 回调函数
   */
  onRestart(callback) {
    if (typeof callback === 'function') {
      this.restartCallbacks.push(callback);
    }
  }

  /**
   * 触发重新开始回调
   */
  triggerRestartCallbacks() {
    this.restartCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in restart callback:', error);
      }
    });
  }

  /**
   * 检查页面是否可见
   * @returns {boolean} 是否可见
   */
  isPageVisible() {
    return this.isVisible;
  }

  /**
   * 清理资源
   */
  dispose() {
    if (this.qrCodeDisplay) {
      this.qrCodeDisplay.dispose();
    }

    if (this.container) {
      document.body.removeChild(this.container);
    }

    this.container = null;
    this.rankingList = null;
    this.restartButton = null;
    this.qrCodeDisplay = null;
    this.restartCallbacks = [];
    this.isVisible = false;
    this.currentUserId = null;
  }
}
