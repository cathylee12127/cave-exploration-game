/**
 * PerformanceUtils - 性能优化工具
 * 
 * 职责：提供性能优化相关的工具函数
 * 
 * 功能：
 * - 节流（Throttle）
 * - 防抖（Debounce）
 * - 请求动画帧优化
 * - 性能监控
 * 
 * 验证需求: 8.1, 8.4, 9.1
 */

/**
 * 节流函数
 * 限制函数在指定时间内只能执行一次
 * 
 * @param {Function} func - 要节流的函数
 * @param {number} wait - 等待时间（毫秒）
 * @param {Object} options - 选项
 * @returns {Function} 节流后的函数
 */
export function throttle(func, wait, options = {}) {
  let timeout = null;
  let previous = 0;
  const { leading = true, trailing = true } = options;

  const throttled = function (...args) {
    const now = Date.now();
    
    if (!previous && !leading) {
      previous = now;
    }

    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      previous = now;
      func.apply(this, args);
    } else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        previous = leading ? Date.now() : 0;
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };

  throttled.cancel = function () {
    if (timeout) {
      clearTimeout(timeout);
    }
    previous = 0;
    timeout = null;
  };

  return throttled;
}

/**
 * 防抖函数
 * 延迟执行函数，如果在延迟期间再次调用，则重新计时
 * 
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait, immediate = false) {
  let timeout = null;

  const debounced = function (...args) {
    const later = () => {
      timeout = null;
      if (!immediate) {
        func.apply(this, args);
      }
    };

    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);

    if (callNow) {
      func.apply(this, args);
    }
  };

  debounced.cancel = function () {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

/**
 * 请求动画帧节流
 * 使用 requestAnimationFrame 优化高频事件
 * 
 * @param {Function} func - 要执行的函数
 * @returns {Function} 优化后的函数
 */
export function rafThrottle(func) {
  let rafId = null;
  let lastArgs = null;

  const throttled = function (...args) {
    lastArgs = args;

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func.apply(this, lastArgs);
        rafId = null;
        lastArgs = null;
      });
    }
  };

  throttled.cancel = function () {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
      lastArgs = null;
    }
  };

  return throttled;
}

/**
 * 性能监控类
 */
export class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.measures = [];
  }

  /**
   * 标记时间点
   * @param {string} name - 标记名称
   */
  mark(name) {
    this.marks.set(name, performance.now());
  }

  /**
   * 测量两个标记之间的时间
   * @param {string} name - 测量名称
   * @param {string} startMark - 开始标记
   * @param {string} endMark - 结束标记
   * @returns {number} 时间差（毫秒）
   */
  measure(name, startMark, endMark) {
    const startTime = this.marks.get(startMark);
    const endTime = this.marks.get(endMark);

    if (startTime === undefined || endTime === undefined) {
      console.warn(`Mark not found: ${startMark} or ${endMark}`);
      return 0;
    }

    const duration = endTime - startTime;
    this.measures.push({ name, duration, timestamp: Date.now() });

    return duration;
  }

  /**
   * 获取所有测量结果
   * @returns {Array} 测量结果数组
   */
  getMeasures() {
    return [...this.measures];
  }

  /**
   * 清除所有标记和测量
   */
  clear() {
    this.marks.clear();
    this.measures = [];
  }

  /**
   * 获取性能报告
   * @returns {Object} 性能报告
   */
  getReport() {
    const report = {
      totalMeasures: this.measures.length,
      measures: this.measures.map(m => ({
        name: m.name,
        duration: `${m.duration.toFixed(2)}ms`,
      })),
    };

    return report;
  }
}

/**
 * 批处理执行
 * 将多个操作批量执行，减少重绘次数
 * 
 * @param {Array<Function>} operations - 操作数组
 */
export function batchExecute(operations) {
  requestAnimationFrame(() => {
    operations.forEach(op => {
      try {
        op();
      } catch (error) {
        console.error('Batch operation failed:', error);
      }
    });
  });
}

/**
 * 延迟加载
 * 延迟执行非关键操作
 * 
 * @param {Function} func - 要延迟执行的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Promise}
 */
export function deferExecution(func, delay = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = func();
      resolve(result);
    }, delay);
  });
}

/**
 * 空闲时执行
 * 在浏览器空闲时执行任务
 * 
 * @param {Function} func - 要执行的函数
 * @param {Object} options - 选项
 * @returns {number} 任务ID
 */
export function idleExecute(func, options = {}) {
  if ('requestIdleCallback' in window) {
    return requestIdleCallback(func, options);
  } else {
    // 降级方案
    return setTimeout(func, 1);
  }
}

/**
 * 取消空闲任务
 * @param {number} id - 任务ID
 */
export function cancelIdleExecute(id) {
  if ('cancelIdleCallback' in window) {
    cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

export default {
  throttle,
  debounce,
  rafThrottle,
  PerformanceMonitor,
  batchExecute,
  deferExecution,
  idleExecute,
  cancelIdleExecute,
};
