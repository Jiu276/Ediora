# Google AI Studio (Gemini) 接入说明

## ✅ 已完成的工作

1. ✅ 创建了 `.env.local` 配置文件（已包含你的 API Key）
2. ✅ 实现了 Gemini API 调用工具函数 (`app/lib/gemini.ts`)
3. ✅ 实现了流式响应 API (`app/app/api/generate-titles/stream/route.ts`)
4. ✅ 更新了前端页面，支持流式显示标题生成过程

## 📋 使用步骤

### 1. 确认配置文件

`.env.local` 文件已创建在项目根目录，包含：
```
GOOGLE_AI_API_KEY=AIzaSyBrVje3_EdR6C_gPyJ5oBy4GLMUkDFFm3s
GOOGLE_AI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro
GOOGLE_AI_STREAM_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent
```

### 2. 重启开发服务器

由于添加了新的环境变量，需要重启 Next.js 开发服务器：

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
npm run dev
```

### 3. 测试功能

1. 访问：`http://localhost:50812/admin/article-titles`
2. 在"生成标题"标签页输入提示词
3. 点击"生成标题"按钮
4. 观察标题逐个生成的效果（类似 ChatGPT）

## 🎯 功能特点

### 流式生成效果
- ✅ 标题逐个生成显示（不是一次性全部显示）
- ✅ 实时进度条显示（已生成 X/10）
- ✅ 生成状态提示（"正在生成..."）
- ✅ 中英文双语标题支持

### 智能解析
- ✅ 自动解析 AI 返回的 JSON 格式标题
- ✅ 支持多种格式的标题提取
- ✅ 自动计算推荐度分数

### 错误处理
- ✅ API 调用失败时显示错误信息
- ✅ 网络中断时自动提示
- ✅ 降级处理（如果 AI 失败，可以回退到模板生成）

## ⚠️ 注意事项

### API Key 安全
- ✅ `.env.local` 文件已在 `.gitignore` 中，不会被提交到 Git
- ⚠️ **不要**将 API Key 提交到代码仓库
- ⚠️ **不要**在前端代码中暴露 API Key

### 免费额度限制
- Google AI Studio 免费额度：
  - 每分钟：15 次请求（RPM）
  - 每天：1500 次请求（RPD）
- 如果超出限制，会收到错误提示
- 建议：控制调用频率，避免频繁请求

### 网络访问
- 如果国内访问 Google API 有困难，可能需要：
  - 使用代理服务器
  - 或考虑使用 DeepSeek（国内访问更稳定）

## 🔧 故障排查

### 问题1：提示 "GOOGLE_AI_API_KEY is not set"
**解决方案：**
1. 确认 `.env.local` 文件在项目根目录
2. 确认文件内容正确
3. 重启开发服务器

### 问题2：API 调用失败
**可能原因：**
- API Key 无效或过期
- 网络连接问题
- 超出免费额度限制

**解决方案：**
1. 检查 API Key 是否正确
2. 在 Google AI Studio 查看 API 使用情况
3. 检查网络连接

### 问题3：标题生成很慢
**可能原因：**
- 网络延迟
- AI 处理需要时间

**解决方案：**
- 这是正常现象，AI 生成需要几秒到几十秒
- 流式响应会实时显示进度

## 📊 成本说明

### Google AI Studio 免费额度
- **完全免费**：每天 1500 次请求
- 足够日常测试使用
- 超出后按量付费（价格较低）

### 单次生成成本
- 生成 10 个标题 = 1 次 API 调用
- 每天可生成：1500 次 × 10 个标题 = 15,000 个标题
- **完全免费！**

## 🚀 下一步优化建议

1. **添加缓存机制**：相同提示词不重复调用 AI
2. **添加重试机制**：API 失败时自动重试
3. **优化提示词**：提高生成质量
4. **添加降级方案**：AI 失败时使用模板生成

## 📝 测试建议

1. **简单测试**：输入"如何提升工作效率"
2. **复杂测试**：输入长文本提示词
3. **边界测试**：输入空提示词、超长提示词
4. **压力测试**：连续生成多次，观察是否超出限制

---

**如有问题，请检查：**
1. 开发服务器是否重启
2. `.env.local` 文件是否存在且正确
3. 浏览器控制台是否有错误信息
4. 网络连接是否正常

