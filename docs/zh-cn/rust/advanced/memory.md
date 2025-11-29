# 内存
大多数应用程序，不论服务器、区块链、人工智能、游戏还是其他领域。都需要数据。因此理解内存的复杂性相当重要。
不同类型的内存往往依赖于几个因素:
* 数据大小
* 所有权
* 生命周期
* 可变性
* 持久性

这些因素综合起来，将帮助你做出明确的决定。
其中三个主要的内存区域是栈、堆和静态。你可以将数据放置在这些位置中的任何一个。有时，Rust会提供一些指引，比如将向量的元素放置在堆上。 **然而主要还是你自己决定数据的位置。**

应该注意的是，Rust没有正式的内存管理模型(一套定义良好的规则和机制，用于自动管理内存的分配，使用和释放从而确保内存高效、安全地使用)。但是Rust的特性(例如默认不可变性、智能指针、所有权和生命周期)形成了一种非正式的内存管理模型。

---
## 栈
每个线程都拥有一个栈，它是一种专用内存。
* 当线程调用一个函数时，栈会增长。
* 当线程从函数返回时，栈会缩小。
每个函数都有一个栈帧，它为函数保留内存。栈帧中的内存用于局部变量、参数、返回值和系统数据。这些数据会被系统自动释放。
栈的实现是一个先进后出(LIFO)队列，类似于一碟盘子，新的盘子总放置在顶部，并按顺序从顶部移除。这种方式意味着数据高效地存储在连续的内存中。栈具有可预测的行为，因此系统能有效地管理栈。
对于Rust,除主线程(main线程)外，默认栈大小是2K字节，当生成一个线程时，
* 你可以使用Builder类型和stack_size函数明确设置最小栈的大小。
* 或者使用RUST_MIN_STACK环境变量更改默认栈大小。

然而上面两种方法都没有设置栈大小上限，因为栈是可增长的，会在需要时扩展，直到达到可用内存容量的限制。
let语句可用于当前栈帧内的内存中创建一个本地变量。
```rust
fn main() {
    let a = 1;
    let b = 2;
    let c = do_something();
    
    println!("{:p} + {}(i32) = {:p} + {}(i32) {:p}",&a, &b-&a, &b, &c-&b, &c);
}

fn do_something()->i32 {
    3
}
```
可以看到，本地变量a、b和c在栈上占据连续的内存位置

即使在函数内部，数据也可以被添加和从栈中移除。
```rust
fn main() {
    let a = 1;
    let b = 2;
    {
        let c = 3;
    }

    println!("{} + {} = {}", a, b, c); //报错，因为c已经被移除了
}
```

UnSized(?Sized)类型不能放在栈上。
```rust
fn do_something(a: Copy) {

}
```
因为Copy trait是一个UnSized的。编译器阻止了不符合条件的参数被放置到栈上。
解决方法是结合dyn(dyn Copy)或impl(impl Dopy)关键字，这些关键字用具体类型替换了trait,它们是定长的。

注意事项
* 栈可能会消耗大量内存，因此在栈上放置大量对象时要小心。
* 另一个问题是递归函数，不经意的无限递归会迅速耗尽可用内存。
* 一些数据类型(比如向量和字符串)是智能指针，当使用let语句声明时，这些类型的值会在堆上分配。指向该值的指针存放在栈上
```rust
fn main() {
    let vp = vec![1,2,3,4];
    println!("{:?}",vp);
}
```
上述例子中，vp是一个变量，代表胖指针，被放在栈上，而值`[1,2,3,4]`被放置在堆上

---
## 静态值
静态值在应用程序的生命周期内是持久的。这是通过将静态值存储在二进制文件本身来实现的。这种方式使得这些值始终可用。这也意味着大量的静态值会导致二进制文件膨胀，这可能会影响性能。此外，为了保证静态安全，静态值很少是可变的。
可以使用static关键字声明静态绑定。静态值的名称应该全大写。此外，静态值的类型不可被推断，必须显式声明类型。
```rust
fn main() {
    static PI: f64 = 3.14;
    let r = 4.0;
    println!("面积: {}",PI*r*r);
}
```

与栈变量相比，静态值的地址明确显示出它们位于内存中不同的区域。
```rust
fn main() {
    static A: i32 = 10;
    static B: i32 = 20;
    let a = 10;
    let b = 20;
    println!("Global: ptr_A {:p} ptr_B {:p}", &A, &B);
    println!("Stack: prt_a {:p} ptr_b {:p}", &a, &b);
}
```

---
## 堆
堆是运行时可供应用程序使用的进程内存。这通常是应用程序最大的可用内存池，是放置大型对象的地方。在运行时，应用程序会根据需要在堆上分配内存。这通常被称为动态内存分配。当不需要时，堆内存可被释放，返回可用池中。
堆内存取自应用程序的虚拟内存。一个进程与设备上其他正在运行的进程共享物理内存。因此一个应用程序并不拥有计算机上的所有内存。相反，应用程序被分配了一个虚拟地址空间(虚拟内存)，然后操作系统将其映射到物理内存。
在申请对内存时，操作系统必须首先找到足够的连续内存以满足要求，然后在该位置分配内存，并返回一个指向该地址的指针。地位和分配内存的过程可能会比较耗时。
* 此外，堆可能会因为一系列不同大小的数据分配操作而变得碎片化。即使有足够的内可用存，但不是单一位置的整块内存，也可能导致内存分配失败。一些操作系统提供了系统API来对堆进行整理，以缓解该问题。

与栈不同，堆是进程内所有线程都可以访问的共享内存。因此堆上的数据可能不是内存安全的。但是我们可以用RwLock这样的类型来管理共享内存。

在Rust中，Box类型用于在堆上分配内存。当Box被释放时，通常在当前块的末尾，释放这个堆内存。然而，如果Box的值一直没得到释放，就会导致内存泄漏。或者，可以使用drop关键字显式释放Box及相关内存。
```rust
pub struct Box<T, A = Global>(_, _)
    where A: Allocator, T: ?Sized;
```
Box是泛型结构体，它的类型参数是T,T是动态分配的类型(?Sized)，类型参数A是对内存分配器的引用，Global是默认的分配器件，用于在堆上分配内存。如果需要，你可以使用自定义分配器。
可以使用new构造函数创建一个Box
```rust
fn new(x: T)->Box<T, Global>
```
Box::new函数用于在堆上创建一个值，并返回一个Box值，而不是指向堆内存的原始指针。
要访问堆上的Box值，需要对Box进行解引用。然而这种解引用也不是必须的，有时会发生自动解引用。例如println!宏。
```rust
fn main() {
    let boxa = Box::new(10);
    let stackb=*boxa+1;
    println!("{} {}", boxa, stackb);
}
```

示例
```rust
fn main() {
    let boxa = Box::new(1);
    let boxb = Box::new(2);

    let c = 1;
    let d = 2;
    println!("boxa:{:p} boxb:{:p} &c{:p} &d:{:p}",&boxa, &boxb, &c, &d);
    
    let rawa = Box::into_raw(boxa);
    let rawb = Box::into_raw(boxb);

    println!("rawa:{:p} rawb{:p} &c:{:p} &d:{:p}", rawa, rawb, &c, &d);

    let boxc;
    let boxd;
    unsafe {
        boxc = Box::from_raw(rawa);
        boxd = Box::from_raw(rawb);
    }

    println!("boxc value:{}", *boxc);
    println!("boxd value:{}", *boxd);
}
```
* Box本身位于栈上，即使引用了堆上的数据。
* into_raw函数用于获取Box值的原始指针(rawa和rawb)。原始指针直接指向堆内存，并且是unsafe的。当它被释放时，堆内存不会移除。
* Box值与局部变量c和d位于内存的不同区域。
* 你还可以使用from_raw函数将原始指针重新放回Box中，此后，Box将恢复对堆上数据项的责任。必须将from_raw标记为unsafe来调用。

你也可以将栈上的值移动到堆，其结果取决于值移动是复制语义还是移动语义。

例如，将String变为`Box<String>`变量时，所有权被转移到堆上，也就是说String智能指针本身被移动到堆上。
```rust
fn main() {
    let a = 10;
    let mut boxa = Box::new(a);
    *boxa += 1;
    println!("{} {}", a, *boxa);
}
```

---
## 内部可变性
内部可变性用一个场景来描述是。
你管理你个大型连锁超市内的一家杂货店。在结账时，顾客购物车里的商品会被合计并记录到收据上。收据上的商店Id和交易Id是固定的，而总金额字段是可变的。
```rust
struct Transaction {
    storeid: i8,
    txid: i32,
    mut total: f64 //错误的，结构体某单个字段无法声明为可变的
}
```
结构体单个字段无法声明为可变，可变性是在结构体级别上声明的。
但是这会导致不恰当的更改
```rust
#[derive(Debug)]
struct Transaction {
    storeid: i8,
    txid: i32,
    total: f64,
}

fn main() {
    let mut tx = Transaction {storeid: 0, txid: 0, total: 64.0};
    tx.storeid=101; // oops
    println!("{:?}", tx);
}
```
解决办法是内部可变性。支持内部可变性的类型是一种内部值的包装器，包装器呈现了一种不可变的外观，同时间接允许对其内部值的修改。

### Cell
Cell是一种支持内部可变性的类型，它的类型参数是T，其中T描述了内部值，Cell位于std::cell模块中

Cell可以保证不变性，而内部值可以使用方法修改
* Cell::get 返回内部值的副本
* Cell::set 修改内部值
```rust
fn get(&self)->T
fn set(&self, val: T)
```
可以使用Cell::new函数创建一个Cell
```rust
fn new(value: T)->Cell<T>
```

修改最开始的例子
```rust
use std::cell::Cell;

fn main() {
    let cell = Cell::new(0);
    let data = cell.get();
    cell.set(1);
    println!("cell:{} data:{}", cell.get(), data);
}
```

```rust
use std::cell::Cell;

#[derive(Debug)]
struct Transaction {
    storeid: i8,
    txid: i32,
    total: Cell<f64>,
}

fn main() {
    let item_prices = [11.21, 25.45, 30.5];
    let tx = Transaction {
        storeid: 100,
        txid: 203,
        total: Cell::new(0.0),
    };

    for prices in item_prices {
        let total = tx.total.get()+prices;
        tx.total.set(total);
    }
    
    println!("{:?}",tx);
    
}
```

Cell还有一个好处，比如下面的代码，Rust不允许存在多个可变借用
```rust
fn main() {
    let mut a = 1;
    let ref1 = &a; 
    let ref2 = &a;

    let mut ref3 = &mut a;
    let mut ref4 = &mut a;
    *ref3=2;
    println!("{ref3}");
}
```

如果用Cell
```rust
use std::cell::Cell;

fn main() {
    let a = 10;
    let cell = Cell::new(a);
    let cell1 = &cell;
    let cell2 = &cell;
    cell1.set(11);
    cell2.set(12);
    println!("{}",cell.get());
}
```
我们可以通过多个不同的引用修改内部值。
还有一些Cell的函数
* replace: 用新值替换内部值，然后返回被替换的旧值
* swap: 交换两个Cell的内部值
* take: 获取内部值并将其内部替换为默认值

### RefCell
RefCell也位于std::cell模块中，与Cell不同的是，RefCell只提供对内部值的引用，而不是副本。
* RefCell::borrow 获取不可变借用
* RefCell::borrow_mut 获取可变借用
```rust
fn borrow(&self)->Ref<'_, T>
fn borrow_mut(&self)->RefMut<'_, T>
```
可以用new函数创建一个ReCell
```rust
fn new(value: T)->RefCell<T>
```

示例
```rust
use std::cell::RefCell;

fn main() {
    let ref_cell = RefCell::new(0);
    *ref_cell.borrow_mut() += 10;
    println!("*ref_cell: {}",ref_cell.borrow());
}
```
对于RefCell,可变性规则(不允许存在多个可变借用)完全适用。然而这些规则是在运行时而不是编译时强制执行的。因此要格外小心不要违反这些规则，会出现panic
```rust
use std::cell::RefCell;

fn main() {
    let refcell = RefCell::new(0);
    let mut ref1 = refcell.borrow_mut();
    let mut ref2 = refcell.borrow_mut();

    *ref1 = 10;
    println!("{}",ref1);
}
```

示例二
```rust
```rust
use std::cell::RefCell;

fn main() {
    let refcell = RefCell::new(0);
    let ref1 = refcell.borrow();
    let mut ref2 = refcell.borrow_mut();

    println!("{}",ref1);
}
```

try_borrow函数是borrow函数的一个替代方案。该函数返回一个Result类型，当已存在一个可变引用时，它不会引发panic.而是直接返回Result类型的Err。如果成功则返回Ok(reference)
```rust
use std::cell::RefCell;

fn main() {
    let refcell = RefCell::new(0);
    let ref1 = refcell.borrow();
    let ret = refcell.try_borrow_mut();
    match ret {
        Ok(value) => println!("Interior value: {}", value),
        Err(_) => println!("不可再声明可变借用"),
    }
    
}
```

还是修改最开始的例子
```rust
use std::cell::RefCell;


#[derive(Debug)]
struct Transaction {
    storeid: i8,
    txid: i32,
    total: RefCell<f64>,
}

fn main() {
    let item_prices = [11.5, 20.5, 30.0, 40.3];
    let tx = Transaction{storeid: 100, txid: 203, total: RefCell::new(0.0)};

    for prices in item_prices {
        *tx.total.borrow_mut() += prices
    }

    println!("{:#?}", tx)
}
```
RefCell还有其他有用的方法
* replace: 用另一个值替换内部值，并返回当前值
* swap: 交换两个RefCell的内部值

### OnceCell 
与Cell和RefCell类似，区别是OnceCell只能修改一次内部值。如果再次修改会发生错误。可以用new函数创建一个OnceCell.
* set用于初始化内部值
* get返回内部值，可以根据需要多次获取内部值
```rust
fn new()->OnceCell<T>
fn set(&selfm value, T)->Result<(), T>
fn get(&self)->Option<&T>
```

示例
```rust
use std::cell::OnceCell;

fn main() {
    let once = OnceCell::new();
    let mut result = Ok(());
    for i in 1..=3 {
        result = once.set(i);
        match result {
            Ok(_) => println!("Updated"),
            Err(_) => println!("Not undated")
        }
    }
    println!("{:?}", result);
}
```
OnceCell其他有用的函数
* get_mut 获取内部值的可变引用
* get_or_init 获取内部值，如果未初始化，则使用闭包初始化它
* take 获取内部值然后将内部设置为默认值

