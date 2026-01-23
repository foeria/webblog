#!/usr/bin/env node

/**
 * 博客路由诊断工具
 * 用于检查和验证所有路由是否正常配置
 */

const fs = require('fs');
const path = require('path');

class RoutingDiagnostic {
  constructor() {
    // 从 tools 目录向上一级找到项目根目录
    this.projectRoot = path.resolve(__dirname, '..');
    this.issues = [];
    this.warnings = [];
    this.info = [];
  }

  // 检查必要的目录和文件
  checkProjectStructure() {
    console.log('\n📁 检查项目结构...');

    const requiredDirs = [
      'source',
      'source/_posts',
      'source/about',
      'themes/modern-blog',
      'themes/modern-blog/layout',
      'public',
    ];

    const requiredFiles = [
      '_config.yml',
      'themes/modern-blog/_config.yml',
      'themes/modern-blog/layout/index.ejs',
      'themes/modern-blog/layout/post.ejs',
      'themes/modern-blog/layout/category.ejs',
      'themes/modern-blog/layout/tag.ejs',
      'themes/modern-blog/layout/about.ejs',
      'themes/modern-blog/layout/archives.ejs',
      'themes/modern-blog/layout/nav.ejs',
    ];

    requiredDirs.forEach(dir => {
      const fullPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(fullPath)) {
        this.issues.push(`❌ 缺少目录: ${dir}`);
      } else {
        this.info.push(`✓ 目录存在: ${dir}`);
      }
    });

    requiredFiles.forEach(file => {
      const fullPath = path.join(this.projectRoot, file);
      if (!fs.existsSync(fullPath)) {
        this.issues.push(`❌ 缺少文件: ${file}`);
      } else {
        this.info.push(`✓ 文件存在: ${file}`);
      }
    });
  }

  // 检查配置文件
  checkConfigurations() {
    console.log('\n⚙️  检查配置文件...');

    try {
      const configPath = path.join(this.projectRoot, '_config.yml');
      const configContent = fs.readFileSync(configPath, 'utf8');

      // 检查关键配置
      const checks = [
        { pattern: /theme:\s*modern-blog/, name: '主题配置' },
        { pattern: /language:\s*zh-CN/, name: '语言配置' },
        { pattern: /permalink:/, name: '永久链接配置' },
        { pattern: /index_generator:/, name: '首页生成器' },
        { pattern: /archive_generator:/, name: '归档生成器' },
        { pattern: /category_generator:/, name: '分类生成器' },
        { pattern: /tag_generator:/, name: '标签生成器' },
      ];

      checks.forEach(check => {
        if (check.pattern.test(configContent)) {
          this.info.push(`✓ ${check.name}配置已找到`);
        } else {
          this.warnings.push(`⚠ ${check.name}未找到或配置不完整`);
        }
      });
    } catch (error) {
      this.issues.push(`❌ 无法读取配置文件: ${error.message}`);
    }
  }

  // 检查布局文件
  checkLayouts() {
    console.log('\n🎨 检查布局文件...');

    const layoutDir = path.join(this.projectRoot, 'themes/modern-blog/layout');
    
    if (!fs.existsSync(layoutDir)) {
      this.issues.push(`❌ 布局目录不存在`);
      return;
    }

    const layouts = fs.readdirSync(layoutDir).filter(f => f.endsWith('.ejs'));
    
    if (layouts.length === 0) {
      this.issues.push(`❌ 未找到任何布局文件`);
      return;
    }

    this.info.push(`✓ 找到 ${layouts.length} 个布局文件`);
    layouts.forEach(layout => {
      this.info.push(`  - ${layout}`);
    });
  }

  // 检查源文件
  checkSourceFiles() {
    console.log('\n📝 检查源文件...');

    const sourcePosts = path.join(this.projectRoot, 'source/_posts');
    const aboutPage = path.join(this.projectRoot, 'source/about/index.md');

    if (!fs.existsSync(sourcePosts)) {
      this.issues.push(`❌ _posts 目录不存在`);
      return;
    }

    const posts = fs.readdirSync(sourcePosts).filter(f => f.endsWith('.md'));
    this.info.push(`✓ 找到 ${posts.length} 篇文章`);

    if (fs.existsSync(aboutPage)) {
      this.info.push(`✓ 关于页面存在`);
    } else {
      this.warnings.push(`⚠ 关于页面不存在`);
    }
  }

  // 检查生成的文件
  checkGeneratedFiles() {
    console.log('\n🏗️  检查生成的文件...');

    const publicDir = path.join(this.projectRoot, 'public');

    if (!fs.existsSync(publicDir)) {
      this.warnings.push(`⚠ public 目录不存在（需要运行 hexo generate）`);
      return;
    }

    const requiredGeneratedFiles = [
      'index.html',
      'about/index.html',
      'categories/index.html',
      'archives/index.html',
      'tags/index.html',
    ];

    requiredGeneratedFiles.forEach(file => {
      const fullPath = path.join(publicDir, file);
      if (fs.existsSync(fullPath)) {
        this.info.push(`✓ 已生成: ${file}`);
      } else {
        this.warnings.push(`⚠ 未生成: ${file}`);
      }
    });

    // 统计生成的文件数量
    const fileCount = this.countFiles(publicDir);
    this.info.push(`✓ 共生成 ${fileCount} 个文件`);
  }

  // 递归计算文件数量
  countFiles(dir) {
    let count = 0;
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isFile()) {
        count++;
      } else if (stat.isDirectory()) {
        count += this.countFiles(fullPath);
      }
    });
    
    return count;
  }

  // 检查导航配置
  checkNavigation() {
    console.log('\n🧭 检查导航配置...');

    try {
      const navPath = path.join(this.projectRoot, 'themes/modern-blog/layout/nav.ejs');
      const navContent = fs.readFileSync(navPath, 'utf8');

      const navItems = [
        { text: '首页', path: 'config.root' },
        { text: '分类', path: 'categories' },
        { text: '归档', path: 'archives' },
        { text: '标签', path: 'tags' },
        { text: '关于', path: 'about' },
      ];

      navItems.forEach(item => {
        if (navContent.includes(item.text)) {
          this.info.push(`✓ 导航包含: ${item.text}`);
        } else {
          this.warnings.push(`⚠ 导航缺少: ${item.text}`);
        }
      });

      if (navContent.includes('search')) {
        this.info.push(`✓ 导航包含搜索框`);
      } else {
        this.warnings.push(`⚠ 导航缺少搜索框`);
      }
    } catch (error) {
      this.issues.push(`❌ 无法检查导航文件: ${error.message}`);
    }
  }

  // 生成诊断报告
  generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 博客路由诊断报告');
    console.log('='.repeat(50));

    if (this.info.length > 0) {
      console.log('\n✅ 检查成功:');
      this.info.forEach(msg => console.log('  ' + msg));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  警告:');
      this.warnings.forEach(msg => console.log('  ' + msg));
    }

    if (this.issues.length > 0) {
      console.log('\n❌ 问题:');
      this.issues.forEach(msg => console.log('  ' + msg));
    }

    console.log('\n' + '='.repeat(50));
    
    if (this.issues.length === 0) {
      console.log('✨ 所有路由检查通过！');
    } else {
      console.log(`⚠️  发现 ${this.issues.length} 个问题，请修复后重试`);
    }
    
    console.log('='.repeat(50) + '\n');

    return this.issues.length === 0;
  }

  // 运行所有检查
  run() {
    console.log('🔍 开始诊断博客路由...\n');
    
    this.checkProjectStructure();
    this.checkConfigurations();
    this.checkLayouts();
    this.checkSourceFiles();
    this.checkNavigation();
    this.checkGeneratedFiles();

    return this.generateReport();
  }
}

// 运行诊断
const diagnostic = new RoutingDiagnostic();
const success = diagnostic.run();

process.exit(success ? 0 : 1);
