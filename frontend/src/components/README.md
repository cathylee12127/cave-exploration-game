# SceneRenderer - 溶洞场景渲染器

## 概述

SceneRenderer 是溶洞探秘游戏的核心渲染组件，负责绘制高清写实的溶洞场景，包括钟乳石、石笋、石柱和光影效果。

## 功能特性

### 1. 溶洞背景渲染 (需求 2.1, 2.6)

- **径向渐变背景**: 使用深蓝、暗紫色调融合，从中心向外渐变
- **岩壁纹理**: 通过随机半透明圆形模拟岩石表面纹理
- **色调配色**: 深蓝 (#1a2a3a)、暗紫 (#2d1b3d)、土黄 (#8b7355)、灰褐 (#5a4a3a)

### 2. 钟乳石渲染 (需求 2.2)

- **自然垂坠形态**: 使用二次贝塞尔曲线绘制锥形结构
- **碳酸钙结晶光泽**: 线性渐变模拟光泽效果
- **高光和阴影**: 添加高光线条和阴影边缘，增强立体感

### 3. 石笋渲染 (需求 2.3)

- **底部粗壮、顶部尖锐**: 使用二次贝塞尔曲线绘制特征形态
- **水流侵蚀痕迹**: 绘制垂直线条模拟水流侵蚀效果
- **渐变着色**: 从底部阴影到中部土黄色的自然过渡

### 4. 石柱渲染 (需求 2.4)

- **上下自然衔接**: 钟乳石和石笋连接形成石柱
- **过渡效果**: 中间连接部分使用渐变实现自然过渡
- **统一光影**: 整体光影效果协调一致

### 5. 光影效果 (需求 2.7, 9.3)

- **主光源**: 从左上角发散的径向渐变光
- **次光源**: 从右下角发散的次要光源
- **微光效果**: 使用半透明渐变模拟微弱光线

### 6. 交互点系统 (需求 3.1, 3.2, 3.5)

- **微弱光斑**: 浅灰、淡米白色的光点
- **状态变化**: 支持 active、hover、completed 三种状态
- **视觉反馈**: hover 状态下光点提亮，completed 状态下变暗

### 7. 响应式设计 (需求 2.9)

- **自适应尺寸**: 根据窗口尺寸自动调整画布大小
- **保持质量**: 在不同设备上保持视觉质量

## API 接口

### 构造函数

```javascript
const renderer = new SceneRenderer();
```

### 初始化

```javascript
renderer.initialize(canvas);
```

**参数**:
- `canvas` (HTMLCanvasElement): Canvas 元素

**抛出**:
- 如果 canvas 为 null，抛出 "Canvas element is required"
- 如果无法获取 2D 上下文，抛出 "Failed to get 2D context"

### 渲染场景

```javascript
renderer.render();
```

渲染完整的溶洞场景，包括背景、光影、钟乳石、石笋、石柱和交互点。

### 添加交互点

```javascript
renderer.addInteractionPoint(point);
```

**参数**:
- `point` (Object): 交互点对象
  - `id` (string): 唯一标识符
  - `x` (number): X 坐标（0-1 之间的百分比）
  - `y` (number): Y 坐标（0-1 之间的百分比）
  - `state` (string): 状态 ('active' | 'hover' | 'completed')
  - `questionId` (string): 关联的题目 ID

**抛出**:
- 如果 point 无效，抛出 "Invalid interaction point"

### 更新交互点状态

```javascript
renderer.updateInteractionPoint(id, state);
```

**参数**:
- `id` (string): 交互点 ID
- `state` (string): 新状态 ('active' | 'hover' | 'completed')

### 处理窗口大小变化

```javascript
renderer.handleResize();
```

自动调整画布尺寸并重新渲染场景。

### 清理资源

```javascript
renderer.dispose();
```

清理所有资源，包括交互点数组和 canvas 引用。

## 使用示例

```javascript
import { SceneRenderer } from './components/SceneRenderer.js';

// 创建渲染器实例
const renderer = new SceneRenderer();

// 获取 canvas 元素
const canvas = document.getElementById('game-canvas');

// 初始化渲染器
renderer.initialize(canvas);

// 渲染场景
renderer.render();

// 添加交互点
renderer.addInteractionPoint({
  id: 'p1',
  x: 0.3,
  y: 0.4,
  state: 'active',
  questionId: 'q1'
});

// 更新交互点状态（悬停）
renderer.updateInteractionPoint('p1', 'hover');

// 监听窗口大小变化
window.addEventListener('resize', () => {
  renderer.handleResize();
});

// 清理资源
renderer.dispose();
```

## 色调配色方案

| 颜色名称 | 十六进制值 | 用途 |
|---------|-----------|------|
| deepBlue | #1a2a3a | 背景深蓝色 |
| darkPurple | #2d1b3d | 背景暗紫色 |
| midPurple | #3d2a4d | 背景中紫色 |
| earthYellow | #8b7355 | 石笋土黄色 |
| grayBrown | #5a4a3a | 钟乳石灰褐色 |
| lightBrown | #a89070 | 高光浅褐色 |
| highlight | #d4c4a8 | 高光色 |
| shadow | #0f1419 | 阴影色 |
| pointActive | rgba(220, 220, 200, 0.6) | 活跃交互点 |
| pointHover | rgba(240, 240, 220, 0.9) | 悬停交互点 |
| pointCompleted | rgba(150, 150, 140, 0.3) | 完成交互点 |

## 性能优化

- **按需渲染**: 只在状态变化时重新渲染
- **资源清理**: dispose() 方法清理所有资源
- **响应式设计**: 根据设备尺寸调整渲染分辨率

## 测试覆盖

- ✅ 初始化测试
- ✅ 渲染测试
- ✅ 交互点添加和更新测试
- ✅ 响应式设计测试
- ✅ 错误处理测试
- ✅ 资源清理测试

## 需求验证

| 需求 ID | 描述 | 状态 |
|---------|------|------|
| 2.1 | 显示包含钟乳石、石笋、石柱的溶洞内景 | ✅ 已实现 |
| 2.6 | 使用深蓝、暗紫与土黄、灰褐色调融合的配色方案 | ✅ 已实现 |
| 2.7 | 实现微光从岩壁缝隙发散的光影效果 | ✅ 已实现 |
| 9.3 | 确保所有视觉元素贴合溶洞主题 | ✅ 已实现 |

## 未来改进

- [ ] 添加水珠滴落动画 (需求 2.5, 2.8)
- [ ] 添加钟乳石反光动画
- [ ] 添加苔藓质感纹理
- [ ] 优化渲染性能（使用离屏 canvas）
- [ ] 添加更多交互点样式


---

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

## API 接口

### 构造函数

```javascript
const manager = new InteractionManager();
```

### 初始化

```javascript
manager.initialize(canvas, interactionPoints);
```

**参数**:
- `canvas` (HTMLCanvasElement): Canvas 元素
- `interactionPoints` (Array): 交互点数组（可选）

### 更新交互点

```javascript
manager.updateInteractionPoints(interactionPoints);
```

**参数**:
- `interactionPoints` (Array): 新的交互点数组

### 检测点击

```javascript
const point = manager.detectClick(x, y);
```

**参数**:
- `x` (number): Canvas X 坐标
- `y` (number): Canvas Y 坐标

**返回**:
- `Object|null`: 被点击的交互点，如果没有则返回 null

### 检测悬停

```javascript
const point = manager.detectHover(x, y);
```

**参数**:
- `x` (number): Canvas X 坐标
- `y` (number): Canvas Y 坐标

**返回**:
- `Object|null`: 被悬停的交互点，如果没有则返回 null

### 注册点击回调

```javascript
manager.onPointClick((point) => {
  console.log('Point clicked:', point.id);
});
```

### 注册悬停回调

```javascript
manager.onPointHover((point) => {
  if (point) {
    console.log('Hovering:', point.id);
  }
});
```

### 清理资源

```javascript
manager.dispose();
```

## 使用示例

```javascript
import { InteractionManager } from './components/InteractionManager.js';

// 创建实例
const manager = new InteractionManager();

// 初始化
const canvas = document.getElementById('game-canvas');
const interactionPoints = [
  { id: 'p1', x: 100, y: 100, state: 'active', questionId: 'q1' },
  { id: 'p2', x: 300, y: 200, state: 'active', questionId: 'q2' }
];

manager.initialize(canvas, interactionPoints);

// 注册点击回调
manager.onPointClick((point) => {
  console.log('Clicked:', point.id);
  showQuizModal(point.questionId);
});

// 注册悬停回调
manager.onPointHover((point) => {
  if (point) {
    renderer.updateInteractionPoint(point.id, 'hover');
  }
});
```

## 测试覆盖

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

## 需求验证

| 需求 ID | 描述 | 状态 |
|---------|------|------|
| 3.3 | 鼠标悬停或触摸交互点时提供视觉反馈 | ✅ 已实现 |
| 3.4 | 点击交互点触发问答弹窗 | ✅ 已实现 |

详细文档请参考 `InteractionManager.md`。
