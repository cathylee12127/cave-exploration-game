/**
 * RankingPage 组件测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RankingPage } from './RankingPage.js';

describe('RankingPage', () => {
  let rankingPage;

  beforeEach(() => {
    rankingPage = new RankingPage();
  });

  afterEach(() => {
    if (rankingPage) {
      rankingPage.dispose();
    }
  });

  describe('初始化', () => {
    it('应该创建 RankingPage 实例', () => {
      expect(rankingPage).toBeDefined();
      expect(rankingPage.isVisible).toBe(false);
    });

    it('应该创建 DOM 结构', () => {
      expect(rankingPage.container).toBeDefined();
      expect(rankingPage.rankingList).toBeDefined();
      expect(rankingPage.restartButton).toBeDefined();
    });

    it('应该初始隐藏', () => {
      expect(rankingPage.container.style.display).toBe('none');
    });
  });

  describe('显示排名', () => {
    it('应该显示排名列表', () => {
      const rankings = [
        { rank: 1, userId: 'u1', username: '张三', score: 100, timestamp: new Date().toISOString() },
        { rank: 2, userId: 'u2', username: '李四', score: 80, timestamp: new Date().toISOString() },
        { rank: 3, userId: 'u3', username: '王五', score: 60, timestamp: new Date().toISOString() },
      ];

      rankingPage.show(rankings);

      expect(rankingPage.isVisible).toBe(true);
      expect(rankingPage.container.style.display).toBe('flex');
      expect(rankingPage.rankingList.children.length).toBe(3);
    });

    it('应该高亮当前用户', () => {
      const rankings = [
        { rank: 1, userId: 'u1', username: '张三', score: 100, timestamp: new Date().toISOString() },
        { rank: 2, userId: 'u2', username: '李四', score: 80, timestamp: new Date().toISOString() },
      ];

      rankingPage.show(rankings, 'u2');

      expect(rankingPage.currentUserId).toBe('u2');

      // 检查第二个排名项是否有高亮样式
      const secondItem = rankingPage.rankingList.children[1];
      expect(secondItem.style.background).toContain('rgba(139, 115, 85');
    });

    it('应该显示空状态', () => {
      rankingPage.show([]);

      expect(rankingPage.rankingList.children.length).toBe(1);
      expect(rankingPage.rankingList.children[0].textContent).toBe('暂无排名数据');
    });

    it('应该处理 null 排名列表', () => {
      rankingPage.show(null);

      expect(rankingPage.rankingList.children.length).toBe(1);
      expect(rankingPage.rankingList.children[0].textContent).toBe('暂无排名数据');
    });
  });

  describe('隐藏排名', () => {
    it('应该隐藏排名页面', () => {
      const rankings = [
        { rank: 1, userId: 'u1', username: '张三', score: 100, timestamp: new Date().toISOString() },
      ];

      rankingPage.show(rankings);
      expect(rankingPage.isVisible).toBe(true);

      rankingPage.hide();

      expect(rankingPage.isVisible).toBe(false);
      expect(rankingPage.container.style.display).toBe('none');
      expect(rankingPage.currentUserId).toBeNull();
    });
  });

  describe('排名徽章', () => {
    it('应该为前三名显示奖牌', () => {
      expect(rankingPage.getRankBadge(1)).toBe('🥇');
      expect(rankingPage.getRankBadge(2)).toBe('🥈');
      expect(rankingPage.getRankBadge(3)).toBe('🥉');
    });

    it('应该为其他排名显示数字', () => {
      expect(rankingPage.getRankBadge(4)).toBe('#4');
      expect(rankingPage.getRankBadge(10)).toBe('#10');
    });
  });

  describe('排名颜色', () => {
    it('应该为前三名使用特殊颜色', () => {
      expect(rankingPage.getRankColor(1)).toBe('#ffd700'); // 金色
      expect(rankingPage.getRankColor(2)).toBe('#c0c0c0'); // 银色
      expect(rankingPage.getRankColor(3)).toBe('#cd7f32'); // 铜色
    });

    it('应该为其他排名使用默认颜色', () => {
      expect(rankingPage.getRankColor(4)).toBe('#d4c4a8');
      expect(rankingPage.getRankColor(10)).toBe('#d4c4a8');
    });
  });

  describe('时间戳格式化', () => {
    it('应该显示"刚刚"（小于1分钟）', () => {
      const now = new Date();
      const timestamp = new Date(now.getTime() - 30000).toISOString(); // 30秒前

      const formatted = rankingPage.formatTimestamp(timestamp);

      expect(formatted).toBe('刚刚');
    });

    it('应该显示分钟数（小于1小时）', () => {
      const now = new Date();
      const timestamp = new Date(now.getTime() - 300000).toISOString(); // 5分钟前

      const formatted = rankingPage.formatTimestamp(timestamp);

      expect(formatted).toBe('5分钟前');
    });

    it('应该显示小时数（小于1天）', () => {
      const now = new Date();
      const timestamp = new Date(now.getTime() - 7200000).toISOString(); // 2小时前

      const formatted = rankingPage.formatTimestamp(timestamp);

      expect(formatted).toBe('2小时前');
    });

    it('应该显示天数（小于7天）', () => {
      const now = new Date();
      const timestamp = new Date(now.getTime() - 172800000).toISOString(); // 2天前

      const formatted = rankingPage.formatTimestamp(timestamp);

      expect(formatted).toBe('2天前');
    });

    it('应该显示日期（超过7天）', () => {
      const date = new Date(2024, 0, 15); // 2024年1月15日
      const timestamp = date.toISOString();

      const formatted = rankingPage.formatTimestamp(timestamp);

      expect(formatted).toMatch(/\d+月\d+日/);
    });

    it('应该处理无效时间戳', () => {
      const formatted = rankingPage.formatTimestamp('invalid');

      expect(formatted).toBe('');
    });
  });

  describe('重新开始', () => {
    it('应该注册重新开始回调', () => {
      const callback = vi.fn();

      rankingPage.onRestart(callback);

      expect(rankingPage.restartCallbacks.length).toBe(1);
    });

    it('应该触发重新开始回调', () => {
      const callback = vi.fn();

      rankingPage.onRestart(callback);
      rankingPage.restartButton.click();

      expect(callback).toHaveBeenCalled();
    });

    it('应该触发多个回调', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      rankingPage.onRestart(callback1);
      rankingPage.onRestart(callback2);
      rankingPage.restartButton.click();

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('应该处理回调错误', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error');
      });
      const normalCallback = vi.fn();

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      rankingPage.onRestart(errorCallback);
      rankingPage.onRestart(normalCallback);
      rankingPage.restartButton.click();

      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('排名项创建', () => {
    it('应该创建排名项', () => {
      const ranking = {
        rank: 1,
        userId: 'u1',
        username: '张三',
        score: 100,
        timestamp: new Date().toISOString(),
      };

      const item = rankingPage.createRankingItem(ranking);

      expect(item).toBeDefined();
      expect(item.textContent).toContain('张三');
      expect(item.textContent).toContain('100分');
    });

    it('应该为当前用户添加标记', () => {
      rankingPage.currentUserId = 'u1';

      const ranking = {
        rank: 1,
        userId: 'u1',
        username: '张三',
        score: 100,
        timestamp: new Date().toISOString(),
      };

      const item = rankingPage.createRankingItem(ranking);

      expect(item.textContent).toContain('你');
    });
  });

  describe('清理资源', () => {
    it('应该清理所有资源', () => {
      const rankings = [
        { rank: 1, userId: 'u1', username: '张三', score: 100, timestamp: new Date().toISOString() },
      ];

      rankingPage.show(rankings);

      const container = rankingPage.container;
      rankingPage.dispose();

      expect(rankingPage.container).toBeNull();
      expect(rankingPage.rankingList).toBeNull();
      expect(rankingPage.restartButton).toBeNull();
      expect(rankingPage.restartCallbacks.length).toBe(0);
      expect(rankingPage.isVisible).toBe(false);
      expect(rankingPage.currentUserId).toBeNull();

      // 验证 DOM 已移除
      expect(document.body.contains(container)).toBe(false);
    });
  });
});
