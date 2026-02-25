---
title: 解决 Hexo 博客 GitHub Actions 部署后页面空白问题
date: 2026-02-25
categories: 问题排查
tags:
  - Hexo
  - GitHub Actions
  - Git
  - 博客系统
  - 静态网站生成
---

## 问题现象

博客在本地运行 `hexo server` 一切正常，但推送到 GitHub 后，通过 GitHub Actions 部署的站点出现以下症状：

- 所有页面内容均显示为空白
- 查看页面源码发现 HTML 骨架存在，但主题样式和内容缺失
- 控制台无报错，只是页面没有正确渲染

## 问题排查

### 第一步：对比本地与远程生成结果

本地执行 `hexo generate` 后可以正常生成带主题的 HTML 文件，说明问题出在 CI 构建阶段而非代码本身。

### 第二步：查看 GitHub Actions 构建日志

在 Actions 日志中发现大量警告：

```
WARN  No layout: index.html
WARN  No layout: about/index.html
WARN  No layout: archives/index.html
...（所有页面均有相同警告）
```

Hexo 在生成 HTML 时找不到对应的**布局文件（layout）**，因此输出了无内容的空白 HTML。

### 第三步：定位根本原因

检查 `themes/butterfly` 目录，发现其内部存在 `.git` 目录——这意味着该目录曾被作为 **Git 嵌套仓库**（或子模块 gitlink）管理。

执行 `git submodule status` 报错：

```
fatal: no submodule mapping found in .gitmodules for path 'themes/butterfly'
```

执行 `git ls-files themes/butterfly` 只输出一行：

```
themes/butterfly
```

这说明 Git 将 `themes/butterfly` 识别为一个 **gitlink（子模块占位符）**，而不是普通目录。仓库中**没有存储任何主题文件**，只存了一个指向外部仓库某 commit 的引用。

### 根本原因总结

| 环节 | 本地 | GitHub Actions |
|------|------|----------------|
| 主题文件来源 | 本地磁盘已有真实文件 | checkout 时 gitlink 为空占位符 |
| `git submodules: false`（默认） | 不影响，文件已存在 | 主题文件完全缺失 |
| Hexo 能否找到布局 | ✅ 能 | ❌ 不能，输出空白页面 |

## 解决方案

### 方案一（本文采用）：将主题直接内嵌到主仓库

将主题从 gitlink/子模块模式改为普通目录，让所有文件直接被主仓库追踪。

**操作步骤：**

**1. 从 git 索引中移除 gitlink 占位符**（不删除本地文件）：

```bash
git rm --cached themes/butterfly -f
```

**2. 删除主题内嵌的 `.git` 目录**，解除嵌套仓库关系：

```bash
# Linux/macOS
rm -rf themes/butterfly/.git

# Windows (PowerShell)
Remove-Item -Recurse -Force themes/butterfly/.git
```

**3. 重新将主题文件加入 git 追踪：**

```bash
git add themes/butterfly
```

**4. 提交并推送：**

```bash
git commit -m "fix: 将 butterfly 主题从 gitlink 改为直接内嵌文件"
git push
```

> ⚠️ 注意：确认 `.gitignore` 中没有排除 `themes/butterfly/`，否则文件不会被追踪。

### 方案二：使用正确的 Git 子模块

如果希望保持子模块方式管理主题，需要：

**1. 正确初始化子模块：**

```bash
# 先移除旧的 gitlink
git rm --cached themes/butterfly -f
rm -rf themes/butterfly/.git

# 重新以子模块方式添加
git submodule add https://github.com/jerryc127/hexo-theme-butterfly.git themes/butterfly
git commit -m "feat: 以 git 子模块方式添加 butterfly 主题"
```

**2. 修改 GitHub Actions workflow，在 checkout 步骤添加子模块参数：**

```yaml
- name: 检出代码
  uses: actions/checkout@v4
  with:
    submodules: true    # 检出子模块
    fetch-depth: 0      # 获取完整历史
```

## 技术原理

### Git 子模块（submodule）工作机制

Git 子模块允许在一个仓库内引用另一个仓库的特定 commit。主仓库中存储的不是文件内容，而是一个 **gitlink** —— 一条指向外部仓库某 commit 的记录，配合 `.gitmodules` 文件描述来源地址。

```
主仓库
├── .gitmodules          ← 记录子模块来源 URL
└── themes/butterfly     ← gitlink，仅存储 commit SHA，不含文件
```

执行 `git clone` 或 `actions/checkout` 时，**默认不会拉取子模块内容**，需要显式指定：

```bash
# 命令行
git clone --recurse-submodules <repo>
# 或已 clone 后
git submodule update --init

# GitHub Actions
- uses: actions/checkout@v4
  with:
    submodules: true
```

### Hexo 主题渲染流程

Hexo 生成站点时：

1. 读取 `_config.yml` 中的 `theme` 字段
2. 在 `themes/<theme-name>/layout/` 目录查找布局模板（`.pug`、`.ejs` 等）
3. 用布局模板渲染 Markdown 内容生成 HTML

若布局目录不存在或为空，Hexo 会输出警告 `WARN No layout: xxx.html`，并生成**几乎为空的 HTML 文件**，表现为空白页面。

## 总结

| 场景 | 推荐方案 |
|------|---------|
| 主题不需要跟随上游更新 | **方案一**：直接内嵌，最简单可靠 |
| 需要方便地拉取主题更新 | **方案二**：正确配置子模块 + workflow `submodules: true` |

核心教训：**本地环境和 CI/CD 环境的关键差异在于文件是否真实存在**。本地已有的文件不代表远程构建也能获取到，务必验证 CI 环境能否完整 checkout 所有需要的内容。
