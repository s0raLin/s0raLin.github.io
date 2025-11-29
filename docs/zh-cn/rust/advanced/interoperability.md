# chapter_20

有时 Rust 需要与其他编程语言编写的程序或库通信，包括调用系统 API 等。尽管 crates.io 和 Rust 生态系统提供了很多功能。这就意味着你可能需要在某时离开 Rust 舒适区。

Rust 支持 C **应用程序二进制接口(ABI)** 。虽然有很多限制，但 C ABI 仍然是许多语言和操作系统的首选公共接口。C 语言(或其他基于 C 的语言)已经存在超过 50 年了。因此用 C/C++编写的应用程序涵盖了所有计算需求。互操作性为 Rust 开发者提供了对这一庞大库的访问能力。

在不同语言交换数据是巨大的挑战，

- 尤其是处理字符串。C 语言的字符串是以空字符结尾的，而 Rust 则不是。这种不同语言的类型系统的差异常常会带来额外的兼容性问题。
- 另一个潜在问题是指针的管理方式。这在不同语言之间可能存在差异。

解决这些问题的方案是使用外部函数接口(FFI)。它提供了 Rust 与其他语言之间传输数据的能力，以处理这些差异。

## 外部函数接口

外部函数接口是确保互操作性成功的粘合剂。它在 Rust 和 C 之间建立了一个翻译层。FFI 的部分可以在 std::ffi 模块中找到。你可以看到大多数情况下将数据从 Rust 编组到 C 所需的标量、枚举和结构体。

字符串是最难正确编组的类型。这一点考虑到 Rust 和 C/C++的差异。

- C 字符串以空字符结尾，而 Rust 则不是
- C 字符串不能包含控制阀，而 Rust 允许
- C 字符串可以通过原始指针直接访问。Rust 需要通过胖指针访问，胖指针还包含了额外的元数据。
- Rust 字符串主要使用 Unicode 字符集和 Utf-8 编码。对于 C 语言，Unicode 的使用可能会有所不同。

甚至 Rust 中的 char 与 C 的字符也不同。

- 在 Rust 中的 char 是 Unicode 标量值，而 C 的 char 支持 Unicode 代码点

在 FFI 中，CString 类型用于在 Rust 和 C 之间编组字符串。CStr 类型用于将 C 字符串转换成&str。还有 OsString 和 OsStr 类型，用于读取操作系统字符串，例如命令行参数和环境变量。

此外，一些 Rust 类型可以"按原样"完全兼容，包括浮点数，整数和基本枚举。相反，动态大小的类型不受支持，比如 trait 和切片

对于有限数量的条目，创建适当的接口以进行编组是可行的。然而当有数百个条目需要编组时，这种方式难以维持。例如编组 C 标准库的部分内容，你不会想要将整个 stdlib.h 头文件进行编组。幸运的是，libc crate 提供了绑定来对 C 标准库中的部分内容进行编组。

## 基础示例

我们从"Hello World"开始。

目录结构如下

![alt text](zh-cn/rust/images/basic_example_directory_structure.png)

1. 创建一个 C 源文件

```c
// hello.c
#include<stdio.h>

void hello() {
    printf("HelloWorld");
}
```

2. 使用 clang 编译器和 llvm 工具编译 c 源代码，并创建一个静态库

```bash
clang hello.c -c
ar rcs libhello.a hello.o # linux
# 或者
llvm-lic hello.o # windows
```

3. 将从 C 导出的函数定义在 extern "C"块中，该块可以看出 Rust 风格的头文件。调用这个函数时必须使用 unsafe 包裹。因为 Rust 无法保证外部函数的安全性。

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

4. 是时候构建应用程序了。使用 rustc 编译器，你可以从 Rust 源文件创建一个可执行的 crate,同时链接到一个外部库

```bash
rustc main.rs -L ./ -l static=hello
```

- `-L ./` -> 告诉 rustc 在这个目录找库
- `-l static=hello` -> 链接 libhello.a

你可以通过 build.rs 脚本来自动化完成构建过程，包括链接库。build.rs 文件在构建过程中由 cargo 自动检测和执行。

```rust
extern crate cc;

fn main() {
    cc::Build::new().file("c_src/hello.c").compile("hello");
}
```

- 第一步是使用`Builder::new`构造函数创建一个 Builder 类型。
- `Builder::file`函数识别输入文件(这里是一个 c 文件)以进行编译。
- `file::compile`函数执行实际的编译并生成静态库 libhello.a（Linux/macOS）或 hello.lib（Windows）
  > 生成的静态库会放在 Cargo 自动管理的 target 目录中，并且 Rust 可以在后续的 FFI 中链接使用。

这些函数都在 cc crate 中被定义，你必须在使用前在 cargo.toml 中的 build-dependencies 部分添加 cc(crate.io 中的 cc)

```toml
[build-dependencies]
cc = "1.2.41"
```

## libc crate

libc crate 包含了与 c 标准库的一部分进行编组的 ffi 绑定，包括 stdlib.h 的 ffi 绑定。在 extern 块中，你只要列出将应用程序中使用的 C 标准库的数据项，而不需要其他东西，这就是 libc crate 的好处。

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

atof 和 atoi 函数接收字符串作为参数，并分别返回一个浮点数和整数。CString::new 函数将 String 类型转换为 CString 类型。as_ptr 函数将 CStrings 转换为指针，这等同于 char\*。调用函数的结果被保存在适当的类型 c_double 和 c_longlong。由于使用了 libc crate。构建该程序无需考虑特殊因素，正常编译。

## 结构体

我们需要经常对复杂类型(如结构体)进行编组。例如，系统 API 通常需要结构体作为参数或返回值。

编组复杂类型需要额外考虑。内存对齐可能有所不同。此外，C 结构体的内存布局可能会受到用户定义的打包和内存边界的影响。Rust 并不保证其结构体的内存布局。这对编组可能是一场噩梦。解决方案是采用 C 语言模型来编组结构体。你可以应用#[repr(C)]属性到结构体上，这将消除 C 与 Rust 结构体之间的内存布局差异。

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

- extern "C" 块中导入 get_person 和 set_person 函数
- 在第一个 unsafe 代码块中，获取并显示 gPerson 的默认值。
  - 调用 get_person 函数返回\*Person 类型的默认值，对指针解引用来访问字段
  - 调用 CStr::from_ptr 函数将 first 和 last 字段转换成字符串字面量。
  - 在 println!宏中显示结构体中的三个字段
- 第二个 unsafe 代码块中，修改并显示 gPerson 的值。
  - 创建一个新的结构体，为结构体的每个字段添加新值。
  - 调用 set_person 函数将 gPerson 设置为新值。

## bindgen

你可以花大量时间创建正确的 FFI 绑定，以便在 Rust 和 C 之间传输数据。可是，当包含数十甚至数百个需要编组的文件时，这个过程相当繁琐。此外，如果处理不当，你可能会花费更多时间俩调试。幸运的是 bindgen(绑定生成)工具会自动化帮你完成这个过程。

bindgen 为 C 定义创建正确的 FFI 绑定，以免你手动完成创建映射这种繁琐工作。
bindgen 可以读取 C 头文件并为其自动生成包含所有对应 Rust 绑定的源文件。这对于 libc 未包含的 C 标准库非常有用。
Bindgen 源于 crates.io，你可以通过 cargo 安装 bindgen.

```bash
cargo add bindgen
```

按照 bindgen-cli 可以使用 bindgen 命令

```bash
cargo install bindgen-cli
```

读取头文件并生成适当的 FFI 绑定

```bash
bindgen time.h > time.rs
```

## C 调用 Rust 函数

为了互操作性，我们在要导出的 Rust 函数前加上 extern 关键字。
Rust 为其函数名进行混淆，以赋予它独一无二的身份。混淆后的名称结合了 crate 名、哈希值、函数本身的名称以及其他因素。这意味着其他语言(不知道这个方案)将无法识别 Rust 函数的内部名称。因此，为了使函数保持透明，需要使用 no_mangle 属性禁用函数的名称混淆。

```rust
#[no_mangle]
extern fn display_rust() {
    println!("Greetings from Rust");
}
```

为了与其他语言互操作，你必须为 Rust 应用程序构建一个静态或动态的库。其他语言可以通过这个库来访问其导出函数。请将 lib 部分添加到 cargo.toml 文件中，为 crate 创建一个库。

- crate-type 字段设置为 staticlib,则代表创建一个静态库
- crate-type 字段设置为 cdylib,则代表创建一个动态库

> 默认以包名为库名，如果需要，可以使用 name 字段显示设置名字

```toml
[lib]
name = "greeting"
crate-type = ["staticlib", "cdylib"]
```

上面的 cargo.tom 片段要求 Rust 程序同时创建静态库和动态库

1. lib.rs

```rust
#[unsafe(no_mangle)]
pub extern fn display_rust() {
    println!("Greetings from Rust");
}
```

编译生成的库在 target/下

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

在构建 c 程序时，你必须包含 c 源文件并链接到 Rust 创建的库。

```bash
clang sample.c libgreeting.a -o sample
或者
clang sample.c libgreeting.so -o sample
```

这个命令会在当前目录下产生 c 的可执行文件，`sample`

## cbindgen

- `bindgen`工具用于创建 C 文件生成 Rust 的 FFI 绑定，让 Rust 能调用 C 代码。
- `cbindgen`工具与`bindgen`工具正好相反。`cbindgen`工具从 Rust 代码中生成 C 头文件，让 C 能够调用 Rust 的代码。

`cbindgen`可以在 crates.io 中找到

你可以结合`cbindgen`和`build.rs`来自动化该过程。

项目结构如下

![alt text](zh-cn/rust/images/project_structure.png)

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
   在 cargo.toml 文件中，将 cbindgen 添加为构建依赖项。它将会在被 build.rs 构建的过程中使用。我们还要求生成静态库和动态库。

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

这会在 crate 根目录生产 c 头文件

![alt text](zh-cn/rust/images/generated_header_file.png)

生成的 max3.h 文件

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

编写一个调用 max3 函数的 c++程序,它包含了 cbindgen 生成的头文件

```rust
#include<stdio.h>
#include "max3.h" // 加上max3.h头文件的路径

int main() {
    long answer = max3(100, 200, 300);
    printf("Max value is %ld\n", answer);
    return 0;
}
```

以下命令将编译的 C++程序链接到 Rust 库

```rust
clang myapp.cpp libexample.a -o myapp
```

这会在调用命令所在的目录生成可执行文件 myapp

> 需要注意的是，我们与 C++应用程序进行交互操作没有想象中的那么容易，因为 C++没有稳定的 ABI,通常情况下，Rust 与 C++安全交互需要通过 C ABI 来完成。
