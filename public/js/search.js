/**
 * 搜索功能 - 实时客户端搜索
 * 支持标题、分类、标签搜索，带动画效果
 */
(function() {
    let postsData = [];
    
    function initSearch() {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.querySelector('.search-btn');
        const searchResultsContainer = document.getElementById('search-results');
        
        if (!searchInput || !searchResultsContainer) return;
        
        // 获取所有文章数据
        loadPostsData();
        
        // 实时搜索
        searchInput.addEventListener('input', debounce(function(e) {
            const query = e.target.value.trim();
            
            if (query.length === 0) {
                searchResultsContainer.style.display = 'none';
                return;
            }
            
            const results = searchPosts(query);
            displaySearchResults(results, searchResultsContainer);
        }, 300));
        
        // 点击搜索按钮
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                const query = searchInput.value.trim();
                if (query.length > 0) {
                    window.location.href = config.root + 'search/?q=' + encodeURIComponent(query);
                }
            });
        }
        
        // 按Enter键搜索
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query.length > 0) {
                    window.location.href = config.root + 'search/?q=' + encodeURIComponent(query);
                }
            }
        });
        
        // 点击页面其他地方关闭搜索结果
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-search')) {
                searchResultsContainer.style.display = 'none';
            }
        });
    }
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction() {
            const args = arguments;
            const later = function() {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    function loadPostsData() {
        // 从页面中的所有文章卡片提取数据
        const postCards = document.querySelectorAll('.post-card, article');
        
        postCards.forEach(function(card) {
            const titleEl = card.querySelector('.post-title a, h3 a, h2 a');
            const categoryEls = card.querySelectorAll('.category-link');
            const tagEls = card.querySelectorAll('.tag, .post-tags a');
            const dateEl = card.querySelector('.meta-item, .post-date, time');
            
            if (titleEl) {
                const categories = Array.from(categoryEls).map(function(el) {
                    return el.textContent.trim();
                }).join(', ');
                
                const tags = Array.from(tagEls).map(function(el) {
                    return el.textContent.trim();
                });
                
                postsData.push({
                    title: titleEl.textContent.trim(),
                    url: titleEl.href,
                    category: categories,
                    tags: tags,
                    date: dateEl ? dateEl.textContent.trim() : '',
                    excerpt: card.querySelector('.post-excerpt') ? 
                             card.querySelector('.post-excerpt').textContent.trim() : ''
                });
            }
        });
    }
    
    function searchPosts(query) {
        const lowerQuery = query.toLowerCase();
        const filtered = postsData.filter(function(post) {
            const matchTitle = post.title.toLowerCase().indexOf(lowerQuery) !== -1;
            const matchCategory = post.category.toLowerCase().indexOf(lowerQuery) !== -1;
            const matchTags = post.tags.some(function(tag) {
                return tag.toLowerCase().indexOf(lowerQuery) !== -1;
            });
            const matchExcerpt = post.excerpt.toLowerCase().indexOf(lowerQuery) !== -1;
            
            return matchTitle || matchCategory || matchTags || matchExcerpt;
        });
        
        return filtered.slice(0, 8); // 限制显示8条
    }
    
    function displaySearchResults(results, container) {
        const resultsList = container.querySelector('.search-results-list');
        
        if (results.length === 0) {
            resultsList.innerHTML = '<div class="search-no-result" style="padding: 16px; text-align: center;">未找到相关文章</div>';
        } else {
            resultsList.innerHTML = results.map(function(post) {
                return '<a href="' + post.url + '" class="search-item">' +
                       '<span class="search-item-title">' + post.title + '</span>' +
                       '<div class="search-item-excerpt">' + post.excerpt.substring(0, 80) + '...</div>' +
                       (post.category ? '<span class="search-item-category">' + post.category + '</span>' : '') +
                       '</a>';
            }).join('');
        }
        
        container.style.display = 'block';
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSearch);
    } else {
        initSearch();
    }
})();
