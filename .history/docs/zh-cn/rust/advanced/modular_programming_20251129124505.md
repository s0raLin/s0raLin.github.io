# 模块化编程

模块在软件开发中扮演着至关重要的角色，它使开发者能够更有效地组织和管理代码。通过将程序结构按层级或功能进行划分，可以避免“单体式开发”带来的弊端。
> 在单体程序中，所有代码都集中在一个源文件中，这对于包含成百上千行代码的大型项目来说，无疑会使代码查找、理解和后续维护变得异常困难。将程序拆分为多个模块是解决这些问题的有效途径。

## 模块的本质与命名

从本质上讲，模块用于汇集相关的程序元素，这些元素可以包括结构体、枚举、函数以及全局变量等。值得注意的是，模块也可以是空的，即不包含任何元素。

模块的命名应清晰地反映其语义上下文。

## Rust 中的模块

Rust 语言本身就大量依赖模块来对功能进行分类和组织，从而极大地提高了代码的可理解性。常见的 Rust 标准库（std crate）模块示例如下：

* std::string：集合了与字符串操作相关的各种项，包括常用的字符串类型。

* std::fmt：提供了对 format! 等格式化宏的支持。

* std::io：将所有输入/输出相关的项进行分组，例如 Stdout (标准输出)、Stdin (标准输入) 和 StdErr (标准错误) 等类型。

这些模块的名称清晰地反映了它们的内容上下文，例如 std::io 明确指代输入/输出功能。

### 模块的层级结构

Rust 允许通过模块构建逻辑层级结构，形成一个模块树。模块路径使用 :: 作为分隔符。例如，路径 std::os::linux::net 揭示了一个层级关系：

* std 是包含 os 模块的顶级 Crate。

* os、linux 和 net 都是子模块。

net 模块的上下文是与其祖先模块的上下文（操作系统、Linux、网络）相结合的。因此，net 模块包含了诸如 TcpStreamExt 和 SocketAddrExt 类型的 Linux 特定网络功能实现。

### 与其他语言的对比

尽管模块与其它编程语言（如 Java、Python、C++）中的命名空间有相似之处，它们都用于防止命名冲突和组织代码，但 Rust 的模块还提供了额外的功能和更严格的可见性控制。

**Rust中的模块分为两类**
* **模块项** 定义在单个源文件内部的模块
* **模块文件** 以独立文件的形式存在的模块

**模块有两种模式**
* **新模式** 在Rust1.30中引入的
* **遗留模式** Rust1.30之前的模式

两种模式至今都被支持且使用广泛

## 模块项
模块使用mod关键字声明。你可以在源文件中声明一个模块项
```rust
mod name {
    /* 模块内容 */
}
```
在花括号内，可以添加结构体和其他项。在默认情况下，模块项是私有项(仅在模块内可见)。为了让其在模块外可见，在项前加pub关键字。

```rust
mod greetings {
    pub fn hello() {
        println!("Hello, world!");
    }
}
fn hello() {
    println!("Hello");
}

fn main() {
    hello();
    greetings::hello(); // 可以调用，因为 hello 是 pub
}
```

通过上述例子，我们可以发现，使用模块可以避免命名冲突。

模块与结构体、枚举以及其他类型共享相同的命名空间。因此，你不能在同一作用域内让类型和结构体使用相同名称。
```rust
mod example {

}
struct example; //报错

fn main() {

}
```

可以在模块中声明子模块。通过这种方式可以创建逻辑层次结构。子模块的深度没有限制。在访问某项时，你必须以完整的模块路径作为前缀。
```rust
mod solar_system {
    pub mod earth {
        pub fn get_name()-> &'static str {
            "Earth" //地球
        }
        pub mod constants {
            pub static DISTANCE: i64 = 93_000_000; // 离太阳的距离
            pub static CIRCUMFERENCE: i32 = 24_901; //地球周长
        }
    }
    /* 其他八个行星 */
}

fn main() {
    println!("{}", solar_system::earth::get_name());
    println!("Distance from Sun {}", solar_system::earth::constants::DISTANCE)
}
```

封装是模块的另一个特性。在一个模块中，你可以为用户定义一个公共接口(使用pub关键字)，同时隐藏其他细节。使用pub关键字定义公共项和公共接口。其他所有内容都是默认隐藏的。这允许开发者在应用程序中更好地建模现实世界的实体。
```rust
// 定义一个名为 money_vault 的模块
mod money_vault {
    // 1. 定义一个公共结构体。注意：结构体本身是公共的，但它的字段默认是私有的。
    pub struct Vault {
        // 2. balance 字段是私有的 (默认)，外部代码无法直接访问或修改它。
        balance: f64,
    }

    // 3. 为 Vault 实现一个公共接口
    impl Vault {
        // 公共构造函数（关联函数）：允许外部代码创建 Vault 实例。
        pub fn new(initial_balance: f64) -> Vault {
            Vault {
                balance: initial_balance,
            }
        }

        // 公共方法：允许外部代码安全地存入金额。
        pub fn deposit(&mut self, amount: f64) {
            if amount > 0.0 {
                self.balance += amount;
                self.log_transaction("Deposit", amount); // 调用私有方法
            }
        }

        // 公共方法：允许外部代码安全地取出金额。
        pub fn withdraw(&mut self, amount: f64) -> bool {
            if amount > 0.0 && self.balance >= amount {
                self.balance -= amount;
                self.log_transaction("Withdrawal", amount); // 调用私有方法
                true
            } else {
                false
            }
        }

        // 公共方法：允许外部代码查看余额。
        pub fn get_balance(&self) -> f64 {
            self.balance // 允许读取私有字段
        }
        
        // 4. 私有方法 (默认私有，没有 pub 关键字): 外部代码无法调用它。
        fn log_transaction(&self, kind: &str, amount: f64) {
            println!("Transaction: {} of ${:.2}. New balance: ${:.2}", kind, amount, self.balance);
        }
    }
}

fn main() {
    // 1. 成功：通过公共构造函数创建实例。
    let mut safe = money_vault::Vault::new(100.0);
    println!("Initial balance: ${:.2}", safe.get_balance()); // 输出：100.00

    // 2. 成功：通过公共方法进行操作。
    safe.deposit(50.0);
    
    if safe.withdraw(20.0) {
        println!("Withdrawal successful.");
    } else {
        println!("Withdrawal failed.");
    }

    println!("Current balance: ${:.2}", safe.get_balance()); // 输出：130.00

    // 3. 编译错误 (Encapsulation enforced): 尝试直接访问私有字段。
    // safe.balance = 9999.0; 
    // ^ 错误: 字段 `balance` 是私有的 (field `balance` is private)

    // 4. 编译错误 (Encapsulation enforced): 尝试调用私有方法。
    // safe.log_transaction("Hacking attempt", 1000.0);
    // ^ 错误: 方法 `log_transaction` 是私有的 (method `log_transaction` is private)
}
```


## 模块文件
模块文件包含整个文件。这与模块不同，模块项使用大括号来定义模块的范围。而对于模块文件来说，文件本身就是模块的范围，因此不需要使用大括号。用mod关键字和名称定义一个模块文件。
```rust
mod mymod; // mymod.rs
```
无论是模块文件还是模块项，模块的逻辑路径不会改变。你仍然需要使用::来分隔模块路径中的模块。

```rust
// hello.rs
pub fn hello() {
    println!("hello world");
}

// main.rs
mod hello;
fn main() {
    hello::hello();
}
```
main.rs和hello.rs在同一目录
![alt text](zh-cn/rust/images/main_and_hello_same_directory.png)

然而，你可能希望模块文件创建子目录，以保持物理结构。使用mod关键字，你可以在模块文件内声明子模块文件。子模块文件根据模块名称(如module.rs)放在子目录中。

可以通过一个示例来展示，比如创建一个以不同语言展示HelloWorld的程序。

![alt text](zh-cn/rust/images/module_file_structure.png)

```rust
mod greeting {
    pub mod chinese;
    pub mod english;
}

fn main() {
    greeting::chinese::hello();
}

// chinese.rs
pub fn hello() {
    println!("你好世界");
}

// english.rs
pub fn hello() {
    println!("Hello World");
}
```

path 属性
使用path属性可以显式设置模块的物理位置来覆盖默认设置。可以直接将path属性引用于模块。
```rust
// main.rs
#[path="./cool/cooler.rs"]
mod cooler;

fn main() {
    cooler::funca();
}

// cooler.rs #[path="./cool/cooler.rs"]
pub funca() {
    println!("Doing something");
}
```

## 函数与模块
也可以在函数内声明模块，其原理是相同的。模块可用于在函数内对项分组、创建层次结构、消除歧义等。
* 在函数内声明的模块(包括其项)无法在函数外访问。
* 在模块内声明的变量必须是静态值或常量。
* 函数内声明的模块的项目必须是pub的才能在函数中使用。

```rust
fn funca(input: bool) {
    if input {
        mod1::do_something();
    } else {
        mod2::do_something();
    }

    mod mod1 {
        use std::println;

        pub fn do_something() {
            println!("in mod1");
        }
    }

    mod mod2 {
        use std::println;

        pub fn do_something() {
            println!("in mod2");
        }
    }

}

fn main() {
    funca(true);
}
```

## crate、super、self关键字
可以在模块路径中使用crate、super和self关键字。
* crate 用于从crate根模块进行导航。在任何模块内部都是绝对路径
* super 从父模块开始导航。这是一个相对路径，通常比crate(绝对路径)更可靠
* self 指的是当前模块

## 遗留模式
虽然在Rust1.30引入了模块的新模式。但遗留模式仍然被使用。使用遗留模式和新模式创建的模块没有区别。
对于遗留模式的模块创建步骤如下:
1. 在模块中声明一个子模块，如mod name(模块名称).
2. 使用该模块名称创建一个子目录
3. 在子目录中放置mod.rs文件
4. 在模块子目录中，为之前命名的美国子模块创建同名模块文件。

![alt text](zh-cn/rust/images/legacy_module_structure.png)

```rust
// main.rs
mod hello;

fn main() {
    hello::chinese::hello();
}

//mod.rs
pub mod chinese;
pub mod english;


//chinese.rs
pub fn hello() {
    println!("你好世界");
}

// english.rs
pub fn hello() {
    println!("Hello World");
}
```

