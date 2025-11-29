# chapter_15


## 静态分发
相较于具体类型，采用trait作为函数和返回值类型可以使代码更具扩散性，也更加简洁。只要是实现了相同的trait的类型，在该trait的语境都是可以互换使用的，不局限于特定类型。因此可以将trait看作实现了相应行为的任何具体类型的占位符。
```rust
trait ATrart {
    
}
fn do_something(obj: ATrart) {

}

fn main() {

}
```
这个例子无法编译，因为trait是UnSized的，不能用来创建实例。要解决这个问题，我们采用静态分发和动态分发。
静态分发在编译时将trait解析成具体类型，然后编译器为这个特定类型创建一个函数的特化版本，这称为单态化，能够通过减少运行时消耗来提高性能，但是会导致代码膨胀。单态化的前提是在编译时能够识别具体类型。

使用impl关键字来定义静态分发
```rust
fn do_something(obj: impl ATrait) {

}
```
> impl可以与函数参数使用，但不能与变量绑定使用

示例
```rust
trait Human {
    fn get_name(&self);
}

#[derive(Debug)]
struct Adult(String); //成人

impl Human for Adult {
    fn get_name(&self) {
        println!("{:?}",self);
    }
}

#[derive(Debug)]
struct Child(String);

impl Human for Child {
    fn get_name(&self) {
        println!("{:?}",self);
    }
}

// 外星人
trait Alien {
    fn get_name(&self);    
}

// 火星人
#[derive(Debug)]
struct Martian(String);

impl Alien for Martian {
    fn get_name(&self) {
        println!("{:?}",self)
    }
}

fn invite_to_paty(attendee: impl Human) {
    attendee.get_name();
}
fn main() {
    // 创建成年人实例
    let bob = Adult("Bob".to_string());

    // 创建儿童实例
    let janice = Child("janice".to_string());

    // 创建外星人实例
    let fred = Martian("Fred".to_string());

    invite_to_paty(bob);

    invite_to_paty(janice);

    invite_to_paty(fred); // 不允许外星人参加
}
```

## 动态分发
有时编译器无法推断出具体类型，这种情况下需要使用动态分发。对于动态分发，解决方案是使用引用，因为引用具有固定大小。不过普通引用所携带的信息还不够，为此，Rust将dyn关键字和引用组合起来提高了trait对象.它在运行时被初始化为两个指针，一个指向具体类型实例，另一个指向trait的实现。
有几种方法声明trait对象

* 使用dyn关键字
```rust
&dyn trait
```
* 使用Box创建trait对象
```rust
Box<dyn trait>
```

示例
```rust
trait Human {
    fn display_name(&self);
}

#[derive(Debug)]
struct Adult(String); //成人

impl Human for Adult {
    fn display_name(&self) {
        println!("{:?}",self);
    }
}

#[derive(Debug)]
struct Child(String);

impl Human for Child {
    fn display_name(&self) {
        println!("{:?}",self);
    }
}

// 外星人
trait Alien {
    fn display_name(&self);    
}

// 火星人
#[derive(Debug)]
struct Martian(String);

impl Alien for Martian {
    fn display_name(&self) {
        println!("{:?}",self)
    }
}

fn invite_to_paty(attendee: impl Human) {
    attendee.display_name();
}

fn create_person(adult: bool, name: String)->Box<dyn Human> {
    if adult {
        Box::new(Adult(name))
    } else {
        Box::new(Child(name))
    }
}

fn main() {
    let bob = create_person(true, "Bob".to_string());
    bob.display_name();

    let janice = create_person(false, "janice".to_string());
    janice.display_name();
}
```

动态分发还可以用于变量绑定
```rust
struct Rectangle;
struct Ellipse;


trait Shape {
    fn draw(&self) {
        println!("draw");
    }
}

impl Shape for Rectangle {
    
}

impl Shape for Ellipse {

}
fn main() {
    let shapes: Vec<&dyn Shape> = vec![&Rectangle{}, &Ellipse{}];
    for shape in shapes {
        shape.draw();
    }
}
```

## 枚举和trait
枚举类型同样可以实现trait,可以自由选择实现方式。不过有一种最佳实践: 在为枚举实现trait时，应当使用match表达式，针对每个枚举变体分别提供一种唯一的trait实现。
```rust
trait Schemes {
    fn get_rgb(&self)->(u8, u8, u8);
    fn get_cmyk(&self)->(u8, u8, u8, u8);
}
enum CoreColor {
    Red,
    Green,
    Blue,
}
impl Schemes for CoreColor {
    fn get_rgb(&self)->(u8, u8, u8) {
        match self {
            CoreColor::Red => (255, 0, 0),
            CoreColor::Green => (0, 255, 0),
            CoreColor::Blue => (0, 0, 255),
        }
    }

    fn get_cmyk(&self)->(u8, u8, u8, u8) {
        match self {
            CoreColor::Red => (0, 99, 100, 0),
            CoreColor::Green => (100, 0, 100, 0),
            CoreColor::Blue => (98, 59, 0, 1),
        }
    }
}

fn main() {
    let red = CoreColor::Red;
    let red_rgb = red.get_rgb();
    let red_cmyk = red.get_cmyk();
    println!("{:?}", red_rgb);
    println!("{:?}", red_cmyk);

}
```

