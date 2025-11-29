# chapter_20

有时Rust需要与其他编程语言编写的程序或库通信，包括调用系统API等。尽管crates.io和Rust生态系统提供了很多功能。这就意味着你可能需要在某时离开Rust舒适区。

Rust支持C **应用程序二进制接口(ABI)**。虽然有很多限制，但C ABI仍然是许多语言和操作系统的首选公共接口。C语言(或其他基于C的语言)已经存在超过50年了。因此用C/C++编写的应用程序涵盖了所有计算需求。互操作性为Rust开发者提供了对这一庞大库的访问能力。

在不同语言交换数据是巨大的挑战，
* 尤其是处理字符串。C语言的字符串是以空字符结尾的，而Rust则不是。这种不同语言的类型系统的差异常常会带来额外的兼容性问题。
* 另一个潜在问题是指针的管理方式。这在不同语言之间可能存在差异。

解决这些问题的方案是使用外部函数接口(FFI)。它提供了Rust与其他语言之间传输数据的能力，以处理这些差异。

## 外部函数接口
外部函数接口是确保互操作性成功的粘合剂。它在Rust和C之间建立了一个翻译层。FFI的部分可以在std::ffi模块中找到。你可以看到大多数情况下将数据从Rust编组到C所需的标量、枚举和结构体。

字符串是最难正确编组的类型。这一点考虑到Rust和C/C++的差异。
* C字符串以空字符结尾，而Rust则不是
* C字符串不能包含控制阀，而Rust允许
* C字符串可以通过原始指针直接访问。Rust需要通过胖指针访问，胖指针还包含了额外的元数据。
* Rust字符串主要使用Unicode字符集和Utf-8编码。对于C语言，Unicode的使用可能会有所不同。

甚至Rust中的char与C的字符也不同。
* 在Rust中的char是Unicode标量值，而C的char支持Unicode代码点

在FFI中，CString类型用于在Rust和C之间编组字符串。CStr类型用于将C字符串转换成&str。还有OsString和OsStr类型，用于读取操作系统字符串，例如命令行参数和环境变量。

此外，一些Rust类型可以"按原样"完全兼容，包括浮点数，整数和基本枚举。相反，动态大小的类型不受支持，比如trait和切片

对于有限数量的条目，创建适当的接口以进行编组是可行的。然而当有数百个条目需要编组时，这种方式难以维持。例如编组C标准库的部分内容，你不会想要将整个stdlib.h头文件进行编组。幸运的是，libc crate提供了绑定来对C标准库中的部分内容进行编组。

## 基础示例
我们从"Hello World"开始。

目录结构如下

![alt text](image-14.png)


1. 创建一个C源文件
```c
// hello.c
#include<stdio.h>

void hello() {
    printf("HelloWorld");
}
```
2. 使用clang编译器和llvm工具编译c源代码，并创建一个静态库
```bash
clang hello.c -c
ar rcs libhello.a hello.o # linux
# 或者
llvm-lic hello.o # windows
```

3. 将从C导出的函数定义在extern "C"块中，该块可以看出Rust风格的头文件。调用这个函数时必须使用unsafe包裹。因为Rust无法保证外部函数的安全性。
```rust
extern "C" {
    fn hello();
}

fn main() {
    unsafe {
        hello()
    }   
}
```
4. 是时候构建应用程序了。使用rustc编译器，你可以从Rust源文件创建一个可执行的crate,同时链接到一个外部库
```bash
rustc main.rs -L ./ -l static=hello
```
* `-L ./` -> 告诉 rustc 在这个目录找库
* `-l static=hello` -> 链接 libhello.a

你可以通过build.rs脚本来自动化完成构建过程，包括链接库。build.rs文件在构建过程中由cargo自动检测和执行。
```rust
extern crate cc;

fn main() {
    cc::Build::new().file("c_src/hello.c").compile("hello");
}
```
* 第一步是使用`Builder::new`构造函数创建一个Builder类型。
* `Builder::file`函数识别输入文件(这里是一个c文件)以进行编译。
* `file::compile`函数执行实际的编译并生成静态库 libhello.a（Linux/macOS）或 hello.lib（Windows）
> 生成的静态库会放在 Cargo 自动管理的 target 目录中，并且 Rust 可以在后续的 FFI 中链接使用。

这些函数都在cc crate中被定义，你必须在使用前在cargo.toml中的build-dependencies部分添加cc(crate.io中的cc)
```toml
[build-dependencies]
cc = "1.2.41"
```


## libc crate
libc crate包含了与c标准库的一部分进行编组的ffi绑定，包括stdlib.h的ffi绑定。在extern块中，你只要列出将应用程序中使用的C标准库的数据项，而不需要其他东西，这就是libc crate的好处。

```rust
use std::ffi::{c_double, c_longlong, CString};

unsafe extern "C" {
    //将字符串浮点数转换为浮点数
    fn atof(p: *const i8)->c_double;
    //将字符串整数转换为长整型
    fn atoi(p: *const i8)->c_longlong;
}

fn main() {
    let f_str = "256.78".to_string();
    let f_cstr = CString::new(f_str).unwrap();
    let i_str = "345".to_string();
    let i_cstr = CString::new(i_str).unwrap();


    let mut f_ret: c_double;
    let mut i_ret: c_long;
    unsafe {
        f_ret = atof(f_cstr.as_ptr());  // 转换为整数
        i_ret = atoi(i_cstr.as_ptr());  // 转换为整数
    }

    println!("{}", f_ret);
    println!("{}", i_ret);
}
```

atof和atoi函数接收字符串作为参数，并分别返回一个浮点数和整数。CString::new函数将String类型转换为CString类型。as_ptr函数将CStrings转换为指针，这等同于char*。调用函数的结果被保存在适当的类型c_double和c_longlong。由于使用了libc crate。构建该程序无需考虑特殊因素，正常编译。


## 结构体
我们需要经常对复杂类型(如结构体)进行编组。例如，系统API通常需要结构体作为参数或返回值。

编组复杂类型需要额外考虑。内存对齐可能有所不同。此外，C结构体的内存布局可能会受到用户定义的打包和内存边界的影响。Rust并不保证其结构体的内存布局。这对编组可能是一场噩梦。解决方案是采用C语言模型来编组结构体。你可以应用#[repr(C)]属性到结构体上，这将消除C与Rust结构体之间的内存布局差异。
```rust
#[repr(C)]
struct AStruct {}
```
结构体将按照其组成部分进行编组。只有这样，你才能确定正确的编组方法。
```c
struct AStruct {
    int field1;
    int field2;
    int field3;
}
```

```rust
struct AStruct {
    field1: c_int,
    field2: c_int,
    field3: c_int,
}
```

示例
```rust
use std::ffi::{c_int, CStr, CString};

#[repr(C)]
pub struct Person {
    first: *const i8,
    last: *const i8,
    age: c_int,
}

unsafe extern "C" {
    fn get_person()->*mut Person;
    fn set_person(new_person: Person);
}

fn main() {
    let person;
    
    unsafe {
        person = get_person();
        println!("{:?}",(*person).age);
        println!("{:?}",CStr::from_ptr((*person).first));
        println!("{:?}",CStr::from_ptr((*person).last));
    }

    let first = CString::new("Sally".to_string()).unwrap();
    let pfirst = first.as_ptr();
    let last = CString::new("Johnson".to_string()).unwrap();
    let plast = last.as_ptr();
    let new_person = Person {
        first: pfirst,
        last: plast,
        age: 43,
    };
    unsafe {
        set_person(new_person);
        println!("{:?}", (*person).age);
        println!("{:?}", CStr::from_ptr((*person).first));
        println!("{:?}", CStr::from_ptr((*person).last));
    }
}
```
以下是程序各部分的描述
* extern "C" 块中导入get_person和set_person函数
* 在第一个unsafe代码块中，获取并显示gPerson的默认值。
    * 调用get_person函数返回*Person类型的默认值，对指针解引用来访问字段
    * 调用CStr::from_ptr函数将first和last字段转换成字符串字面量。
    * 在println!宏中显示结构体中的三个字段
* 第二个unsafe代码块中，修改并显示gPerson的值。
    * 创建一个新的结构体，为结构体的每个字段添加新值。
    * 调用set_person函数将gPerson设置为新值。

## bindgen
你可以花大量时间创建正确的FFI绑定，以便在Rust和C之间传输数据。可是，当包含数十甚至数百个需要编组的文件时，这个过程相当繁琐。此外，如果处理不当，你可能会花费更多时间俩调试。幸运的是bindgen(绑定生成)工具会自动化帮你完成这个过程。

bindgen为C定义创建正确的FFI绑定，以免你手动完成创建映射这种繁琐工作。
bindgen可以读取C头文件并为其自动生成包含所有对应Rust绑定的源文件。这对于libc未包含的C标准库非常有用。
Bindgen源于crates.io，你可以通过cargo安装bindgen.
```bash
cargo add bindgen
```

按照bindgen-cli可以使用bindgen命令
```bash
cargo install bindgen-cli
```

读取头文件并生成适当的FFI绑定
```bash
bindgen time.h > time.rs
```


## C调用Rust函数
为了互操作性，我们在要导出的Rust函数前加上extern关键字。
Rust为其函数名进行混淆，以赋予它独一无二的身份。混淆后的名称结合了crate名、哈希值、函数本身的名称以及其他因素。这意味着其他语言(不知道这个方案)将无法识别Rust函数的内部名称。因此，为了使函数保持透明，需要使用no_mangle属性禁用函数的名称混淆。
```rust
#[no_mangle]
extern fn display_rust() {
    println!("Greetings from Rust");
}
```
为了与其他语言互操作，你必须为Rust应用程序构建一个静态或动态的库。其他语言可以通过这个库来访问其导出函数。请将lib部分添加到cargo.toml文件中，为crate创建一个库。

* crate-type字段设置为staticlib,则代表创建一个静态库
* crate-type字段设置为cdylib,则代表创建一个动态库

> 默认以包名为库名，如果需要，可以使用name字段显示设置名字

```toml
[lib]
name = "greeting"
crate-type = ["staticlib", "cdylib"]
```
上面的cargo.tom片段要求Rust程序同时创建静态库和动态库

1. lib.rs
```rust
#[unsafe(no_mangle)]
pub extern fn display_rust() {
    println!("Greetings from Rust");
}
```
编译生成的库在target/下

2. sample.h
```c
void display_rust();
```

3. sample.c
```rust
#include "hello.h"
int main(void) {
    display_rust();
}
```
在构建c程序时，你必须包含c源文件并链接到Rust创建的库。
```bash
clang sample.c libgreeting.a -o sample
或者
clang sample.c libgreeting.so -o sample
```
这个命令会在当前目录下产生c的可执行文件，`sample`


## cbindgen
* `bindgen`工具用于创建C文件生成Rust的FFI绑定，让Rust能调用C代码。
* `cbindgen`工具与`bindgen`工具正好相反。`cbindgen`工具从Rust代码中生成C头文件，让C能够调用Rust的代码。

`cbindgen`可以在crates.io中找到

你可以结合`cbindgen`和`build.rs`来自动化该过程。

项目结构如下

![alt text](image-15.png)

1. lib.rs
```rust
#[unsafe(no_mangle)]
pub extern fn max3(first: i64, second: i64, third: i64)->i64 {
    let value = if first>second {
        first
    }else {
        second
    };

    if value>third {
        value
    } else {
        third
    }
}
```

2. cargo.toml
在cargo.toml文件中，将cbindgen添加为构建依赖项。它将会在被build.rs构建的过程中使用。我们还要求生成静态库和动态库。
```toml
[build-dependencies]
cbindgen = "0.29.0"

[lib]
name = "example"
crate-type = ["staticlib", "cdylib"]
```

3. build.rs
```rust
extern crate cbindgen;

fn main() {
    cbindgen::Builder::new()
        .with_crate(".")
        .generate()
        .expect("Unable to generate bindings")
        .write_to_file("max3.h");
}
```

编译
```bash
cargo build
```
这会在crate根目录生产c头文件

![alt text](image-16.png)


生成的max3.h文件
```cpp
#include <cstdarg>
#include <cstdint>
#include <cstdlib>
#include <ostream>
#include <new>

extern "C" {

int64_t max3(int64_t first, int64_t second, int64_t third);

}  // extern "C"
```

编写一个调用max3函数的c++程序,它包含了cbindgen生成的头文件
```rust
#include<stdio.h>
#include "max3.h" // 加上max3.h头文件的路径

int main() {
    long answer = max3(100, 200, 300);
    printf("Max value is %ld\n", answer);
    return 0;
}
```

以下命令将编译的C++程序链接到Rust库
```rust
clang myapp.cpp libexample.a -o myapp
```
这会在调用命令所在的目录生成可执行文件myapp

> 需要注意的是，我们与C++应用程序进行交互操作没有想象中的轻松，因为C++没有稳定的ABI,通常情况下，Rust与C++安全交互需要通过C ABI来完成。

