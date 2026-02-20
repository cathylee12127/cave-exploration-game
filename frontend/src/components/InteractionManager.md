# InteractionManager - 交互管理器

## 概述

InteractionManager 负责处理用户与溶洞场景中交互点的交互，包括鼠标点击、悬停和触摸事件的检测与处理。

## 功能特性

### 1. 事件监听
- **鼠标事件**: click, mousemove
- **触摸事件**: touchstart, touchmove
- 自动处理事件坐标转换（屏幕坐标 → Canvas 坐标）

### 2. 交互检测
- **点击检测**: 检测用户点击是否在交互点范围内
- **悬停检测**: 检测鼠标/触摸是否悬停在交互点上
- **碰撞检测**: 使用圆形碰撞检测（默认半径 30 像素）

### 3. 状态过滤
- 只检测 `active` 状态的交互点
- 自动忽略 `completed` 状态的交互点
- 支持动态更新交互点列表

### 4. 回调机制
- 支持注册多个点击回调
- 支持注册多个悬停回调
- 自动错误处理，防止回调异常影响其他回调

## API 文档

### 构造函数

```javascript
const manager = new InteractionManager();
```

### 方法

#### initialize(canvas, interactionPoints)

初始化交互管理器

**参数:**
- `canvas` (HTMLCanvasElement): Canvas 元素
- `interactionPoints` (Array): 交互点数组（可选）

**示例:**
```javascript
manager.initialize(canvas, [
  { id: 'p1', x: 100, y: 100, state: 'active', questionId: 'q1' },
  { id: 'p2', x: 300, y: 200, state: 'active', questionId: 'q2' }
]);
```

#### updateInteractionPoints(interactionPoints)

更新交互点列表

**参数:**
- `interactionPoints` (Array): 新的交互点数组

**示例:**
```javascript
manager.updateInteractionPoints(newPoints);
```

#### detectClick(x, y)

检测点击位置是否在交互点范围内

**参数:**
- `x` (number): Canvas X 坐标
- `y` (number): Canvas Y 坐标

**返回:**
- `Object|null`: 被点击的交互点，如果没有则返回 null

**示例:**
```javascript
const point = manager.detectClick(150, 150);
if (point) {
  console.log('Clicked point:', point.id);
}
```

#### detectHover(x, y)

检测悬停位置是否在交互点范围内

**参数:**
- `x` (number): Canvas X 坐标
- `y` (number): Canvas Y 坐标

**返回:**
- `Object|null`: 被悬停的交互点，如果没有则返回 null

**示例:**
```javascript
const point = manager.detectHover(150, 150);
if (point) {
  console.log('Hovering point:', point.id);
}
```

#### onPointClick(callback)

注册点击回调

**参数:**
- `callback` (Function): 回调函数，接收交互点作为参数

**示例:**
```javascript
manager.onPointClick((point) => {
  console.log('Point clicked:', point.id);
  showQuizModal(point.questionId);
});
```

#### onPointHover(callback)

注册悬停回调

**参数:**
- `callback` (Function): 回调函数，接收交互点或 null 作为参数

**示例:**
```javascript
manager.onPointHover((point) => {
  if (point) {
    console.log('Hovering:', point.id);
    sceneRenderer.updateInteractionPoint(point.id, 'hover');
  } else {
    console.log('Not hovering any point');
  }
});
```

#### dispose()

清理资源，移除事件监听器

**示例:**
```javascript
manager.dispose();
```

## 使用示例

### 基本使用

```javascript
import { InteractionManager } from './InteractionManager.js';
import { SceneRenderer } from './SceneRenderer.js';

// 创建实例
const manager = new InteractionManager();
const renderer = new SceneRenderer();

// 初始化
const canvas = document.getElementById('game-canvas');
const interactionPoints = [
  { id: 'p1', x: 100, y: 100, state: 'active', questionId: 'q1' },
  { id: 'p2', x: 300, y: 200, state: 'active', questionId: 'q2' },
  { id: 'p3', x: 500, y: 400, state: 'active', questionId: 'q3' }
];

manager.initialize(canvas, interactionPoints);

// 注册点击回调
manager.onPointClick((point) => {
  console.log('Clicked:', point.id);
  // 显示问答弹窗
  showQuizModal(point.questionId);
});

// 注册悬停回调
manager.onPointHover((point) => {
  if (point) {
    // 高亮交互点
    renderer.updateInteractionPoint(point.id, 'hover');
  } else {
    // 取消所有高亮
    interactionPoints.forEach(p => {
      if (p.state === 'active') {
        renderer.updateInteractionPoint(p.id, 'active');
      }
    });
  }
});
```

### 与 StateManager 集成

```javascript
import { InteractionManager } from './InteractionManager.js';
import { StateManager } from '../utils/StateManager.js';

const manager = new InteractionManager();
const stateManager = new StateManager();

manager.initialize(canvas, stateManager.game.interactionPoints);

manager.onPointClick((point) => {
  // 检查是否已完成
  if (stateManager.user.completedQuestions.has(point.questionId)) {
    console.log('Question already answered');
    return;
  }
  
  // 显示问答弹窗
  showQuizModal(point.questionId);
});

// 监听状态变化，更新交互点
stateManager.on('questionCompleted', (questionId) => {
  const point = stateManager.game.interactionPoints.find(
    p => p.questionId === questionId
  );
  if (point) {
    point.state = 'completed';
    manager.updateInteractionPoints(stateManager.game.interactionPoints);
  }
});
```

### 响应式处理

```javascript
// 处理窗口大小变化
window.addEventListener('resize', () => {
  // 重新初始化以更新坐标转换
  manager.dispose();
  manager.initialize(canvas, interactionPoints);
});
```

## 交互点数据结构

```javascript
{
  id: string,           // 唯一标识符
  x: number,            // Canvas X 坐标（像素）
  y: number,            // Canvas Y 坐标（像素）
  state: string,        // 状态: 'active' | 'completed' | 'hover'
  questionId: string    // 关联的题目 ID
}
```

## 配置选项

### 点击检测半径

默认点击检测半径为 30 像素，可以通过修改 `clickRadius` 属性调整：

```javascript
manager.clickRadius = 40; // 增大检测范围
```

## 注意事项

1. **坐标系统**: InteractionManager 使用 Canvas 坐标系统（像素），不是百分比坐标
2. **状态过滤**: 只有 `active` 状态的交互点可以被点击和悬停
3. **事件顺序**: 悬停回调只在悬停状态改变时触发，避免重复调用
4. **触摸事件**: 触摸事件会自动调用 `preventDefault()` 防止默认行为
5. **资源清理**: 使用完毕后应调用 `dispose()` 清理资源

## 测试覆盖

InteractionManager 包含全面的单元测试，覆盖以下场景：

- ✅ 初始化和事件监听器注册
- ✅ 点击检测（精确点击、范围内点击、范围外点击）
- ✅ 悬停检测（精确悬停、范围内悬停、范围外悬停）
- ✅ 坐标转换（标准、缩放、偏移）
- ✅ 距离计算
- ✅ 回调注册和触发
- ✅ 鼠标事件处理
- ✅ 触摸事件处理
- ✅ 状态过滤（忽略 completed 状态）
- ✅ 交互点更新
- ✅ 资源清理
- ✅ 边缘情况（空数组、重叠点、大坐标、负坐标）

运行测试：
```bash
npm test -- InteractionManager.test.js
```

## 性能优化

1. **事件节流**: 悬停回调只在状态改变时触发
2. **状态过滤**: 提前过滤非 active 状态的交互点
3. **早期返回**: 找到第一个匹配的交互点后立即返回
4. **错误隔离**: 回调错误不会影响其他回调执行

## 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ 移动端浏览器（iOS Safari, Chrome Mobile）

## 相关组件

- **SceneRenderer**: 场景渲染器，负责绘制交互点
- **StateManager**: 状态管理器，管理交互点状态
- **QuizModal**: 问答弹窗，显示题目和选项
