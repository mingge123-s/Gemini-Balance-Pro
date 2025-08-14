# 部署和使用指南

## 🚀 快速开始

### 1. 本地测试

如果你想在本地测试项目，需要先安装 Node.js (版本 18+)，然后运行：

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 查看项目。

### 2. Vercel 部署

推荐使用 Vercel 进行部署，因为它专门为 Next.js 项目优化：

#### 方法一：通过 Git 仓库部署

1. 将项目上传到 GitHub 仓库
2. 访问 [Vercel](https://vercel.com/)
3. 导入 GitHub 仓库
4. 等待自动部署完成

#### 方法二：直接部署

1. 安装 Vercel CLI：
   ```bash
   npm i -g vercel
   ```

2. 在项目目录运行：
   ```bash
   vercel
   ```

3. 按照提示完成部署

### 3. 配置自定义域名 (重要)

为了在国内更好地访问，强烈建议配置自定义域名：

1. 在 Vercel 项目设置中添加你的域名
2. 在域名提供商处配置 DNS 记录：
   - 类型: CNAME
   - 名称: www (或其他子域名)
   - 值: your-project.vercel.app

## 📖 使用说明

### 管理面板访问

部署完成后，直接访问你的域名即可进入管理面板，例如：
- `https://your-domain.com`
- `https://your-project.vercel.app`

### API Key 管理

1. 在管理面板点击 "API Keys" 标签
2. 获取 Gemini API Key：
   - 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
   - 创建新的 API Key
   - 复制 API Key
3. 在面板中添加 API Key

### 使用代理 API

将原始的 Gemini API 请求：
```
https://generativelanguage.googleapis.com/v1beta/...
```

替换为：
```
https://your-domain.com/api/gemini/v1beta/...
```

或者：
```
https://your-domain.com/v1beta/...
```

### 示例请求

```bash
# 使用 curl 测试
curl -X POST \
  https://your-domain.com/api/gemini/v1beta/models/gemini-pro:generateContent \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [
      {
        "parts": [
          {
            "text": "Hello, world!"
          }
        ]
      }
    ]
  }'
```

## 🔧 高级配置

### 环境变量

你可以在 Vercel 项目设置中添加以下环境变量：

- `ADMIN_PASSWORD`: 管理面板访问密码（可选）
- `MAX_KEYS`: 最大 API Key 数量限制（默认 50）
- `LOG_RETENTION_DAYS`: 日志保留天数（默认 30 天）

### 数据持久化

当前版本使用内存存储，每次重启会丢失数据。如果需要数据持久化，可以：

1. 使用 Vercel KV 存储
2. 使用 Redis
3. 使用 PostgreSQL

## 🛠️ 故障排除

### 常见问题

1. **403 错误**
   - 检查 API Key 是否有效
   - 确认 API Key 没有被禁用

2. **429 错误（限速）**
   - Gemini API 有请求频率限制
   - 添加更多 API Key 来分散请求

3. **CORS 错误**
   - 已在代码中处理 CORS，如果仍有问题，检查请求头

### 监控建议

- 定期查看错误日志
- 监控各个 API Key 的使用情况
- 及时禁用出现大量错误的 Key

## 🔐 安全建议

1. **保护管理面板**
   - 不要公开管理面板 URL
   - 考虑设置访问密码
   - 定期更换 API Key

2. **域名安全**
   - 使用 HTTPS（Vercel 自动提供）
   - 考虑设置 Cloudflare 等 CDN

3. **监控使用**
   - 定期检查使用统计
   - 及时发现异常使用

## 📊 性能优化

1. **负载均衡**
   - 添加多个 API Key
   - 及时禁用故障 Key

2. **缓存策略**
   - 考虑在客户端实现缓存
   - 避免重复相同请求

3. **错误处理**
   - 实现客户端重试机制
   - 监控错误率

## 🆘 获取帮助

如果遇到问题，可以：

1. 查看错误日志页面
2. 检查 Vercel 部署日志
3. 参考 Next.js 官方文档

---

祝你使用愉快！ 🎉
