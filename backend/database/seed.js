/**
 * 题库初始化脚本
 * 插入溶洞科学知识题目
 */

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const { randomUUID } = require('crypto');

const DB_PATH = path.join(__dirname, 'cave-game.db');

/**
 * 题库数据
 * 包含基础题（10分）和提升题（20分）
 * 每道题包含1个正确答案和2个干扰项
 */
const questionsData = [
  // 基础题（10分）
  {
    text: '钟乳石是如何形成的？',
    difficulty: 'basic',
    correctAnswerId: 'a',
    options: [
      { id: 'a', text: '地下水中的碳酸钙沉积' },
      { id: 'b', text: '岩浆冷却凝固' },
      { id: 'c', text: '风化作用形成' },
    ],
  },
  {
    text: '石笋通常生长在溶洞的什么位置？',
    difficulty: 'basic',
    correctAnswerId: 'b',
    options: [
      { id: 'a', text: '溶洞顶部' },
      { id: 'b', text: '溶洞底部' },
      { id: 'c', text: '溶洞侧壁' },
    ],
  },
  {
    text: '石柱是由什么形成的？',
    difficulty: 'basic',
    correctAnswerId: 'c',
    options: [
      { id: 'a', text: '地震挤压' },
      { id: 'b', text: '人工雕刻' },
      { id: 'c', text: '钟乳石和石笋连接' },
    ],
  },
  {
    text: '溶洞主要是由什么岩石溶蚀形成的？',
    difficulty: 'basic',
    correctAnswerId: 'a',
    options: [
      { id: 'a', text: '石灰岩' },
      { id: 'b', text: '花岗岩' },
      { id: 'c', text: '玄武岩' },
    ],
  },
  {
    text: '钟乳石的生长速度大约是多少？',
    difficulty: 'basic',
    correctAnswerId: 'b',
    options: [
      { id: 'a', text: '每年1厘米' },
      { id: 'b', text: '每百年几厘米' },
      { id: 'c', text: '每月1毫米' },
    ],
  },
  {
    text: '溶洞中常见的水滴声是由什么引起的？',
    difficulty: 'basic',
    correctAnswerId: 'a',
    options: [
      { id: 'a', text: '地下水从钟乳石滴落' },
      { id: 'b', text: '地下河流动' },
      { id: 'c', text: '岩石碰撞' },
    ],
  },

  // 提升题（20分）
  {
    text: '碳酸钙沉积形成钟乳石的化学反应过程中，起关键作用的是什么？',
    difficulty: 'advanced',
    correctAnswerId: 'b',
    options: [
      { id: 'a', text: '氧气的氧化作用' },
      { id: 'b', text: '二氧化碳的溶解和释放' },
      { id: 'c', text: '氮气的固定作用' },
    ],
  },
  {
    text: '溶洞的形成需要经历多长时间？',
    difficulty: 'advanced',
    correctAnswerId: 'c',
    options: [
      { id: 'a', text: '几十年' },
      { id: 'b', text: '几百年' },
      { id: 'c', text: '数万至数百万年' },
    ],
  },
  {
    text: '为什么溶洞内的温度相对恒定？',
    difficulty: 'advanced',
    correctAnswerId: 'a',
    options: [
      { id: 'a', text: '深埋地下，不受外界气温影响' },
      { id: 'b', text: '地热持续加温' },
      { id: 'c', text: '水流调节温度' },
    ],
  },
  {
    text: '溶洞中的"石花"是如何形成的？',
    difficulty: 'advanced',
    correctAnswerId: 'b',
    options: [
      { id: 'a', text: '水流冲刷形成' },
      { id: 'b', text: '毛细作用和结晶作用' },
      { id: 'c', text: '微生物堆积' },
    ],
  },
  {
    text: '中国最大的溶洞系统位于哪个省份？',
    difficulty: 'advanced',
    correctAnswerId: 'c',
    options: [
      { id: 'a', text: '云南省' },
      { id: 'b', text: '四川省' },
      { id: 'c', text: '贵州省' },
    ],
  },
  {
    text: '溶洞中的"石幔"景观是如何形成的？',
    difficulty: 'advanced',
    correctAnswerId: 'a',
    options: [
      { id: 'a', text: '水沿洞壁流淌时碳酸钙沉积' },
      { id: 'b', text: '岩石层层剥落' },
      { id: 'c', text: '地下水位变化造成' },
    ],
  },
];

/**
 * 插入题库数据
 * @param {Database} db 数据库实例
 */
function seedQuestions(db) {
  try {
    console.log('🌱 开始插入题库数据...\n');

    // 检查是否已有数据
    const existingCount = db
      .prepare('SELECT COUNT(*) as count FROM questions')
      .get().count;

    if (existingCount > 0) {
      console.log(`⚠️  数据库中已有 ${existingCount} 道题目`);
      console.log('是否要清空现有数据并重新插入？(y/n)');
      // 在实际使用中，这里可以添加交互式确认
      // 为了自动化，我们直接清空
      console.log('清空现有题库数据...');
      db.prepare('DELETE FROM answers').run();
      db.prepare('DELETE FROM options').run();
      db.prepare('DELETE FROM questions').run();
      console.log('✅ 已清空现有数据\n');
    }

    // 开始事务
    const insertQuestions = db.transaction(() => {
      let basicCount = 0;
      let advancedCount = 0;

      questionsData.forEach((questionData, index) => {
        // 生成题目 ID
        const questionId = randomUUID();

        // 插入题目
        db.prepare(
          `INSERT INTO questions (id, text, difficulty, correct_answer_id, created_at)
           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`
        ).run(questionId, questionData.text, questionData.difficulty, questionData.correctAnswerId);

        // 插入选项
        questionData.options.forEach((option) => {
          const optionId = randomUUID();
          db.prepare(
            `INSERT INTO options (id, question_id, option_id, text)
             VALUES (?, ?, ?, ?)`
          ).run(optionId, questionId, option.id, option.text);
        });

        // 统计题目数量
        if (questionData.difficulty === 'basic') {
          basicCount++;
        } else {
          advancedCount++;
        }

        console.log(
          `✅ 题目 ${index + 1}: [${questionData.difficulty === 'basic' ? '基础题' : '提升题'}] ${questionData.text}`
        );
      });

      console.log(`\n📊 题库统计:`);
      console.log(`   - 基础题（10分）: ${basicCount} 道`);
      console.log(`   - 提升题（20分）: ${advancedCount} 道`);
      console.log(`   - 总计: ${basicCount + advancedCount} 道`);
    });

    // 执行事务
    insertQuestions();

    console.log('\n✅ 题库数据插入成功！');
  } catch (err) {
    console.error('❌ 插入题库数据失败:', err.message);
    throw err;
  }
}

/**
 * 验证题库数据
 * @param {Database} db 数据库实例
 */
function verifyQuestions(db) {
  try {
    console.log('\n🔍 验证题库数据...\n');

    // 验证题目数量
    const questionCount = db
      .prepare('SELECT COUNT(*) as count FROM questions')
      .get().count;
    console.log(`✅ 题目总数: ${questionCount}`);

    // 验证基础题和提升题数量
    const basicCount = db
      .prepare("SELECT COUNT(*) as count FROM questions WHERE difficulty = 'basic'")
      .get().count;
    const advancedCount = db
      .prepare("SELECT COUNT(*) as count FROM questions WHERE difficulty = 'advanced'")
      .get().count;
    console.log(`✅ 基础题数量: ${basicCount}`);
    console.log(`✅ 提升题数量: ${advancedCount}`);

    // 验证每道题都有3个选项
    const questionsWithOptions = db
      .prepare(
        `SELECT q.id, q.text, COUNT(o.id) as option_count
         FROM questions q
         LEFT JOIN options o ON q.id = o.question_id
         GROUP BY q.id`
      )
      .all();

    let allValid = true;
    questionsWithOptions.forEach((q) => {
      if (q.option_count !== 3) {
        console.error(`❌ 题目 "${q.text}" 的选项数量不正确: ${q.option_count}`);
        allValid = false;
      }
    });

    if (allValid) {
      console.log(`✅ 所有题目都有3个选项`);
    }

    // 验证每道题的正确答案存在
    const questionsWithCorrectAnswer = db
      .prepare(
        `SELECT q.id, q.text, q.correct_answer_id,
                (SELECT COUNT(*) FROM options o 
                 WHERE o.question_id = q.id AND o.option_id = q.correct_answer_id) as has_correct
         FROM questions q`
      )
      .all();

    let allHaveCorrect = true;
    questionsWithCorrectAnswer.forEach((q) => {
      if (q.has_correct === 0) {
        console.error(`❌ 题目 "${q.text}" 的正确答案 "${q.correct_answer_id}" 不存在`);
        allHaveCorrect = false;
      }
    });

    if (allHaveCorrect) {
      console.log(`✅ 所有题目的正确答案都存在`);
    }

    // 验证选项总数
    const optionCount = db
      .prepare('SELECT COUNT(*) as count FROM options')
      .get().count;
    console.log(`✅ 选项总数: ${optionCount} (应为 ${questionCount * 3})`);

    if (optionCount !== questionCount * 3) {
      console.error(`❌ 选项总数不正确`);
      allValid = false;
    }

    if (allValid && allHaveCorrect) {
      console.log('\n✅ 题库数据验证通过！');
    } else {
      throw new Error('题库数据验证失败');
    }
  } catch (err) {
    console.error('❌ 验证题库数据失败:', err.message);
    throw err;
  }
}

/**
 * 显示题库内容
 * @param {Database} db 数据库实例
 */
function displayQuestions(db) {
  try {
    console.log('\n📚 题库内容预览:\n');

    const questions = db
      .prepare(
        `SELECT id, text, difficulty, correct_answer_id
         FROM questions
         ORDER BY difficulty, created_at`
      )
      .all();

    questions.forEach((question, index) => {
      console.log(`\n${index + 1}. [${question.difficulty === 'basic' ? '基础题 10分' : '提升题 20分'}]`);
      console.log(`   ${question.text}`);

      const options = db
        .prepare(
          `SELECT option_id, text
           FROM options
           WHERE question_id = ?
           ORDER BY option_id`
        )
        .all(question.id);

      options.forEach((option) => {
        const isCorrect = option.option_id === question.correct_answer_id;
        console.log(`   ${option.option_id.toUpperCase()}. ${option.text} ${isCorrect ? '✓' : ''}`);
      });
    });
  } catch (err) {
    console.error('❌ 显示题库内容失败:', err.message);
    throw err;
  }
}

// 主函数
function main() {
  let db;
  try {
    console.log('🚀 开始初始化题库...\n');

    // 连接数据库
    db = new Database(DB_PATH);
    db.pragma('foreign_keys = ON');
    console.log('✅ 数据库连接成功\n');

    // 插入题库数据
    seedQuestions(db);

    // 验证题库数据
    verifyQuestions(db);

    // 显示题库内容
    displayQuestions(db);

    console.log('\n✅ 题库初始化完成！');
    console.log(`📁 数据库文件: ${DB_PATH}`);
  } catch (error) {
    console.error('\n❌ 题库初始化失败:', error.message);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    if (db) {
      db.close();
      console.log('\n🔒 数据库连接已关闭');
    }
  }
}

// 如果直接运行此脚本，执行初始化
if (require.main === module) {
  main();
}

// 导出函数供其他模块使用
module.exports = { seedQuestions, verifyQuestions, displayQuestions, questionsData };
