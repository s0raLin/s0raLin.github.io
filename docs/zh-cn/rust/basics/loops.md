# chapter_5

for 表达式
for循环是一种基于迭代器的循环结构。迭代器需要实现Iterator trait.然后可以使用for循环。
不过像数组或向量这样的集合类型并不是迭代器，而是实现了IntoIterator trait,该trati定义了如何从某种类型转换为迭代器。for循环也可以直接作用于实现了IntoIterator的集合类型。

## for循环
下面演示了在for循环中使用范围字面量
```rust
use std::ops::Range;

fn main() {
    let r = Range{start: 0, end: 3};
    for i in r {
        println!("{}", i);
    }

}
```

在迭代器中，有一个enumeratr方法，返回一个包含两个字段的元组，分别是当前项的索引和值
```rust
fn main() {
    let iter = (1..=10).enumerate();
    for value in iter {
        println!("{:?}",value);
    }
}
```

数组和向量不是迭代器，但是for-in会通过IntoIterator trait转换为迭代器。
```rust
fn main() {
    let vec = vec![1,2,3,4,5,6];
    for i in vec {
        println!("{}", i);
    }
}
```
我们尝试在数组或向量上使用enumerate方法是行不通的，因为IntoIterator trait没有提供相应的方法。
在使用enumerate之前，我们需要通过iter/iter_mut/into_iter方法将集合类型转换为迭代器。
* iter() 生成不可变引用(&T)
* iter_mut() 生成可变引用(&mut T)
* into_iter() for-in默认调用的方法，通过消耗所有权将集合转化为迭代器
```rust
fn main() {
    let vec = vec![1, 2, 3, 4, 5, 6, 7];
    for value in vec.iter().enumerate() {
        println!("{:?}", value);
    }
}
```
尝试在遍历过程中修改不可变引用的值，会报错
```rust
fn main() {
    let mut vec = vec![1, 2, 3];

    for item in vec {
        item *= 2;
    }
    println!("{:?}",vec);
}
```
输出
```rust
cannot assign twice to immutable variable
```
这说明了，默认情况下for-in返回的是不可变的类型T，我们无法对其进行修改，因此我们需要返回一个可变引用(&mut T)。
```rust
fn main() {
    let mut vec = vec![1, 2, 3];

    for item in vec.iter_mut() {
        *item *= 2;
    }
}
```
而默认的T类型具有移动语义，在for-in中，这个变量的所有权也会被移走。当我们使用for-in循环时，这个变量的所有权会被移动到循环内部，这就导致for-in循环结束后，这个变量不再可用。会引起借用检查器报错。
```rust


fn main() {
    let vec = vec![1, 2, 3];

    for value in vec {
        println!("{}", value);
    }
    println!("{}", vec[0]);
}
```

解决方法是使用正确的迭代器。
```rust


fn main() {
    let vec = vec![1, 2, 3];

    for value in vec.iter() {
        println!("{}", value);
    }
    println!("{}", vec[0]);
}
```

## loop表达式
loop在设计上是一个无限循环，而它不仅仅是一个"while true", 它相较于while true有额外的特性,因为loop可以用作表达式。
下面演示了找到第一个偶数的例子
```rust
fn main() {
    let vec = vec![1,5,6,4,5];
    let mut iter = vec.iter();

    let value = loop {
        let value = iter.next().unwrap();

        if value%2==0 {
            break value; 
        }

    };

    println!("{}",value)
}
```

## 循环标签
在嵌套循环中，for/while/loop通常只能break或continue当前的循环，然而在某些情况下，我们需要跳出到外层循环，或者跳过当前循环。使用循环标签可以解决这个问题。
定义标签
```rust
'label: loop
'label: while
'label: for
```
跳出标签
```rust
break 'label;
continue 'label;
```
示例
```rust
fn main() {
    'label: for i in 1..=10 {
        for j in 1..=10 {
            print!("{}", j);
            if j == 5 {
                println!();
                continue 'label;
            }
        }
    }
}
```

## Iterator trait
迭代器可以从头到尾遍历一个元素序列，可以很方便地和for/while/loop结合使用。
* 迭代器包含正向迭代器和反向迭代器。你也可以让迭代器返回普通的/可变引用/不可变引用的项
* 迭代器实现了Iterator trait。通常实现迭代器的类型都会维护一个游标，被称为项(Item)，也就是关联类型。
* 对于实现了Iterator trait的类型，next是唯一必须实现的方法。
* next方法会按顺序依次返回每个项，返回结果要么是`Some<T>`要么在项目遍历完后返回None。
迭代器的next方法会在for-in循环中被隐式调用，而使用while或loop时需要显式调用。
```rust
struct Triangular(i32);

impl Iterator for Triangular {
    type Item = i32;

    fn next(&mut self) -> Option<i32> {
        self.0 += 1;
        Some(self.0 * (self.0 + 1) / 2)
    }

}

fn main() {
    for t in Triangular(0).take(6) {
        println!("{}", t);
    }

}
```
需要注意的是，这个三角序列是无穷的，next函数永远不会返回None,因此for-in会无限循环,相应的，使用take方法来仅返回前6项。

