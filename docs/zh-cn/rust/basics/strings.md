# chapter_3

## str

- str 类型是一种原生类型，str 类型具有切片的所有特性，包括无固定大小和只读。
- 因为 str 就是一个切片，通常会借用一个 str，即&str。
- str 类型有两个字段组成，指向字符串数据的指针和长度。

字符串字面量定义在("..")内，是程序整个生命周期内都存在的 str 值。
因此字符串字面量的生命周期是静态的，表示为`&'static str`

## 字符串

- 字符串(String)类型定义在 Rust 标准库中，是基于特化的向量实现的，由字符值组成。
- 字符串和向量一样是可变的也是可增长的。
- 字符串 Striing 类型包含 3 个字段：指向底层数组的指针、长度、容量。
  - 底层数组是分配的内存空间
  - 长度是按照 utf-8 编码占据的字节数
  - 容量是底层分配给数组空间的长度

### 创建字符串实例

- 使用 String::from("str")和 str::to_string(),将 str 转成 String

```rust
fn main() {
    let str1 = String::from("hello world1");
    let str2 = "hello world2".to_string();

    println!("{} {}",str1, str2);
}
```

- 也可以通过 new 构造函数为 String 创造一个新的空字符串，然后将字符串追加进里面，前提是可变

```rust
fn main() {
    let mut new_str = String::new();
    new_str.push_str("hello world3");
    println!("{}",new_str);
}
```

如前所述，字符串是一种特殊的字符值向量，你甚至可以直接从向量创建一个字符串。

```rust
fn main() {
    let v = vec![65, 114, 107, 97, 110, 115, 97, 115];

    let str = String::from_utf8(v).unwrap();
    println!("{}",str);
}
```

在这个示例中，"Arkansas"这个码值被存储到一个向量 v 内，例如码值 65 对应的字符 A，通过 from_utf 函数将这个向量转换成一个字符串

### 字符串长度

一个给定的 unicode 字符的长度是多少?这个问题看似简单实际上很复杂。
首先，这取决于你是指字符串的字符个数还是字节。一个 utf-8 字符可以用 1-4 个字节来描述，asscii 字符，在 unicode 中是 1 字节。然而位于代码空间其他位置的字符大小可能是多个字节

- Ascii 是单字节大小
- 希腊字符是 2 字节大小
- 中文字符是 3 字节大小
- 表情符号是 4 字节大小

对于 ascii,字节长度和字符数量是相同的。而对于其他字符集可能会有所不同。len 函数返回字符串中的字节数

```rust
fn main() {
    let str = "你好世界";
    println!("{}",str.len());
}
```

理应打印的是 4,实际上却是 12
要获取字符串中字符的数量，可以首先使用 chars 返回字符串字符的迭代器，然后在迭代器上调用 count 方法来统计字符数量

```rust
fn main() {
    let str = "你好世界";
    let size = str.chars().count();
    println!("{}",size);
}
```

### 扩展字符串

你可以扩展一个字符串 String 的值，但你不能扩展 str 类型的值。下面提供了几个方法

- push 对于 String 追加 char 值
- push_str 对于 String 追加一个 str

```rust
fn main() {

    let mut str = String::new();
    str.push_str("hello world");
    str.push('!');

    println!("{}",str);
}
```

- insert
- insert_str

有时候，你可能不仅仅想在字符串末尾追加新内容，而是想将新内容插入到已有字符串中间的某个位置。

```rust
fn main() {
    let mut characters = "ac".to_string();
    characters.insert(1, 'b');
    println!("{}",characters);

    let mut numbers = "one  three".to_string();
    numbers.insert_str(4, "two");
    println!("{}", numbers);
}
```

### 字符串容量

作为特化的向量，String 具有一个底层数组和一个容量。

- 底层数组是存储字符串字符的空间，容量是底层数组的总大小，而长度则是字符串当前占用的大小。
- 当长度超过容量时，底层数组必须重新分配并进行扩展，
  当底层数组重新分配发生时，会有性能损失。因此避免不必要的重新分配可以提供程序的性能。

```rust
fn main() {
    let mut str = '我'.to_string();

    println!("容量:{} 长度:{}",str.capacity(), str.len());

    str.push('是');
    println!("容量:{} 长度:{}",str.capacity(), str.len());

    str.push('谁');
    println!("容量:{} 长度:{}",str.capacity(), str.len());
}
```

上述例子将字符转换为字符串，然后每次追加一个字符，都引起字符串 str 的扩容,发生了两次重新分配，对应的 3->8->16

如果一开始就能预估需要多大的字符值数组，那么在前面例子就可以给出更高效的写法，通过 with_capacity()可以在创建字符串时手动指定容量大小

```rust
fn main() {
    let mut str = String::with_capacity(12);
    str.push('我');
    str.push('是');
    str.push('谁');
    println!("容量:{} 长度:{} 内容:{}",str.capacity(), str.len(), str);
}
```

### 访问字符串的值

我们知道，字符串本质上就是字符值数组，所以通过数组下标索引来访问吗？

```rust
fn main() {
    let str = "你好世界".to_string();
    let ch = str[1];
}
```

然后你将会得到类似这样的错误

```rust
error[E0277]: the type `str` cannot be indexed by `{integer}`
```

虽然错误本身是正确的，但没有解释清楚根本原因。
实际上，根本问题是: 对字符串使用索引进行访问是存在歧义的，我们无法确定索引值究竟对应的字节位置还是字符位置。没有解决这一歧义，继续这种操作会被编译器认为是不安全的。
因此，在 Rust 中直接通过索引来访问字符串中的字符是明确禁止的。
你可以通过字符串切片来访问 String 中的字符，起始索引和结束索引来表示字节位置，切片的结果是一个 str

```rust
string[startIndex..endIndex]
```

示例

```rust
fn main() {
    let str = "你好世界".to_string();
    let ch = &str[3..=5];
    println!("{}", ch);
}
```

字符位置如下图所示
![alt text](zh-cn/rust/images/character_positions.png)

当尝试获取字符串切片的前两个字符，但是切片的位置是不正确的，就会引发一个 panic
示例

```rust
fn main() {
    let str = "你好世界".to_string();
    let ch = &str[0..8];
    println!("{}", ch);
}
```

输出

```rust
byte index 8 is not a char boundary; it is inside '世' (bytes 6..9) of `你好世界`
```

在获取字符串切片之前，你可以手动调用 str 类型的 is_char_boundary 方法来确定给定索引位置是否与字符边界的开始对齐

```rust
fn main() {
    let str = "你好世界".to_string();
    println!("{}",str.is_char_boundary(0)); // true
    println!("{}",str.is_char_boundary(1)); //false
}
```

### 字符串里的字符

字符串由字符组成，一个很有用的操作是迭代每一个字符。比如对每个字符执行某种操作、对字符进行编码、统计字符数量、或者搜索并删除包含字母 e 的所有单词等等。
字符串的 chars 方法会返回一个字符串迭代器，方便我们遍历访问字符串中的每一个字符。

```rust
fn main() {
    let str = "你好世界".to_string();
    for ch in str.chars() {
        println!("{}", ch);
    }
}
```

也可以使用迭代器的 nth 方法读取某个位置的一个字符

```rust
fn main() {
    let str = "你好世界".to_string();
    let ch1 = str.chars().nth(1).unwrap();
    println!("{}", ch1);

}
```

### 格式化字符串

在需要&str 的场合，可以借用字符串的&String 来代替。这时 String 会继承 str 的所有方法，这种隐式转换的原理就是 String 类型为 str 实现了 Deref trait,这种自动转换行为被称为 Deref 强制转换，但反过来，从 str 转换为 String 类型是不允许的

```rust
fn foo(str: &str) {
    println!("{}", str);
}
fn main() {
    let str = "hello".to_string();
    foo(&str);
}
```

如果你需要创建格式化的字符串，那么可以使用 format!()宏，这个宏与 println!()的用法类似，不同的是，它返回一个格式化后的字符串，而不是直接输出。

```rust
fn main() {
    let left = 5;
    let right = 10;
    let result = format!("{}+{}={}",left, right, left+right);
    println!("{}",result);
}
```

### 实用函数

字符串类型实现了丰富的方法，可以方便对字符串进行各种处理。以下是一些常用函数。

- **clear** :清除一个字符串但不减少当前容量，如果需要，你可以通过 shrink_to_fit 方法来减少容量

```rust
fn clear(&mut self)
```

- **contains** :在字符串中查找一个模式字符串，如果找到则返回 true

```rust
fn contains<'a, P>(&'a self, pat: P)->bool
```

- **ends_with** :判断字符串是否以给定模式字符串结尾，如果是则返回 true

```rust
fn ends_with<'a, P>(&'a self, pat: P)->bool
```

- **eq_ignore_ascii_case** :以不区分大小写的方式比较两个字符串，如果相同则返回 true

```rust
fn eq_ignore_ascii_case(&self, other: &str)->bool
```

- **replace** :替换字符串中的模式，返回修改后的字符串

```rust
fn replace<'a, P>(&'a self, from: P, to: &str);
```

- **split** :用给定的分隔符将字符串拆分，返回一个迭代器以遍历拆分后得到的字符串数组

```rust
fn split<'a, P>(&'a self, pat: P)->Split<'a, P>
```

- **start_with** :判断字符串是否以给定模式字符串开始，如果是则返回 true

```rust
fn starts_with<&'a, P>(&'a self, pat: P)->bool
```

- **to_uppercase** :将字符串转换为大写

```rust
fn to_uppercase(&self)->String
```
