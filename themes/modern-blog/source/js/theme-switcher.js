/**
 * 主题切换器 - 支持亮色/深色模式
 * 用于 GitHub Pages 静态博客
 */
(function() {
    const THEME_KEY = 'blog-theme-mode';
    
    function initThemeSwitcher() {
        // 检查保存的主题偏好
        const savedTheme = localStorage.getItem(THEME_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;
        
        if (shouldBeDark) {
            document.body.classList.add('dark-mode');
        }
        
        // 主题切换按钮
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
            updateThemeToggleIcon();
        }
    }
    
    function toggleTheme() {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
        updateThemeToggleIcon();
    }
    
    function updateThemeToggleIcon() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const isDark = document.body.classList.contains('dark-mode');
            themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            themeToggle.setAttribute('title', isDark ? '切换到亮色模式' : '切换到深色模式');
        }
    }
    
    // DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThemeSwitcher);
    } else {
        initThemeSwitcher();
    }
})();
