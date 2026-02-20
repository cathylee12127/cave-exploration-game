# 二维码扫码功能使用说明

## 问题说明

首页的二维码无法扫描的原因是:当你使用 `http://localhost:5174` 访问游戏时,二维码中编码的也是 localhost 地址,而手机无法访问电脑的 localhost。

## 解决方案

要让二维码可以扫描,需要使用**局域网 IP 地址**访问游戏,而不是 localhost。

### 方法 1: 使用配置脚本 (推荐)

1. 运行配置脚本获取局域网地址:
   ```bash
   cd cave-exploration-game
   node enable-mobile-access.js
   ```

2. 脚本会显示你的局域网地址,例如:
   ```
   🌐 游戏地址: http://192.168.3.170:5174
   ```

3. 在电脑浏览器中使用这个地址访问游戏:
   ```
   http://192.168.3.170:5174
   ```

4. 现在首页的二维码就可以扫描了!扫码后会直接跳转到游戏。

### 方法 2: 手动配置 Vite

1. 修改 `frontend/package.json`:
   ```json
   {
     "scripts": {
       "dev": "vite --host"
     }
   }
   ```

2. 重启前端服务器:
   ```bash
   cd cave-exploration-game/frontend
   npm run dev
   ```

3. Vite 会显示网络地址:
   ```
   ➜  Local:   http://localhost:5174/
   ➜  Network: http://192.168.3.170:5174/
   ```

4. 使用 Network 地址访问游戏。

## 二维码功能说明

### 登录页面二维码
- **位置**: 登录弹窗右侧
- **功能**: 扫码后直接访问游戏
- **要求**: 必须使用局域网 IP 地址访问

### 排名页面二维码
- **位置**: 游戏完成后的排名页面
- **功能**: 扫码分享游戏给其他人
- **要求**: 必须使用局域网 IP 地址访问

## 为什么需要局域网地址?

### localhost 的限制
- `localhost` 是一个特殊的域名,指向本机 (127.0.0.1)
- 手机无法访问电脑的 localhost
- 二维码中如果包含 localhost,手机扫码后会尝试访问手机自己的 localhost,而不是电脑

### 局域网 IP 的优势
- 局域网 IP (如 192.168.x.x) 是电脑在局域网中的真实地址
- 同一 WiFi 下的手机可以访问这个地址
- 二维码中包含局域网 IP,手机扫码后可以正确访问电脑上的游戏

## 使用流程示例

### 完整流程
1. **启动后端服务器**:
   ```bash
   cd cave-exploration-game/backend
   npm start
   ```

2. **启动前端服务器** (使用 --host):
   ```bash
   cd cave-exploration-game/frontend
   npm run dev -- --host
   ```

3. **获取局域网地址**:
   - 查看终端输出的 Network 地址
   - 或运行 `node enable-mobile-access.js`

4. **在电脑浏览器中访问局域网地址**:
   ```
   http://192.168.3.170:5174
   ```

5. **扫描二维码**:
   - 使用手机扫描登录页面的二维码
   - 手机会自动打开游戏

6. **开始游戏**:
   - 在手机上输入姓名
   - 开始答题

## 二维码显示逻辑

### 当前实现
```javascript
// 如果访问地址是 localhost,显示提示信息
if (currentURL.includes('localhost') || currentURL.includes('127.0.0.1')) {
  // 显示: "请使用局域网地址访问游戏"
  this.showLocalHostWarning();
  return;
}

// 否则生成真实的二维码
this.qrGenerator.generateToCanvas(targetURL, this.canvas, options);
```

### 提示信息
当使用 localhost 访问时,二维码区域会显示:
```
请使用局域网地址
访问游戏

运行以下命令获取地址:
node enable-mobile-access.js
```

## 二维码技术实现

### 使用的 API
- **QR Server API**: `https://api.qrserver.com/v1/create-qr-code/`
- 免费、可靠、无需注册
- 支持自定义颜色和大小

### 生成参数
```javascript
const qrURL = `https://api.qrserver.com/v1/create-qr-code/
  ?size=256x256
  &data=${encodeURIComponent(gameURL)}
  &color=2d1b3d  // 深紫色
  &bgcolor=ffffff  // 白色背景
`;
```

### 备用方案
如果 API 失败,会显示提示文字:
```
请使用局域网地址
访问游戏
```

## 常见问题

### Q1: 二维码显示"请使用局域网地址"
**A**: 你正在使用 localhost 访问游戏。请按照上述方法使用局域网 IP 地址访问。

### Q2: 扫码后无法访问
**A**: 检查以下几点:
1. 手机和电脑是否在同一 WiFi 网络
2. 电脑防火墙是否允许端口 5174 和 3000
3. 前端和后端服务器是否正在运行

### Q3: 二维码无法生成
**A**: 可能的原因:
1. 网络连接问题 (无法访问 QR Server API)
2. URL 过长 (超过二维码容量)
3. 浏览器安全策略限制

### Q4: 想要公网访问怎么办?
**A**: 局域网地址只能在同一 WiFi 下访问。如果需要公网访问:
1. 部署到云服务器 (参考 `DEPLOYMENT.md`)
2. 使用内网穿透工具 (如 ngrok, frp)
3. 配置路由器端口转发

## 测试二维码

### 测试页面
项目包含一个二维码测试页面:
```
cave-exploration-game/frontend/qrcode-test.html
```

访问方式:
```
http://192.168.3.170:5174/qrcode-test.html
```

### 测试步骤
1. 在电脑浏览器中打开测试页面
2. 输入要生成二维码的 URL
3. 点击"生成二维码"
4. 使用手机扫描测试

## 总结

要让二维码可以扫描:
1. ✅ 使用局域网 IP 地址访问游戏 (不是 localhost)
2. ✅ 确保手机和电脑在同一 WiFi
3. ✅ 确保防火墙允许相关端口
4. ✅ 扫码后即可在手机上玩游戏

**推荐命令**:
```bash
# 获取局域网地址
node enable-mobile-access.js

# 启动前端 (支持网络访问)
cd frontend
npm run dev -- --host
```
