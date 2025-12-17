# 快速配置代理 - 3 步解决网络问题

## 🚀 快速步骤

### 步骤 1：找到你的代理端口

打开你的代理软件（Clash、V2Ray 等），查看 **HTTP 代理端口**：
- Clash 通常是：`7890`
- V2Ray 通常是：`10808`
- 其他软件查看设置中的 HTTP 端口

### 步骤 2：更新 .env.local 文件

在项目根目录 `app/.env.local` 文件中，添加一行：

```env
HTTPS_PROXY=http://127.0.0.1:你的端口号
```

**示例：**
- 如果端口是 7890：`HTTPS_PROXY=http://127.0.0.1:7890`
- 如果端口是 10808：`HTTPS_PROXY=http://127.0.0.1:10808`

**完整配置示例：**
```env
# Google AI Studio (Gemini) API Configuration
GOOGLE_AI_API_KEY=AIzaSyBrVje3_EdR6C_gPyJ5oBy4GLMUkDFFm3s
GOOGLE_AI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro
GOOGLE_AI_STREAM_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent

# 代理配置（添加这一行）
HTTPS_PROXY=http://127.0.0.1:7890
```

### 步骤 3：重启开发服务器

```bash
# 1. 停止当前服务器（按 Ctrl+C）
# 2. 重新启动
npm run dev
```

## ✅ 验证配置

启动服务器后，查看终端输出：

**如果看到：**
```
✅ HTTPS 代理已配置: http://127.0.0.1:7890
```
说明配置成功！

**如果看到：**
```
ℹ️ 未配置代理，将直接连接
```
说明代理未配置，需要检查 `.env.local` 文件。

## 🧪 测试

1. 访问：`http://localhost:50812/admin/article-titles`
2. 输入提示词
3. 点击"生成标题 (AI)"按钮
4. 如果成功，标题会逐个生成显示

## ❓ 常见问题

### Q: 不知道代理端口是多少？
**A:** 
- 打开代理软件
- 查看"设置"或"配置"
- 找到"HTTP 端口"或"本地端口"
- 通常是 7890 或 10808

### Q: 代理需要用户名密码？
**A:** 格式：`http://用户名:密码@127.0.0.1:端口`
例如：`HTTPS_PROXY=http://user:pass@127.0.0.1:7890`

### Q: 配置后还是不行？
**A:** 
1. 确认代理软件正在运行
2. 确认端口号正确
3. 尝试在浏览器访问 Google，确认代理正常
4. 查看服务器启动日志，确认代理配置被读取

### Q: 没有代理软件？
**A:** 
- 可以使用"模板生成"功能（虽然不是 AI，但可以正常使用）
- 或考虑使用 DeepSeek 等国内 AI 服务

## 📝 完整配置示例

`.env.local` 文件完整内容：

```env
# Google AI Studio (Gemini) API Configuration
GOOGLE_AI_API_KEY=AIzaSyBrVje3_EdR6C_gPyJ5oBy4GLMUkDFFm3s
GOOGLE_AI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro
GOOGLE_AI_STREAM_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent

# 代理配置（根据你的代理软件端口修改）
HTTPS_PROXY=http://127.0.0.1:7890
```

---

**提示**：配置完成后，必须重启开发服务器才能生效！

