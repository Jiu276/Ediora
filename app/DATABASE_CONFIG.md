# 数据库配置说明

## 数据库连接信息

已配置的数据库信息：
- **地址**: localhost
- **端口**: 3306
- **数据库名**: test1
- **用户名**: test1
- **密码**: cjiu123

## 配置步骤

### 1. 创建 .env 文件

在 `app` 目录下创建 `.env` 文件，内容如下：

```env
# 数据库连接配置
DATABASE_URL="mysql://test1:cjiu123@localhost:3306/test1"
```

### 2. 执行数据库初始化

使用以下命令执行 SQL 脚本创建数据库表：

```bash
# 方式1：使用MySQL命令行
mysql -u test1 -p test1 < database/schema.sql
# 输入密码：cjiu123

# 方式2：在MySQL客户端中执行
# 1. 登录MySQL
mysql -u test1 -p
# 输入密码：cjiu123

# 2. 执行SQL文件
source database/schema.sql;
```

### 3. 使用 Prisma 迁移（推荐）

```bash
# 1. 生成 Prisma Client
npm run db:generate

# 2. 推送 schema 到数据库（开发环境）
npm run db:push

# 或创建正式迁移
npm run db:migrate
```

## 验证连接

运行以下命令测试数据库连接：

```bash
# 启动开发服务器
npm run dev
```

如果连接成功，应用将正常启动。如果出现连接错误，请检查：
1. MySQL 服务是否运行
2. 数据库 `test1` 是否存在
3. 用户名和密码是否正确
4. 端口 3306 是否可访问

## 数据库信息

- **数据库名**: test1
- **字符集**: utf8mb4
- **排序规则**: utf8mb4_unicode_ci

## 注意事项

1. `.env` 文件包含敏感信息，不要提交到版本控制
2. 确保 MySQL 用户 `test1` 有足够的权限创建表和插入数据
3. 如果数据库不存在，SQL 脚本会自动创建

