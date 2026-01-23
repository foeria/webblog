---
title: 常见 JavaScript 性能问题排查
date: 2026-01-19
categories:
  - 问题排查
tags:
  - JavaScript
  - 性能优化
  - 调试
excerpt: 学习如何排查和解决常见的 JavaScript 性能问题，包括内存泄漏、事件监听器未移除等典型案例。
---

# 常见 JavaScript 性能问题排查

## 内存泄漏

### 问题表现

- 浏览器标签页占用内存不断增加
- 应用运行缓慢

### 常见原因

```javascript
// ❌ 错误：未清理计时器
setInterval(() => {
  console.log('监听中...');
}, 1000);

// ✅ 正确：清理计时器
const timer = setInterval(() => {
  console.log('监听中...');
}, 1000);

// 清理时
clearInterval(timer);
```

### 排查方法

1. 打开 Chrome DevTools
2. 进入 Memory 标签
3. 拍摄堆快照
4. 对比变化

## 事件监听器未移除

```javascript
// ❌ 错误
window.addEventListener('resize', handleResize);

// ✅ 正确
const handleResize = () => { /* ... */ };
window.addEventListener('resize', handleResize);

// 移除时
window.removeEventListener('resize', handleResize);
```

## 频繁的重排/重绘

```javascript
// ❌ 错误：多次 DOM 操作
for (let i = 0; i < 100; i++) {
  element.style.width = (element.offsetWidth + 1) + 'px';
}

// ✅ 正确：批量操作
element.style.width = (element.offsetWidth + 100) + 'px';
```

## 工具推荐

- **Chrome DevTools** - 内存、性能分析
- **Lighthouse** - 网站性能审计
- **Profiler** - 函数执行时间分析

---

定期检查和优化性能可以显著提升用户体验！
