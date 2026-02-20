/**
 * 启用移动端访问
 * 获取本机 IP 地址并显示访问链接
 */

import os from 'os';

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // 跳过内部地址和非 IPv4 地址
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

function displayMobileAccessInfo() {
  const ipAddress = getLocalIPAddress();
  const frontendPort = 5174;
  const backendPort = 3000;
  
  console.log('\n=============================================================');
  console.log('溶洞探秘游戏 - 移动端访问配置');
  console.log('=============================================================\n');
  
  console.log('📱 移动端访问步骤:\n');
  
  console.log('1. 确保手机和电脑连接到同一个 WiFi 网络\n');
  
  console.log('2. 在手机浏览器中访问以下地址:\n');
  console.log(`   🌐 游戏地址: http://${ipAddress}:${frontendPort}`);
  console.log(`   🔧 后端 API: http://${ipAddress}:${backendPort}\n`);
  
  console.log('3. 如果无法访问,请检查:\n');
  console.log('   - 电脑防火墙是否允许端口 5174 和 3000');
  console.log('   - 前端和后端服务器是否正在运行');
  console.log('   - 手机和电脑是否在同一网络\n');
  
  console.log('💡 提示:\n');
  console.log('   - 建议使用竖屏模式');
  console.log('   - 首次加载可能需要几秒钟');
  console.log('   - 支持触摸操作\n');
  
  console.log('🔥 Windows 防火墙配置 (如果需要):\n');
  console.log('   1. 打开 "Windows Defender 防火墙"');
  console.log('   2. 点击 "高级设置"');
  console.log('   3. 选择 "入站规则" -> "新建规则"');
  console.log('   4. 选择 "端口" -> "TCP" -> 输入 "5174,3000"');
  console.log('   5. 选择 "允许连接" -> 完成\n');
  
  console.log('📖 更多信息请查看: MOBILE_SUPPORT.md\n');
  
  console.log('=============================================================\n');
}

displayMobileAccessInfo();
