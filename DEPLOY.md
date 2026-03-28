# Vercel 部署指南（完全免费）

## 📋 准备工作

1. 注册 GitHub 账号（免费）
2. 注册 Vercel 账号（免费）
3. 获取 Hugging Face Token（免费）

---

## 🚀 第一步：获取 Hugging Face Token

1. 访问 https://huggingface.co
2. 注册/登录
3. 点击右上角头像 → Settings
4. 左侧菜单 → Access Tokens
5. 点击 "New token"
6. 选择 "Read" 权限
7. 复制生成的 token（格式：`hf_xxxxxxxx`）

---

## 📦 第二步：上传代码到 GitHub

### 方法1：使用 Git 命令

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/sope.git
git push -u origin main
```

### 方法2：使用 GitHub Desktop

1. 下载 GitHub Desktop
2. 登录账号
3. File → Add Local Repository
4. 选择 `d:\sope` 文件夹
5. Publish repository

---

## 🌐 第三步：部署到 Vercel

1. 访问 https://vercel.com
2. 点击 "Sign Up" → 选择 "Continue with GitHub"
3. 登录后点击 "Add New..." → "Project"
4. 选择你刚才上传的 `sope` 仓库
5. 点击 "Import"
6. 在 "Environment Variables" 添加：
   - Name: `HF_API_KEY`
   - Value: 你的 Hugging Face Token（`hf_xxxxxxxx`）
7. 点击 "Deploy"
8. 等待2-3分钟部署完成

---

## ✅ 第四步：获取部署地址

部署完成后，Vercel 会给你一个免费域名：

```
https://sope-xxx.vercel.app
```

---

## 🔧 第五步：更新前端代码

如果域名不是 `sope-ai.vercel.app`，需要修改：

打开 `src/services/videoService.js`，修改第一行：

```javascript
const PROXY_URL = 'https://你的域名.vercel.app'
```

---

## 💰 费用说明

| 项目 | 费用 |
|------|------|
| Vercel 托管 | ✅ 免费 |
| Hugging Face API | ✅ 免费（有速率限制） |
| GitHub 仓库 | ✅ 免费 |
| **总计** | **✅ 完全免费** |

### Vercel 免费额度

- 100GB 流量/月
- 无限次部署
- 自动 HTTPS
- 全球 CDN

### Hugging Face 免费额度

- 每小时有限次请求
- 模型可能需要预热（首次调用等待30秒）

---

## ❓ 常见问题

### Q: 部署失败怎么办？

检查 `vercel.json` 和 `api/` 文件夹是否正确。

### Q: 图片生成很慢？

首次调用模型需要加载，等待30秒后重试。

### Q: 提示"模型正在加载中"？

正常现象，等待30秒后再次点击生成。

---

## 🎉 完成！

部署完成后，你的应用就可以免费生成图片了！
