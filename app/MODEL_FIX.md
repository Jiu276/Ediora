# 模型名称修复说明

## 🔴 问题：404 错误 - 模型未找到

错误信息：`models/gemini-pro is not found`

**原因：** Google 已经更新了模型名称，`gemini-pro` 可能已经弃用或改名。

## ✅ 解决方案

### 已更新的模型名称

Google AI Studio 现在使用以下模型：

1. **gemini-1.5-flash**（推荐）
   - 免费且快速
   - 适合大多数场景
   - 已更新为默认模型

2. **gemini-1.5-pro**
   - 更强大但可能收费
   - 适合复杂任务

### 配置已更新

`.env.local` 文件已更新为使用 `gemini-1.5-flash`：

```env
GOOGLE_AI_MODEL=gemini-1.5-flash
GOOGLE_AI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash
GOOGLE_AI_STREAM_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent
```

## 🚀 下一步

1. **重启开发服务器**
   ```bash
   # 停止当前服务器（Ctrl+C）
   # 重新启动
   npm run dev
   ```

2. **查看启动日志**
   应该看到：
   ```
   📋 Gemini API 配置: { model: 'gemini-1.5-flash', ... }
   ```

3. **测试生成**
   - 访问标题生成页面
   - 输入提示词
   - 点击"生成标题 (AI)"按钮

## 🔍 如果还是不行

### 检查 1：确认模型名称
在 Google AI Studio 查看可用的模型：
- 访问：https://aistudio.google.com/
- 查看可用的模型列表

### 检查 2：尝试其他模型
如果 `gemini-1.5-flash` 不行，尝试：
```env
GOOGLE_AI_MODEL=gemini-1.5-pro
```

### 检查 3：检查 API 版本
尝试使用 `v1` 而不是 `v1beta`：
```env
GOOGLE_AI_API_VERSION=v1
```

## 📝 完整配置示例

```env
# Google AI Studio (Gemini) API Configuration
GOOGLE_AI_API_KEY=你的API密钥
GOOGLE_AI_MODEL=gemini-1.5-flash
GOOGLE_AI_API_VERSION=v1beta
GOOGLE_AI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash
GOOGLE_AI_STREAM_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent

# 代理配置（如果需要）
HTTPS_PROXY=http://127.0.0.1:7890
```

---

**重要：** 修改配置后必须重启开发服务器！

