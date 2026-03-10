# 方案一实现示例：单应用 + 多数据库

## 目录结构
```
deployment-examples/solution-1-dynamic-db/
├── middleware.ts          # Next.js 中间件：域名识别和数据库切换
├── lib/
│   ├── db-router.ts       # 数据库路由逻辑
│   └── domain-mapping.ts  # 域名到数据库映射配置
├── nginx.conf             # Nginx 配置示例
├── docker-compose.yml     # Docker Compose 配置（可选）
└── scripts/
    ├── create-site.sh     # 创建新站点脚本
    └── init-databases.sh  # 初始化所有数据库脚本
```

## 核心实现

### 1. 域名到数据库映射配置
创建 `lib/domain-mapping.ts` 管理域名和数据库的映射关系。

### 2. Next.js 中间件
创建 `middleware.ts` 在请求处理前识别域名并切换数据库连接。

### 3. Prisma 动态数据源
修改 Prisma 配置支持动态数据源切换。

### 4. Nginx 反向代理
配置 Nginx 将所有域名请求转发到同一个 Next.js 应用。

## 使用说明

1. 配置域名映射表
2. 创建所有站点的数据库
3. 配置 Nginx 反向代理
4. 部署 Next.js 应用
5. 使用脚本创建新站点

