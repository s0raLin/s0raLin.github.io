语法
伪代码如下:

```
 [init_statements]
 while(test_expression) {
     body_statements
     [iteration_statements]
 }
```

while 每次执行循环体之前，都会对 test_expression 布尔表达式求值，

- 如果为 true，则执行循环体部分
- 如果为 false，则不执行循环体部分

```kotlin
 fun main() {
     var count = 1 // [init_statements] 初始化语句

     while (count <= 5) { // test_expression 布尔条件表达式
         println("当前 count = $count") // body_statements 循环体
         count++ // [iteration_statements] 迭代语句
     }

     println("循环结束，最终 count = $count")
 }
```

从某种意义来说，while 循环也可以被当作条件语句(当条件一开始为 false,则循环体根本不会被执行) </br>
示例：

```kotlin
 fun main() {
     //循环的初始化条件
     var count = 0
     while(count<10) {
         println("count: $count")
         //迭代语句
         count++
     }
     println("循环结束")
 }
```

一定要保证有条件为假的时候，否则会陷入死循环

```kotlin
 fun main() {
     var count = 0
     while(count<20) {
         println("count: count")
         //迭代语句
         count--
     }
     println("永远无法跳出循环体")
 }
```

如果循环体只有一条语句，`{}`可以省略</br>

```kotlin
 fun main() {
     //循环的初始条件
     var count = 0
     //当count<10时执行循环体
     while(count<10)
         println("count: ${count++}")
 }
```

与前面 if 分支类似，如果省略了`{}`，那么 while 只控制紧跟该循环的第一条语句.
极端情况下，如果 while 后跟`;`，那么这是一个空循环体，这意味着紧跟 while 及后面的代码都不会执行，并且可能陷入死循环
