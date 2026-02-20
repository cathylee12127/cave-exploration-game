/**
 * QuizModal - 问答弹窗
 * 
 * 职责：显示题目和选项，处理用户答题
 * 
 * 功能：
 * - 显示/隐藏弹窗
 * - 渲染题目文本和选项按钮
 * - 处理用户答案选择
 * - 提供淡入淡出动画
 * - 移动端触摸友好设计
 * 
 * 验证需求: 4.1, 4.2, 9.1, 9.2
 */

export class QuizModal {
  constructor() {
    this.modal = null;
    this.answerCallbacks = [];
    this.currentQuestion = null;
    this.isVisible = false;
    
    this.createModal();
  }

  /**
   * 创建弹窗 DOM 结构
   */
  createModal() {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'quiz-modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // 创建弹窗容器
    const container = document.createElement('div');
    container.className = 'quiz-modal-container';
    container.style.cssText = `
      background: linear-gradient(135deg, rgba(45, 27, 61, 0.95), rgba(26, 42, 58, 0.95));
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 32px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(212, 196, 168, 0.2);
      transform: scale(0.9);
      transition: transform 0.3s ease;
    `;

    // 创建关闭按钮
    const closeButton = document.createElement('button');
    closeButton.className = 'quiz-modal-close';
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      color: rgba(212, 196, 168, 0.8);
      font-size: 32px;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      line-height: 32px;
      text-align: center;
      transition: color 0.2s ease;
    `;
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.color = 'rgba(212, 196, 168, 1)';
    });
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.color = 'rgba(212, 196, 168, 0.8)';
    });
    closeButton.addEventListener('click', () => this.hide());

    // 创建题目文本
    const questionText = document.createElement('div');
    questionText.className = 'quiz-modal-question';
    questionText.style.cssText = `
      color: #d4c4a8;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 24px;
      line-height: 1.6;
      text-align: center;
    `;

    // 创建选项容器
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'quiz-modal-options';
    optionsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;

    // 组装弹窗
    container.style.position = 'relative';
    container.appendChild(closeButton);
    container.appendChild(questionText);
    container.appendChild(optionsContainer);
    overlay.appendChild(container);

    // 添加到 body
    document.body.appendChild(overlay);

    this.modal = {
      overlay,
      container,
      closeButton,
      questionText,
      optionsContainer
    };
  }

  /**
   * 显示弹窗
   * @param {Object} question - 题目对象
   * @param {string} question.id - 题目 ID
   * @param {string} question.text - 题目文本
   * @param {Array} question.options - 选项数组
   * @param {string} question.difficulty - 难度 ('basic' | 'advanced')
   */
  show(question) {
    if (!question || !question.text || !question.options) {
      throw new Error('Invalid question object');
    }

    this.currentQuestion = question;
    this.isVisible = true;

    // 更新题目文本
    this.modal.questionText.textContent = question.text;

    // 清空并重新创建选项按钮
    this.modal.optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
      const button = this.createOptionButton(option, index);
      this.modal.optionsContainer.appendChild(button);
    });

    // 显示弹窗（淡入动画）
    this.modal.overlay.style.display = 'flex';
    
    // 触发重排以启动动画
    requestAnimationFrame(() => {
      this.modal.overlay.style.opacity = '1';
      this.modal.container.style.transform = 'scale(1)';
    });
  }

  /**
   * 创建选项按钮
   * @param {Object} option - 选项对象
   * @param {number} index - 选项索引
   * @returns {HTMLButtonElement} 选项按钮
   */
  createOptionButton(option, index) {
    const button = document.createElement('button');
    button.className = 'quiz-modal-option';
    button.textContent = `${String.fromCharCode(65 + index)}. ${option.text}`;
    button.dataset.optionId = option.id;
    
    button.style.cssText = `
      background: linear-gradient(135deg, rgba(90, 74, 58, 0.6), rgba(139, 115, 85, 0.6));
      border: 2px solid rgba(212, 196, 168, 0.3);
      border-radius: 12px;
      color: #d4c4a8;
      font-size: 16px;
      padding: 16px 20px;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;
      font-weight: 500;
    `;

    // 悬停效果
    button.addEventListener('mouseenter', () => {
      button.style.background = 'linear-gradient(135deg, rgba(90, 74, 58, 0.8), rgba(139, 115, 85, 0.8))';
      button.style.borderColor = 'rgba(212, 196, 168, 0.6)';
      button.style.transform = 'translateX(4px)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = 'linear-gradient(135deg, rgba(90, 74, 58, 0.6), rgba(139, 115, 85, 0.6))';
      button.style.borderColor = 'rgba(212, 196, 168, 0.3)';
      button.style.transform = 'translateX(0)';
    });

    // 点击效果
    button.addEventListener('click', () => {
      this.handleAnswerSelected(option.id);
    });

    // 触摸友好设计
    button.addEventListener('touchstart', (e) => {
      e.preventDefault();
      button.style.background = 'linear-gradient(135deg, rgba(90, 74, 58, 0.8), rgba(139, 115, 85, 0.8))';
    });

    button.addEventListener('touchend', (e) => {
      e.preventDefault();
      button.style.background = 'linear-gradient(135deg, rgba(90, 74, 58, 0.6), rgba(139, 115, 85, 0.6))';
      this.handleAnswerSelected(option.id);
    });

    return button;
  }

  /**
   * 处理答案选择
   * @param {string} answerId - 选中的答案 ID
   */
  handleAnswerSelected(answerId) {
    if (!this.currentQuestion) return;

    // 触发所有答案选择回调
    this.answerCallbacks.forEach(callback => {
      try {
        callback(answerId);
      } catch (error) {
        console.error('Error in answer callback:', error);
      }
    });
  }

  /**
   * 显示答案反馈（正确答案和知识点）
   * @param {boolean} isCorrect - 是否答对
   * @param {string} correctAnswerId - 正确答案的 ID
   * @param {string} explanation - 知识点说明
   */
  showFeedback(isCorrect, correctAnswerId, explanation) {
    console.log('[QuizModal] showFeedback called:', { isCorrect, correctAnswerId, explanation });
    
    // 禁用所有选项按钮
    const optionButtons = this.modal.optionsContainer.querySelectorAll('button');
    let correctAnswerText = '';
    
    console.log('[QuizModal] Found option buttons:', optionButtons.length);
    
    optionButtons.forEach(button => {
      button.disabled = true;
      button.style.cursor = 'not-allowed';
      button.style.opacity = '0.6';
      
      console.log('[QuizModal] Button:', button.dataset.optionId, 'Correct:', correctAnswerId);
      
      // 高亮正确答案
      if (button.dataset.optionId === correctAnswerId) {
        button.style.background = 'linear-gradient(135deg, rgba(34, 139, 34, 0.8), rgba(50, 205, 50, 0.8))';
        button.style.borderColor = 'rgba(144, 238, 144, 0.8)';
        button.style.opacity = '1';
        correctAnswerText = button.textContent;
        console.log('[QuizModal] Found correct answer:', correctAnswerText);
      }
    });

    // 创建反馈容器
    const feedbackContainer = document.createElement('div');
    feedbackContainer.className = 'quiz-modal-feedback';
    feedbackContainer.style.cssText = `
      margin-top: 24px;
      padding: 20px;
      border-radius: 12px;
      background: ${isCorrect 
        ? 'linear-gradient(135deg, rgba(34, 139, 34, 0.2), rgba(50, 205, 50, 0.2))' 
        : 'linear-gradient(135deg, rgba(178, 34, 34, 0.2), rgba(220, 20, 60, 0.2))'};
      border: 2px solid ${isCorrect 
        ? 'rgba(144, 238, 144, 0.4)' 
        : 'rgba(255, 99, 71, 0.4)'};
    `;

    // 反馈标题
    const feedbackTitle = document.createElement('div');
    feedbackTitle.style.cssText = `
      color: ${isCorrect ? '#90EE90' : '#FF6347'};
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
      text-align: center;
    `;
    feedbackTitle.textContent = isCorrect ? '✓ 回答正确！' : '✗ 回答错误';

    feedbackContainer.appendChild(feedbackTitle);

    // 如果答错，显示正确答案
    if (!isCorrect && correctAnswerText) {
      console.log('[QuizModal] Adding correct answer section');
      
      const correctAnswerLabel = document.createElement('div');
      correctAnswerLabel.style.cssText = `
        color: #90EE90;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
      `;
      correctAnswerLabel.textContent = '正确答案：';

      const correctAnswerContent = document.createElement('div');
      correctAnswerContent.style.cssText = `
        color: #d4c4a8;
        font-size: 15px;
        line-height: 1.6;
        margin-bottom: 16px;
        padding: 12px;
        background: rgba(34, 139, 34, 0.1);
        border-radius: 8px;
        border-left: 3px solid #90EE90;
      `;
      correctAnswerContent.textContent = correctAnswerText;

      feedbackContainer.appendChild(correctAnswerLabel);
      feedbackContainer.appendChild(correctAnswerContent);
    } else {
      console.log('[QuizModal] Not adding correct answer section:', { isCorrect, correctAnswerText });
    }

    // 知识点说明
    if (explanation) {
      console.log('[QuizModal] Adding explanation section');
      
      const knowledgeLabel = document.createElement('div');
      knowledgeLabel.style.cssText = `
        color: #d4c4a8;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
      `;
      knowledgeLabel.textContent = '知识点：';

      const explanationText = document.createElement('div');
      explanationText.style.cssText = `
        color: #d4c4a8;
        font-size: 15px;
        line-height: 1.6;
        padding: 12px;
        background: rgba(212, 196, 168, 0.1);
        border-radius: 8px;
        border-left: 3px solid rgba(212, 196, 168, 0.5);
      `;
      explanationText.textContent = explanation;

      feedbackContainer.appendChild(knowledgeLabel);
      feedbackContainer.appendChild(explanationText);
    } else {
      console.log('[QuizModal] No explanation provided');
    }

    // 添加到弹窗容器
    this.modal.container.appendChild(feedbackContainer);
    console.log('[QuizModal] Feedback container added to modal');

    // 保存引用以便后续清理
    this.feedbackContainer = feedbackContainer;
  }

  /**
   * 隐藏弹窗
   */
  hide() {
    if (!this.isVisible) return;

    this.isVisible = false;

    // 淡出动画
    this.modal.overlay.style.opacity = '0';
    this.modal.container.style.transform = 'scale(0.9)';

    // 动画结束后隐藏
    setTimeout(() => {
      this.modal.overlay.style.display = 'none';
      this.currentQuestion = null;
      
      // 清理反馈容器
      if (this.feedbackContainer) {
        this.feedbackContainer.remove();
        this.feedbackContainer = null;
      }
    }, 300);
  }

  /**
   * 注册答案选择回调
   * @param {Function} callback - 回调函数，接收答案 ID 作为参数
   */
  onAnswerSelected(callback) {
    if (typeof callback === 'function') {
      this.answerCallbacks.push(callback);
    }
  }

  /**
   * 获取当前题目
   * @returns {Object|null} 当前题目对象
   */
  getCurrentQuestion() {
    return this.currentQuestion;
  }

  /**
   * 检查弹窗是否可见
   * @returns {boolean} 是否可见
   */
  isModalVisible() {
    return this.isVisible;
  }

  /**
   * 清理资源
   */
  dispose() {
    if (this.modal && this.modal.overlay) {
      document.body.removeChild(this.modal.overlay);
    }
    
    this.modal = null;
    this.answerCallbacks = [];
    this.currentQuestion = null;
    this.isVisible = false;
  }
}
