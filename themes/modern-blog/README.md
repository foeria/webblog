# Modern Blog Theme

一个现代化、响应式的 Hexo 编程博客主题，采用 Material Design 风格，具有优雅的视觉设计和流畅的交互体验。

## 🌟 特性

- ✨ 现代化设计，采用梯度色彩和卡片布局
- 📱 完全响应式，适配所有设备
- 🎯 分类、标签、归档等完整功能
- 💡 搜索功能支持（可扩展）
- 🌈 浅色/深色模式支持
- ⚡ 高性能，代码简洁高效
- 🎨 自定义配置灵活
- 📊 SEO 友好

## 📋 内置分类

主题预设了以下分类（您可以自定义）：

- **前端开发** - JavaScript、React、Vue 等前端技术
- **后端开发** - Node.js、数据库、API 设计
- **技术分享** - 工具推荐、开发技巧、行业动态
- **问题排查** - 常见问题、调试技巧、解决方案
- **学习笔记** - 知识总结、源码解析、深度理解
- **项目实战** - 完整项目、案例分享、经验总结

## 🚀 快速开始

### 1. 更新 Hexo 配置

编辑 `_config.yml`:

```yaml
# Site
title: 我的编程博客
subtitle: 分享编程知识和技术实践
description: 一个专注于编程技术分享的博客
author: Your Name
language: zh-CN

# Theme
theme: modern-blog

# URL
url: https://yourblog.com
```

### 2. 启用分类和标签生成器

确保 `package.json` 中已安装这些生成器：

```json
{
  "dependencies": {
    "hexo-generator-category": "^2.0.0",
    "hexo-generator-tag": "^2.0.0",
    "hexo-generator-archive": "^2.0.0"
  }
}
```

### 3. 创建文章

```bash
hexo new post "我的第一篇文章"
```

编辑文件 `source/_posts/my-first-article.md`:

```markdown
---
title: 我的第一篇文章
date: 2026-01-21
categories:
  - 前端开发
tags:
  - JavaScript
  - React
excerpt: 这是文章摘要
---

这是文章内容...
```

### 4. 生成和预览

```bash
npm run build
npm run server
```

访问 `http://localhost:4000` 查看博客。

## 🎨 主题配置

在 `themes/modern-blog` 下创建 `_config.yml` 配置文件：

```yaml
# 导航菜单
menu:
  首页: /
  分类: /categories/
  标签: /tags/
  归档: /archives/

# 页脚信息
footer:
  about: 关于你的描述
  social:
    GitHub: https://github.com/yourname
    Twitter: https://twitter.com/yourname

# 侧边栏
sidebar: true

# 分页
paginate: 10
```

## 📝 Markdown 前置属性

```yaml
---
title: 文章标题
date: 2026-01-21
updated: 2026-01-22
categories:
  - 分类1
  - 分类2
tags:
  - 标签1
  - 标签2
excerpt: 文章摘要（显示在文章列表中）
---
```

## 🛠️ 定制指南

### 修改颜色

编辑 `source/css/style.css` 中的 CSS 变量：

```css
:root {
    --primary-color: #6366f1;
    --primary-dark: #4f46e5;
    --secondary-color: #ec4899;
    /* ... 更多颜色 ... */
}
```

### 添加自定义页面

1. 创建新的 EJS 文件在 `layout/` 文件夹
2. 在 `_config.yml` 中配置路由
3. 在 `source/` 目录中创建对应的 markdown 文件

### 修改导航菜单

编辑 `layout/nav.ejs` 中的导航项

## 📱 页面结构

- **主页** (`/`) - 展示最新文章和分类概览
- **分类页** (`/categories/`) - 浏览所有分类
- **标签页** (`/tags/`) - 浏览所有标签
- **归档页** (`/archives/`) - 按时间查看文章
- **分类文章页** (`/categories/分类名/`) - 特定分类的文章
- **标签文章页** (`/tags/标签名/`) - 特定标签的文章
- **文章详情页** - 单篇文章详情

## 🔍 功能特性详解

### 1. 响应式设计

- 桌面版：完整三栏布局
- 平板版：两栏布局
- 手机版：单栏布局，导航折叠

### 2. 交互效果

- 卡片悬停效果
- 平滑过渡动画
- 导航菜单响应式切换
- 返回顶部按钮

### 3. 代码块功能

- 代码高亮显示
- 一键复制按钮
- 代码块自动识别语言

### 4. 文章导航

- 上一篇/下一篇导航
- 文章目录自动生成
- 阅读进度显示

## 🚀 性能优化

- 使用 CSS Grid 和 Flexbox 现代布局
- 最小化 CSS/JS 文件大小
- 图片懒加载支持
- 无外部依赖，纯原生实现

## 📄 许可证

MIT License

## 🙏 反馈

如有问题或建议，欢迎通过 GitHub Issues 反馈。

---

**祝您使用愉快！** 🎉
