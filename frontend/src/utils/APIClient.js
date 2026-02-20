/**
 * APIClient - API 客户端
 * 
 * 职责：
 * - 封装与后端 API 的通信
 * - 处理网络请求和响应
 * - 实现错误处理和重试逻辑
 * 
 * 需求: 8.2, 8.3
 */

/**
 * API 配置
 * 支持生产环境和开发环境
 */
const API_CONFIG = {
  // 生产环境使用环境变量，开发环境使用本地地址
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api` 
    : '/api',
  timeout: 10000, // 10秒超时
  maxRetries: 3, // 最大重试次数
  retryDelay: 1000, // 重试延迟（毫秒）
};

/**
 * API 错误类
 */
class APIError extends Error {
  constructor(message, statusCode, originalError) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

class APIClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || API_CONFIG.baseURL;
    this.timeout = config.timeout || API_CONFIG.timeout;
    this.maxRetries = config.maxRetries || API_CONFIG.maxRetries;
    this.retryDelay = config.retryDelay || API_CONFIG.retryDelay;
  }

  /**
   * 发送 HTTP 请求
   * @private
   * @param {string} endpoint - API 端点
   * @param {Object} options - 请求选项
   * @param {number} retryCount - 当前重试次数
   * @returns {Promise<any>} 响应数据
   */
  async _request(endpoint, options = {}, retryCount = 0) {
    const url = `${this.baseURL}${endpoint}`;

    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      // 处理 HTTP 错误状态码
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || `HTTP 错误: ${response.status}`;

        throw new APIError(errorMessage, response.status);
      }

      // 解析 JSON 响应
      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      // 处理超时错误
      if (error.name === 'AbortError') {
        const timeoutError = new APIError(
          '请求超时，请检查网络连接',
          408,
          error
        );

        // 超时错误可以重试
        if (retryCount < this.maxRetries) {
          return this._retry(endpoint, options, retryCount, timeoutError);
        }

        throw timeoutError;
      }

      // 处理网络错误
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new APIError(
          '网络连接失败，请检查网络',
          0,
          error
        );

        // 网络错误可以重试
        if (retryCount < this.maxRetries) {
          return this._retry(endpoint, options, retryCount, networkError);
        }

        throw networkError;
      }

      // 处理 API 错误
      if (error instanceof APIError) {
        // 5xx 服务器错误可以重试
        if (error.statusCode >= 500 && retryCount < this.maxRetries) {
          return this._retry(endpoint, options, retryCount, error);
        }

        throw error;
      }

      // 其他未知错误
      throw new APIError('未知错误', 0, error);
    }
  }

  /**
   * 重试请求
   * @private
   * @param {string} endpoint - API 端点
   * @param {Object} options - 请求选项
   * @param {number} retryCount - 当前重试次数
   * @param {Error} lastError - 上次的错误
   * @returns {Promise<any>} 响应数据
   */
  async _retry(endpoint, options, retryCount, lastError) {
    console.warn(
      `请求失败，正在重试 (${retryCount + 1}/${this.maxRetries}):`,
      lastError.message
    );

    // 等待一段时间后重试（指数退避）
    const delay = this.retryDelay * Math.pow(2, retryCount);
    await new Promise((resolve) => setTimeout(resolve, delay));

    return this._request(endpoint, options, retryCount + 1);
  }

  /**
   * 注册新用户
   * @param {string} username - 用户姓名
   * @returns {Promise<{success: boolean, userId: string, message: string}>}
   */
  async registerUser(username) {
    if (!username || typeof username !== 'string') {
      throw new Error('用户姓名不能为空');
    }

    const data = await this._request('/users/register', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });

    return data;
  }

  /**
   * 检查姓名是否可用
   * @param {string} username - 用户姓名
   * @returns {Promise<{available: boolean}>}
   */
  async checkUsername(username) {
    if (!username || typeof username !== 'string') {
      throw new Error('用户姓名不能为空');
    }

    const encodedUsername = encodeURIComponent(username.trim());
    const data = await this._request(`/users/check/${encodedUsername}`, {
      method: 'GET',
    });

    return data;
  }

  /**
   * 获取所有题目
   * @returns {Promise<{questions: Array}>}
   */
  async getQuestions() {
    const data = await this._request('/questions', {
      method: 'GET',
    });

    return data;
  }

  /**
   * 提交答案
   * @param {string} userId - 用户ID
   * @param {string} questionId - 题目ID
   * @param {string} answerId - 答案ID
   * @returns {Promise<{correct: boolean, scoreEarned: number, totalScore: number}>}
   */
  async submitAnswer(userId, questionId, answerId) {
    if (!userId || !questionId || !answerId) {
      throw new Error('缺少必需参数：userId, questionId, answerId');
    }

    const data = await this._request('/questions/answer', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        questionId,
        answerId,
      }),
    });

    return data;
  }

  /**
   * 获取用户积分
   * @param {string} userId - 用户ID
   * @returns {Promise<{userId: string, username: string, score: number}>}
   */
  async getUserScore(userId) {
    if (!userId || typeof userId !== 'string') {
      throw new Error('用户ID不能为空');
    }

    const data = await this._request(`/scores/${userId}`, {
      method: 'GET',
    });

    return data;
  }

  /**
   * 获取排名列表
   * @param {number} limit - 返回数量（默认100）
   * @param {number} offset - 偏移量（默认0）
   * @returns {Promise<{rankings: Array}>}
   */
  async getRankings(limit = 100, offset = 0) {
    if (typeof limit !== 'number' || limit < 1) {
      throw new Error('limit 必须是正整数');
    }

    if (typeof offset !== 'number' || offset < 0) {
      throw new Error('offset 必须是非负整数');
    }

    const data = await this._request(
      `/rankings?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
      }
    );

    return data;
  }

  /**
   * 标记用户完成游戏
   * @param {string} userId - 用户ID
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async completeGame(userId) {
    if (!userId || typeof userId !== 'string') {
      throw new Error('用户ID不能为空');
    }

    const data = await this._request(`/users/${userId}/complete`, {
      method: 'POST',
    });

    return data;
  }

  /**
   * 设置基础 URL（用于测试或配置）
   * @param {string} baseURL - 基础 URL
   */
  setBaseURL(baseURL) {
    if (typeof baseURL !== 'string') {
      throw new Error('baseURL 必须是字符串');
    }
    this.baseURL = baseURL;
  }

  /**
   * 设置超时时间
   * @param {number} timeout - 超时时间（毫秒）
   */
  setTimeout(timeout) {
    if (typeof timeout !== 'number' || timeout <= 0) {
      throw new Error('timeout 必须是正数');
    }
    this.timeout = timeout;
  }

  /**
   * 设置最大重试次数
   * @param {number} maxRetries - 最大重试次数
   */
  setMaxRetries(maxRetries) {
    if (typeof maxRetries !== 'number' || maxRetries < 0) {
      throw new Error('maxRetries 必须是非负整数');
    }
    this.maxRetries = maxRetries;
  }
}

export default APIClient;
export { APIError };
