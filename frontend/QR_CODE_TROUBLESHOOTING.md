# 二维码显示问题排查指南

## 问题：网页上看不到二维码

### 快速测试

1. **打开测试页面**：
   ```bash
   # 确保前端服务器正在运行
   cd cave-exploration-game/frontend
   npm run dev
   ```

2. **访问测试页面**：
   打开浏览器访问：`http://localhost:5173/qrcode-test.html`
   
   这个页面会：
   - 显示当前 URL
   - 生成二维码
   - 显示生成状态
   - 提供下载功能

### 常见问题和解决方案

#### 问题 1: 二维码区域完全不显示

**可能原因**：
- JavaScript 模块加载失败
- 浏览器控制台有错误

**解决方法**：
1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签页是否有错误
3. 查看 Network 标签页，确认所有 JS 文件都成功加载

#### 问题 2: 二维码区域显示但是空白

**可能原因**：
- Canvas 渲染失败
- QRCodeGenerator 生成失败

**解决方法**：
1. 打开 `qrcode-test.html` 查看状态信息
2. 检查浏览器控制台是否有错误
3. 确认 Canvas 元素是否正确创建

#### 问题 3: 登录页面布局错乱

**可能原因**：
- CSS Flexbox 布局问题
- 容器宽度不足

**解决方法**：
1. 检查浏览器窗口宽度（建议 > 900px）
2. 打开开发者工具，检查元素的 CSS 样式
3. 查看 `.login-modal-container` 的 `display` 和 `flex` 属性

### 调试步骤

#### 步骤 1: 检查文件是否存在

确认以下文件存在：
- `src/utils/QRCodeGenerator.js`
- `src/components/QRCodeDisplay.js`
- `src/components/LoginModal.js`

#### 步骤 2: 检查导入语句

在浏览器控制台运行：
```javascript
// 检查 QRCodeDisplay 是否正确导入
console.log(window.location.href);
```

#### 步骤 3: 手动测试 QR 码生成

在浏览器控制台运行：
```javascript
// 创建测试 Canvas
const testCanvas = document.createElement('canvas');
testCanvas.width = 256;
testCanvas.height = 256;
document.body.appendChild(testCanvas);

// 尝试绘制简单图形
const ctx = testCanvas.getContext('2d');
ctx.fillStyle = '#2d1b3d';
ctx.fillRect(0, 0, 256, 256);
ctx.fillStyle = '#ffffff';
ctx.fillRect(50, 50, 156, 156);

// 如果能看到紫色背景和白色方块，说明 Canvas 工作正常
```

### 浏览器兼容性检查

确认你的浏览器支持：
- ✅ Canvas API
- ✅ ES6 Modules (import/export)
- ✅ CSS Flexbox
- ✅ CSS backdrop-filter

**推荐浏览器**：
- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

### 查看实际渲染的 HTML

在浏览器开发者工具中：
1. 打开 Elements 标签页
2. 找到 `.login-modal-overlay` 元素
3. 展开查看内部结构
4. 确认是否有 `.qr-section` 和 `.qrcode-display-container`

预期结构：
```html
<div class="login-modal-overlay">
  <div class="login-modal-container">
    <div class="login-section">
      <!-- 登录表单 -->
    </div>
    <div class="qr-section">
      <div class="qrcode-display-container">
        <div class="qrcode-title">📱 扫码畅玩</div>
        <div class="qrcode-subtitle">...</div>
        <div class="qrcode-canvas-container">
          <canvas class="qrcode-canvas"></canvas>
        </div>
        <div class="qrcode-hint">...</div>
        <button class="qrcode-download-button">💾 下载二维码</button>
      </div>
    </div>
  </div>
</div>
```

### 强制刷新

有时浏览器缓存会导致问题：
1. 按 `Ctrl + Shift + R` (Windows) 或 `Cmd + Shift + R` (Mac) 强制刷新
2. 或者清除浏览器缓存后重新加载

### 检查 CSS 样式

在开发者工具中检查 `.qr-section` 的样式：
```css
.qr-section {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}
```

如果 `display: none`，说明被隐藏了。

### 最小化测试

创建一个最简单的测试：

```html
<!DOCTYPE html>
<html>
<head>
    <title>Minimal QR Test</title>
</head>
<body>
    <h1>QR Code Test</h1>
    <canvas id="test" width="256" height="256" style="border: 1px solid black;"></canvas>
    
    <script>
        const canvas = document.getElementById('test');
        const ctx = canvas.getContext('2d');
        
        // 绘制简单的黑白方块图案
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 256, 256);
        
        ctx.fillStyle = 'black';
        for (let i = 0; i < 21; i++) {
            for (let j = 0; j < 21; j++) {
                if ((i + j) % 2 === 0) {
                    ctx.fillRect(i * 12, j * 12, 12, 12);
                }
            }
        }
        
        console.log('Canvas rendered successfully!');
    </script>
</body>
</html>
```

保存为 `minimal-test.html` 并在浏览器中打开。如果能看到棋盘图案，说明 Canvas 工作正常。

### 联系支持

如果以上方法都无法解决问题，请提供：
1. 浏览器版本和操作系统
2. 浏览器控制台的错误信息（截图）
3. Network 标签页的请求列表（截图）
4. Elements 标签页中 `.login-modal-overlay` 的 HTML 结构（截图）

## 成功标志

当二维码正确显示时，你应该看到：
- ✅ 登录弹窗左侧有姓名输入框
- ✅ 登录弹窗右侧有二维码区域
- ✅ 二维码区域有标题 "📱 扫码畅玩"
- ✅ 二维码图像清晰可见（黑白方块图案）
- ✅ 下方有 "💾 下载二维码" 按钮
- ✅ 点击下载按钮可以保存 PNG 文件
