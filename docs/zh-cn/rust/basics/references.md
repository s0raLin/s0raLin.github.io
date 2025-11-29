# chapter_2

## 引用

引用的作用是借用所指向内存位置中的值。引用是一种安全的指针，为确保安全性，Rust 为引用施加了各种规则，而裸指针没有这些约束。

- 引用必须是非空的
- 底层值必须是有效的类型
- 引用是有生命周期的
- 引用的使用有一些特殊的限制，包括不限于所有权机制

对于引用，执行运算前会先解引用

```rust
fn main() {
    let ref1 = &15;
    let ref2 = &20;
    let value1 = ref1+10;
    let value2 = ref1*ref2;
    println!("{} {}",value1, value2);
}
```

如果不自动解引用，那么将这么写，可读性会变差

```rust
fn main() {
    let ref1 = &15;
    let ref2 = &20;
    let value1 = *ref1+10;
    let value2 = *ref1**ref2;
    println!("{} {}", value1, value2);
}
```

需要注意的是`==`比较的是引用处的值，而不是内存地址，如果你想要比较实际的内存地址，则可以使用`std::ptr`模块中的`eq`函数，其参数是要比较的引用

```rust
fn main() {
    let num_of_eggs = 10;
    let num_of_pizza = 10;

    let eggs = &num_of_eggs;
    let pizza = &num_of_pizza;

    // 比较的值
    println!("{}", eggs==pizza);
    // 比较的地址
    println!("{}", ptr::eq(eggs, pizza));
}
```

## 逻辑运算

二元逻辑运算符是惰性运算符。只有在需要对整体表达式求值时才会进行求值。
例如，仅当左操作符为真时，才会对&&运算符右操作数求值，如果&&运算符左操作数为假，右操作数就不会被求值，这种现象被称为短路。相比之下，&和|是不进行短路求值的

## 原生指针

原生指针主要用于 unsafe rust 中。直接使用原生指针是不安全的(可能指向一个 null，或者已经释放的内存区域)。原生指针不再 Rust 的可控范围之内，所以需要程序员自己保证安全。
Rust 有两种原生指针:

- `*const T` 不可变原生指针
- `*mut T` 可变原生指针

示例

```rust
  fn main() {
        let mut x = 10;
        let mut_ptr = &mut x as *mut i32;
        let boxx = Box::new(x);
        let const_ptr = &*boxx as *const i32;

        unsafe {
            *mut_ptr += 20;
            println!("x: {} mut_ptr: {:?} const_ptr: {:?}", x, *mut_ptr, *const_ptr);
        }
    }
```
