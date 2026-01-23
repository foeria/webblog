# 快速部署指南

## 5 分钟快速启动

### 前置条件
- GitHub 账户
- Git 已安装
- Node.js 18+ 已安装

### 步骤 1：准备项目（2分钟）

```bash
# 进入项目根目录
cd blogweb

# 编辑配置文件 - 将 USERNAME 替换为你的 GitHub 用户名
# 编辑: my-blog/_config.yml
# 修改这两行：
# url: https://USERNAME.github.io/blog
# root: /blog/
```

### 步骤 2：初始化 Git 并推送（2分钟）

```bash
# 检查项目是否已是 Git 仓库
git status

# 如果未初始化，则初始化
git init

# 提交所有文件
git add .
git commit -m "初始化博客项目"

# 添加远程仓库（替换 USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/USERNAME/blogweb.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 步骤 3：配置 GitHub Pages（1分钟）

1. 打开 https://github.com/USERNAME/blogweb/settings
2. 左侧菜单选择 **Pages**
3. **Build and deployment** 部分：
   - Source: 选择 **Deploy from a branch**
   - Branch: 选择 **gh-pages** 和 **/(root)**
4. 点击 **Save**

### 完成！

- 部署日志查看：https://github.com/USERNAME/blogweb/actions
- 网站访问：https://USERNAME.github.io/blog/

---

## 常用操作

### 发布新文章

```bash
# 方法 1: 本地编辑 Markdown 文件
1. 创建文件: my-blog/source/_posts/new-article.md
2. 编辑内容
3. 提交并推送：
   git add .
   git commit -m "发布新文章：文章标题"
   git push

# 方法 2: 使用写作管理中心
1. 访问 http://localhost:4000/blog/writer/
2. 在左侧新建分类和文章
3. 点击"下载 Markdown"
4. 将文件放到 my-blog/source/_posts/
5. 提交并推送
```

### 本地预览

```bash
cd my-blog
npx hexo server
# 访问 http://localhost:4000/blog/
```

### 检查部署状态

```bash
# 运行部署检查脚本
./check-deployment.sh          # macOS/Linux
./check-deployment.bat         # Windows
```

---

## 常见问题排查

### 问题：GitHub Actions 失败

**解决步骤：**

1. 查看错误日志
   - 进入 https://github.com/USERNAME/blogweb/actions
   - 点击最新的 workflow run
   - 查看失败原因

2. 常见原因及解决：

| 错误 | 原因 | 解决 |
|------|------|------|
| `npm ERR!` | 依赖安装失败 | 检查 package.json 和 package-lock.json |
| `hexo: command not found` | Hexo 未安装 | 确认 package.json 中有 hexo 依赖 |
| `EACCES permission denied` | 权限问题 | 删除 node_modules 重新安装 |
| `Build failed` | 主题或配置问题 | 本地运行 `npx hexo generate` 测试 |

### 问题：网站发布后找不到

**检查：**

1. 是否配置了 GitHub Pages：
   ```
   Settings → Pages → 应显示"Your site is live at..."
   ```

2. 是否使用了正确的 URL：
   ```bash
   # 查看当前配置
   cd my-blog
   npx hexo config
   ```

3. 清空浏览器缓存或使用无痕模式访问

### 问题：文章链接 404

**原因：** URL 根路径配置错误

**解决：**
```yaml
# my-blog/_config.yml

# 如果部署到 GitHub Pages 子路径
url: https://USERNAME.github.io/blog
root: /blog/

# 如果部署到自定义域名
url: https://yourdomain.com
root: /
```

---

## 高级配置

### 使用自定义域名

1. 在 `.github/workflows/deploy.yml` 中修改 CNAME：

```yaml
- name: 部署到 GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./my-blog/public
    cname: yourdomain.com  # 改为你的域名
```

2. 在 DNS 提供商添加 CNAME 记录：
   ```
   主机名: www
   记录值: USERNAME.github.io
   ```

3. 配置 Hexo URL：

```yaml
# my-blog/_config.yml
url: https://yourdomain.com
root: /
```

### 手动部署命令

```bash
# 如果不想用 GitHub Actions，可以手动部署
cd my-blog

# 清空并重新生成
npm run build

# 手动推送到 GitHub Pages（需要配置）
npm run deploy
```

---

## 文件说明

| 文件 | 用途 |
|------|------|
| `.github/workflows/deploy.yml` | GitHub Actions 自动化配置 |
| `check-deployment.sh` | Linux/macOS 部署检查脚本 |
| `check-deployment.bat` | Windows 部署检查脚本 |
| `DEPLOYMENT_GUIDE.md` | 详细部署指南 |
| `QUICK_START.md` | 本文件 |

---

## 相关链接

- 🔗 [Hexo 官方文档](https://hexo.io/docs/)
- 🔗 [GitHub Pages 帮助](https://docs.github.com/en/pages)
- 🔗 [GitHub Actions 文档](https://docs.github.com/en/actions)
- 🔗 [Markdown 语法指南](https://markdown.com.cn/)

---

## 获取帮助

1. 检查本项目的 `DEPLOYMENT_GUIDE.md`
2. 查阅 GitHub Actions 日志
3. 搜索 [GitHub Discussions](https://github.com/hexojs/hexo/discussions)
4. 提交 Issue 或 Pull Request

---

祝你的博客运行愉快！ 🚀
