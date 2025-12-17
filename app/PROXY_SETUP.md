# 代理配置指南 - 解决 Google API 网络访问问题

## 🔧 配置方法

### 方法一：通过环境变量配置（推荐）

在 `.env.local` 文件中添加代理配置：

```env
# Google AI Studio (Gemini) API Configuration
GOOGLE_AI_API_KEY=AIzaSyBrVje3_EdR6C_gPyJ5oBy4GLMUkDFFm3s
GOOGLE_AI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro
GOOGLE_AI_STREAM_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent

# 代理配置（二选一）
# HTTPS 代理（推荐，用于 HTTPS 请求）
HTTPS_PROXY=http://127.0.0.1:7890

# 或 HTTP 代理（如果只有 HTTP 代理）
# HTTP_PROXY=http://127.0.0.1:7890
```

### 方法二：使用系统代理

如果你的系统已经配置了全局代理，可以：

1. **Windows 系统代理**
   - 设置 → 网络和 Internet → 代理
   - 配置代理服务器地址和端口

2. **通过环境变量设置系统代理**
   ```powershell
   # PowerShell
   $env:HTTPS_PROXY="http://127.0.0.1:7890"
   $env:HTTP_PROXY="http://127.0.0.1:7890"
   ```

## 📋 常见代理软件端口

| 代理软件 | 默认端口 | 配置示例 |
|---------|---------|---------|
| Clash | 7890 | `http://127.0.0.1:7890` |
| V2Ray | 10808 | `http://127.0.0.1:10808` |
| Shadowsocks | 1080 | `http://127.0.0.1:1080` |
| 自定义代理 | 自定义 | `http://你的代理地址:端口` |

## 🔍 如何找到你的代理端口

### Clash
1. 打开 Clash 客户端
2. 查看"端口"设置
3. 通常 HTTP 端口是 `7890`

### V2Ray
1. 打开 V2Ray 客户端
2. 查看"本地监听端口"
3. 通常 HTTP 端口是 `10808`

### 其他代理软件
查看软件的设置或配置文件，找到 HTTP/HTTPS 代理端口

## ✅ 配置步骤

### 步骤 1：找到你的代理端口

打开你的代理软件，查看 HTTP 代理端口（通常是 7890 或 10808）

### 步骤 2：更新 .env.local 文件

在项目根目录的 `.env.local` 文件中添加：

```env
HTTPS_PROXY=http://127.0.0.1:你的端口号
```

例如，如果端口是 7890：
```env
HTTPS_PROXY=http://127.0.0.1:7890
```

### 步骤 3：重启开发服务器

```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
npm run dev
```

### 步骤 4：测试

1. 访问标题生成页面
2. 输入提示词
3. 点击"生成标题 (AI)"按钮
4. 查看是否能正常生成

## 🧪 测试代理是否生效

### 方法一：查看服务器日志

启动服务器后，如果看到：
```
✅ HTTPS 代理已配置: http://127.0.0.1:7890
```
说明代理配置成功。

### 方法二：测试 API 调用

在浏览器控制台运行：
```javascript
fetch('https://generativelanguage.googleapis.com')
  .then(() => console.log('✅ 可以访问 Google API'))
  .catch(() => console.log('❌ 无法访问 Google API'))
```

## ⚠️ 注意事项

1. **代理必须运行**
   - 确保代理软件已启动
   - 确保代理可以访问 Google 服务

2. **端口要正确**
   - 确认代理软件的 HTTP 端口
   - 不要使用 SOCKS 端口（需要使用 HTTP 端口）

3. **需要认证的代理**
   - 如果代理需要用户名密码，格式：`http://用户名:密码@地址:端口`
   - 例如：`http://user:pass@127.0.0.1:7890`

4. **重启服务器**
   - 修改 `.env.local` 后必须重启开发服务器
   - 环境变量只在启动时加载

## 🔄 如果还是不行

### 方案 1：检查代理软件
- 确认代理软件正在运行
- 确认代理可以访问 Google 服务
- 尝试在浏览器中访问 Google，确认代理正常

### 方案 2：使用模板生成
- 如果代理配置困难，可以使用"模板生成"功能
- 虽然不是 AI 生成，但可以正常使用

### 方案 3：切换到其他 AI 服务
- 考虑使用 DeepSeek（国内访问稳定）
- 或使用通义千问、文心一言等国内服务

## 📞 需要帮助？

如果配置后仍然无法访问，请提供：
1. 代理软件名称和版本
2. 代理端口号
3. 服务器启动日志
4. 浏览器控制台的错误信息

