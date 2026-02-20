# 📸 Vercel 配置详细步骤（图解版）

## 🎯 问题：Root Directory 里没有 frontend 选项

**解决方法：需要手动输入！**

---

## 📝 详细操作步骤

### 步骤 1：找到 Root Directory 配置

在 Vercel 的配置页面，你会看到这样的界面：

```
┌────────────────────────────────────────────┐
│ Configure Project                           │
├────────────────────────────────────────────┤
│                                             │
│ Framework Preset                            │
│ ┌─────────────────────────────────┐        │
│ │ Vite                        ▼   │        │
│ └─────────────────────────────────┘        │
│                                             │
│ Root Directory                              │
│ ┌─────────────────────────────────┐        │
│ │ ./                          ✎   │  ← 这里│
│ └─────────────────────────────────┘        │
│                                             │
└────────────────────────────────────────────┘
```

### 步骤 2：点击 Root Directory 输入框

1. **找到 "Root Directory" 这一行**
2. **点击输入框**（显示 `./` 的那个框）
3. 输入框会变成可编辑状态

### 步骤 3：清空并输入 frontend

1. **删除原来的内容**（通常是 `./`）
   - 按 `Ctrl + A`（全选）
   - 按 `Delete` 或 `Backspace`

2. **输入**: `frontend`
   - 注意：只输入 `frontend`，不要加 `/` 或 `./`
   - 正确：`frontend`
   - 错误：`./frontend` 或 `/frontend`

### 步骤 4：确认其他配置

确保其他配置也正确：

```
Framework Preset: Vite

Root Directory: frontend  ← 刚才输入的

Build Command: npm run build

Output Directory: dist

Install Command: npm install
```

### 步骤 5：点击 Deploy

配置完成后，点击页面底部的 **"Deploy"** 按钮。

---

## 🖼️ 界面示意图

### 修改前（错误）：
```
Root Directory
┌─────────────────────────────────┐
│ ./                          ✎   │  ← 默认值，会导致错误
└─────────────────────────────────┘
```

### 修改后（正确）：
```
Root Directory
┌─────────────────────────────────┐
│ frontend                    ✎   │  ← 正确的值
└─────────────────────────────────┘
```

---

## 🔍 如果找不到 Root Directory

有些情况下，Root Directory 可能被隐藏了。试试这些方法：

### 方法 1：展开高级设置

1. 在配置页面找到 **"Build and Output Settings"**
2. 点击旁边的 **"Override"** 或 **"Edit"** 按钮
3. 这会展开所有配置选项，包括 Root Directory

### 方法 2：向下滚动

Root Directory 配置可能在页面下方，向下滚动查看。

### 方法 3：使用搜索

1. 按 `Ctrl + F`（Windows）或 `Cmd + F`（Mac）
2. 搜索 "Root Directory"
3. 浏览器会高亮显示这个配置项

---

## ⚠️ 常见错误

### 错误 1：输入了错误的路径

❌ 错误示例：
- `./frontend`
- `/frontend`
- `frontend/`
- `cave-exploration-game/frontend`

✅ 正确示例：
- `frontend`

### 错误 2：没有保存配置

输入 `frontend` 后，确保：
1. 输入框外面点击一下（让输入框失去焦点）
2. 或者按 `Enter` 键
3. 确认输入框显示 `frontend`

### 错误 3：Framework Preset 选错了

确保 Framework Preset 选择的是 **Vite**，不是：
- ❌ Other
- ❌ Create React App
- ❌ Next.js
- ✅ Vite（正确）

---

## 📋 完整配置检查清单

部署前，请确认：

- [ ] Framework Preset = `Vite`
- [ ] Root Directory = `frontend`（手动输入）
- [ ] Build Command = `npm run build`
- [ ] Output Directory = `dist`
- [ ] Install Command = `npm install`

全部确认后，点击 **Deploy**。

---

## 🎬 操作视频步骤（文字版）

1. **打开 Vercel 配置页面**
   - 你应该已经在这个页面了

2. **定位 Root Directory**
   - 用眼睛找到 "Root Directory" 这几个字
   - 它通常在 Framework Preset 下面

3. **点击输入框**
   - 在 Root Directory 下面有一个输入框
   - 用鼠标点击这个输入框

4. **清空内容**
   - 按 Ctrl + A（全选）
   - 按 Delete（删除）

5. **输入 frontend**
   - 用键盘输入：f-r-o-n-t-e-n-d
   - 不要加任何符号

6. **确认输入**
   - 按 Enter 键
   - 或点击输入框外面

7. **检查显示**
   - 确认输入框显示：frontend

8. **点击 Deploy**
   - 滚动到页面底部
   - 点击蓝色的 "Deploy" 按钮

---

## 🆘 还是不行？试试这个方法

如果上面的方法都不行，可以尝试：

### 备用方案：只上传 frontend 文件夹

1. **删除当前的 Vercel 项目**
   - 进入 Vercel Dashboard
   - 找到你的项目
   - Settings → 最底部 → Delete Project

2. **在 GitHub 创建新仓库**
   - 访问 https://github.com/new
   - 仓库名：`cave-game-frontend`
   - 创建仓库

3. **只上传 frontend 文件夹的内容**
   - 打开你的 GitHub 仓库
   - 点击 "uploading an existing file"
   - 进入本地的 `cave-exploration-game/frontend` 文件夹
   - 选择里面的所有文件（不包括 frontend 文件夹本身）
   - 拖拽上传

4. **在 Vercel 重新导入**
   - 这次不需要设置 Root Directory
   - 因为 package.json 已经在根目录了

---

## 💡 提示

- Root Directory 是一个**文本输入框**，不是下拉选择框
- 你需要**手动输入** `frontend` 这个单词
- 输入时注意**不要有空格**
- 输入完记得**按 Enter 或点击外面**确认

---

## ✅ 成功标志

配置正确后，部署时你会看到：

```
✓ Cloning completed
✓ Running "install" command: npm install
✓ Found package.json in /vercel/path0/frontend
✓ Installing dependencies...
```

注意：应该显示 "Found package.json in /vercel/path0/frontend"

---

## 📞 需要帮助？

如果按照上面的步骤还是不行，请告诉我：

1. 你现在看到的界面是什么样的？
2. Root Directory 那一行显示什么？
3. 有没有 "Edit" 或 "Override" 按钮？

我会根据你的情况给出更具体的指导！
