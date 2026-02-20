// 测试 API
import http from 'http';

function testAPI(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    console.log('Testing /health...');
    const health = await testAPI('/health');
    console.log('✅ Health:', JSON.stringify(health, null, 2));
    
    console.log('\nTesting /api/questions...');
    const questions = await testAPI('/api/questions');
    console.log('✅ Questions:', JSON.stringify(questions, null, 2).substring(0, 500));
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

main();
