/**
 * 生成固定URL的二维码
 * 用于部署后的公网地址
 */

import fs from 'fs';
import https from 'https';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (error) => {
      fs.unlink(outputPath, () => {});
      reject(error);
    });
  });
}

async function generateFixedQRCode() {
  console.log('\n=============================================================');
  console.log('溶洞探秘游戏 - 固定二维码生成器');
  console.log('=============================================================\n');
  
  console.log('💡 使用说明:');
  console.log('   - 输入你的游戏公网地址(部署后的域名)');
  console.log('   - 生成的二维码可以永久使用');
  console.log('   - 任何人扫码都可以访问游戏\n');
  
  console.log('📝 示例地址:');
  console.log('   - https://your-game.vercel.app');
  console.log('   - https://your-game.netlify.app');
  console.log('   - https://yourdomain.com\n');
  
  const gameURL = await question('请输入游戏地址: ');
  
  if (!gameURL || gameURL.trim().length === 0) {
    console.log('\n❌ 地址不能为空');
    rl.close();
    return;
  }
  
  const trimmedURL = gameURL.trim();
  
  // 验证URL格式
  try {
    new URL(trimmedURL);
  } catch (error) {
    console.log('\n❌ 地址格式不正确,请输入完整的URL(包含 http:// 或 https://)');
    rl.close();
    return;
  }
  
  console.log('\n🔄 正在生成二维码...\n');
  
  // 生成多个尺寸的二维码
  const sizes = [
    { size: 300, name: 'game-qrcode-small.png', desc: '小尺寸(适合屏幕显示)' },
    { size: 500, name: 'game-qrcode-medium.png', desc: '中尺寸(适合打印)' },
    { size: 1000, name: 'game-qrcode-large.png', desc: '大尺寸(高清打印)' }
  ];
  
  for (const { size, name, desc } of sizes) {
    try {
      const encodedURL = encodeURIComponent(trimmedURL);
      const qrAPIURL = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedURL}&color=2d1b3d&bgcolor=ffffff&margin=20`;
      
      await downloadImage(qrAPIURL, name);
      console.log(`✅ ${desc}: ${name}`);
    } catch (error) {
      console.log(`❌ ${desc} 生成失败:`, error.message);
    }
  }
  
  console.log('\n=============================================================');
  console.log('✅ 二维码生成完成!');
  console.log('=============================================================\n');
  
  console.log('📁 生成的文件:\n');
  console.log('   1. game-qrcode-small.png  (300x300) - 屏幕显示');
  console.log('   2. game-qrcode-medium.png (500x500) - 普通打印');
  console.log('   3. game-qrcode-large.png  (1000x1000) - 高清打印\n');
  
  console.log('📱 使用方法:\n');
  console.log('   - 打开任意二维码图片');
  console.log('   - 用手机扫描');
  console.log('   - 任何人都可以访问游戏\n');
  
  console.log('🖨️  打印建议:\n');
  console.log('   - 小尺寸: 5cm x 5cm');
  console.log('   - 中尺寸: 10cm x 10cm');
  console.log('   - 大尺寸: 20cm x 20cm 或更大\n');
  
  console.log('💡 提示:\n');
  console.log('   - 这些二维码是固定的,可以永久使用');
  console.log('   - 可以打印多份分发给不同的人');
  console.log('   - 可以贴在展示区域供公众扫描\n');
  
  console.log('🔗 二维码内容:', trimmedURL);
  console.log('\n=============================================================\n');
  
  rl.close();
}

generateFixedQRCode();
