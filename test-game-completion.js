/**
 * 测试游戏完成流程
 * 验证：
 * 1. 用户注册
 * 2. 答题并获得积分
 * 3. 标记游戏完成
 * 4. 查询排行榜
 */

async function testGameCompletion() {
  const baseURL = 'http://localhost:3000/api';
  
  console.log('=== 测试游戏完成流程 ===\n');

  try {
    // 1. 注册用户
    console.log('1. 注册测试用户...');
    const registerResponse = await fetch(`${baseURL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: '测试用户' + Date.now() })
    });
    const registerData = await registerResponse.json();
    console.log('   注册结果:', registerData);
    
    if (!registerData.success) {
      throw new Error('注册失败');
    }
    
    const userId = registerData.userId;
    console.log('   用户ID:', userId);

    // 2. 获取题目列表
    console.log('\n2. 获取题目列表...');
    const questionsResponse = await fetch(`${baseURL}/questions`);
    const questionsData = await questionsResponse.json();
    console.log('   题目数量:', questionsData.questions.length);

    // 3. 答对一道题
    if (questionsData.questions.length > 0) {
      const question = questionsData.questions[0];
      console.log('\n3. 答题测试...');
      console.log('   题目:', question.text);
      console.log('   正确答案ID:', question.correctAnswerId);
      
      const answerResponse = await fetch(`${baseURL}/questions/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          questionId: question.id,
          answerId: question.correctAnswerId
        })
      });
      const answerData = await answerResponse.json();
      console.log('   答题结果:', answerData);
    }

    // 4. 标记游戏完成
    console.log('\n4. 标记游戏完成...');
    const completeResponse = await fetch(`${baseURL}/users/${userId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('   响应状态:', completeResponse.status);
    console.log('   响应头:', completeResponse.headers.get('content-type'));
    const responseText = await completeResponse.text();
    console.log('   响应内容:', responseText.substring(0, 200));
    
    let completeData;
    try {
      completeData = JSON.parse(responseText);
      console.log('   完成标记结果:', completeData);
    } catch (e) {
      console.error('   无法解析 JSON 响应');
      throw new Error('API 返回了非 JSON 响应');
    }

    // 5. 查询排行榜
    console.log('\n5. 查询排行榜...');
    const rankingsResponse = await fetch(`${baseURL}/rankings?limit=10`);
    const rankingsData = await rankingsResponse.json();
    console.log('   排行榜数据:');
    if (rankingsData.rankings && rankingsData.rankings.length > 0) {
      rankingsData.rankings.forEach(rank => {
        console.log(`   ${rank.rank}. ${rank.username} - ${rank.score}分`);
      });
    } else {
      console.log('   排行榜为空');
    }

    console.log('\n=== 测试完成 ===');
  } catch (error) {
    console.error('\n测试失败:', error.message);
    console.error(error);
  }
}

testGameCompletion();
