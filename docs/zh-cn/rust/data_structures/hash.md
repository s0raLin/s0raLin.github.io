# chapter_7

哈希表是一种查找表，其中的条目有键(key)和值(value)组成。它是一个可变集合，可以在运行时插入和移除条目，类似于其他语言的字典和表。

- 键是唯一的，而值可以是重复的。
- 通过键，你可以快速查找到所需的值，就像访问数组一样方便。
- 键的类型不局限于 usize,几乎所有类型都可以。比如整数、字符串、结构、数组甚至是其他哈希表。

## `HashMap<K, V>`类型

其中 K 是键类型，V 是值类型，

- 所有键 K 对应的同一类型，所有的值 V 也对应的同一类型
- 键的类型必须是实现了 Eq 和 Hash 这两个 trait.

```rust
#[derive(PartialEq, Eq, Hash)]
```

- 对于 HashMap 类型,默认的散列函数实现采用了二次探测和 SIMD 查找。
- 此外，默认的哈希器内置了合理的防御机制，可以低于哈希 DS 攻击。
- 为了进一步增强安全性，哈希的计算过程还引入了基于系统熵的随机密钥。
- 开发者也可以自行实现 BuildHasher trait 来替换默认的哈希器。也可以在 creates.io 上寻找现成的第三方哈希器。

哈希是可变的集合，因此哈希表的条目会被放置在堆上。可以像向量一样设置哈希表的容量。

### 创建 HashMap

HashMap 类型不包含在标准预先导入中，其位于`std::collections::HashMap`中。

1. 使用 new 方法创建新的 HashMap

```rust
use std::collections::HashMap;

fn main() {
    let map = HashMap::<i32, String>::new();

    println!("{} {}",map.capacity(),map.len());
}
```

2. 使用 from 方法从元组数组创建

   其中`tuple.0`是 K，`tuple.1`是值

```rust
use std::collections::HashMap;

fn main() {
    let tuple_array = [("张三", 21),("李四", 34),("王五", 43)];
    let map = HashMap::from(tuple_array);
    println!("{:#?}",map);
}
```

### 添加和删除元素

```rust
use std::collections::HashMap;

fn main() {
    let tuple_array = [("张三", 21),("李四", 34),("王五", 43)];
    let mut map = HashMap::from(tuple_array);
    println!("{:#?}",map);
    map.insert("赵六", 49);
    println!("{:#?}",map);
    map.remove("赵六");
    println!("{:#?}",map);

}
```

### 访问 HashMap

get 方法可以用键(K)在 HashMap 中查找一个值。该方法返回一个 Option 枚举，如果键存在，其值作为 Some(value)返回，如果键不存在则返回 None。

### 更新条目

仅需对一个已经存在的键(K)插入一个新的元素即可

```rust
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::from([("张三", 32), ("王五", 44), ("赵六", 66)]);

    map.insert("王五", 88);
    println!("{}",map["王五"]);
}
```

有时候知道 insert 是插入还是更新还是挺有用的，当插入新条目时，insert 返回的是 None;而当更新已存在的值时，insert 返回的是`Some<T>`，其中 T 是更新之前的值。

```rust
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::from([("张三", 32), ("王五", 44), ("赵六", 66)]);

    let result = map.insert("李四", 88);

    match result {
        Some(old_value) => println!("{}被更新",old_value),
        None => println!("插入了新元素")
    }

}

```

另一种方式是通过 entry 方法，接受一个参数，即 HashMap 的键，返回一个`Entry<K, V>`枚举,表示该条目被占用还是空缺。声明如下:

```rust
pub enum Entry<'a, K: 'a, B: 'a> {
    Occupied(OccupiedEntry<'a, K, V>),
    Vacant(VacantEntry<'a, K, V>),
}
```

- Occupied(占用)，代表查找的条目被找到。
- Vacant(空缺)，代表此条目不存在。
  那么
- 如果条目是 Occupied,则可以通过 or_insert 函数返回一个该值的可变引用。可以解引用来修改这个值，
- 如果条目是 Vacant,那么 or_insert 函数则设置一个默认值。

```rust
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();
    map.insert("张三", 31);
    map.insert("王五", 42);
    map.insert("李四", 45);
    map.insert("赵六", 78);

    // 如果不存在，就创建新的Key,对于的Value为0
    let value = map.entry("张三").or_insert(0);
    // 已经存在，返回可变引用，可用于修改value值
    *value = 99;

    println!("{:?}",map);
}
```

### 迭代

可以使用 for-in 遍历

```rust
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();
    map.insert("张三", 43);
    map.insert("李四", 56);
    map.insert("王五", 89);
    for (name, age) in map.iter() {
        println!("姓名:{},年龄:{}",name, age);
    }
    map.insert("赵六", 99);
}
```
