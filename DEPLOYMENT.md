# 溶洞探秘互动小游戏 - 部署指南

## 目录

1. [环境要求](#环境要求)
2. [本地开发部署](#本地开发部署)
3. [生产环境部署](#生产环境部署)
4. [Docker 部署](#docker-部署)
5. [HTTPS 配置](#https-配置)
6. [性能优化](#性能优化)
7. [监控和日志](#监控和日志)
8. [故障排查](#故障排查)

## 环境要求

### 最低要求
- Node.js >= 16.0.0
- npm >= 8.0.0
- SQLite3

### 推荐配置
- Node.js >= 18.0.0
- npm >= 9.0.0
- 2GB RAM
- 10GB 磁盘空间

## 本地开发部署

### 1. 克隆项目

```bash
git clone <repository-url>
cd cave-exploration-game
```

### 2. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 3. 配置环境变量

```bash
# 复制环境配置文件
cp .env.example .env

# 编辑 .env 文件，填入配置
```

### 4. 初始化数据库

```bash
cd backend
npm run db:init
npm run db:seed
```

### 5. 启动开发服务器

```bash
# 启动后端（终端1）
cd backend
npm run dev

# 启动前端（终端2）
cd frontend
npm run dev
```

### 6. 访问应用

打开浏览器访问: `http://localhost:5173`

## 生产环境部署

### 方案一：传统部署

#### 1. 准备服务器

- 操作系统: Ubuntu 20.04+ / CentOS 8+
- 安装 Node.js 和 npm
- 安装 Nginx（可选，用于反向代理）

#### 2. 上传代码

```bash
# 使用 git
git clone <repository-url>
cd cave-exploration-game

# 或使用 scp/rsync 上传
```

#### 3. 安装依赖

```bash
# 后端
cd backend
npm ci --production

# 前端
cd ../frontend
npm ci
```

#### 4. 配置环境变量

```bash
# 复制生产环境配置
cp .env.production.example .env.production

# 编辑配置文件
nano .env.production

# 重要：修改以下配置
# - SESSION_SECRET: 使用强随机字符串
# - CORS_ORIGIN: 设置为实际域名
# - VITE_API_BASE_URL: 设置为实际 API 地址
```

#### 5. 构建前端

```bash
cd frontend
npm run build
```

#### 6. 初始化数据库

```bash
cd backend
NODE_ENV=production npm run db:init
NODE_ENV=production npm run db:seed
```

#### 7. 启动后端服务

使用 PM2 管理进程：

```bash
# 安装 PM2
npm install -g pm2

# 启动后端
cd backend
pm2 start src/index.js --name cave-game-backend

# 设置开机自启
pm2 startup
pm2 save
```

#### 8. 配置 Nginx

创建 Nginx 配置文件 `/etc/nginx/sites-available/cave-game`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/cave-exploration-game/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/cave-game /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 方案二：Docker 部署

#### 1. 创建 Dockerfile（后端）

`backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --production

# 复制源代码
COPY . .

# 初始化数据库
RUN npm run db:init && npm run db:seed

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "src/index.js"]
```

#### 2. 创建 Dockerfile（前端）

`frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建
RUN npm run build

# 使用 Nginx 提供静态文件
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 3. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./backend/database:/app/database
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

#### 4. 启动服务

```bash
docker-compose up -d
```

## HTTPS 配置

### 使用 Let's Encrypt（推荐）

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 手动配置 SSL

更新 Nginx 配置：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... 其他配置
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 性能优化

### 1. 前端优化

```bash
# 构建时启用压缩
cd frontend
npm run build

# 分析包大小
npm run build -- --report
```

### 2. 后端优化

- 启用 Gzip 压缩
- 使用 Redis 缓存（可选）
- 配置数据库连接池
- 启用 HTTP/2

### 3. CDN 配置

将静态资源上传到 CDN：

```bash
# 上传到 CDN
aws s3 sync frontend/dist s3://your-bucket --acl public-read
```

更新前端配置使用 CDN URL。

## 监控和日志

### 1. PM2 监控

```bash
# 查看进程状态
pm2 status

# 查看日志
pm2 logs cave-game-backend

# 监控面板
pm2 monit
```

### 2. Nginx 日志

```bash
# 访问日志
tail -f /var/log/nginx/access.log

# 错误日志
tail -f /var/log/nginx/error.log
```

### 3. 应用日志

后端日志位置: `backend/logs/`

```bash
# 查看应用日志
tail -f backend/logs/app.log
```

## 故障排查

### 常见问题

#### 1. 数据库连接失败

```bash
# 检查数据库文件权限
ls -la backend/database/

# 重新初始化数据库
cd backend
npm run db:init
```

#### 2. CORS 错误

检查 `.env` 文件中的 `CORS_ORIGIN` 配置是否正确。

#### 3. 端口被占用

```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>
```

#### 4. 前端构建失败

```bash
# 清除缓存
cd frontend
rm -rf node_modules dist
npm install
npm run build
```

#### 5. 后端启动失败

```bash
# 检查日志
pm2 logs cave-game-backend

# 重启服务
pm2 restart cave-game-backend
```

### 性能问题

#### 1. 响应慢

- 检查数据库查询性能
- 启用缓存
- 优化前端资源加载

#### 2. 内存泄漏

```bash
# 监控内存使用
pm2 monit

# 重启服务
pm2 restart cave-game-backend
```

## 备份和恢复

### 数据库备份

```bash
# 备份数据库
cp backend/database/cave-game.db backend/database/cave-game.db.backup

# 定时备份（crontab）
0 2 * * * cp /path/to/backend/database/cave-game.db /path/to/backups/cave-game-$(date +\%Y\%m\%d).db
```

### 恢复数据库

```bash
# 恢复数据库
cp backend/database/cave-game.db.backup backend/database/cave-game.db

# 重启服务
pm2 restart cave-game-backend
```

## 安全建议

1. **使用强密码**: 修改 `SESSION_SECRET` 为强随机字符串
2. **启用 HTTPS**: 使用 SSL/TLS 加密通信
3. **限制 CORS**: 只允许信任的域名访问 API
4. **定期更新**: 保持依赖包和系统更新
5. **防火墙配置**: 只开放必要的端口
6. **日志监控**: 定期检查日志，发现异常行为
7. **备份策略**: 定期备份数据库和配置文件

## 扩展性

### 水平扩展

使用负载均衡器（如 Nginx）分发请求到多个后端实例：

```nginx
upstream backend {
    server backend1:3000;
    server backend2:3000;
    server backend3:3000;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

### 数据库扩展

考虑迁移到 PostgreSQL 或 MySQL 以支持更大规模的用户。

## 联系支持

如有问题，请联系：
- 邮箱: support@example.com
- 文档: https://docs.example.com
- GitHub: https://github.com/example/cave-game

## 更新日志

查看 `CHANGELOG.md` 了解版本更新信息。
