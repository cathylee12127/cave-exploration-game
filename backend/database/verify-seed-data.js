/**
 * 验证题库数据结构
 * 不需要数据库连接，直接验证数据源
 */

import { questionsData } from './seed.js';

console.log('🔍 验证题库数据结构...\n');

let hasErrors = false;

// 验证题目数量
console.log(`📊 题目总数: ${questionsData.length}`);
if (questionsData.length < 10) {
  console.error('❌ 题目数量少于10道');
  hasErrors = true;
} else {
  console.log('✅ 题目数量符合要求（至少10道）');
}

// 统计基础题和提升题
const basicQuestions = questionsData.filter((q) => q.difficulty === 'basic');
const advancedQuestions = questionsData.filter(
  (q) => q.difficulty === 'advanced'
);

console.log(`\n📊 题目分类:`);
console.log(`   - 基础题（10分）: ${basicQuestions.length} 道`);
console.log(`   - 提升题（20分）: ${advancedQuestions.length} 道`);

if (basicQuestions.length === 0) {
  console.error('❌ 缺少基础题');
  hasErrors = true;
} else {
  console.log('✅ 包含基础题');
}

if (advancedQuestions.length === 0) {
  console.error('❌ 缺少提升题');
  hasErrors = true;
} else {
  console.log('✅ 包含提升题');
}

// 验证每道题的结构
console.log(`\n🔍 验证题目结构:\n`);

questionsData.forEach((question, index) => {
  const errors = [];

  // 验证题目文本
  if (!question.text || question.text.trim().length === 0) {
    errors.push('题目文本为空');
  }

  // 验证难度
  if (question.difficulty !== 'basic' && question.difficulty !== 'advanced') {
    errors.push(`难度值无效: ${question.difficulty}`);
  }

  // 验证正确答案ID
  if (!['a', 'b', 'c'].includes(question.correctAnswerId)) {
    errors.push(`正确答案ID无效: ${question.correctAnswerId}`);
  }

  // 验证选项数量
  if (!question.options || question.options.length !== 3) {
    errors.push(`选项数量不是3个: ${question.options?.length || 0}`);
  } else {
    // 验证每个选项
    const optionIds = new Set();
    let hasCorrectAnswer = false;

    question.options.forEach((option) => {
      // 验证选项ID
      if (!['a', 'b', 'c'].includes(option.id)) {
        errors.push(`选项ID无效: ${option.id}`);
      }

      // 检查选项ID重复
      if (optionIds.has(option.id)) {
        errors.push(`选项ID重复: ${option.id}`);
      }
      optionIds.add(option.id);

      // 验证选项文本
      if (!option.text || option.text.trim().length === 0) {
        errors.push(`选项 ${option.id} 文本为空`);
      }

      // 检查是否有正确答案
      if (option.id === question.correctAnswerId) {
        hasCorrectAnswer = true;
      }
    });

    // 验证正确答案存在
    if (!hasCorrectAnswer) {
      errors.push(`正确答案 ${question.correctAnswerId} 不在选项中`);
    }

    // 验证干扰项数量
    const distractors = question.options.filter(
      (opt) => opt.id !== question.correctAnswerId
    );
    if (distractors.length !== 2) {
      errors.push(`干扰项数量不是2个: ${distractors.length}`);
    }
  }

  // 输出验证结果
  if (errors.length > 0) {
    console.log(
      `❌ 题目 ${index + 1} [${question.difficulty}]: ${question.text}`
    );
    errors.forEach((error) => {
      console.log(`   - ${error}`);
    });
    hasErrors = true;
  } else {
    console.log(
      `✅ 题目 ${index + 1} [${question.difficulty === 'basic' ? '基础题' : '提升题'}]: ${question.text}`
    );
  }
});

// 验证题目内容相关性
console.log(`\n🔍 验证题目内容相关性:\n`);

const caveKeywords = [
  '钟乳石',
  '石笋',
  '石柱',
  '溶洞',
  '碳酸钙',
  '石灰岩',
  '石花',
  '石幔',
  '地下水',
  '沉积',
];

let relevantCount = 0;
questionsData.forEach((question) => {
  const text = question.text + ' ' + question.options.map((o) => o.text).join(' ');
  const hasKeyword = caveKeywords.some((keyword) => text.includes(keyword));
  if (hasKeyword) {
    relevantCount++;
  }
});

console.log(`包含溶洞相关关键词的题目: ${relevantCount}/${questionsData.length}`);
if (relevantCount > 0) {
  console.log('✅ 题目包含溶洞科学知识');
} else {
  console.error('❌ 题目不包含溶洞科学知识');
  hasErrors = true;
}

// 最终结果
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ 题库数据验证失败');
  process.exit(1);
} else {
  console.log('✅ 题库数据验证通过！');
  console.log('\n题库数据符合所有要求:');
  console.log('  ✓ 至少10道题目');
  console.log('  ✓ 包含基础题（10分）和提升题（20分）');
  console.log('  ✓ 每道题有3个选项');
  console.log('  ✓ 每道题有1个正确答案和2个干扰项');
  console.log('  ✓ 题目包含溶洞科学知识');
  process.exit(0);
}
