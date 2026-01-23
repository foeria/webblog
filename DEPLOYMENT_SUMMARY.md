# GitHub Pages 部署配置总结

## ✅ 已为你配置完成的内容

### 1. GitHub Actions 工作流 (`.github/workflows/deploy.yml`)

**功能特性：**
- ✅ 自动监听 main 分支的更新
- ✅ 自动安装依赖和生成静态文件
- ✅ 自动部署到 GitHub Pages
- ✅ 缓存优化，加快构建速度
- ✅ 详细的构建日志和成功/失败提示
- ✅ 手动触发部署（workflow_dispatch）

**构建流程：**
```
推送代码 → GitHub Actions 自动构建 → 生成静态文件 → 推送到 gh-pages 分支 → 自动发布到 GitHub Pages
```

### 2. 部署检查脚本

- `check-deployment.sh` - Linux/macOS 检查脚本
- `check-deployment.bat` - Windows 检查脚本

**功能：**
- 验证项目结构
- 检查 Git 配置
- 验证 Node.js 和 Hexo
- 检查文章数量
- 显示部署提示

### 3. 详细文档

| 文档 | 用途 |
|------|------|
| `QUICK_START.md` | ⭐ 从这里开始（推荐） |
| `DEPLOYMENT_GUIDE.md` | 完整部署指南 |
| `DEPLOYMENT_SUMMARY.md` | 本文件 |

---

## 📋 你需要做的步骤

### 第 1 步：配置 Hexo URL（必须）

编辑 `my-blog/_config.yml`：

```yaml
# 找到这两行并修改
url: https://USERNAME.github.io/blog    # 将 USERNAME 替换为你的 GitHub 用户名
root: /blog/                             # 保持不变

# 如果使用自定义域名，改为：
# url: https://yourdomain.com
# root: /
```

### 第 2 步：初始化 Git 并推送到 GitHub

```bash
# 1. 检查是否已是 Git 仓库
git status

# 2. 如果不是，初始化
git init

# 3. 提交当前项目
git add .
git commit -m "初始化 Hexo 博客项目"

# 4. 添加远程仓库（创建 GitHub 仓库后）
git remote add origin https://github.com/USERNAME/blogweb.git

# 5. 推送到 GitHub
git branch -M main
git push -u origin main
```

### 第 3 步：在 GitHub 配置 Pages 设置

1. 打开你的仓库：https://github.com/USERNAME/blogweb
2. 点击右上角 **Settings**
3. 左侧菜单选择 **Pages**
4. **Build and deployment** 部分配置：
   - **Source**: 选择 `Deploy from a branch`
   - **Branch**: 选择 `gh-pages` 和 `/(root)`
5. 点击 **Save**

> GitHub Actions 会自动创建 `gh-pages` 分支

### 第 4 步：推送更新并验证

```bash
# 提交一个小改动以测试部署
git add .
git commit -m "测试 GitHub Actions 部署"
git push

# 查看部署状态
# https://github.com/USERNAME/blogweb/actions
```

### 第 5 步：访问你的网站

部署成功后访问：
```
https://USERNAME.github.io/blog/
```

> 首次部署可能需要 1-2 分钟，请耐心等待

---

## 🚀 之后的工作流

### 发布新文章

#### 方法 A：直接编辑 Markdown（推荐）

```bash
# 1. 创建新文章
cat > my-blog/source/_posts/my-article.md << 'EOF'
---
title: 我的第一篇文章
date: 2026-01-23
tags:
  - 标签1
  - 标签2
categories:
  - 分类名
---

这是文章内容，支持 Markdown 格式

更多内容...
EOF

# 2. 提交并推送
git add .
git commit -m "发布新文章：我的第一篇文章"
git push

# 完成！GitHub Actions 会自动部署
```

#### 方法 B：使用写作管理中心

1. 本地运行：`npm run server` (在 `my-blog` 目录)
2. 访问：http://localhost:4000/blog/writer/
3. 在左侧创建分类和文章
4. 编辑完成后，点击"下载 Markdown"
5. 将文件放到 `my-blog/source/_posts/`
6. 提交并推送

### 本地预览

```bash
cd my-blog
npm install          # 仅首次需要
npm run server       # 或 npx hexo server
# 访问 http://localhost:4000/blog/
```

---

## 📊 部署状态监控

### 查看部署日志

```
https://github.com/USERNAME/blogweb/actions
```

**日志说明：**
- 🟡 **黄色圆圈** = 正在部署
- 🟢 **绿色对号** = 部署成功
- 🔴 **红色叉号** = 部署失败

### 常见状态信息

| 消息 | 含义 | 处理方法 |
|------|------|---------|
| `npm ERR!` | 安装依赖失败 | 检查 package.json 依赖 |
| `hexo: not found` | Hexo 不可用 | 清空 node_modules 重装 |
| `Deployed successfully` | 部署成功 | ✅ 无需处理 |

---

## ⚙️ 可选配置

### 使用自定义域名

1. 编辑 `.github/workflows/deploy.yml`：

```yaml
      - name: 部署到 GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./my-blog/public
          cname: yourdomain.com  # 改为你的域名
```

2. 在 DNS 提供商配置（以 GoDaddy 为例）：
   - 类型: CNAME
   - 名称: @ 或 www
   - 值: USERNAME.github.io

3. 更新 `my-blog/_config.yml`：

```yaml
url: https://yourdomain.com
root: /
```

### 启用自动化工作流触发

工作流已配置为在以下情况自动运行：

- ✅ 推送到 main 分支
- ✅ 修改 `my-blog/` 目录下的文件
- ✅ 修改 `.github/workflows/deploy.yml` 文件
- ✅ 手动触发（Actions 页面的 Run workflow 按钮）

---

## 🔧 故障排查

### Q: 推送后没有自动部署

**检查：**
1. 确认推送到 main 分支：`git branch`
2. 查看 Actions 日志：https://github.com/USERNAME/blogweb/actions
3. 检查 workflow 文件是否在 `.github/workflows/deploy.yml`

### Q: 访问时 404

**原因可能：**
1. URL 配置错误（检查 `_config.yml` 中的 url 和 root）
2. 部署未完成（等待 Actions 运行完成）
3. gh-pages 分支未激活（GitHub Pages 设置）

### Q: 部署很慢

**优化：**
1. 检查是否缓存了依赖（已配置）
2. 减少文章大小（避免超大图片）
3. 删除不必要的 node_modules 文件

### Q: 本地生成成功，但 CI 失败

**解决：**
```bash
# 在本地删除缓存并重新生成
cd my-blog
rm -rf node_modules package-lock.json
npm install
npm run build  # 或 npx hexo generate
```

---

## 📚 相关资源

- 📖 [Hexo 官方文档](https://hexo.io/docs/)
- 📖 [GitHub Pages 帮助](https://docs.github.com/en/pages)
- 📖 [GitHub Actions 文档](https://docs.github.com/en/actions)
- 📖 [Markdown 完全指南](https://markdown.com.cn/)

---

## ✨ 项目结构

```
blogweb/
├── .github/
│   └── workflows/
│       └── deploy.yml                    # ⭐ GitHub Actions 配置
├── my-blog/
│   ├── _config.yml                       # Hexo 主配置（需要修改 url）
│   ├── package.json                      # Node.js 依赖
│   ├── themes/                           # 主题目录
│   │   └── modern-blog/
│   ├── source/
│   │   ├── _posts/                       # 📝 文章存放处
│   │   └── ...
│   └── public/                           # 生成的静态文件（不提交到 Git）
├── QUICK_START.md                        # ⭐ 快速开始指南
├── DEPLOYMENT_GUIDE.md                   # 完整部署指南
├── DEPLOYMENT_SUMMARY.md                 # 本文件
├── check-deployment.sh                   # Linux/macOS 检查脚本
└── check-deployment.bat                  # Windows 检查脚本
```

---

## 🎯 下一步行动

| 优先级 | 任务 | 时间 |
|--------|------|------|
| 🔴 必须 | 修改 `_config.yml` 中的 URL | 5 分钟 |
| 🔴 必须 | 推送到 GitHub | 5 分钟 |
| 🟡 应该 | 配置 GitHub Pages 设置 | 2 分钟 |
| 🟡 应该 | 验证部署成功 | 2 分钟 |
| 🟢 可选 | 配置自定义域名 | 10 分钟 |
| 🟢 可选 | 完成所有配置 | - |

---

## 💡 最佳实践

1. **定期备份** - 定期 push 到 GitHub
2. **本地测试** - 运行 `npm run server` 预览后再 push
3. **清晰的 commit 消息** - 便于追踪历史
4. **监控部署日志** - 及时发现问题

```bash
# 好的 commit 消息
git commit -m "发布新文章：JavaScript 高级特性介绍"
git commit -m "更新首页导航样式"
git commit -m "修复代码块显示问题"

# 不好的 commit 消息
git commit -m "update"
git commit -m "fix"
```

---

## 📞 需要帮助？

1. 查看本项目的文档
2. 查看 GitHub Actions 日志
3. 搜索 [Hexo 论坛](https://hexo.io/en/docs/)
4. 提交 Issue 或联系技术支持

---

**最后一步：运行检查脚本**

```bash
# macOS/Linux
./check-deployment.sh

# Windows
./check-deployment.bat
```

检查所有配置是否正确后，就可以开始发布文章了！🎉

---

祝你的博客部署成功！如有问题，欢迎查阅相关文档。
