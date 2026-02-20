/**
 * 生成游戏访问二维码图片
 * 可以直接扫描的二维码
 */

import os from 'os';
import fs from 'fs';
import https from 'https';

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

async function generateQRCode() {
  const ipAddress = getLocalIPAddress();
  const frontendPort = 5174;
  const gameURL = `http://${ipAddress}:${frontendPort}`;
  
  console.log('\n=============================================================');
  console.log('溶洞探秘游戏 - 二维码生成');
  console.log('=============================================================\n');
  
  console.log('📱 游戏地址:', gameURL);
  console.log('🔄 正在生成二维码...\n');
  
  // 使用 QR Server API 生成二维码
  const size = 500;
  const encodedURL = encodeURIComponent(gameURL);
  const qrAPIURL = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedURL}&color=2d1b3d&bgcolor=ffffff&margin=20`;
  
  const outputPath = 'game-qrcode.png';
  
  try {
    await downloadImage(qrAPIURL, outputPath);
    
    console.log('✅ 二维码生成成功!\n');
    console.log('📁 保存位置:', outputPath);
    console.log('📏 图片尺寸:', `${size}x${size} 像素\n`);
    
    console.log('📱 使用方法:\n');
    console.log('1. 打开生成的二维码图片: game-qrcode.png');
    console.log('2. 使用手机扫描二维码');
    console.log('3. 手机会自动打开游戏\n');
    
    console.log('💡 提示:\n');
    console.log('- 确保手机和电脑在同一 WiFi 网络');
    console.log('- 确保前端和后端服务器正在运行');
    console.log('- 可以打印二维码或在屏幕上显示\n');
    
    console.log('🖨️  打印建议:\n');
    console.log('- 推荐打印尺寸: 10cm x 10cm 或更大');
    console.log('- 确保打印清晰,避免模糊');
    console.log('- 可以贴在展示区域供用户扫描\n');
    
    console.log('=============================================================\n');
  } catch (error) {
    console.error('❌ 二维码生成失败:', error.message);
    console.error('\n可能的原因:');
    console.error('1. 网络连接问题');
    console.error('2. QR Server API 不可用');
    console.error('\n备用方案:');
    console.error('1. 访问在线二维码生成器: https://www.qr-code-generator.com/');
    console.error('2. 输入游戏地址:', gameURL);
    console.error('3. 下载生成的二维码\n');
  }
}

function downloadImage(url, outputPath) {
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

generateQRCode();
