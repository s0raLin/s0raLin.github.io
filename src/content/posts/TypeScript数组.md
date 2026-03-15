---
title: TypeScript数组
published: 2026-03-06
description: ''
image: ''
tags: [TypeScript, 基础]
category: '编程语言'
draft: false 
lang: ''
---


## 数组的定义（Definition of an Array）

数组是一种容器，它允许你按顺序存储数据，就像整理购物清单上的物品。它是一种用来组织和获取数据的结构化方式。数组通常用于以顺序结构存储数据。

可以把数组想象成一个购物清单，其中每一项代表一条独立的信息。例如，如果我们创建一个用于列出杂货的数组，那么每个元素代表一种食物。

使用数组的好处在于它的 **有序性**。就像购物清单上的物品按照特定顺序排列一样，数组中的数据也按照顺序存储。这种排列方式使得访问和操作数据变得更加方便。通过引用数组中元素的位置（称为 **索引 index**），我们可以在需要时高效地获取或修改数据。

---

## 为什么编程中要使用数组（Why Arrays Are Used in Programming）

数组在编程中被广泛使用，原因有很多。数组的主要用途之一是 **存储相同类型的多个值**。与其单独声明和管理多个变量，不如使用数组，通过一个变量名来管理一组数据。

数组在处理 **顺序数据（Sequential Data）** 时尤其有用。顺序数据指的是具有特定顺序的信息，例如：

- 一系列数字
- 字符
- 对象

通过数组，程序员可以有效地组织和操作这些数据。

例如，一个程序需要存储 **100 个学生成绩**：

- 不使用数组：需要创建 100 个变量
- 使用数组：只需要一个数组即可存储所有成绩

数组还能高效管理大量数据。程序员可以：

- 遍历数组元素
- 进行计算
- 对整个数据集应用算法

此外，数组还提供了一种方便的方法在 **函数之间传递或返回多个值**。

---

## 在 TypeScript 中声明数组（Declaring an Array in TypeScript）

### 数组元素与类型（Array Elements and Types）

在 TypeScript 中，数组可以分为两类：

#### 1. 类型数组（Typed Arrays）

也称为 **静态数组**：

特点：

- 长度固定
- 只能存储指定类型的数据

例如：

```ts
let numbers: number[] = [1,2,3];
```

#### 2. 非类型数组（Untyped Arrays）

也称为 **动态数组**：

特点：

- 长度可以动态变化
- 可以存储任意类型的数据

例如：

```ts
let arr: any[] = [1,"hello",true];
```

---

##### 类型数组的特点

- 长度在初始化后 **不可改变**
- 适用于数组长度 **提前确定** 的场景
- 内存 **在编译时分配**

##### 非类型数组的特点

- 长度可以动态改变
- 内存 **在运行时分配**

---

## 类型安全（Type Safety）

类型数组可以确保数组中的每个元素都属于指定类型，从而：

- 提高类型安全
- 防止类型错误

而非类型数组虽然更灵活，但更容易产生类型错误。

---

### TypeScript 数组类型写法

TypeScript 中数组有两种写法：

#### 写法1：数组语法

```ts
let numbers: number[];
```

表示：只包含 **number 类型** 的数组。

#### 写法2：泛型数组

```ts
let numbers: Array<number>;
```

这两种写法 **完全等价**。

---

## 数组中可以存储的元素类型

数组是一种数据结构，可以存储 **多个元素**。

这些元素理论上可以是任何数据类型，例如：

- number
- string
- boolean
- object

但通常数组被设计为存储 **相同类型的数据**。

例如：

```ts
let nums: number[] = [1,2,3];
```

这里所有元素都是 **number 类型**。

---

## 数组索引（Index）

数组中的每个元素都有一个 **索引**。

特点：

- 第一个元素索引为 **0**
- 每个元素索引递增 **1**

例如：

```ts
let arr = [10,20,30]  
  
arr[0] // 10  
arr[1] // 20  
arr[2] // 30
```

---

## 为什么数组元素通常要同类型？

数组在内存中是 **连续存储（contiguous memory）** 的。

如果元素类型相同：

- 每个元素占用相同内存空间
- 访问和计算更加高效

---

## 同构集合 vs 异构集合

(Homogeneous vs Heterogeneous Collections)

### 同构集合（Homogeneous）

集合中的所有元素 **类型相同**

例如：

```ts
let grades: number[] = [90,85,88]
```

优点：

- 数据结构可预测
- 操作简单高效

适用场景：

- 学生成绩
- 数字列表

---

### 异构集合（Heterogeneous）

集合中的元素 **类型不同**

例如：

```ts
let data: any[] = [1,"Tom",{age:20}]
```

优点：

- 灵活性高
- 可以存储复杂数据结构

常见场景：

- 字典
- 复杂对象数据

---

## 泛型数组（Generic Array Type）

**泛型数组**允许创建可以存储不同类型元素的数组，同时仍然保持类型检查。

例如：

```ts
let arr: Array<number>;
```

泛型在以下场景非常有用：

- 实现数据结构
- 编写通用程序
- 处理用户输入

---

## 在 TypeScript 中创建数组（Creating Arrays）

TypeScript 创建数组的方法：

### 方法1：声明类型

```ts
let numbers: number[]
let numbers: Array<number>
```

---

### 方法2：初始化数组

```ts
let numbers: number[] = [1,2,3,4,5]
```

或

```ts
let numbers: Array<number> = [1,2,3,4,5]
```

---

### 方法3：类型推断

TypeScript 可以自动推断类型：

```ts
let fruits = ["apple","banana","orange"]
```

TypeScript 自动推断为：

```ts
string[]
```

---

## 数组操作

数组可以动态修改，例如：

```ts
push()  
pop()  
splice()
```

例如：

```ts
let nums = [1,2] 
  
nums.push(3) // 添加  
nums.pop()   // 删除最后一个
```

---

## 使用字面量初始化数组

(Initializing Arrays with Literal Values)

语法：

```ts
let arrayName: dataType[] = [value1,value2,value3]
```

例如：

```ts
let numbers: number[] = [1,2,3]
```

数组可以存储：

- string
- number
- boolean
- object

---

## 使用 Array 构造函数创建数组

(Creating Arrays with the Array Constructor)

JavaScript 可以使用 **Array 构造函数**创建数组：

```ts
Array(5)
```

表示：

创建一个 **长度为 5 的空数组**

创建数组的三种方式：

1. 数组字面量

```js
[]
```

1. 构造函数

```js
Array()
```

1. new 关键字

```js
new Array()
```

---

## 使用方括号声明数组

(Using Square Brackets Notation)

声明数组时最常用的方式是 **方括号 `[]`**。

例如：

```ts
let nums: number[]
```

这种方式：

- 简洁
- 常用
- 易读

---

## 访问数组元素（Accessing Array Elements）

### 数组索引（Indexing）

访问数组元素需要使用 **索引**。

数组索引从 **0 开始**。

例如：

```js
let numbers = [10,20,30]  
  
numbers[0] // 10  
numbers[1] // 20  
numbers[2] // 30
```

如果要访问 **第三个元素**：

```js
numbers[2]
```

---

## 访问单个元素 vs 多个元素

### 访问单个元素

```ts
myArray[2]
```

---

### 访问多个元素

通常使用 **循环（loop）**：

例如：

#### C风格循环

```ts
for(let i=0;i<arr.length;i++){  
  console.log(arr[i])  
}
```

---

#### TypeScript 推荐方式

##### for...of

```ts
for(let item of arr){  
  console.log(item)  
}
```

---

##### 解构数组（Destructuring）

```ts
let [a,b,c] = arr
```
