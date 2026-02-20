# 登录功能调试指南

## 问题

点击"开始探秘"按钮后没有反应。

## 调试步骤

### 1. 检查浏览器控制台

1. 访问 `http://localhost:5174`
2. 按 F12 打开开发者工具
3. 切换到 Console 标签
4. 输入姓名（例如："张三"）
5. 点击"开始探秘"按钮
6. 查看控制台输出

### 预期的日志输出

如果一切正常，你应该看到：

```
[LoginModal] Button clicked, disabled: false
[LoginModal] Button enabled, calling handleSubmit
[LoginModal] handleSubmit called
[LoginModal] Username: 张三
[LoginModal] Validation result: {valid: true}
[LoginModal] Starting registration...
[LoginModal] Calling apiClient.registerUser...
[LoginModal] Registration result: {success: true, userId: "...", message: "注册成功"}
[LoginModal] Registration successful, triggering callbacks
Login successful, game started
```

### 可能的问题

#### 问题 1: 按钮被禁用

如果看到：
```
[LoginModal] Button clicked, disabled: true
[LoginModal] Button disabled, ignoring click
```

**原因**：按钮被禁用了
**解决**：检查姓名验证逻辑，确保输入的姓名符合要求

#### 问题 2: 验证失败

如果看到：
```
[LoginModal] Validation result: {valid: false, error: "..."}
```

**原因**：姓名验证失败
**解决**：
- 确保姓名不为空
- 确保姓名不超过 50 个字符
- 确保姓名只包含中文、英文、数字和下划线

#### 问题 3: 注册请求失败

如果看到：
```
[LoginModal] Registration error: ...
```

**原因**：API 请求失败
**解决**：
- 检查后端是否运行（`http://localhost:3000/health`）
- 检查网络连接
- 查看 Network 标签中的请求详情

#### 问题 4: 没有任何日志

如果点击按钮后没有任何日志输出：

**原因**：JavaScript 可能有错误
**解决**：
- 查看 Console 中是否有红色错误信息
- 检查是否有语法错误
- 确认页面已完全加载

### 2. 检查 Network 标签

1. 在开发者工具中切换到 Network 标签
2. 点击"开始探秘"按钮
3. 查看是否有 `/api/users/register` 请求
4. 点击该请求查看详情：
   - Request Headers
   - Request Payload
   - Response

### 3. 手动测试 API

访问测试页面：`http://localhost:5174/test-login.html`

1. 输入姓名
2. 点击"注册"按钮
3. 查看结果

如果这个页面可以成功注册，说明 API 正常，问题在前端代码。

### 4. 检查后端日志

查看后端终端的输出，看是否收到注册请求。

如果没有收到请求，说明前端没有发送请求。

### 5. 简化测试

在浏览器控制台直接运行：

```javascript
// 测试 API 客户端
const response = await fetch('/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: '测试用户' })
});
const data = await response.json();
console.log(data);
```

如果这个可以成功，说明 API 正常，问题在 LoginModal 组件。

## 常见解决方案

### 解决方案 1: 清除浏览器缓存

1. 按 Ctrl+Shift+Delete
2. 清除缓存
3. 刷新页面

### 解决方案 2: 硬刷新

按 Ctrl+Shift+R 强制刷新页面

### 解决方案 3: 检查姓名格式

确保输入的姓名：
- 不为空
- 不超过 50 个字符
- 只包含中文、英文、数字和下划线
- 不包含特殊字符或空格

### 解决方案 4: 重启服务器

```bash
# 停止前端（Ctrl+C）
cd frontend
npm run dev

# 停止后端（Ctrl+C）
cd backend
npm start
```

## 需要提供的信息

如果问题仍未解决，请提供：

1. **浏览器控制台的完整输出**（Console 标签）
2. **Network 标签中的请求详情**（如果有）
3. **后端终端的输出**
4. **输入的姓名**
5. **浏览器版本**

## 快速诊断命令

在浏览器控制台运行：

```javascript
// 检查 LoginModal 是否存在
console.log('LoginModal exists:', !!document.querySelector('.login-modal-overlay'));

// 检查按钮是否存在
const button = document.querySelector('.login-modal-start-button');
console.log('Button exists:', !!button);
console.log('Button disabled:', button?.disabled);

// 检查输入框
const input = document.querySelector('.login-modal-input');
console.log('Input exists:', !!input);
console.log('Input value:', input?.value);
```

这会告诉你组件是否正确渲染。
