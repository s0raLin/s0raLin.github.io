---
title: TypeScript泛型
published: 2026-03-06
description: ''
image: ''
tags: [TypeScript]
category: '编程语言'
draft: false 
lang: ''
---


泛型是 TypeScript 中最强大、最有价值的特性之一。它允许我们编写**可重用**、**类型安全**的代码组件（函数、类、接口等），这些组件可以适用于**多种数据类型**，而不需要为每种类型都写一份重复的代码。

泛型的核心思想：**把类型当作参数一样传递**，在定义时使用类型占位符（通常用 T、K、U 等表示），在使用时再指定具体类型（或让 TypeScript 自动推断）。

## **泛型的作用**

- 大幅提升**代码复用性**（一个函数/类能处理 `number`、`string`、自定义对象等）
- 保持**类型安全**（编译期就能检查类型是否匹配）
- 避免滥用 `any` 类型（`any` 会关闭类型检查，失去 TypeScript 的意义）
- 让代码更通用、更优雅（常见于工具库、React、Vue 等框架源码）

## **什么是泛型？**

泛型（Generics）是指在定义函数、接口、类的时候，**不预先指定具体的类型**，而是使用一个**类型占位符**（如 `<T>`），等到实际使用时再传入具体类型的一种机制。

它就像给类型开了一个“参数化”的口子，让类型也可以像函数参数一样灵活传入。

## **泛型的基本语法**

### **泛型函数**

```ts
function identity<T>(value: T): T {
    return value;
}

// 使用方式一：显式指定类型
let num = identity<number>(123);          // T 被指定为 number

// 使用方式二：类型推断（最常用）
let str = identity("hello");              // 自动推断 T 为 string
```

### **泛型接口**

```ts
interface Box<T> {
    value: T;
    getValue(): T;
}

const numberBox: Box<number> = { value: 100, getValue: () => 100 };
const stringBox: Box<string> = { value: "hi", getValue: () => "hi" };
```

### **泛型类**

```ts
class Container<T> {
    private data: T;

    constructor(value: T) {
        this.data = value;
    }

    get(): T {
        return this.data;
    }
}

const numContainer = new Container<number>(42);
const strContainer = new Container("TypeScript");
```

### **多个类型参数**

```ts
function merge<T, U>(obj1: T, obj2: U): T & U {
    return { ...obj1, ...obj2 };
}

const result = merge({ name: "Alice" }, { age: 25 });
// result 类型被推断为 { name: string } & { age: number }
```

## **泛型常用约束（extends）**

有时候我们希望泛型不是“任意类型”，而是“某种范围内的类型”：

```ts
function printLength<T extends { length: number }>(item: T): void {
    console.log(item.length);
}

printLength("hello");      // OK
printLength([1,2,3]);      // OK
printLength(123);          // 报错！number 没有 length 属性
```

### **常见内置泛型工具类型（Utility Types）**

TypeScript 内置了很多基于泛型的实用类型，例如：

- `Partial<T>` → 把 T 的所有属性变为可选
- `Required<T>` → 把所有属性变为必选
- `Pick<T, K>` → 从 T 中挑选部分属性
- `Omit<T, K>` → 排除某些属性
- `Record<K, T>` → 创建一个以 K 为键、T 为值的对象类型
- `ReturnType<T>` → 获取函数 T 的返回类型

```ts
type User = { name: string; age?: number };

type PartialUser = Partial<User>;     // { name?: string; age?: number }
type RequiredUser = Required<User>;   // { name: string; age: number }
```

## 总结

泛型可以极大简化，同时类型提示和错误检查会变得异常强大。