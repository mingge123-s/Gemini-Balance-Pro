# Gemini Balance Pro

## 项目简介

Gemini Balance Pro 是一个功能增强的 Gemini API 代理项目，基于 Next.js 构建，支持在 Vercel 上一键部署。相比原版 gemini-balance-lite，本项目新增了以下核心功能：

### 🚀 主要功能

- **🔄 智能负载均衡**: 自动在多个 API Key 之间轮换请求
- **📊 实时监控面板**: 可视化展示请求统计、成功率等数据
- **🔑 API Key 管理**: 可视化添加、删除、启用/禁用 API Key
- **📝 错误日志记录**: 详细记录每个请求的错误信息
- **📈 统计图表**: 直观展示各个 API Key 的使用情况
- **🌐 国内网络优化**: 专为国内网络环境优化的代理服务

### 📦 技术栈

- **前端**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Edge Functions
- **图表**: Recharts
- **部署**: Vercel (推荐)
- **样式**: Tailwind CSS + Lucide Icons

## 🚀 快速部署

### 1. 一键部署到 Vercel (推荐)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/gemini-balance-pro)

1. 点击上方按钮
2. 使用 GitHub 登录 Vercel
3. 导入此项目
4. 等待部署完成
5. 配置自定义域名（可选，但推荐用于国内访问）

### 2. 本地开发

```bash
# 克隆项目
git clone https://github.com/your-username/gemini-balance-pro.git
cd gemini-balance-pro

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 查看项目。

## 📖 使用说明

### 1. 访问管理面板

部署完成后，访问 `https://your-domain.vercel.app` 即可进入监控管理面板。

### 2. 添加 API Key

在管理面板的 "API Keys" 标签页中：
1. 输入 API Key 名称（可选）
2. 输入从 [AI Studio](https://aistudio.google.com/app/apikey) 获取的 Gemini API Key
3. 点击"添加"按钮

### 3. 使用代理 API

将你的 Gemini API 请求中的基础 URL：
```
https://generativelanguage.googleapis.com
```

替换为：
```
https://your-domain.vercel.app/api/gemini
```

例如：
```bash
# 原始请求
curl https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY

# 使用代理后
curl https://your-domain.vercel.app/api/gemini/v1beta/models/gemini-pro:generateContent
```

**注意**: 使用代理时无需在请求中包含 API Key，系统会自动选择可用的 Key。

### 4. 监控功能

- **总览页面**: 查看总请求数、错误数、成功率等统计信息
- **API Keys页面**: 管理 API Key，查看每个 Key 的使用情况
- **错误日志页面**: 查看详细的错误日志和请求记录

## 🔧 配置选项

### 环境变量 (可选)

项目支持通过环境变量进行配置：

```env
# 管理面板访问密码（可选，未设置时无需密码）
ADMIN_PASSWORD=your_secure_password

# 存储后端配置（可选，默认使用内存存储）
# 生产环境建议使用外部数据库
DATABASE_URL=your_database_url
```

### 自定义域名配置

为了在国内更好地访问，强烈建议配置自定义域名：

1. 在 Vercel 项目设置中添加自定义域名
2. 配置域名的 DNS 记录指向 Vercel
3. 等待 SSL 证书自动配置完成

## 📊 功能详解

### 负载均衡策略

- **随机选择**: 从可用的 API Key 中随机选择一个
- **自动故障转移**: 自动跳过被禁用的 API Key
- **实时监控**: 监控每个 Key 的使用情况和错误率

### 监控功能

- **实时统计**: 总请求数、错误数、成功率
- **Key 级监控**: 每个 API Key 的详细使用统计
- **可视化图表**: 使用 Recharts 生成的统计图表
- **错误日志**: 详细的错误信息和堆栈追踪

### 管理功能

- **Key 管理**: 添加、删除、启用/禁用 API Key
- **批量操作**: 支持批量启用/禁用多个 Key
- **数据清理**: 清空错误日志、重置统计数据

## 🔐 安全说明

- **访问控制**: 建议为管理面板配置密码保护
- **域名保护**: 不要在公开场所泄露管理面板地址
- **Key 安全**: API Key 仅存储在服务器端，不会泄露给客户端
- **日志清理**: 定期清理错误日志，避免存储敏感信息

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- 感谢 [tech-shrimp/gemini-balance-lite](https://github.com/tech-shrimp/gemini-balance-lite) 项目提供的灵感
- 感谢 Vercel 提供的优秀部署平台
- 感谢 Google 提供的 Gemini API 服务

## 🔗 相关链接

- [Google AI Studio](https://aistudio.google.com/) - 获取免费的 Gemini API Key
- [Vercel](https://vercel.com/) - 推荐的部署平台
- [Next.js 文档](https://nextjs.org/docs) - 了解更多 Next.js 用法

---

如果这个项目对你有帮助，请给它一个 ⭐ Star！
