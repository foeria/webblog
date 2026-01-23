---
title: TypeScript 类型系统精通指南
date: 2026-01-20
categories:
  - Skill
skill_category: 编程语言
skill_level: 中级
skill_icon: fas fa-cube
tags:
  - TypeScript
  - 类型系统
excerpt: 掌握 TypeScript 的类型系统，包括基础类型、泛型、交叉类型和条件类型等高级特性。
---

# TypeScript 类型系统精通指南

## 基础类型

### 基本类型
```typescript
let str: string = "hello";
let num: number = 42;
let bool: boolean = true;
let any: any = "anything";
```

## 泛型（Generics）

### 泛型函数
```typescript
function identity<T>(arg: T): T {
  return arg;
}
```

### 泛型接口
```typescript
interface Container<T> {
  value: T;
}
```

## 高级类型

### 交叉类型（Intersection Types）
```typescript
type A = { a: string };
type B = { b: number };
type C = A & B; // 同时具有 a 和 b
```

### 联合类型（Union Types）
```typescript
type Status = "success" | "error" | "pending";
```

### 条件类型
```typescript
type IsString<T> = T extends string ? true : false;
```

## 最佳实践

1. 始终为函数参数和返回值添加类型注解
2. 优先使用接口而不是类型别名（除非需要联合类型）
3. 避免过度使用 any 类型
4. 利用类型推断减少冗余的类型注解

## 工具类型

- `Partial<T>` - 使所有属性可选
- `Required<T>` - 使所有属性必需
- `Readonly<T>` - 使所有属性只读
- `Pick<T, K>` - 选择特定属性
- `Omit<T, K>` - 排除特定属性
- `Record<K, T>` - 创建对象类型

## 总结

TypeScript 的类型系统是其最强大的特性，能够帮助我们编写更安全、更易维护的代码。
