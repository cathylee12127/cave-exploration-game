# 数据库设计文档

## 概述

溶洞探秘互动小游戏使用 SQLite 数据库存储用户信息、题库、答题记录和排名数据。数据库采用关系型设计，包含 4 个主要表和多个索引以优化查询性能。

## 数据库文件

- **位置**: `backend/database/cave-game.db`
- **类型**: SQLite 3
- **驱动**: better-sqlite3

## 表结构

### 1. Users 表

存储用户基本信息和游戏进度。

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PRIMARY KEY | 用户唯一标识符（UUID） |
| username | VARCHAR(50) | UNIQUE NOT NULL | 用户姓名（唯一） |
| score | INTEGER | DEFAULT 0 NOT NULL | 用户总积分 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP NOT NULL | 用户注册时间 |
| completed_at | TIMESTAMP | NULL | 游戏完成时间 |

**索引**:
- `idx_username`: 加速姓名唯一性检查
- `idx_score_time`: 复合索引，用于排名查询（按积分降序，时间升序）

**需求映射**: 1.2, 4.3, 5.1

### 2. Questions 表

存储题库信息。

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PRIMARY KEY | 题目唯一标识符（UUID） |
| text | TEXT | NOT NULL | 题目文本 |
| difficulty | VARCHAR(20) | NOT NULL, CHECK(difficulty IN ('basic', 'advanced')) | 题目难度（basic=10分，advanced=20分） |
| correct_answer_id | VARCHAR(10) | NOT NULL | 正确答案的选项ID（'a', 'b', 'c'） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP NOT NULL | 题目创建时间 |

**需求映射**: 4.3, 5.2, 5.3

### 3. Options 表

存储题目选项。

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PRIMARY KEY | 选项唯一标识符（UUID） |
| question_id | VARCHAR(36) | NOT NULL, FOREIGN KEY | 关联的题目ID |
| option_id | VARCHAR(10) | NOT NULL | 选项标识符（'a', 'b', 'c'） |
| text | TEXT | NOT NULL | 选项文本 |

**外键约束**:
- `question_id` → `questions(id)` ON DELETE CASCADE

**索引**:
- `idx_question`: 加速按题目查询选项

**需求映射**: 4.3, 4.4

### 4. Answers 表

存储用户答题记录。

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PRIMARY KEY | 答题记录唯一标识符（UUID） |
| user_id | VARCHAR(36) | NOT NULL, FOREIGN KEY | 关联的用户ID |
| question_id | VARCHAR(36) | NOT NULL, FOREIGN KEY | 关联的题目ID |
| selected_answer_id | VARCHAR(10) | NOT NULL | 用户选择的答案ID |
| is_correct | BOOLEAN | NOT NULL | 答案是否正确 |
| score_earned | INTEGER | NOT NULL | 本题获得的积分 |
| answered_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP NOT NULL | 答题时间 |

**外键约束**:
- `user_id` → `users(id)` ON DELETE CASCADE
- `question_id` → `questions(id)` ON DELETE CASCADE

**索引**:
- `idx_user_answers`: 加速按用户查询答题记录
- `idx_user_question`: 唯一索引，防止用户重复回答同一题目

**需求映射**: 4.5, 4.6, 4.7, 5.2, 5.3, 5.4

## 数据关系图

```
┌─────────────┐
│   Users     │
│─────────────│
│ id (PK)     │◄─────┐
│ username    │      │
│ score       │      │
│ created_at  │      │
│ completed_at│      │
└─────────────┘      │
                     │
                     │ user_id (FK)
                     │
┌─────────────┐      │     ┌─────────────┐
│  Questions  │      │     │   Answers   │
│─────────────│      │     │─────────────│
│ id (PK)     │◄─────┼─────┤ id (PK)     │
│ text        │      │     │ user_id     │
│ difficulty  │      │     │ question_id │
│ correct_ans │      └─────┤ selected_ans│
│ created_at  │            │ is_correct  │
└─────────────┘            │ score_earned│
       │                   │ answered_at │
       │                   └─────────────┘
       │ question_id (FK)
       │
       ▼
┌─────────────┐
│   Options   │
│─────────────│
│ id (PK)     │
│ question_id │
│ option_id   │
│ text        │
└─────────────┘
```

## 初始化数据库

### 方法 1: 使用 npm 脚本

```bash
cd backend
npm run db:init
```

### 方法 2: 直接运行初始化脚本

```bash
cd backend
node database/init.js
```

初始化脚本会：
1. 创建数据库文件 `cave-game.db`
2. 执行 `schema.sql` 创建所有表
3. 创建所有索引和外键约束
4. 验证表结构和索引是否正确创建

## 初始化题库数据

### 方法 1: 使用 npm 脚本

```bash
cd backend
npm run db:seed
```

### 方法 2: 直接运行种子脚本

```bash
cd backend
node database/seed.js
```

种子脚本会：
1. 插入12道溶洞科学知识题目
2. 包含6道基础题（10分）和6道提升题（20分）
3. 每道题包含1个正确答案和2个干扰项
4. 验证题库数据的完整性和正确性
5. 显示题库内容预览

**题库内容**：
- 基础题（10分）：钟乳石形成、石笋位置、石柱形成、溶洞岩石类型、钟乳石生长速度、水滴声来源
- 提升题（20分）：化学反应过程、溶洞形成时间、温度恒定原因、石花形成、最大溶洞系统、石幔景观

**注意**：如果数据库中已有题目数据，脚本会先清空现有数据再重新插入。

## 运行测试

```bash
cd backend
npm test database/schema.test.js
npm test database/seed.test.js
```

**schema.test.js** 测试覆盖：
- ✅ 所有表是否正确创建
- ✅ 所有列是否存在且类型正确
- ✅ 所有索引是否正确创建
- ✅ 唯一约束是否生效（username）
- ✅ 外键约束是否生效
- ✅ CHECK 约束是否生效（difficulty）
- ✅ 默认值是否正确（score = 0）
- ✅ 防止重复答题的唯一索引是否生效

**seed.test.js** 测试覆盖：
- ✅ 题库数据成功插入
- ✅ 题目数量至少10道
- ✅ 包含基础题和提升题
- ✅ 每道题有3个选项
- ✅ 每道题有1个正确答案和2个干扰项
- ✅ 题目难度只能是 basic 或 advanced
- ✅ 选项ID和正确答案ID是 a, b, c 之一
- ✅ 题目和选项文本不为空
- ✅ 题目包含溶洞科学知识
- ✅ 题目和选项ID唯一性
- ✅ 外键约束正常工作

## 使用数据库连接模块

```javascript
import database from './database/db.js';

// 连接数据库
database.connect();

// 查询所有用户
const users = database.query('SELECT * FROM users');

// 查询单个用户
const user = database.queryOne('SELECT * FROM users WHERE id = ?', ['user123']);

// 插入数据
const result = database.run(
  'INSERT INTO users (id, username, score) VALUES (?, ?, ?)',
  ['user123', '张三', 0]
);

// 执行事务
database.transaction((db) => {
  db.run('INSERT INTO users (id, username, score) VALUES (?, ?, ?)', ['user1', '李四', 0]);
  db.run('UPDATE users SET score = score + 10 WHERE id = ?', ['user1']);
});

// 关闭连接
database.close();
```

## 性能优化

### 索引策略

1. **idx_username**: 单列索引，优化姓名唯一性检查
   - 使用场景: 用户注册时检查姓名是否已存在
   - 查询示例: `SELECT * FROM users WHERE username = ?`

2. **idx_score_time**: 复合索引，优化排名查询
   - 使用场景: 获取排名列表
   - 查询示例: `SELECT * FROM users ORDER BY score DESC, created_at ASC`

3. **idx_question**: 单列索引，优化选项查询
   - 使用场景: 获取题目的所有选项
   - 查询示例: `SELECT * FROM options WHERE question_id = ?`

4. **idx_user_answers**: 单列索引，优化用户答题记录查询
   - 使用场景: 获取用户的所有答题记录
   - 查询示例: `SELECT * FROM answers WHERE user_id = ?`

5. **idx_user_question**: 唯一复合索引，防止重复答题
   - 使用场景: 插入答题记录时自动检查
   - 约束: 每个用户只能回答每道题目一次

### 外键约束

启用外键约束以保证数据完整性：

```javascript
db.pragma('foreign_keys = ON');
```

外键约束的好处：
- 防止插入无效的关联数据
- 级联删除（CASCADE）自动清理相关数据
- 保证数据一致性

## 数据迁移

如果需要修改表结构，建议：

1. 创建新的迁移脚本（如 `migration_001.sql`）
2. 在迁移脚本中使用 `ALTER TABLE` 语句
3. 更新 `schema.sql` 以反映最新结构
4. 在生产环境谨慎执行迁移

## 备份和恢复

### 备份数据库

```bash
cp backend/database/cave-game.db backend/database/cave-game.db.backup
```

### 恢复数据库

```bash
cp backend/database/cave-game.db.backup backend/database/cave-game.db
```

## 常见问题

### Q: 如何重置数据库？

A: 删除数据库文件并重新运行初始化脚本：

```bash
rm backend/database/cave-game.db
npm run db:init
```

### Q: 如何查看数据库内容？

A: 使用 SQLite 命令行工具或 GUI 工具（如 DB Browser for SQLite）：

```bash
sqlite3 backend/database/cave-game.db
.tables
.schema users
SELECT * FROM users;
```

### Q: 外键约束不生效？

A: 确保在连接数据库后启用外键约束：

```javascript
db.pragma('foreign_keys = ON');
```

### Q: 如何处理并发写入？

A: better-sqlite3 默认使用 WAL 模式，支持并发读取。对于写入操作，使用事务确保原子性：

```javascript
database.transaction((db) => {
  // 多个写操作
});
```

## 相关文件

- `schema.sql`: 数据库表结构定义
- `init.js`: 数据库初始化脚本
- `seed.js`: 题库数据初始化脚本
- `db.js`: 数据库连接模块
- `schema.test.js`: 数据库表结构测试
- `seed.test.js`: 题库数据测试
- `README.md`: 本文档
