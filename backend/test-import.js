// 测试导入
console.log('Testing imports...');

try {
  console.log('1. Importing express...');
  const express = await import('express');
  console.log('✅ Express imported');
  
  console.log('2. Importing db...');
  const db = await import('./database/db.js');
  console.log('✅ DB imported');
  
  console.log('3. Importing users router...');
  const users = await import('./src/routes/users.js');
  console.log('✅ Users router imported');
  
  console.log('\n✅ All imports successful!');
} catch (err) {
  console.error('❌ Import failed:', err.message);
  console.error(err);
}
