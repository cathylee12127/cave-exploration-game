/**
 * APIClient 单元测试
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import APIClient, { APIError } from './APIClient.js';

describe('APIClient', () => {
  let apiClient;
  let fetchMock;

  beforeEach(() => {
    apiClient = new APIClient({
      baseURL: '/api',
      timeout: 5000,
      maxRetries: 2,
      retryDelay: 100,
    });

    // Mock fetch
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('初始化', () => {
    test('应该使用默认配置初始化', () => {
      const client = new APIClient();
      expect(client.baseURL).toBe('/api');
      expect(client.timeout).toBe(10000);
      expect(client.maxRetries).toBe(3);
    });

    test('应该使用自定义配置初始化', () => {
      const client = new APIClient({
        baseURL: '/custom-api',
        timeout: 3000,
        maxRetries: 1,
      });

      expect(client.baseURL).toBe('/custom-api');
      expect(client.timeout).toBe(3000);
      expect(client.maxRetries).toBe(1);
    });
  });

  describe('registerUser', () => {
    test('应该成功注册用户', async () => {
      const mockResponse = {
        success: true,
        userId: 'user-123',
        message: '注册成功',
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.registerUser('张三');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/users/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username: '张三' }),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    test('应该拒绝空姓名', async () => {
      await expect(apiClient.registerUser('')).rejects.toThrow(
        '用户姓名不能为空'
      );
    });

    test('应该拒绝非字符串姓名', async () => {
      await expect(apiClient.registerUser(123)).rejects.toThrow(
        '用户姓名不能为空'
      );
    });

    test('应该处理姓名已存在错误', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ error: '姓名已存在' }),
      });

      await expect(apiClient.registerUser('张三')).rejects.toThrow(
        APIError
      );
      await expect(apiClient.registerUser('张三')).rejects.toThrow(
        '姓名已存在'
      );
    });
  });

  describe('checkUsername', () => {
    test('应该检查姓名可用性', async () => {
      const mockResponse = { available: true };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.checkUsername('张三');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/users/check/%E5%BC%A0%E4%B8%89',
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result).toEqual(mockResponse);
    });

    test('应该正确编码姓名', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true }),
      });

      await apiClient.checkUsername('张 三');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('%E5%BC%A0%20%E4%B8%89'),
        expect.any(Object)
      );
    });

    test('应该拒绝空姓名', async () => {
      await expect(apiClient.checkUsername('')).rejects.toThrow(
        '用户姓名不能为空'
      );
    });
  });

  describe('getQuestions', () => {
    test('应该获取题目列表', async () => {
      const mockResponse = {
        questions: [
          {
            id: 'q1',
            text: '题目1',
            options: [
              { id: 'a', text: '选项A' },
              { id: 'b', text: '选项B' },
              { id: 'c', text: '选项C' },
            ],
            correctAnswerId: 'a',
            difficulty: 'basic',
          },
        ],
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.getQuestions();

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/questions',
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('submitAnswer', () => {
    test('应该提交答案', async () => {
      const mockResponse = {
        correct: true,
        scoreEarned: 10,
        totalScore: 10,
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.submitAnswer('user-123', 'q1', 'a');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/questions/answer',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userId: 'user-123',
            questionId: 'q1',
            answerId: 'a',
          }),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    test('应该拒绝缺少参数', async () => {
      await expect(apiClient.submitAnswer('', 'q1', 'a')).rejects.toThrow(
        '缺少必需参数'
      );
      await expect(apiClient.submitAnswer('user-123', '', 'a')).rejects.toThrow(
        '缺少必需参数'
      );
      await expect(
        apiClient.submitAnswer('user-123', 'q1', '')
      ).rejects.toThrow('缺少必需参数');
    });
  });

  describe('getUserScore', () => {
    test('应该获取用户积分', async () => {
      const mockResponse = {
        userId: 'user-123',
        username: '张三',
        score: 50,
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.getUserScore('user-123');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/scores/user-123',
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result).toEqual(mockResponse);
    });

    test('应该拒绝空用户ID', async () => {
      await expect(apiClient.getUserScore('')).rejects.toThrow(
        '用户ID不能为空'
      );
    });
  });

  describe('getRankings', () => {
    test('应该获取排名列表', async () => {
      const mockResponse = {
        rankings: [
          {
            rank: 1,
            username: '李四',
            score: 100,
            timestamp: '2024-01-15T10:30:00.000Z',
          },
        ],
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.getRankings(10, 0);

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/rankings?limit=10&offset=0',
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result).toEqual(mockResponse);
    });

    test('应该使用默认参数', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ rankings: [] }),
      });

      await apiClient.getRankings();

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/rankings?limit=100&offset=0',
        expect.any(Object)
      );
    });

    test('应该拒绝无效的 limit', async () => {
      await expect(apiClient.getRankings(0, 0)).rejects.toThrow(
        'limit 必须是正整数'
      );
      await expect(apiClient.getRankings(-1, 0)).rejects.toThrow(
        'limit 必须是正整数'
      );
    });

    test('应该拒绝无效的 offset', async () => {
      await expect(apiClient.getRankings(10, -1)).rejects.toThrow(
        'offset 必须是非负整数'
      );
    });
  });

  describe('错误处理', () => {
    test('应该处理 HTTP 错误', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: '用户不存在' }),
      });

      await expect(apiClient.getUserScore('invalid')).rejects.toThrow(
        APIError
      );
      await expect(apiClient.getUserScore('invalid')).rejects.toThrow(
        '用户不存在'
      );
    });

    test('应该处理网络错误', async () => {
      fetchMock.mockRejectedValueOnce(
        new TypeError('Failed to fetch')
      );

      await expect(apiClient.getQuestions()).rejects.toThrow(APIError);
      await expect(apiClient.getQuestions()).rejects.toThrow(
        '网络连接失败'
      );
    });

    test('应该处理超时错误', async () => {
      // 模拟超时
      fetchMock.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ ok: true }), 10000);
          })
      );

      const client = new APIClient({ timeout: 100, maxRetries: 0 });
      await expect(client.getQuestions()).rejects.toThrow(APIError);
      await expect(client.getQuestions()).rejects.toThrow('请求超时');
    });

    test('应该处理 JSON 解析错误', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(apiClient.getQuestions()).rejects.toThrow(APIError);
    });
  });

  describe('重试逻辑', () => {
    test('应该在网络错误时重试', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      // 第一次失败，第二次成功
      fetchMock
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ questions: [] }),
        });

      const result = await apiClient.getQuestions();

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ questions: [] });
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    test('应该在服务器错误时重试', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      // 第一次 500 错误，第二次成功
      fetchMock
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: '服务器错误' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ questions: [] }),
        });

      const result = await apiClient.getQuestions();

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ questions: [] });

      consoleWarnSpy.mockRestore();
    });

    test('应该在达到最大重试次数后抛出错误', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      // 所有请求都失败
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(apiClient.getQuestions()).rejects.toThrow(APIError);
      expect(fetchMock).toHaveBeenCalledTimes(3); // 1 次初始 + 2 次重试

      consoleWarnSpy.mockRestore();
    });

    test('应该不重试客户端错误（4xx）', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: '请求参数错误' }),
      });

      await expect(apiClient.getQuestions()).rejects.toThrow(APIError);
      expect(fetchMock).toHaveBeenCalledTimes(1); // 不重试
    });

    test('应该使用指数退避策略', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const client = new APIClient({ maxRetries: 2, retryDelay: 100 });
      const startTime = Date.now();

      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(client.getQuestions()).rejects.toThrow(APIError);

      const elapsed = Date.now() - startTime;
      // 第一次重试延迟 100ms，第二次重试延迟 200ms，总共至少 300ms
      expect(elapsed).toBeGreaterThanOrEqual(250);

      consoleWarnSpy.mockRestore();
    });
  });

  describe('配置方法', () => {
    test('应该设置基础 URL', () => {
      apiClient.setBaseURL('/new-api');
      expect(apiClient.baseURL).toBe('/new-api');
    });

    test('应该拒绝非字符串的基础 URL', () => {
      expect(() => apiClient.setBaseURL(123)).toThrow(
        'baseURL 必须是字符串'
      );
    });

    test('应该设置超时时间', () => {
      apiClient.setTimeout(3000);
      expect(apiClient.timeout).toBe(3000);
    });

    test('应该拒绝无效的超时时间', () => {
      expect(() => apiClient.setTimeout(0)).toThrow('timeout 必须是正数');
      expect(() => apiClient.setTimeout(-1)).toThrow('timeout 必须是正数');
    });

    test('应该设置最大重试次数', () => {
      apiClient.setMaxRetries(5);
      expect(apiClient.maxRetries).toBe(5);
    });

    test('应该拒绝无效的最大重试次数', () => {
      expect(() => apiClient.setMaxRetries(-1)).toThrow(
        'maxRetries 必须是非负整数'
      );
    });
  });

  describe('APIError', () => {
    test('应该创建 APIError 实例', () => {
      const error = new APIError('测试错误', 404);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(APIError);
      expect(error.message).toBe('测试错误');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('APIError');
    });

    test('应该包含原始错误', () => {
      const originalError = new Error('原始错误');
      const error = new APIError('测试错误', 500, originalError);

      expect(error.originalError).toBe(originalError);
    });
  });
});
