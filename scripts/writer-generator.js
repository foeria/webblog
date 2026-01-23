/**
 * 生成写作编辑器页面
 * 该生成器创建 /writer/index.html 用于在线编辑博客文章
 */

'use strict';

hexo.extend.generator.register('writer', function(locals) {
    return {
        path: 'writer/index.html',
        layout: 'writer',
        data: {
            title: '写作编辑器',
            page_title: '在线写作编辑器'
        }
    };
});
