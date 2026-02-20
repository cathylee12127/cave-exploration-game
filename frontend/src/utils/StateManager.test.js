/**
 * StateManager 单元测试
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import StateManager from './StateManager.js';

describe('StateManager', () => {
  let stateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  describe('初始化', () => {
    test('应该初始化为登录阶段', () => {
      expect(stateManager.game.phase).toBe('login');
    });

    test('应该初始化用户为 null', () => {
      expect(stateManager.user).toBeNull();
    });

    test('应该初始化空的题目列表', () => {
      expect(stateManager.game.questions).toEqual([]);
    });

    test('应该初始化空的交互点列表', () => {
      expect(stateManager.game.interactionPoints).toEqual([]);
    });

    test('应该初始化当前题目为 null', () => {
      expect(stateManager.game.currentQuestion).toBeNull();
    });
  });

  describe('setUsername', () => {
    test('应该设置用户姓名和ID', () => {
      stateManager.setUsername('张三', 'user-123');

      expect(stateManager.user).not.toBeNull();
      expect(stateManager.user.username).toBe('张三');
      expect(stateManager.user.id).toBe('user-123');
      expect(stateManager.user.score).toBe(0);
      expect(stateManager.user.completedQuestions).toBeInstanceOf(Set);
      expect(stateManager.user.completedQuestions.size).toBe(0);
    });

    test('应该去除姓名前后的空格', () => {
      stateManager.setUsername('  张三  ', 'user-123');
      expect(stateManager.user.username).toBe('张三');
    });

    test('应该在设置用户后触发 userChanged 事件', () => {
      const callback = vi.fn();
      stateManager.on('userChanged', callback);

      stateManager.setUsername('张三', 'user-123');

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(stateManager.user);
    });

    test('应该拒绝空姓名', () => {
      expect(() => stateManager.setUsername('', 'user-123')).toThrow(
        '用户姓名不能为空'
      );
    });

    test('应该拒绝非字符串姓名', () => {
      expect(() => stateManager.setUsername(123, 'user-123')).toThrow(
        '用户姓名不能为空'
      );
    });

    test('应该拒绝空用户ID', () => {
      expect(() => stateManager.setUsername('张三', '')).toThrow(
        '用户ID不能为空'
      );
    });
  });

  describe('updateScore', () => {
    beforeEach(() => {
      stateManager.setUsername('张三', 'user-123');
    });

    test('应该增加积分', () => {
      stateManager.updateScore(10);
      expect(stateManager.user.score).toBe(10);

      stateManager.updateScore(20);
      expect(stateManager.user.score).toBe(30);
    });

    test('应该支持负数积分变化', () => {
      stateManager.user.score = 50;
      stateManager.updateScore(-10);
      expect(stateManager.user.score).toBe(40);
    });

    test('应该确保积分不为负数', () => {
      stateManager.user.score = 10;
      stateManager.updateScore(-20);
      expect(stateManager.user.score).toBe(0);
    });

    test('应该在积分变化后触发 scoreChanged 事件', () => {
      const callback = vi.fn();
      stateManager.on('scoreChanged', callback);

      stateManager.updateScore(10);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({
        oldScore: 0,
        newScore: 10,
        delta: 10,
      });
    });

    test('应该在用户未登录时抛出错误', () => {
      stateManager.user = null;
      expect(() => stateManager.updateScore(10)).toThrow('用户未登录');
    });

    test('应该拒绝非数字的积分变化', () => {
      expect(() => stateManager.updateScore('10')).toThrow(
        '积分变化量必须是数字'
      );
    });

    test('应该拒绝 NaN', () => {
      expect(() => stateManager.updateScore(NaN)).toThrow(
        '积分变化量必须是数字'
      );
    });
  });

  describe('markQuestionCompleted', () => {
    beforeEach(() => {
      stateManager.setUsername('张三', 'user-123');
      stateManager.setQuestions([
        { id: 'q1', text: '题目1' },
        { id: 'q2', text: '题目2' },
      ]);
      stateManager.setInteractionPoints([
        { id: 'p1', questionId: 'q1', state: 'active' },
        { id: 'p2', questionId: 'q2', state: 'active' },
      ]);
    });

    test('应该标记题目为已完成', () => {
      stateManager.markQuestionCompleted('q1');

      expect(stateManager.user.completedQuestions.has('q1')).toBe(true);
      expect(stateManager.user.completedQuestions.size).toBe(1);
    });

    test('应该更新对应交互点的状态为 completed', () => {
      stateManager.markQuestionCompleted('q1');

      const point = stateManager.game.interactionPoints.find(
        (p) => p.id === 'p1'
      );
      expect(point.state).toBe('completed');
    });

    test('应该在标记完成后触发 questionCompleted 事件', () => {
      const callback = vi.fn();
      stateManager.on('questionCompleted', callback);

      stateManager.markQuestionCompleted('q1');

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('q1');
    });

    test('应该在所有题目完成后触发 allQuestionsCompleted 事件', () => {
      const callback = vi.fn();
      stateManager.on('allQuestionsCompleted', callback);

      stateManager.markQuestionCompleted('q1');
      expect(callback).not.toHaveBeenCalled();

      stateManager.markQuestionCompleted('q2');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('应该在用户未登录时抛出错误', () => {
      stateManager.user = null;
      expect(() => stateManager.markQuestionCompleted('q1')).toThrow(
        '用户未登录'
      );
    });

    test('应该拒绝空题目ID', () => {
      expect(() => stateManager.markQuestionCompleted('')).toThrow(
        '题目ID不能为空'
      );
    });
  });

  describe('setGamePhase', () => {
    test('应该设置游戏阶段为 playing', () => {
      stateManager.setGamePhase('playing');
      expect(stateManager.game.phase).toBe('playing');
    });

    test('应该设置游戏阶段为 finished', () => {
      stateManager.setGamePhase('finished');
      expect(stateManager.game.phase).toBe('finished');
    });

    test('应该在阶段变化后触发 phaseChanged 事件', () => {
      const callback = vi.fn();
      stateManager.on('phaseChanged', callback);

      stateManager.setGamePhase('playing');

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({
        oldPhase: 'login',
        newPhase: 'playing',
      });
    });

    test('应该拒绝无效的游戏阶段', () => {
      expect(() => stateManager.setGamePhase('invalid')).toThrow(
        '无效的游戏阶段'
      );
    });
  });

  describe('setQuestions', () => {
    test('应该设置题目列表', () => {
      const questions = [
        { id: 'q1', text: '题目1' },
        { id: 'q2', text: '题目2' },
      ];

      stateManager.setQuestions(questions);
      expect(stateManager.game.questions).toEqual(questions);
    });

    test('应该在设置题目后触发 questionsLoaded 事件', () => {
      const callback = vi.fn();
      stateManager.on('questionsLoaded', callback);

      const questions = [{ id: 'q1', text: '题目1' }];
      stateManager.setQuestions(questions);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(questions);
    });

    test('应该拒绝非数组的题目列表', () => {
      expect(() => stateManager.setQuestions('not an array')).toThrow(
        '题目列表必须是数组'
      );
    });
  });

  describe('setInteractionPoints', () => {
    test('应该设置交互点列表', () => {
      const points = [
        { id: 'p1', x: 0.5, y: 0.5, state: 'active', questionId: 'q1' },
      ];

      stateManager.setInteractionPoints(points);
      expect(stateManager.game.interactionPoints).toEqual(points);
    });

    test('应该在设置交互点后触发 interactionPointsLoaded 事件', () => {
      const callback = vi.fn();
      stateManager.on('interactionPointsLoaded', callback);

      const points = [
        { id: 'p1', x: 0.5, y: 0.5, state: 'active', questionId: 'q1' },
      ];
      stateManager.setInteractionPoints(points);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(points);
    });

    test('应该拒绝非数组的交互点列表', () => {
      expect(() => stateManager.setInteractionPoints('not an array')).toThrow(
        '交互点列表必须是数组'
      );
    });
  });

  describe('setCurrentQuestion', () => {
    test('应该设置当前题目', () => {
      const question = { id: 'q1', text: '题目1' };
      stateManager.setCurrentQuestion(question);
      expect(stateManager.game.currentQuestion).toEqual(question);
    });

    test('应该在设置当前题目后触发 currentQuestionChanged 事件', () => {
      const callback = vi.fn();
      stateManager.on('currentQuestionChanged', callback);

      const question = { id: 'q1', text: '题目1' };
      stateManager.setCurrentQuestion(question);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(question);
    });

    test('应该支持设置为 null', () => {
      stateManager.setCurrentQuestion({ id: 'q1', text: '题目1' });
      stateManager.setCurrentQuestion(null);
      expect(stateManager.game.currentQuestion).toBeNull();
    });
  });

  describe('updateInteractionPointState', () => {
    beforeEach(() => {
      stateManager.setInteractionPoints([
        { id: 'p1', x: 0.5, y: 0.5, state: 'active', questionId: 'q1' },
      ]);
    });

    test('应该更新交互点状态', () => {
      stateManager.updateInteractionPointState('p1', 'hover');

      const point = stateManager.game.interactionPoints.find(
        (p) => p.id === 'p1'
      );
      expect(point.state).toBe('hover');
    });

    test('应该在更新状态后触发 interactionPointStateChanged 事件', () => {
      const callback = vi.fn();
      stateManager.on('interactionPointStateChanged', callback);

      stateManager.updateInteractionPointState('p1', 'hover');

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({
        pointId: 'p1',
        state: 'hover',
      });
    });

    test('应该在交互点不存在时抛出错误', () => {
      expect(() =>
        stateManager.updateInteractionPointState('invalid', 'hover')
      ).toThrow('交互点不存在');
    });

    test('应该拒绝无效的状态', () => {
      expect(() =>
        stateManager.updateInteractionPointState('p1', 'invalid')
      ).toThrow('无效的交互点状态');
    });
  });

  describe('reset', () => {
    test('应该重置所有状态', () => {
      stateManager.setUsername('张三', 'user-123');
      stateManager.setGamePhase('playing');
      stateManager.setQuestions([{ id: 'q1', text: '题目1' }]);

      stateManager.reset();

      expect(stateManager.user).toBeNull();
      expect(stateManager.game.phase).toBe('login');
      expect(stateManager.game.questions).toEqual([]);
      expect(stateManager.game.interactionPoints).toEqual([]);
      expect(stateManager.game.currentQuestion).toBeNull();
    });

    test('应该在重置后触发 stateReset 事件', () => {
      const callback = vi.fn();
      stateManager.on('stateReset', callback);

      stateManager.reset();

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('事件系统', () => {
    test('应该注册和触发事件监听器', () => {
      const callback = vi.fn();
      stateManager.on('testEvent', callback);

      stateManager._emit('testEvent', { data: 'test' });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({ data: 'test' });
    });

    test('应该支持多个监听器', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      stateManager.on('testEvent', callback1);
      stateManager.on('testEvent', callback2);

      stateManager._emit('testEvent', { data: 'test' });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    test('应该移除事件监听器', () => {
      const callback = vi.fn();
      stateManager.on('testEvent', callback);
      stateManager.off('testEvent', callback);

      stateManager._emit('testEvent', { data: 'test' });

      expect(callback).not.toHaveBeenCalled();
    });

    test('应该拒绝非函数的回调', () => {
      expect(() => stateManager.on('testEvent', 'not a function')).toThrow(
        '回调必须是函数'
      );
    });

    test('应该捕获监听器中的错误', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const callback = vi.fn(() => {
        throw new Error('测试错误');
      });

      stateManager.on('testEvent', callback);
      stateManager._emit('testEvent', { data: 'test' });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getSnapshot', () => {
    test('应该返回状态快照', () => {
      stateManager.setUsername('张三', 'user-123');
      stateManager.user.completedQuestions.add('q1');
      stateManager.setGamePhase('playing');

      const snapshot = stateManager.getSnapshot();

      expect(snapshot.user.username).toBe('张三');
      expect(snapshot.user.completedQuestions).toEqual(['q1']);
      expect(snapshot.game.phase).toBe('playing');
    });

    test('应该在用户为 null 时返回 null', () => {
      const snapshot = stateManager.getSnapshot();
      expect(snapshot.user).toBeNull();
    });
  });
});
