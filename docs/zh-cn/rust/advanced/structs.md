# chapter_11

## 结构体

### 运算符重载
* 一元运算符 instance.operator()
* 二元运算符 左操作数lhs 右操作数rhs instance.operator(rhs)

#### 一元运算符重载
```rust
use std::ops::Neg;

#[derive(Debug)]
struct RGB(u8,u8,u8);

impl Neg for RGB {
    type Output=RGB;

    fn neg(self) -> Self::Output {
        RGB(255-self.0, 255-self.1, 255-self.2)
    }
}

fn main() {
    let mut rgb = RGB(1,2,3);;
    rgb = -rgb;
    println!("{:#?}",rgb)
    
}
```

#### 二元运算符重载
Add trait是加法运算符的定义，是二元运算符的代表。
```rust
pub trait Add<Rhs = Self> {
    type = Output;
    fn add(self, rhs: Rhs)->Self::Output;
}
```

示例
```rust
use std::ops::{Add};

#[derive(Debug)]
struct RGB(u8,u8,u8);

impl Add for RGB {
    type Output=Self;

    fn add(self, rhs: Self) -> Self::Output {
        RGB {
            0: self.0+rhs.0,
            1: self.1+rhs.1,
            2: self.2+rhs.2,
        }
    }
}

fn main() {
    let rgb1 = RGB(1,2,3);
    let rgb2 = RGB(1,1,1);
    let rgb3 = rgb1+rgb2;
    
    println!("{:?}",rgb3);
}
```
