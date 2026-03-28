# Render 部署指南（2026最新版）

## 🚀 第一步：获取 Hugging Face Token

1. 访问 https://huggingface.co
2. 注册/登录
3. 点击头像 → Settings → Access Tokens
4. 创建 "Read" 权限的 token
5. 复制 token（格式：`hf_xxxxxxxx`）

---

## 🌐 第二步：部署到 Render

### 2.1 注册 Render

1. 访问 https://render.com
2. 点击 "Get Started for Free"
3. 用 GitHub 登录

### 2.2 创建 Web Service

1. 点击 Dashboard 上的 **"New +"** 按钮
2. 选择 **"Web Service"**
3. 点击 **"Connect a repository"**
4. 选择你的 GitHub 仓库 `sope`
5. 点击 **"Connect"**

### 2.3 填写配置

在配置页面填写：

| 字段 | 值 |
|------|------|
| **Name** | `sope-api` |
| **Region** | `Oregon (US West)` 或 `Singapore` |
| **Branch** | `main` |
| **Runtime** | 选择 `Node` |
| **Build Command** | `cd server && npm install` |
| **Start Command** | `cd server && npm start` |
| **Instance Type** | 选择 `Free` |

> ⚠️ **注意**：如果没有 Root Directory 选项，在 Build Command 和 Start Command 前面加 `cd server &&`

### 2.4 添加环境变量

在 "Advanced" 或 "Environment Variables" 部分：

1. 点击 **"Add Environment Variable"**
2. 填写：

| Key | Value |
|-----|-------|
| `HF_API_KEY` | 你的 Hugging Face Token（`hf_xxxxxxxx`） |

### 2.5 部署

1. 检查所有配置
2. 点击 **"Create Web Service"** 或 **"Deploy"**
3. 等待 3-5 分钟

---

## 📝 第三步：获取 API 地址

部署成功后，页面顶部会显示：

```
https://sope-api.onrender.com
```

点击这个地址测试，应该看到：

```json
{
  "status": "ok",
  "message": "SOPE API is running",
  "endpoints": {
    "POST /api/generate-image": "Generate single image",
    "POST /api/generate-batch": "Generate batch images"
  }
}
```

---

## 🔧 第四步：更新前端代码

打开 `src/services/videoService.js`，确认第一行是你的 Render 地址：

```javascript
const PROXY_URL = 'https://你的应用名.onrender.com'
```

---

## ❓ 常见问题

### Q: 找不到 Root Directory 选项？

在 Build Command 和 Start Command 前面加：
```
cd server && npm install
cd server && npm start
```

### Q: 部署失败？

检查日志，常见原因：
1. `package.json` 不在根目录 - 使用上面的 `cd server &&` 方法
2. 环境变量没设置 - 确保 `HF_API_KEY` 已添加

### Q: 首次访问很慢？

Render 免费版有冷启动，首次访问需要 30-60 秒唤醒服务。

### Q: 如何避免冷启动？

使用外部定时服务（如 cron-job.org）每 14 分钟 ping 一次：
```
https://你的应用名.onrender.com/
```

---

## 💰 费用说明

| 项目 | 费用 | 商用 |
|------|------|------|
| Render | ✅ 免费（750小时/月） | ✅ 支持 |
| Hugging Face | ✅ 免费 | ✅ 支持 |
| **总计** | **0元** | ✅ |

---

## 🎉 完成！

部署完成后：
- 后端 API：`https://你的应用名.onrender.com`
- 前端：本地运行 `npm run dev`

**完全免费，支持商用！**
