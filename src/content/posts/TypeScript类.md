---
title: TypeScript类
published: 2026-03-06
description: ''
image: ''
tags: [TypeScript]
category: '编程语言'
draft: false 
lang: ''
---

TypeScript 中的**类**是面向对象编程（OOP）的核心概念之一。它本质上是一个**对象的蓝图（模板）**，用来描述一类对象应该有哪些**数据（属性/字段）** 和**行为（方法）**。

使用类可以让代码更结构化、可复用、易于维护，并且很好地支持**封装**、**继承**和**多态**等面向对象特性。

### 1. 基本语法与示例

```ts
class Person {
    // 属性（字段）
    name: string;
    age: number;

    // 构造函数（在 new 时自动执行）
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }

    // 方法
    sayHello() {
        console.log(`你好，我是 ${this.name}，今年 ${this.age} 岁`);
    }
}

// 使用类来创建对象（实例）
const p1 = new Person("小明", 18);
p1.sayHello();  // 你好，我是小明，今年 18 岁
```

### 2. 构造函数（constructor）

- 每个类最多只能有一个 constructor
- 如果你不写构造函数，TypeScript 会自动提供一个**空的默认构造函数**
- 常用写法（更简洁）——**参数属性（parameter properties）**

```ts
class Book {
    // 下面这种写法是简写，等价于在类里声明 + 构造函数里赋值
    constructor(
        public title: string,
        public author: string,
        public year: number,
        public genre: string = "未知"
    ) {}
}

const book = new Book("1984", "乔治·奥威尔", 1949);
console.log(book.genre); // "未知"
```

### 3. 访问修饰符

TypeScript 比 JavaScript 更严格，提供了三种访问修饰符：

|修饰符|含义|从类外部能否访问|子类能否访问|
|---|---|---|---|
|public|公开（默认）|可以|可以|
|private|私有（只有类内部能访问）|不可以|不可以|
|protected|受保护（类内部 + 子类能访问）|不可以|可以|

```ts
class Animal {
    public name: string;          // 随便访问
    private secret: string;       // 只有自己能用
    protected family: string;     // 自己和子类能用

    constructor(name: string, secret: string, family: string) {
        this.name = name;
        this.secret = secret;
        this.family = family;
    }
}

class Dog extends Animal {
    showFamily() {
        console.log(this.family);   // 可以
        // console.log(this.secret); // 错误！private 不允许
    }
}
```

### 4. 抽象类（abstract class）

抽象类**不能直接 new**，它的作用是**定义规范**，强制子类去实现某些方法。

```ts
abstract class Animal {
    // 抽象方法：没有实现，只有声明，子类必须实现
    abstract makeSound(): void;

    // 普通方法：可以有实现
    move() {
        console.log("在地球上移动...");
    }
}

class Dog extends Animal {
    // 必须实现抽象方法，否则编译报错
    makeSound() {
        console.log("汪汪！");
    }
}

const dog = new Dog();
dog.makeSound();  // 汪汪！
dog.move();       // 在地球上移动...
```

### 5. 类的其他常见特性（快速概览）

- **readonly** 属性：只能在构造函数中初始化，之后不可改
- **静态成员**（static）：属于类本身，而不是实例
- **getter / setter**：可以控制属性的读写
- **implements** 接口：让类强制遵守某种契约
- **extends** 继承：单继承（只能继承一个父类）

```ts
class Counter {
    static count = 0;           // 静态属性

    constructor(public readonly id: number) {
        Counter.count++;
    }

    get instanceCount() {
        return Counter.count;
    }
}
```

总结：

**TypeScript 的类 = JavaScript 的类 + 类型系统 + 访问控制 + 抽象类 + 接口实现**

它让 JavaScript 的面向对象编程变得更安全、更严谨、更像传统 OOP 语言（C#、Java 等）。