# chapter_12

泛型可以看作构建函数和类型定义的模板。标准库中有很多常见类型例如`Result<T, E>`、`Option<T>`、`Vec<T>`等都是泛型实现的。主要用于代码的特化。Rust是静态类型语言，因此泛型的类型参数(T)需要在编译期解析为具体类型，这种特性就是参数化多态性。泛型的实现还采用单态化技术，会根据实际传入的类型参数，将泛型实例化为唯一的专用类型。
泛型的优点：
* 代码复用：只需编写一套代码，可以用于不同的类型。
* 重构：重构变得更简单，因为泛型只有一份源码，不需要维护多份类型不同但功能相同的代码
* 扩展性：可扩展性强，未来即使出现新的数据类型，泛型代码依然适用。
* 更不容易犯错：使用泛型减少了大量重复代码的实现，，潜在的错误也变少。
* 独特功能：Rust中的泛型机制带来了独特的能力->函数重载

## 泛型函数
泛型函数是使用类型参数的函数模板，用于创建具体函数，
* 类型参数要在函数名后使用`<>`声明
* 命名惯例使用大驼峰命名，第一个类型参数一般用`T`,接着是U、V等
```rust
fn function_name<T>(param: T)->T {
    let variable: T;
}
```
示例

```rust
fn swap<T, U>(tuple: (T, U))->(U, T) {
    (tuple.1, tuple.0)
}
fn main() {
    let tuple = (1, "hello");
    let tuple1 = ("hello".to_string(), "world".to_string());
    let tuple2 = (3.14, 98);

    let t_swap = swap(tuple);
    let t1_swap = swap(tuple1);
    let t2_swap = swap(tuple2);

    println!("{:?}", t_swap);
    println!("{:?}", t1_swap);
    println!("{:?}", t2_swap);
    
}
```

编译器自动推导出了具体的类型，编译器会根据函数定义，选择调用对应的函数版本。

编译器通常能从参数类型推导出对应的类型参数，但如果无法推导出具体类型，就需要显式指定类型
```rust
function_name::<type,...>(arg,...)
```

示例
```rust
fn do_something<T: Default>()->T {
    let value: T = T::default();
    value
}

fn main() {
    let ret = do_something::<i8>();
    println!("{}", ret);
}
```

### 泛型约束
在编译期，编译器对这些参数类型的实际类型并不了解，因此，编译器需要对使用类型参数的代码添加合理的限制。
可以把类型参数看作一个装着某种工具的黑盒子，你不知道里面具体是什么，但是你想安全地执行一些操作，这个时候会看有关于盒子内容的提示会非常有用。
trait约束就是用来限制类型参数的行为，可以限定单个或多个trait，每个trait都会告诉编译器类型参数应该具备哪些能力。

> 使用(:)用于添加trait约束，如`<T: Trait>`
```rust
use std::fmt::Display;

fn do_something<T: Display>(t: T) {
    println!("{}",t);
}

fn main() {
    do_something(20);
}
```
因为格式化字符串中的{}占位符需要实现Display trait,编译器不能假设类型参数T具有此特性。

可以给类型参数指定多个限制
```rust
<T: Trait1+Trait2+...>
```

示例
```rust
use std::{cmp::Ordering, fmt::Display};

fn largest<T: Ord+Display>(arg1: T, arg2: T) {
    match arg1.cmp(&arg2) {
        Ordering::Less => println!("{arg1} < {arg2}"),
        Ordering::Greater => println!("{arg1} > {arg2}"),
        Ordering::Equal => println!("{arg1} == {arg2}"),
    }
}

fn test() {
    largest(1, 2);
    largest("arg1", "arg2");
    largest('a', 'b');
    largest(100, 99);

}
fn main() {
    test();
}
```
largest是一个泛型函数，用于比较并输出结果。
要支持比较，这个类型必须实现Ord trait; 使用占位符{},要求这个类型必须实现Display,这两个trait都被应用与T的约束。

### where 
where是约束的另一种表示方法，这种方法的表达力更强
```rust
use std::fmt::Debug;

fn do_something<T>(t: T)
where T: Debug {
    println!("{:?}", t);
}
fn main() {
    let tuple = (1,2,3,5);

    do_something(tuple);
}
```

## 泛型结构体
除了函数之外，结构体同样支持泛型，在定义结构体时，可以在结构体名称后面加上`<T>` 之后该参数可以被用于结构体定义的任何位置(字段和方法)

```rust
struct Wrapper<T> {
    internal: T
}
fn main() {
    let obj = Wrapper {internal: 24};

    /* 会被单态化成i32类型
        struct wrapper {
            internal: i32
        }
    */

}
```
由于单态化机制，编译器会用i32类型实例化Wrapper结构体

泛型结构体不仅可以使用类型参数定义字段，还可以将类型参数用于方法定义。
```rust
use std::fmt::Debug;

#[derive(Debug)]
struct Wrapper<T> {
    internal: T
}

impl<T: Copy> Wrapper<T> {
    fn get(&self) -> T {
        self.internal
    }
}

fn main() {
    let obj = Wrapper { internal: 20 };
    let obj1 = Wrapper {internal: "hello".to_string() };

    let ret = obj.get();
    println!("{}",ret);
}
```
只有字段类型实现了Copy的T，才能调用该impl块内的所有方法。由于set方法需要创建T类型的拷贝，所以需要T实现Copy trait。而String类型不属于实现了Copy trait的类型，因此实例化后不具备get方法。

除了从结构体那里继承的类型参数，方法也可以定义专属于自己的类型参数。
```rust
use std::fmt::{Debug, Display};

#[derive(Debug)]
struct Wrapper<T> {
    internal: T
}

impl<T: Copy+Display> Wrapper<T> {
    fn display<U: Display>(&self, prefix: U, suffix: U) {
        println!("{prefix} {} {suffix}", self.internal);
    }
}

fn main() {
    let obj = Wrapper { internal: 20 };
    obj.display("(",")");
}
```


## 关联函数
你可以将泛型与关联函数一起使用
```rust
use std::fmt::{Debug, Display};

#[derive(Debug)]
struct Wrapper<T> {
    internal: T
}
impl<T: Display> Wrapper<T> {
    fn hello(name: T) {
        println!("hello {}",name)
    }
}

fn main() {
    Wrapper::hello("张三");
}
```
由于hello方法传入了一个&str类型的参数，编译器可以推断出T的类型，因此就不需要手动指定。
而下面这种情况需要手动指定类型：
```rust
use std::fmt::{Debug, Display};

#[derive(Debug)]
struct Wrapper<T> {
    internal: T
}
impl<T> Wrapper<T> {
    fn hello() {
        println!("helloworld");
    }
}

fn main() {
    Wrapper::<&str>::hello();
}
```


## 枚举
枚举类型参数需要在枚举名称后的`<>`内声明，之后在定义每个枚举的变体(内部字段)时，都需要在`()`内指明具体应用了哪些类型参数
```rust
enum Option<T> {
    Some<T>
    None,
}
```
由于Option和Result这两个enum没有包含函数返回的全部情况，我们可以自定义一个新的枚举类型
```rust
enum Repeat<T, U> {
    Continue(U),
    Some(T),
    None,
}

fn do_something(number: i32)->Repeat<i32, i32> {
    if number <= 0 {
        Repeat::None
    } else {
        Repeat::Continue(number-1)
    }
}
fn main() {
    let mut number = 100;
    loop {
        if let Repeat::Continue(value) = do_something(number) {
            println!("{}", value);
            number = value
        } else {
            break;
        }
    }
}
```

也可以对泛型枚举中使用的类型参数进行约束
```rust
#[derive(Debug)]
enum Emp<T: Clone> {
    Id(T),
    Name(String),
}

fn get_emp()->Emp<String> {
    Emp::Id("001".to_string())
}

fn main() {
    let emp = get_emp();
    println!("{:?}", emp)
}
```
这样，在创建实例时就必须满足。

## 泛型trait
泛型可以实现类型的抽象，而trait则用于代码的抽象。适当结合这两种技术，可以发挥泛型编程的最大潜力。
```rust
use std::fmt::Display;

struct XStruct<T, U> {
    field1: T,
    field2: U,
}
trait ATrait<T> {
    fn do_something(&self, arg: T);
}

impl<T: Display, U> ATrait<T> for XStruct<T, U> {
    fn do_something(&self, arg: T) {
        println!("{}",arg);
    }
}

fn main() {
    let xstruct = XStruct{ field1: "张三", field2: "李四" };

    xstruct.do_something("王五");
}
```

### 通用扩展trait
它可以为所有类型提供一个统一的trait实现，需要组合泛型和trait才能获得的特殊功能。
```rust

```