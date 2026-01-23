/**
 * 博客内容管理中心 - VSCode风格资源管理器
 * 支持：创建分类、管理文章、编辑预览、发布到 GitHub
 * 兼容 GitHub Pages 静态部署
 */

// 全局配置
let writerConfig = {
    githubToken: localStorage.getItem('github_token') || '',
    githubUsername: localStorage.getItem('github_username') || '',
    githubRepo: localStorage.getItem('github_repo') || '',
    githubBranch: localStorage.getItem('github_branch') || 'main'
};

let currentArticle = null;
let currentCategory = null;
let contextMenuTarget = null;
let deleteTarget = null;
let editingCategoryName = null;
const markdownIt = window.markdownit ? window.markdownit() : null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 首先从页面中加载网站数据
    loadSiteDataFromPage();
    
    initializeExplorer();
    initializeEditor();
    setupEventListeners();
    hideContextMenu();
});

// ========== 资源管理器初始化 ==========

function initializeExplorer() {
    renderExplorerTree();
}

// 从页面中加载网站数据
function loadSiteDataFromPage() {
    const dataScript = document.getElementById('site-data');
    if (dataScript) {
        try {
            window.siteData = JSON.parse(dataScript.textContent);
            console.log('网站数据加载成功:', window.siteData);
        } catch (error) {
            console.warn('解析网站数据失败:', error);
        }
    }
}

// 渲染资源管理器树
function renderExplorerTree() {
    const tree = document.getElementById('explorer-tree');
    const categories = getCategories();
    const articles = getAllArticles();
    
    if (categories.length === 0) {
        tree.innerHTML = `
            <div class="explorer-empty" style="padding: 20px; text-align: center; color: #888;">
                <p>还没有分类</p>
                <button class="btn btn-primary btn-sm" onclick="openCreateCategoryModal()" style="margin-top: 10px; padding: 6px 12px; font-size: 12px;">
                    <i class="fas fa-plus"></i> 新建分类
                </button>
            </div>
        `;
        return;
    }
    
    let html = '';
    categories.forEach(category => {
        const catArticles = articles.filter(a => a.category === category.name);
        const hasArticles = catArticles.length > 0;
        const categoryIcon = category.isCustom ? 'folder-plus' : 'folder';
        const categoryColor = category.isFromSite ? '#dcb67a' : '#a0a0a0';
        
        html += `
            <div class="tree-node" data-category="${escapeHtml(category.name)}">
                <div class="tree-node-header" 
                     onclick="toggleCategory(this)" 
                     oncontextmenu="showContextMenu(event, '${escapeHtml(category.name)}')">
                    <span class="tree-chevron ${hasArticles ? '' : 'hidden'}">
                        <i class="fas fa-chevron-right"></i>
                    </span>
                    <span class="tree-icon folder" style="color: ${categoryColor}">
                        <i class="fas fa-${categoryIcon}"></i>
                    </span>
                    <span class="tree-label">${escapeHtml(category.name)}</span>
                    ${hasArticles ? `<span class="tree-badge">${catArticles.length}</span>` : ''}
                    ${category.isCustom ? '<span class="tree-badge custom" title="自定义分类">自</span>' : ''}
                </div>
                <div class="tree-children">
                    ${catArticles.map(article => `
                        <div class="tree-node tree-node-article" data-article-id="${article.id}">
                            <div class="tree-node-header" onclick="${article.isFromSite ? `viewSiteArticle('${article.path}')` : `openArticleEditor('${article.id}')`}">
                                <span class="tree-chevron hidden"><i class="fas fa-chevron-right"></i></span>
                                <span class="tree-icon file" style="color: ${article.isDraft ? '#f39c12' : '#519aba'}">
                                    <i class="fas fa-${article.isDraft ? 'edit' : 'file-alt'}"></i>
                                </span>
                                <span class="tree-label">${escapeHtml(article.title || '无标题')}</span>
                                ${article.isDraft ? '<span class="tree-badge draft" title="草稿">草稿</span>' : ''}
                                ${article.isFromSite ? '<span class="tree-badge published" title="已发布">已发布</span>' : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    tree.innerHTML = html;
}

// 切换分类展开/折叠
function toggleCategory(header) {
    const node = header.parentElement;
    const chevron = header.querySelector('.tree-chevron');
    const children = node.querySelector('.tree-children');
    const folderIcon = header.querySelector('.tree-icon i');
    
    if (children.classList.contains('expanded')) {
        children.classList.remove('expanded');
        chevron.classList.remove('expanded');
        folderIcon.className = 'fas fa-folder';
    } else {
        children.classList.add('expanded');
        chevron.classList.add('expanded');
        folderIcon.className = 'fas fa-folder-open';
    }
}

// 折叠所有分类
function collapseAllCategories() {
    document.querySelectorAll('.tree-children').forEach(el => {
        el.classList.remove('expanded');
    });
    document.querySelectorAll('.tree-chevron').forEach(el => {
        el.classList.remove('expanded');
    });
    document.querySelectorAll('.tree-icon.folder i, .tree-icon.folder-open i').forEach(el => {
        el.className = 'fas fa-folder';
    });
}

// 刷新资源管理器
function refreshExplorer() {
    renderExplorerTree();
    showNotification('资源管理器已刷新', 'info');
}

// ========== 右键菜单 ==========

function showContextMenu(event, categoryName) {
    event.preventDefault();
    event.stopPropagation();
    
    contextMenuTarget = categoryName;
    
    const menu = document.getElementById('context-menu');
    menu.style.display = 'block';
    menu.style.left = event.pageX + 'px';
    menu.style.top = event.pageY + 'px';
    
    // 高亮选中的分类
    document.querySelectorAll('.tree-node-header').forEach(el => {
        el.classList.remove('selected');
    });
    const targetNode = document.querySelector(`.tree-node[data-category="${categoryName}"] > .tree-node-header`);
    if (targetNode) {
        targetNode.classList.add('selected');
    }
}

function hideContextMenu() {
    const menu = document.getElementById('context-menu');
    if (menu) {
        menu.style.display = 'none';
    }
    document.querySelectorAll('.tree-node-header.selected').forEach(el => {
        el.classList.remove('selected');
    });
}

// 点击其他地方隐藏右键菜单
document.addEventListener('click', function(e) {
    if (!e.target.closest('.context-menu')) {
        hideContextMenu();
    }
});

// 右键菜单 - 新建文章
function contextMenuNewArticle() {
    hideContextMenu();
    if (contextMenuTarget) {
        openNewArticleEditor(contextMenuTarget);
    }
}

// 右键菜单 - 编辑分类
function contextMenuEditCategory() {
    hideContextMenu();
    if (contextMenuTarget) {
        openEditCategoryModal(contextMenuTarget);
    }
}

// 右键菜单 - 删除分类
function contextMenuDeleteCategory() {
    hideContextMenu();
    if (contextMenuTarget) {
        openDeleteConfirmModal('category', contextMenuTarget);
    }
}

// ========== 分类管理 ==========

// 获取所有分类（结合网站数据和localStorage数据）
function getCategories() {
    const categories = [];
    
    // 尝试从网站数据中获取分类（如果页面中有site数据）
    if (typeof window !== 'undefined' && window.siteData && window.siteData.categories) {
        window.siteData.categories.forEach(cat => {
            categories.push({
                name: cat.name,
                description: cat.description || `${cat.name}相关的文章分类`,
                count: cat.count || 0,
                isFromSite: true
            });
        });
    } else {
        // 如果没有网站数据，使用默认分类
        const defaultCategories = [
            { name: '前端开发', description: 'HTML, CSS, JavaScript 相关技术', count: 0 },
            { name: '后端开发', description: '服务端开发相关技术', count: 0 },
            { name: '技术分享', description: '技术心得和经验分享', count: 0 },
            { name: '问题排查', description: '问题解决和调试记录', count: 0 }
        ];
        categories.push(...defaultCategories);
    }
    
    // 添加localStorage中的自定义分类
    const customCategories = JSON.parse(localStorage.getItem('custom_categories') || '[]');
    customCategories.forEach(customCat => {
        if (!categories.find(c => c.name === customCat.name)) {
            categories.push({
                name: customCat.name,
                description: customCat.description || '',
                count: 0,
                isCustom: true
            });
        }
    });
    
    return categories;
}

// 打开创建分类模态框
function openCreateCategoryModal() {
    editingCategoryName = null;
    document.getElementById('category-modal-title').textContent = '新建分类';
    document.getElementById('modal-category-name').value = '';
    document.getElementById('modal-category-desc').value = '';
    document.getElementById('modal-category-name').disabled = false;
    document.getElementById('category-modal-submit').innerHTML = '<i class="fas fa-check"></i> 创建';
    document.getElementById('category-modal').style.display = 'flex';
    document.getElementById('modal-category-name').focus();
}

// 打开编辑分类模态框
function openEditCategoryModal(categoryName) {
    const categories = getCategories();
    const category = categories.find(c => c.name === categoryName);
    
    if (!category) {
        showNotification('分类不存在', 'error');
        return;
    }
    
    editingCategoryName = categoryName;
    document.getElementById('category-modal-title').textContent = '编辑分类';
    document.getElementById('modal-category-name').value = category.name;
    document.getElementById('modal-category-desc').value = category.description || '';
    document.getElementById('modal-category-name').disabled = true; // 不允许修改名称
    document.getElementById('category-modal-submit').innerHTML = '<i class="fas fa-save"></i> 保存';
    document.getElementById('category-modal').style.display = 'flex';
}

// 关闭分类模态框
function closeCategoryModal() {
    document.getElementById('category-modal').style.display = 'none';
    editingCategoryName = null;
}

// 保存分类
function saveCategoryFromModal() {
    const name = document.getElementById('modal-category-name').value.trim();
    const desc = document.getElementById('modal-category-desc').value.trim();
    
    if (!name) {
        showNotification('请输入分类名称', 'warning');
        return;
    }
    
    if (name.length > 20) {
        showNotification('分类名称不能超过20个字符', 'warning');
        return;
    }
    
    const customCategories = JSON.parse(localStorage.getItem('custom_categories') || '[]');
    
    if (editingCategoryName) {
        // 编辑模式 - 只更新描述
        const index = customCategories.findIndex(c => c.name === editingCategoryName);
        if (index !== -1) {
            customCategories[index].description = desc;
            localStorage.setItem('custom_categories', JSON.stringify(customCategories));
            showNotification(`分类 "${name}" 已更新`, 'success');
        }
    } else {
        // 创建模式
        const allCategories = getCategories();
        if (allCategories.find(c => c.name === name)) {
            showNotification('该分类已存在', 'warning');
            return;
        }
        
        customCategories.push({
            name: name,
            description: desc,
            createdAt: new Date().toISOString()
        });
        
        localStorage.setItem('custom_categories', JSON.stringify(customCategories));
        showNotification(`分类 "${name}" 已创建`, 'success');
    }
    
    closeCategoryModal();
    renderExplorerTree();
}

// 删除分类
function deleteCategory(categoryName) {
    const customCategories = JSON.parse(localStorage.getItem('custom_categories') || '[]');
    const filtered = customCategories.filter(c => c.name !== categoryName);
    localStorage.setItem('custom_categories', JSON.stringify(filtered));
    
    // 同时删除该分类下的所有文章
    const articles = JSON.parse(localStorage.getItem('article_drafts') || '[]');
    const filteredArticles = articles.filter(a => a.category !== categoryName);
    localStorage.setItem('article_drafts', JSON.stringify(filteredArticles));
    
    showNotification(`分类 "${categoryName}" 已删除`, 'success');
    renderExplorerTree();
    
    // 如果当前正在编辑的文章属于被删除的分类，关闭编辑器
    if (currentArticle && currentArticle.category === categoryName) {
        closeEditor();
    }
}

// 获取所有文章（结合网站数据和localStorage数据）
function getAllArticles() {
    const articles = [];
    
    // 尝试从网站数据中获取文章
    if (typeof window !== 'undefined' && window.siteData && window.siteData.posts) {
        window.siteData.posts.forEach(post => {
            articles.push({
                id: post.id || post.path || Date.now().toString(),
                title: post.title,
                category: post.categories && post.categories.length > 0 ? post.categories[0] : '未分类',
                tags: post.tags || [],
                date: post.date || new Date().toISOString(),
                excerpt: post.excerpt || '',
                content: post.content || '',
                path: post.path,
                isFromSite: true
            });
        });
    }
    
    // 添加localStorage中的草稿文章
    const drafts = JSON.parse(localStorage.getItem('article_drafts') || '[]');
    drafts.forEach(draft => {
        // 避免重复（如果网站数据中已存在相同的文章）
        if (!articles.find(a => a.title === draft.title && a.category === draft.category)) {
            articles.push({
                ...draft,
                isDraft: true
            });
        }
    });
    
    return articles.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// 获取所有文章（结合网站数据和localStorage数据）
function getAllArticles() {
    const articles = [];
    
    // 尝试从网站数据中获取文章
    if (typeof window !== 'undefined' && window.siteData && window.siteData.posts) {
        window.siteData.posts.forEach(post => {
            articles.push({
                id: post.id || post.path || Date.now().toString(),
                title: post.title,
                category: post.categories && post.categories.length > 0 ? post.categories[0] : '未分类',
                tags: post.tags || [],
                date: post.date || new Date().toISOString(),
                excerpt: post.excerpt || '',
                content: post.content || '',
                path: post.path,
                isFromSite: true
            });
        });
    }
    
    // 添加localStorage中的草稿文章
    const drafts = JSON.parse(localStorage.getItem('article_drafts') || '[]');
    drafts.forEach(draft => {
        // 避免重复（如果网站数据中已存在相同的文章）
        if (!articles.find(a => a.title === draft.title && a.category === draft.category)) {
            articles.push({
                ...draft,
                isDraft: true
            });
        }
    });
    
    return articles.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ========== 文章管理 ==========
function openNewArticleEditor(categoryName) {
    currentArticle = null;
    currentCategory = categoryName;
    
    // 显示编辑面板
    document.getElementById('welcome-panel').style.display = 'none';
    document.getElementById('editor-panel').style.display = 'flex';
    
    // 重置表单
    resetForm();
    document.getElementById('article-category').value = categoryName;
    document.getElementById('editor-tab-title').textContent = '新建文章';
    
    // 设置当前时间
    const now = new Date();
    document.getElementById('article-date').value = now.toISOString().slice(0, 16);
}
// 查看网站中的文章（只读）
function viewSiteArticle(articlePath) {
    if (articlePath) {
        // 在新标签页中打开文章，确保带上站点根路径
        const siteRoot = window.blogRoot || '/';
        const normalizedRoot = siteRoot.endsWith('/') ? siteRoot : siteRoot + '/';
        const sanitizedPath = articlePath.replace(/^\/+/, '');
        const articleUrl = `${window.location.origin}${normalizedRoot}${sanitizedPath}`;
        window.open(articleUrl, '_blank');
    } else {
        showNotification('无法打开文章链接', 'error');
    }
}
// 打开文章编辑器
function openArticleEditor(articleId) {
    const articles = getAllArticles();
    const article = articles.find(a => a.id === articleId);
    
    if (!article) {
        showNotification('文章不存在', 'error');
        return;
    }
    
    currentArticle = article;
    currentCategory = article.category;
    
    // 显示编辑面板
    document.getElementById('welcome-panel').style.display = 'none';
    document.getElementById('editor-panel').style.display = 'flex';
    
    // 填充表单
    document.getElementById('article-title').value = article.title || '';
    document.getElementById('article-category').value = article.category || '';
    document.getElementById('article-tags').value = (article.tags || []).join(', ');
    document.getElementById('article-date').value = article.date || '';
    document.getElementById('article-excerpt').value = article.excerpt || '';
    document.getElementById('article-content').value = article.content || '';
    document.getElementById('editor-tab-title').textContent = article.title || '编辑文章';
    
    updatePreview();
}

// 关闭编辑器
function closeEditor() {
    document.getElementById('editor-panel').style.display = 'none';
    document.getElementById('welcome-panel').style.display = 'flex';
    currentArticle = null;
    currentCategory = null;
}

// ========== 编辑器功能 ==========

// 初始化编辑器
function initializeEditor() {
    const contentEditor = document.getElementById('article-content');
    if (contentEditor) {
        contentEditor.addEventListener('input', updatePreview);
    }
}

// 设置事件监听
function setupEventListeners() {
    // 保存草稿按钮
    const saveDraftBtn = document.getElementById('btn-save-draft');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', saveDraft);
    }
    
    // 下载按钮
    const downloadBtn = document.getElementById('btn-download');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadMarkdown);
    }
    
    // 批量导出按钮
    const exportAllBtn = document.getElementById('btn-export-all');
    if (exportAllBtn) {
        exportAllBtn.addEventListener('click', exportAllArticles);
    }
    
    // 部署指南按钮
    const deployGuideBtn = document.getElementById('btn-deploy-guide');
    if (deployGuideBtn) {
        deployGuideBtn.addEventListener('click', openDeployGuideModal);
    }
    
    // 重置按钮
    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetForm);
    }
    
    // 模态框外部点击关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
    
    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
            hideContextMenu();
        }
    });
}

// 更新预览
function updatePreview() {
    const content = document.getElementById('article-content').value;
    const preview = document.getElementById('article-preview');
    
    if (markdownIt && preview) {
        preview.innerHTML = markdownIt.render(content);
    } else if (preview) {
        preview.innerText = content;
    }
}

// 切换预览大小
function togglePreviewSize() {
    const container = document.querySelector('.editor-preview-container');
    const previewWrapper = container.querySelector('.preview-wrapper');
    
    if (previewWrapper.style.display === 'none') {
        previewWrapper.style.display = 'flex';
        container.style.gridTemplateColumns = '1fr 1fr';
    } else {
        previewWrapper.style.display = 'none';
        container.style.gridTemplateColumns = '1fr';
    }
}

// 获取表单数据
function getFormData() {
    const tags = document.getElementById('article-tags').value
        .split(',')
        .map(t => t.trim())
        .filter(t => t);
    
    return {
        id: currentArticle?.id || Date.now().toString(),
        title: document.getElementById('article-title').value,
        category: document.getElementById('article-category').value || currentCategory || '未分类',
        tags: tags,
        date: document.getElementById('article-date').value,
        excerpt: document.getElementById('article-excerpt').value,
        content: document.getElementById('article-content').value
    };
}

// 保存草稿
function saveDraft() {
    const article = getFormData();
    
    if (!article.title.trim()) {
        showNotification('请输入文章标题', 'warning');
        return;
    }
    
    if (!article.excerpt.trim()) {
        showNotification('请输入文章摘要', 'warning');
        return;
    }
    
    if (!article.content.trim()) {
        showNotification('请输入文章内容', 'warning');
        return;
    }
    
    const drafts = JSON.parse(localStorage.getItem('article_drafts') || '[]');
    
    // 如果是编辑现有文章，更新它
    const existingIndex = drafts.findIndex(a => a.id === article.id);
    if (existingIndex !== -1) {
        drafts[existingIndex] = article;
    } else {
        drafts.push(article);
    }
    
    localStorage.setItem('article_drafts', JSON.stringify(drafts));
    currentArticle = article;
    
    showNotification('草稿已保存', 'success');
    renderExplorerTree();
    document.getElementById('editor-tab-title').textContent = article.title;
}

// 重置表单
function resetForm() {
    document.getElementById('article-title').value = '';
    document.getElementById('article-tags').value = '';
    document.getElementById('article-excerpt').value = '';
    document.getElementById('article-content').value = '';
    
    const dateInput = document.getElementById('article-date');
    if (dateInput) {
        const now = new Date();
        dateInput.value = now.toISOString().slice(0, 16);
    }
    
    updatePreview();
}

// 生成 Frontmatter
function generateFrontmatter(article) {
    let frontmatter = `---
title: ${article.title}
date: ${new Date(article.date).toISOString()}
categories:
  - ${article.category}
tags:`;
    
    article.tags.forEach(tag => {
        frontmatter += `\n  - ${tag}`;
    });
    
    frontmatter += `\nexcerpt: ${article.excerpt}`;
    frontmatter += '\n---';
    
    return frontmatter;
}

// 生成文件名
function generateFilename(article) {
    const date = new Date(article.date);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const slug = article.title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/^-|-$/g, '');
    return `${dateStr}-${slug}.md`;
}

// 下载 Markdown 文件
function downloadMarkdown() {
    const article = getFormData();
    
    if (!article.title.trim() || !article.content.trim()) {
        showNotification('请先填写标题和内容', 'warning');
        return;
    }
    
    const frontmatter = generateFrontmatter(article);
    const fileContent = `${frontmatter}\n\n${article.content}`;
    const filename = generateFilename(article);
    
    // 创建下载
    downloadFile(fileContent, filename, 'text/markdown');
    
    showNotification(`文件 "${filename}" 已下载`, 'success');
    
    // 自动保存草稿
    saveDraft();
}

// 批量导出所有文章
function exportAllArticles() {
    const articles = getAllArticles();
    
    if (articles.length === 0) {
        showNotification('没有可导出的文章', 'warning');
        return;
    }
    
    // 创建 ZIP文件内容（使用简单的文件打包）
    const exportData = {
        articles: articles,
        categories: getCategories(),
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    // 下载数据文件
    downloadFile(JSON.stringify(exportData, null, 2), 'blog-export.json', 'application/json');
    
    // 下载所有Markdown文件
    articles.forEach((article, index) => {
        setTimeout(() => {
            const frontmatter = generateFrontmatter(article);
            const fileContent = `${frontmatter}\n\n${article.content}`;
            const filename = generateFilename(article);
            downloadFile(fileContent, filename, 'text/markdown');
        }, index * 200); // 错开下载时间
    });
    
    showNotification(`已开始导出 ${articles.length} 篇文章`, 'success');
}

// 通用下载文件函数
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ========== 部署指南 ==========

function openDeployGuideModal() {
    document.getElementById('deploy-guide-modal').style.display = 'flex';
    // 默认显示手动部署标签页
    showDeployTab('manual');
}

function closeDeployGuideModal() {
    document.getElementById('deploy-guide-modal').style.display = 'none';
}

function showDeployTab(tabName) {
    // 更新标签状态
    document.querySelectorAll('.deploy-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[onclick="showDeployTab('${tabName}')"]`).classList.add('active');
    
    // 更新内容区域
    document.querySelectorAll('.deploy-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`deploy-${tabName}`).classList.add('active');
}

// ========== 删除确认 ==========

function openDeleteConfirmModal(type, target) {
    deleteTarget = { type, target };
    
    const message = document.getElementById('delete-confirm-message');
    if (type === 'category') {
        message.textContent = `确定要删除分类 "${target}" 吗？`;
    } else if (type === 'article') {
        message.textContent = `确定要删除这篇文章吗？`;
    }
    
    document.getElementById('delete-confirm-modal').style.display = 'flex';
}

function closeDeleteModal() {
    document.getElementById('delete-confirm-modal').style.display = 'none';
    deleteTarget = null;
}

function confirmDelete() {
    if (!deleteTarget) return;
    
    if (deleteTarget.type === 'category') {
        deleteCategory(deleteTarget.target);
    } else if (deleteTarget.type === 'article') {
        deleteArticle(deleteTarget.target);
    }
    
    closeDeleteModal();
}

function deleteArticle(articleId) {
    const articles = JSON.parse(localStorage.getItem('article_drafts') || '[]');
    const filtered = articles.filter(a => a.id !== articleId);
    localStorage.setItem('article_drafts', JSON.stringify(filtered));
    
    showNotification('文章已删除', 'success');
    renderExplorerTree();
    
    if (currentArticle && currentArticle.id === articleId) {
        closeEditor();
    }
}

// ========== 工具函数 ==========

// HTML 转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}
