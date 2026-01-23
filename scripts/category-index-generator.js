'use strict';

// 分类索引页面生成器
hexo.extend.generator.register('category-index', function(locals) {
  const config = hexo.config;
  const theme = hexo.theme.config;
  
  // 只有在有分类时才生成索引
  if (locals.categories.length === 0) {
    return [];
  }
  
  return [{
    path: 'categories/index.html',
    layout: 'categories-index',
    data: {
      title: '分类',
      description: '浏览所有文章分类'
    }
  }];
});
