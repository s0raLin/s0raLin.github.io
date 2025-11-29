# chapter_13

模式在Rust中主要有两个用途
* 实现数据的模式匹配和解构，先看看这个数据长什么样子（是否符合某个结构），如果符合，就把它“拆开”，把里面的各个部分拿出来单独使用
* 程序流程控制，match、while、if等都可以根据模式是否与值匹配来决定程序的执行路径。
模式匹配可以用于标量值，也可以用于符合数据类型(结构体、枚举、数组等)

模式由一系列规则和符号构成，由于描述一个值的结构。模式匹配可用于变量绑定、表达式、函数参数、返回值等场合。

## let语句
let通过模式匹配机制将一个值绑定到新变量上，如果模式就是单个变量名的形式，那么它就属于不可反驳模式，即不存在匹配失败的情况。
```rust
fn main() {
    let a = 3;
    let b = (1,3);
    println!("{a}");
    println!("{b:?}")
}
```
以下是更复杂的例子

匹配元组
```rust
fn main() {
    let (a,b) = (1,2);
    println!("{a} {b}");
}
```
匹配数组
```rust
fn main() {
    let list = [1, 2, 3, 4];
    let [a, b, c, d] = list;
    println!("{} {} {} {}", a, b, c, d);
}
```
对现有变量进行模式匹配
```rust
fn main() {
    let mut a = 0;
    let mut b = 0;
    (a, b) = (1, 2);
    println!("{} {}", a, b)
}
```

### 通配符
下划线(_)用于忽略某个对应的值
```rust
fn main() {
    let list = [1, 2, 3, 4];
    let [a, _, _, d] = list;
    println!("{a} {d}")
}
```
双点号(..)用来忽略一部分连续值
```rust
fn main() {
    let list = [1, 2, 3, 4];
    let [a, .., d] = list;
    println!("{a} {d}")
}
```

### 复杂模式
可以使用更复杂的模式来对复合数据类型的值进行完全解构。
```rust
fn main() {
    let data = ((1, 2), (3, 4));
    let (a, b) = data;
    println!("{:?} {:?}", a, b)
}
```
我们还可以进一步对元组进行解构
```rust
fn main() {
    let data = ((1, 2), (3, 4));
    let ((a,b), (c,d)) = data;
    println!("{} {} {} {}", a, b, c, d);
}
```
使用模式移除引用语义
```rust
fn main() {
    let ref1 = &13;
    let (&data) = ref1;
    println!("{}", ref1);
}
```

### 所有权
在使用模式解构时，所有权可能会发生转移。
* 对于实现了Copy语义的类型，所有权不会转移
* 对于实现了Clone语义的类型，解构操作会导致所有权被转移给新的变量绑定。
```rust
fn main() {
    let tuple = ("Bob".to_string(), 13);
    let (a,b) = tuple;
    println!("{}", tuple.0); //会报错
    println!("{}", tuple.1);
    println!("{a} {b}");
}
```
由于字符串支持Clone语义，而整数实现了Copy语义，因此tuple.0的所有权被转移了，而tuple.1的所有权没被转移。
解决办法是使用ref关键字，它会在模式匹配时创建对该值的引用
```rust
fn main() {
    let tuple = ("Bob".to_string(), 13);
    let (ref a,b) = tuple;
    println!("{}", tuple.0); //会报错
    println!("{}", tuple.1);
    println!("{a} {b}");
}
```
mut关键字可以出现在模式中，在解构一个值时，默认是不可变的，但可以用mut关键字声明可变的绑定。
```rust
fn main() {
    let (mut a, b) = ("bob".to_string(), 13);
    a = "joe".to_string();
    println!("{a}");
}
```
可以在模式中组合ref和mut来声明一个可变引用。此时Rust的可变性规则(同一时间只能存在一个可变引用)依然适用
```rust
fn main() {
    let mut tuple = ("bob".to_string(), 13);
    let (ref mut a, b) = tuple;
    a.push('!');
    println!("{}",tuple.0);
    println!("{}",tuple.1);
}
```

当一个值没有实现Copy语义时，通过解构就会发生所有权转移。但是，如果在模式中使用_忽略该值，所有权就不会发生转移。
```rust
fn main() {
    let tuple = ("bob".to_string(), "def".to_string());
    let (_, b) = tuple;
    println!("{}",tuple.0);
    println!("{}",tuple.1); //报错了
}
```
但是，当我们忽略模式绑定到的变量_variable_name时，情况就不一样了。
```rust
fn main() {
    let tuple = ("bob".to_string(), "def".to_string());
    let (_, _b) = tuple;
    println!("{}",tuple.0); // 被忽略了(未移动)
    println!("{}",tuple.1); // 被绑定了(被移动)
}
```
> * 由于tuple.0被忽略了(_)，没有进行任何绑定，所以所有权没有转移; 
> * 对于tuple.1,虽然后面使用_b进行了绑定，而且_b并没有使用，但tuple.1的值仍然被绑定到_b上，所有权发生了转移。

## 不可反驳模式
在Rust中，模式分为可反驳和不可反驳两种。
* 不可反驳是全面的，可以匹配任何情况，因此始终会匹配成功
* 可反驳只能匹配一部分特定的表达式，也可能完全不匹配，因此你必须提供另一条控制分支以处理无法匹配的情况。
let语句只接受不可反驳模式
```rust
fn main() {
    let a = 10;
    println!("{a}");
}
```
试图用let语句处理可反驳模式是行不通的。
```rust
fn main() {
    let option = Some(12);
    let Some(value) = option;
    println!("{}",value);
}
```
let语句本身没有为匹配失败提供可替代方案。如果匹配失败，就必须提供后备计划，以指导编译器正确地编译。

## 范围模式
范围模式(模式中使用范围)属于可反驳模式。范围模式只适用于数值类型和字符类型。
* `begin..=end` -> 表示`[begin, end]`这个范围
* `begin..` -> 表示`[begin, 最大值]`这个范围
* `..=end` -> 表示`[最小值, end]`这个范围

示例
```rust
fn main() {
    let tuple = get_value();
    if let (1..=10, 1..=10) = tuple {
        println!("匹配成功")
    } else {
        println!("匹配失败")
    }
}

fn get_value()->(i8, i8) {
    (10, 10)
}
```
前面在匹配成功时只输出一条信息，如果能知道匹配的具体值就好了,使用@语法可以将变量绑定到模式范围
```rust
binding@range
```

示例
```rust
fn main() {
    let tuple = get_value();
    if let (a@1..=10, b@1..=10) = tuple {
        println!("匹配成功({a}, {b})")
    } else {
        println!("匹配失败")
    }
}

fn get_value()->(i8, i8) {
    (10, 10)
}
```

## 多个模式
你可以使用管道符(|)将多个模式组合起来
```rust
fn main() {
    let value = get_value();
    if let 10|12|30 = value {
        println!("匹配成功");
    } else {
        println!("匹配失败");
    }
}

fn get_value()->i8 {
    12
}
```
在复合模式中匹配一个值，想要知道匹配的具体是哪个值，我们同样可以使用@
```rust
fn main() {
    let value = get_value();
    if let a@(10|12|30) = value {
        println!("匹配成功 {a}");
    } else {
        println!("匹配失败");
    }
}

fn get_value()->i8 {
    12
}
```

## 控制流
### if-let-else
前面我们使用了if-let-else这样的形式。这里的模式是可反驳的。
```rust
if let pattern=expression {
    //匹配成功的代码块
} else {
    // 不匹配的代码块(可选的)
}
```
示例
```rust
fn main() {
    let value = get_value();
    if let Some(v) = value {
        println!("匹配的值为{}",v)
    }
}

fn get_value()->Option<i8> {
    Some(23)
}
```
### while-let
也可以在while let表达式中使用模式。
* 只要模式匹配到值，while循环就会一直执行，直到模式不能匹配到值时终止。
* 通过模式匹配成功的值，只在while循环体内有效

```rust
fn main() {
    let vec = vec![1,2,3,4,5];
    let mut i = 0;
    while let Some(item) = vec.get(i) {
        println!("{item}");
        i+=1;
    }
}
```

### for-in
for表达式的实现基于迭代器和模式匹配机制，在每次迭代时，它会调用next方法。
* 只要next返回Some(item)，迭代就会继续执行
* 一旦返回None，迭代器就会终止。
```rust
fn main() {
    let data = [1,2,3,4,5];

    for (index, item) in data.iter().enumerate() {
        println!("index {index}; item {item}")
    }
}
```

## 结构体
模式匹配也用于结构体，对结构体进行解构赋值非常有用。
对于结构体模式，至少包含结构体名称和正确的字段名(字段顺序无关紧要)，在默认情况下，结构体字段会被绑定到同名变量上。
```rust
struct Rectangle {
    p1: (u32, u32),
    p2: (u32, u32),
}
fn main() {
    let r = Rectangle {
        p1: (1, 2),
        p2: (3, 4),
    };
    let Rectangle {p1, p2} = r; //解构
    println!("{:?} {:?}", p1, p2);
}
```
我们还可以进一步解构
```rust
struct Rectangle {
    p1: (u32, u32),
    p2: (u32, u32),
}
fn main() {
    let r = Rectangle {
        p1: (1, 2),
        p2: (3, 4),
    };
    let Rectangle {p1: (a,b), p2:(c, d)} = r; //解构
    println!("{a} {b} {c} {d}");
}
```
在解构结构体时，还可以通过field_name:binding_name规则进行重命名
```rust
struct Rectangle {
    p1: (u32, u32),
    p2: (u32, u32),
}
fn main() {
    let r = Rectangle {
        p1: (1, 2),
        p2: (3, 4),
    };
    let Rectangle {p1: top_left, p2:botton_right} = r; //解构
    println!("p1: {:?}; p2: {:?}", top_left, botton_right);
}
```

字面量对模式进行了细化，只有满足字面量的值的模式才能匹配。通过这种方式为模式匹配添加额外条件。由于else分支的存在，该模式是可反驳的。
```rust
struct Rectangle {
    p1: (u32, u32),
    p2: (u32, u32),
}
fn main() {
    let r = Rectangle {
        p1: (1, 2),
        p2: (3, 4),
    };
    if let Rectangle {p1: top_left, p2:(3, 4)} = r {
        println!("p1: {:?}", top_left);
    } //解构
}
```
你也可以在解构模式时使用(_)通配符来忽略一个字段值。使用(..)通配符来忽略任何剩余的值。

## 函数
模式匹配也可以用在函数参数上，不过只能使用不可反驳模式。
```rust
fn do_something((x, y): (u8,u8)) {
    println!("{x} {y}");
}

fn test() {
    do_something((1,2));
    do_something((2,3));
    do_something((3,4));
}
fn main() {
    test();
}
```

## match表达式
match表达式与模式的结合被广泛用于控制流，match的每个分支左侧对应一个模式，当被测试的值与该模式匹配时，该分支就会被执行。
匹配的模式必须穷尽所有可能的情况，如果没有，就需要添加一个默认模式(_)来匹配默认情况。因为默认模式是不可反驳的，所有它应该作为最后一个分支。
```rust
fn main() {
    let value = get_value();
    match value {
        1=>println!("One"),
        2=>println!("Two"),
        _=>println!("Unknown"),
    }
}
fn get_value()->i8 {
    12
}
```

## 匹配守卫

匹配守卫是模式匹配的过滤器，是一个布尔表达式，
* 如果匹配守卫为假，该模式会被过滤掉
* 如果匹配守卫为真，模式匹配会正常进行
```rust
struct Rectangle {
    p1: (u32, u32),
    p2: (u32, u32),
}

fn main() {
    let rect = Rectangle {
        p1: (1, 2),
        p2: (3, 4),
    };

    match rect {
        Rectangle {
            p1: (x1, _),
            p2: (x2, _),
        } if x1 > x2 => println!("1.{x1} {x2}"),
        Rectangle {
            p1: (x1, _),
            p2: (x2, _),
        } => println!("2.{x1} {x2}"),
        _ => println!("default"),
    }
}
```

我们将模式匹配实现为一个函数，该函数接受一种颜色参数，并判断颜色是不是灰色。
```rust
#[derive(Debug)]
struct RgbColor{
    red: i32,
    blue: i32,
    green: i32,
}

#[derive(Debug)]
struct CmykColor {
    cyan: i32,
    magenta: i32,
    yellow: i32,
    black: i32,
}

#[derive(Debug)]
enum Colors {
    RGB(RgbColor),
    CMYK(CmykColor),
}

impl Colors {
    fn is_gray(&self) -> bool {
        match self {
            Colors::RGB(color) => (color.red==color.green)==(color.green==color.blue),
            Colors::CMYK(color) => (color.cyan+color.magenta+color.yellow)==0,
        }
    }

    fn display_gray(&self) {
        match self {
            Colors::RGB(value) if self.is_gray() => println!("RGB {:?} is gray", value),
            Colors::CMYK(value) if self.is_gray() => println!("CMYK {:?} is gray", value),
            Colors::RGB(value) => println!("RGB {:?} is not gray", value),
            Colors::CMYK(value) => println!("CMYK {:?} is not gray", value),
        }
    }
}

fn main() {
    let rgb_color = RgbColor { red: 255, blue: 255, green: 255 };
    let rgb_color = Colors::RGB(rgb_color);

    rgb_color.display_gray();
    

    let cmyk_color = CmykColor { cyan: 0, magenta: 0, yellow: 0, black: 0 };
    let cmyk_color = Colors::CMYK(cmyk_color);
    cmyk_color.display_gray();
}
```

当一个模式由多个模式组合而成时，匹配守卫会应用到所有的模式。只有当模式被匹配且匹配守卫为true时，整个模式才会被匹配。
```rust
fn is_monday()->bool {
    true
}

fn main() {
    match 1 {
        1 | 11 | 21 if is_monday()=>println!("1 | 11 | 21"),
        _ => println!("Not Monday!"),
    }
}
```