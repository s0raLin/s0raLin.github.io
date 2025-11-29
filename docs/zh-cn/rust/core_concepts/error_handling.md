# chapter_10

错误处理是应用程序应对异常的能力。应用程序可以采取主动或被动的方式进行错误处理。

* 主动错误处理 Rust提供了Result和Option这两个标准类型
* 被动错误处理 Rust提供了panic。当执行过程中(运行时)发生了无法继续运行的异常事件时，就会引发panic。

Rust 彻底放弃了“异常”这种隐式传播的思路，而是走编译期强制处理错误的路线

* 可恢复错误（Recoverable Errors）：
用 Result<T, E> 类型表示。调用者必须显式处理（match、? 运算符）。
-> 这就是所谓的主动错误处理，错误传播路径在类型系统里清清楚楚。

* 不可恢复错误（Unrecoverable Errors）：
用 panic! 表示。通常意味着程序逻辑出现严重问题，无法也不应该继续执行。
-> 这就是 Rust 的被动错误处理，类似“终止程序”的紧急刹车。

panic 和异常的区别
虽然 panic 和异常都基于栈展开（stack unwinding），但理念不同：
* 异常：设计成可以恢复的一般错误机制。
* panic：设计成“程序出 bug 或进入不可能状态时”的终止信号。

```rust
fn divide_two_numbersing_ratio(first: i32, second: i32)-> i32 {
   first/second
}

fn logic() {
    divide_two_numbersing_ratio(1, 0);
}
fn main() {
    logic();
}
```
当panic发生时，栈会按顺序展开: divide_two_numbersing_ratio和logic以及最后的main函数。
在程序终止时会输出用于诊断的错误信息，其中包含了panic发生的具体位置
```rust
thread 'main' panicked at src/bin/13_error.rs:2:4:
attempt to divide by zero
```
错误信息中还包含了调用栈回溯信息。
```rust
stack backtrace:
   0: __rustc::rust_begin_unwind
             at /rustc/1159e78c4747b02ef996e55082b704c09b970588/library/std/src/panicking.rs:697:5
   1: core::panicking::panic_fmt
             at /rustc/1159e78c4747b02ef996e55082b704c09b970588/library/core/src/panicking.rs:75:14
   2: core::panicking::panic_const::panic_const_div_by_zero
             at /rustc/1159e78c4747b02ef996e55082b704c09b970588/library/core/src/panicking.rs:175:17
   3: _13_error::divide_two_numbersing_ratio
             at ./src/bin/13_error.rs:2:4
   4: _13_error::logic
             at ./src/bin/13_error.rs:6:5
   5: _13_error::main
             at ./src/bin/13_error.rs:9:5
   6: core::ops::function::FnOnce::call_once
             at /home/cangli/.rustup/toolchains/stable-x86_64-unknown-linux-gnu/lib/rustlib/src/rust/library/core/src/ops/function.rs:253:5
note: Some details are omitted, run with `RUST_BACKTRACE=full` for a verbose backtrace.
```

最后提示你可以运行 `RUST_BACKTRACE=full cargo run`，获取更详细的调用堆栈信息。

当发生panic时，栈展开的过程为应用程序提供了有序退出时机，这时最重要的是释放占用的资源和内存。
* 有些清理工作是自动完成的。比如删除局部变量
* 有些需要特殊处理。比如堆内存对外部资源的引用。

在栈展开的过程中，实现了Drop trait的值会自动调用drop函数。相当于其他语言的析构函数。
```rust
struct Person {
    name: String,
    age: i32,
}

impl Drop for Person {
    fn drop(&mut self) {
        println!("drop被调用");
    }
}

fn division(first: i32, second: i32) {
    let p = Person{name: "李四".to_string(), age: 18};
    first / second;
}

fn logic() {
    let p = Person{name: "张三".to_string(), age: 18};
    division(1, 0);
}
fn main() {
    logic();
}
```

如果你没有想好为panic事件准备好清理策略，这种情况下，栈展开的过程可能会失去作用。更重要的是，如果没有合适的清理措施，应用程序可能会陷入未知或不稳定的状态，这种情况下最佳方案就是在panic发生时直接终止应用程序。
在Cargo.toml中添加配置来实现这一行为
```toml
[profile.dev]
panic = "abort"
```
需要注意的是，任何人都可以改变这个外部配置，也就意味着这种行为可能会在你的控制之外发生。除了栈回溯外，这也是panic不可预测的并且应该避免的另一种原因。

## panic!宏
panic是由异常情况引发的。其实也可以使用panic!宏来主动强制引发panic.
如果可以的话还是要尽量避免panic。panic!的场景
* 传播现有的panic
* 无法找到可行的解决方案
* 向应用程序发出无法拒绝的通知

```rust
fn main() {
    panic!("hello world")
}
```
包含了自定义描述信息
```rust
thread 'main' panicked at src/bin/13_error.rs:2:5:
hello world
```
Rust还提供一种高级版本的panic!宏，支持格式化字符串。
```rust
fn main() {
    panic!("hello {}", "张三")
}
```

## 处理panic
你可以根据实际情况采取不同措施。
避免栈展开进入外部代码，这可能导致无法预知的行为。比如展开到系统调用就可能引发各种问题。
在Rust中最好做必要的错误处理，如果实在无法进行错误处理，那么可以对panic进行有限的处理，比如记录panic信息并重新触发panic

* catch_unwind方法用于处理panic,在std::panic模块中，
```rust
fn catch_unwind<F: FnOnce()->R+UnwindSafe,R>
    (f: F)->Result<R>
```
catch_unwind接受一个闭包作为参数，并返回一个Result
* 如果闭包没有触发panic,则返回Ok(value) (其中value是闭包调用的结果)
* 当发生panic时，该函数返回Err(error)，其中error是panic的错误值

```rust
use std::any::Any;
use std::panic::catch_unwind;

fn get_data(request: usize)->Result<i8, Box<dyn Any+Send>> {
    let vec:Vec<i8> = (0..100).collect();
    let ret = catch_unwind(||
            vec[request]
    );
    ret

}
fn main() {
    match get_data(100) {
        Ok(value) => println!("{}",value),
        Err(_) => println!("数组访问异常")
    }
    
}
```
可以看到，即使进行了处理，panic消息依然被输出。
其实每个线程都有一个panic hook,它是一个在panic发生时会被调用并输出panic的函数。正是这个hook函数将上面的回溯信息输出出来，当这个功能被启用的情况下，使用std::panic模块中的set_hook函数来替换这个hook,panic hook的调用在panic发生和处理之间。
解决办法是使用一个空的闭包替换默认的hook来去除panic信息
```rust
use std::any::Any;
use std::panic;

fn get_data(request: usize)->Result<i8, Box<dyn Any+Send>> {
    let vec:Vec<i8> = (0..100).collect();
    panic::set_hook(Box::new(|_info|{}));
    let ret = panic::catch_unwind(||
            vec[request]
    );
    ret

}
fn main() {
    match get_data(100) {
        Ok(value) => println!("{}",value),
        Err(_) => println!("数组访问异常")
    }
    
}
```

要能够处理panic首先需要了解panic。与panic相关的信息会以任何类型提供，需要先将其转换为特定类型，然后才能访问有关panic的具体信息。
在前面代码中，我们忽略了panic的具体信息，现在我们需要输出panic的信息。将其向下转型为String
```rust
use std::any::Any;
use std::panic;

fn get_data(request: usize)->Result<i8, Box<dyn Any+Send>> {
    let vec:Vec<i8> = (0..100).collect();
    panic::set_hook(Box::new(|_info|{}));
    let ret = panic::catch_unwind(||
            vec[request]
    );
    ret

}
fn main() {
    match get_data(100) {
        Ok(value) => println!("{}",value),
        Err(error) => println!("{:?}",error.downcast::<String>()),
    }
    
}
```

## unwrap 
在应用程序开发和测试阶段，许多开发者会使用unwrap函数来简化错误处理。
通过unwrap可以把Result或Option中的错误结果转换为panic,这种做法有两个原因。
* 在开发阶段，展示没想好如何处理这些特定的错误。
* 想确保错误不会被忽略。
不过unwrap函数有一些变体适用于更多的场景，而不仅仅是开发阶段。

### 首先介绍unwrap函数
如果Option/Result的值为None/Err(E)，就会引发panic
```rust
fn main() {
    let vec = [1,2,3,5,5];
    let ret = vec.get(5).unwrap();
    println!("{}",ret);
}
```
## expect
可以用expect替换unwrap函数，区别是expect可以在panic时指定错误信息，而unwrap只有默认信息。
```rust
fn main() {
    let vec = [1,2,3,5,5];
    let ret = vec.get(5).expect("索引越界");
    println!("{}",ret);
}
```

---

有些unwrap函数的变体出现错误时不会引发panic,这样的方法对于错误处理非常有用。甚至可以处于非开发阶段。
---
## unwrap_or
当出现错误时，这个方法会返回一个预设的替代值而不是直接引发panic。
```rust
fn main() {
    let vec = [1,2,3,5,5];
    let ret = vec.get(5).unwrap_or(&100);
    println!("{}",ret);
}
```
---
>另外一个变体是unwrap_or_else
### unwrap_or_else
替代值是一个闭包，这个替代值需要通过计算或涉及复杂逻辑时很有用。当unwrap出现错误(None/Err)时，会自动调用这个闭包。
```rust
fn main() {
    let vec = [1,2,3,5,5];
    let ret = vec.get(5).unwrap_or_else(|| &100);
    println!("{}",ret);
}
```
### unwrap_or_default
在遇到错误时会返回对应类型的默认值。返回的具体默认值由类型决定，比如整型的默认值是0。需要注意的是，并非所有类型都有默认值，只要实现了Default trait的类型才有相应的默认值，**而引用没有实现这个trait,所以不能使用这个方法**。
```rust
fn main() {
    let vec: Option<i8> = None;
    let ret = vec.unwrap_or_default();
    println!("{}",ret);
}
```

## Result/Option模式匹配
主动实现错误处理的函数会返回Result/Option枚举。调用方需要解析返回值并做出正确的处理。
* 标准的做法是使用match表达式，分别处理成功和失败两种情况
```rust
fn faker()->Result<i8, String> {
    Ok(0)
}
fn transform()->Result<bool, String> {
    match faker() {
        Ok(val) => Ok(val>10),
        Err(err) => Err(err),
    }
}
fn main() {
    let ret = transform();
    println!("{}",ret.unwrap_or_default());
}
```

## map
map函数是一个高阶函数,接收一个闭包来执行转换过程。Option和Result都实现了map函数，这种方式就不需要前面的match了，而是依赖于map来转换Result和Option的值。
```rust
fn Option<T>::map<U, F>(self, f: F)->Option<U> 
where F: FnOnce(T)->U
```
map函数将`Option<T>`转换为`Option<U>`。这本质上是将Some变体中的T转换为U,如果结果是None,则map函数只会简单地传递None。
```rust
pub fn map<U, F>(self, op: F)->Reuslt<U, E>
where F: FnOnce(T)->U
```
对于Result类型，map的行为相似，不过不同的是`Result<T, E>`被转换为`Result<U, E>`,相应地，就是把Ok变体T转换为U,如果结果是Err,则map函数将传递这个信息。
```rust
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::<&str, i32>::new();
    map.insert("张三", 42);
    map.insert("李四", 53);
    let ret = map.get("张三").map(|temp| (*temp as f64)/2 as f64);
    println!("{}",ret.unwrap_or_default()); // 新类型的值
    println!("{}", map.get("张三").unwrap()); //原来的值
}
```

HashMap的get方法将返回一个指定K对应的`Option<i32>`,然后map将原来的值转换为f64并除2.0。然后返回`Option<f64>`

## and_then
与map作用效果类似不过不同的是:and_then函数将`Option<Option<U>>``扁平化为Option<U>`，并返回展开后的内层结果
而下面这段代码无法编译
```rust
use std::collections::HashMap;

fn f_to_c(f: f64)->Option<f64> {
    let f = f as f64;
    Some((f-31.5)*0.566)
}
fn into_celsius(cities: &HashMap<&str, f64>, city: &str)->Option<f64> {
    let ret = cities.get(&city).map(|temp|f_to_c(*temp));
    ret
}

fn main() {
    let mut map = HashMap::new();
    map.insert("a", 42.0);
    map.insert("b", 42.1);
    map.insert("c", 57.1);
    into_celsius(&map, "a");
}
```
这是因为这里map返回的是`Option<Option<f64>>`，然而into_celsius的返回值为`Option<f64>`
对于这种情况，and_then函数可以解决这个问题。
```rust
use std::collections::HashMap;

fn f_to_c(f: f64)->Option<f64> {
    let f = f as f64;
    Some((f-31.5)*0.566)
}
fn into_celsius(cities: &HashMap<&str, f64>, city: &str)->Option<f64> {
    let ret = cities.get(&city).and_then(|temp|f_to_c(*temp));
    ret
}

fn main() {
    let mut map = HashMap::new();
    map.insert("a", 42.0);
    map.insert("b", 42.1);
    map.insert("c", 57.1);
    into_celsius(&map, "a");
}
```
这里into_celsius函数返回的是一个Option枚举。不过也有一种合理的观点是它应该返回Result枚举。into_celsius之所以返回Option,是为了方便对齐HashMap::get返回的Option类型。如果将into_celsius改为Result类型，就无法直接使用map函数了。在这种情况下可以
* 使用Option::ok_or函数，它可以将Option转换为Result，
* 反过来使用Result::ok函数将Result转换为Option
```rust
fn ok_or<E>(self, err: E)->Result<T, E>
```

ok_or示例
```rust
use std::collections::HashMap;

fn f_to_c(f: f64)->Option<f64> {
    let f = f as f64;
    Some((f-31.5)*0.566)
}
fn into_celsius(cities: &HashMap<&str, f64>, city: &str)->Result<f64, String> {
    cities
        .get(city)
        .and_then(|temp|f_to_c(*temp))
        .ok_or("转换失败".to_string())
}

fn main() {
    let mut map = HashMap::new();
    map.insert("a", 42.0);
    map.insert("b", 42.1);
    map.insert("c", 57.1);
    let ret = into_celsius(&map, "a");;
    println!("{}",ret.unwrap());
}
```

## 富错误
错误的值都是各不相同的，有些错误值包含了丰富的信息，能提供额外的重要细节。
带有丰富信息的要求是实现Error trait和Display trait。
io::Error是一种包含丰富信息的错误类型代表。

* unwrap_err从Result中解包Err值 它和unwrap的作用相反，当解包出Ok时则会引发panic.

## 自定义错误
你可以自定义包含丰富信息的错误。添加更多的信息有助于应用程序正确地响应错误。
