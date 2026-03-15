---
title: TypeScript实用工具类型
published: 2026-03-06
description: ''
image: ''
tags: [TypeScript]
category: '编程语言'
draft: false 
lang: ''
---




TypeScript 中的工具类型是内置的类型操作符，帮助开发者对已有类型进行调整和转换。这些工具简化了高效且复杂的**数据结构**的开发，提升了代码的组织性和可读性。

## 常用工具类型
```ts
Partial<Type>
```

Partial 类型可以创建一个新类型，其中原始类型的所有属性都变为可选的。这在处理对象时非常有用，尤其是当某些属性并非总是存在时。
```ts
Pick<Type, Keys>
```
Pick 类型允许从原始类型中挑选特定的属性来创建一个新类型。这能降低复杂度，仅保留必要的属性，使代码更高效。
```ts
Omit<Type, Keys>
```
Omit 类型与 Pick 相反，它通过排除指定的属性来创建一个新类型。当你想通过移除不需要的属性来简化对象时，这个类型非常有帮助。

## 工具类型的重要性

使用工具类型可以显著提升**代码可读性**和**类型安全性**。它们让开发者能够表达更精确的类型约束，减少运行时错误，并优化开发流程。

## **ReturnType** 工具类型

 **ReturnType 的解释**

ReturnType 工具类型允许开发者在不实际调用函数的情况下，获取函数的返回类型。这对于处理 TypeScript 难以直接推断的复杂返回类型特别有用。

**如何使用 ReturnType**

使用方式是将它应用于函数类型，语法为：ReturnType<typeof 函数名>。这样就能获取指定函数的返回类型。

示例
```ts
function add(a: number, b: number): number {
  return a + b;
}
type AddReturnType = ReturnType<typeof add>; // number
```

## 对象类型与工具类型

**对象操作工具类型**

TypeScript 提供了多种用于操作对象类型的工具类型：

- Partial：使所有属性变为可选
- Required：使所有属性变为必选
- Readonly：使所有属性变为只读
- Pick：选择特定属性
- Omit：排除特定属性
- Record：根据指定的键和值类型创建一个对象类型

**如何操作对象类型**

下面是如何使用工具类型来定义和操作对象类型的示例：

```ts
interface User {
  id: number;
  name: string;
  email?: string;
}
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type ReadonlyUser = Readonly<User>;
type UserIdAndName = Pick<User, 'id' | 'name'>;
type UserWithoutEmail = Omit<User, 'email'>;
```

## 函数类型

**函数类型基础**

函数类型描述了函数的结构和行为，指定了函数期望的参数类型以及返回值类型。

**结合工具类型使用函数类型**

TypeScript 提供了 Parameters 和 ReturnType 等工具类型，用于捕获和操作函数的参数类型及返回值类型。

示例

```ts
function multiply(a: number, b: number): number {
  return a * b;
}
type MultiplyParams = Parameters<typeof multiply>; // [number, number]
type MultiplyReturnType = ReturnType<typeof multiply>; // number
```

## 联合类型（Union Type）

**定义与用法**

联合类型允许变量或函数参数接受多种类型，使用 符号表示。

**组合类型创建联合类型**

可以通过组合多个类型来创建联合类型：

```ts
type StringOrNumber = string | number;
```


通过使用这些工具，开发者可以编写更加灵活、可维护的代码。