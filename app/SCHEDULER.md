# 定时发布任务设置说明

## 概述

Ediora 支持定时发布功能，可以自动将设置了未来发布日期的草稿文章在到达发布时间时自动发布。

## 功能说明

### 工作原理

1. 用户在编辑文章时，可以设置未来的发布日期
2. 文章状态保持为"草稿"
3. 定时任务定期检查（建议每5分钟）
4. 当文章的 `publishDate` 小于等于当前时间时，自动将状态改为"已发布"

### API 端点

- `GET/POST /api/scheduler/publish` - 手动触发定时发布任务

## 设置定时任务

### 方法 1: 使用 Cron Job（推荐）

在生产环境中，建议使用系统的 cron job 来定期调用定时发布 API。

#### Linux/macOS

编辑 crontab：
```bash
crontab -e
```

添加以下行（每5分钟执行一次）：
```bash
*/5 * * * * curl -X POST http://localhost:50812/api/scheduler/publish
```

或者使用更安全的方式（需要认证）：
```bash
*/5 * * * * curl -X POST http://localhost:50812/api/scheduler/publish -H "Authorization: Bearer YOUR_API_KEY"
```

#### Windows

使用任务计划程序（Task Scheduler）：
1. 打开任务计划程序
2. 创建基本任务
3. 触发器：每5分钟
4. 操作：启动程序
5. 程序：`curl.exe`
6. 参数：`-X POST http://localhost:50812/api/scheduler/publish`

### 方法 2: 使用 Node.js 定时任务库

如果需要更复杂的定时任务管理，可以使用 `node-cron`：

```bash
npm install node-cron
```

创建 `app/lib/cron.ts`：
```typescript
import cron from 'node-cron'
import { checkAndPublishScheduledArticles } from './scheduler'

// 每5分钟执行一次
cron.schedule('*/5 * * * *', async () => {
  console.log('执行定时发布任务...')
  try {
    const result = await checkAndPublishScheduledArticles()
    console.log('定时发布结果:', result)
  } catch (error) {
    console.error('定时发布任务失败:', error)
  }
})
```

在 `app/layout.tsx` 或启动文件中导入：
```typescript
import './lib/cron'
```

### 方法 3: 使用外部服务

可以使用以下外部服务来定期调用 API：
- **Uptime Robot** - 免费监控服务，可以设置 HTTP 请求
- **EasyCron** - 专业的 cron 服务
- **Cron-job.org** - 免费的 cron 服务

## 测试

### 手动测试

1. 创建一篇草稿文章
2. 设置发布日期为未来时间（例如：5分钟后）
3. 等待到发布时间
4. 手动调用 API：
```bash
curl -X POST http://localhost:50812/api/scheduler/publish
```
5. 检查文章状态是否已自动改为"已发布"

### 查看定时发布状态

在文章列表页面，设置了未来发布日期的草稿文章会显示"定时发布"标签。

## 注意事项

1. **时区问题**：确保服务器时区与预期时区一致
2. **性能考虑**：定时任务执行频率不要太高（建议5分钟以上）
3. **错误处理**：定时任务应该有完善的错误处理和日志记录
4. **并发控制**：如果多个定时任务同时运行，需要添加锁机制防止重复执行

## 故障排查

### 文章没有自动发布

1. 检查定时任务是否正常运行
2. 检查 API 端点是否可访问
3. 检查文章的状态和发布日期设置
4. 查看服务器日志

### 定时任务执行失败

1. 检查数据库连接
2. 检查 Prisma 客户端是否正确初始化
3. 查看错误日志

## 未来改进

- [ ] 添加定时任务执行日志
- [ ] 支持自定义定时任务频率
- [ ] 添加定时任务执行历史记录
- [ ] 支持批量定时发布
- [ ] 添加定时任务监控和告警


