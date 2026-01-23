---
title: React Hooks 完全指南
date: 2026-01-21
categories:
  - 前端开发
tags:
  - React
  - JavaScript
  - Hooks
excerpt: 深入了解 React Hooks，掌握现代 React 开发的最佳实践。本文详细讲解了 useState、useEffect、useContext 等常用 Hooks 的用法。
---

# React Hooks 完全指南

React Hooks 是 React 16.8 引入的新特性，允许你在函数组件中使用 state 和其他 React 特性。

## 什么是 Hooks？

Hooks 是一种特殊的函数，可以让你在函数组件中"钩入" React 的状态和其他特性。

## 为什么使用 Hooks？

1. **更简洁的代码** - 不需要编写类组件
2. **代码复用** - 逻辑更容易共享
3. **关注点分离** - 按关注点而非生命周期组织代码

## 常用 Hooks

### useState

```javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>计数：{count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

### useEffect

```javascript
import { useEffect, useState } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // 在组件挂载和更新时执行
    console.log('组件已更新，计数为：', count);

    // 清理函数
    return () => {
      console.log('清理资源');
    };
  }, [count]); // 依赖数组

  return <div>计数：{count}</div>;
}
```

## 最佳实践

- 只在顶层调用 Hooks
- 只在 React 函数中调用 Hooks
- 使用依赖数组避免无限循环
- 提取自定义 Hooks 复用逻辑

---

希望这篇文章能帮助你掌握 React Hooks！
