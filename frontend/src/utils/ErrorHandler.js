/**
 * ErrorHandler - 全局错误处理器
 * 
 * 职责：统一处理应用中的错误
 * 
 * 功能：
 * - 捕获网络请求错误
 * - 显示友好的错误提示
 * - 实现重试机制
 * - 处理资源加载失败
 * - 错误日志记录
 * 
 * 验证需求: 8.2, 8.3
 */

export class ErrorHandler {
  constructor() {
    this.errorCallbacks = [];
    this.retryAttempts = new Map(); // 记录重试次数
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1秒
    
    this.setupGlobalErrorHandlers();
  }

  /**
   * 设置全局错误处理器
   */
  setupGlobalErrorHandlers() {
    // 捕获未处理的 Promise 拒绝
    window.addEventListener('unhandledrejection', (event) => {
      console.error('未处理的 Promise 拒绝:', event.reason);
      this.handleError({
        type: 'promise',
        message: '操作失败，请重试',
        error: event.reason,
      });
      event.preventDefault();
    });

    // 捕获全局错误
    window.addEventListener('error', (event) => {
      // 忽略脚本加载错误（由资源加载处理）
      if (event.target !== window) {
        return;
      }
      
      console.error('全局错误:', event.error);
      this.handleError({
        type: 'runtime',
        message: '发生错误，请刷新页面重试',
        error: event.error,
      });
    });

    // 捕获资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target.tagName === 'IMG' || event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK') {
        console.error('资源加载失败:', event.target.src || event.target.href);
        this.handleError({
          type: 'resource',
          message: '资源加载失败',
          resource: event.target.src || event.target.href,
        });
      }
    }, true);
  }

  /**
   * 处理网络错误
   * @param {Error} error - 错误对象
   * @param {Object} context - 错误上下文
   * @returns {Object} 错误信息
   */
  handleNetworkError(error, context = {}) {
    let message = '网络连接失败，请检查网络后重试';
    let canRetry = true;

    // 根据错误类型提供更具体的消息
    if (error.message.includes('Failed to fetch')) {
      message = '无法连接到服务器，请检查网络连接';
    } else if (error.message.includes('timeout')) {
      message = '请求超时，请稍后重试';
    } else if (error.message.includes('abort')) {
      message = '请求已取消';
      canRetry = false;
    }

    const errorInfo = {
      type: 'network',
      message,
      error,
      context,
      canRetry,
      timestamp: new Date().toISOString(),
    };

    this.handleError(errorInfo);
    return errorInfo;
  }

  /**
   * 处理 API 错误
   * @param {Response} response - 响应对象
   * @param {Object} data - 响应数据
   * @returns {Object} 错误信息
   */
  handleAPIError(response, data = {}) {
    let message = '操作失败，请重试';

    // 根据状态码提供具体消息
    switch (response.status) {
      case 400:
        message = data.error || '请求参数错误';
        break;
      case 401:
        message = '未授权，请重新登录';
        break;
      case 403:
        message = '没有权限执行此操作';
        break;
      case 404:
        message = '请求的资源不存在';
        break;
      case 409:
        message = data.error || '数据冲突';
        break;
      case 429:
        message = '请求过于频繁，请稍后重试';
        break;
      case 500:
        message = '服务器错误，请稍后重试';
        break;
      case 503:
        message = '服务暂时不可用，请稍后重试';
        break;
      default:
        if (response.status >= 500) {
          message = '服务器错误，请稍后重试';
        }
    }

    const errorInfo = {
      type: 'api',
      message,
      status: response.status,
      data,
      canRetry: response.status >= 500 || response.status === 429,
      timestamp: new Date().toISOString(),
    };

    this.handleError(errorInfo);
    return errorInfo;
  }

  /**
   * 处理错误
   * @param {Object} errorInfo - 错误信息
   */
  handleError(errorInfo) {
    // 记录错误
    this.logError(errorInfo);

    // 触发错误回调
    this.triggerErrorCallbacks(errorInfo);
  }

  /**
   * 记录错误
   * @param {Object} errorInfo - 错误信息
   */
  logError(errorInfo) {
    // 在开发环境中输出详细错误
    if (process.env.NODE_ENV === 'development') {
      console.error('错误详情:', errorInfo);
    }

    // 在生产环境中可以发送到错误追踪服务
    // 例如: Sentry, LogRocket, etc.
  }

  /**
   * 重试操作
   * @param {Function} operation - 要重试的操作
   * @param {string} operationId - 操作ID（用于跟踪重试次数）
   * @param {Object} options - 重试选项
   * @returns {Promise} 操作结果
   */
  async retry(operation, operationId, options = {}) {
    const {
      maxRetries = this.maxRetries,
      delay = this.retryDelay,
      backoff = true,
    } = options;

    const attempts = this.retryAttempts.get(operationId) || 0;

    try {
      const result = await operation();
      // 成功后重置重试次数
      this.retryAttempts.delete(operationId);
      return result;
    } catch (error) {
      if (attempts >= maxRetries) {
        // 达到最大重试次数
        this.retryAttempts.delete(operationId);
        throw error;
      }

      // 增加重试次数
      this.retryAttempts.set(operationId, attempts + 1);

      // 计算延迟时间（指数退避）
      const retryDelay = backoff ? delay * Math.pow(2, attempts) : delay;

      console.log(`重试操作 ${operationId}，第 ${attempts + 1} 次，延迟 ${retryDelay}ms`);

      // 等待后重试
      await this.sleep(retryDelay);
      return this.retry(operation, operationId, options);
    }
  }

  /**
   * 延迟执行
   * @param {number} ms - 延迟毫秒数
   * @returns {Promise}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 注册错误回调
   * @param {Function} callback - 回调函数
   */
  onError(callback) {
    if (typeof callback === 'function') {
      this.errorCallbacks.push(callback);
    }
  }

  /**
   * 触发错误回调
   * @param {Object} errorInfo - 错误信息
   */
  triggerErrorCallbacks(errorInfo) {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(errorInfo);
      } catch (error) {
        console.error('错误回调执行失败:', error);
      }
    });
  }

  /**
   * 清理资源
   */
  dispose() {
    this.errorCallbacks = [];
    this.retryAttempts.clear();
  }
}

// 创建全局单例
const errorHandler = new ErrorHandler();

export default errorHandler;
