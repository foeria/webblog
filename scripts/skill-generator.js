'use strict';

// Skill 分类专用生成器
hexo.extend.generator.register('skill-index', function(locals) {
  const config = hexo.config;
  const theme = hexo.theme.config;
  
  // 获取 Skill 分类
  let skillCategory = null;
  locals.categories.forEach(cat => {
    if (cat.name === 'Skill') {
      skillCategory = cat;
    }
  });
  
  // 如果没有 Skill 分类，不生成
  if (!skillCategory || skillCategory.length === 0) {
    return [];
  }
  
  // 创建分页数据对象
  const skilledPosts = skillCategory.posts.toArray();
  const perPage = 12;
  const totalPages = Math.ceil(skilledPosts.length / perPage);
  
  const pages = [];
  
  for (let i = 0; i < totalPages; i++) {
    const start = i * perPage;
    const end = start + perPage;
    const page = i + 1;
    
    pages.push({
      path: page === 1 ? 'skill/index.html' : `skill/page/${page}/index.html`,
      layout: 'skill',
      data: {
        __posts: skilledPosts.slice(start, end),
        total: totalPages,
        current: page,
        prev: page > 1 ? page === 2 ? 'skill/' : `skill/page/${page - 1}/` : null,
        next: page < totalPages ? `skill/page/${page + 1}/` : null,
        title: 'Skill'
      }
    });
  }
  
  return pages;
});

