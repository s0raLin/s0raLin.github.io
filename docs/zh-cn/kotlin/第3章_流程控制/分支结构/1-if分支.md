kotlin 提供了两个关键字用于表示分支结构，即 if 和 when

## if 分支

语法:

```kotlin
 //第一种形式
 if(expression) {
     statements...
 }
 //第二种形式
 if(expression) {
     statements...
 }else {
     statements...
 }
 //第三种形式
 if(expression) {
     statements...
 } else if(expression) {
     statements...
 } else {
     statements...
 }
```

其中`else if`可以有多个，上述使用`{}`括起来的是代码块，
一个代码块被当作一个整体来执行,除非使用关键字提前退出，如下

- return 结束整个方法,可用于循环和分支
- break 退出当前代码块，线程继续往下执行，用于循环结构
- continue 跳转到下一次执行，用于循环结构 </br>
  示例代码

```kotlin
 fun main() {
     val age = 30
     if(age>20) {
         //只有当age>20时，该代码块才被执行
         //使用{}扩起来的代码块是一个整体，要么一起执行，要么都不执行
         println("年龄大于20岁")
         println("20岁以上的人应该学会承担责任")
     }
 }
```

如果代码块只有一条语句，`{}`省略</br>

```kotlin
 fun main() {
     val age = 5
     if(age>4)
         println("年龄大于4")
     else
         println(”年龄不大于4“)
 }
```

代码块内可以是 1 条或多条语句，也可以是 0 条语句，保留大括号会有更好的可读性</br>
对于 if 分支，有一个容易出现的逻辑问题，这个问题不属于语法问题，出现错误结果</br>
示例代码

```kotlin
 fun main() {
     val age = 50
     if(age>20) {
         println("青年人")
     } else if(age>40) {
         println("中年人")
     } else if(age>60)  {
         println("老年人")
     }
 }
```

从表面上看，程序没有问题，但是结果居然是 20 岁是青年人，显然出了问题</br>

上述代码等价于如下格式

```kotlin
 fun main() {
     val age = 50
     if(age>20) {
         println("青年人")
     } else if(age>40 && !(age>20)) {//在原本的if条件中添加了else的隐含条件
         println("中年人")
     } else if(age>60 && !(age>20) && !(age>40 && !(age>20))) {//在原本的if条件中添加了else的隐含条件
         println("老年人")
     }
 }
```

而`!(age>20)`又可以写成`age<=20`,因此`age>40 && !(age>20)`又可以改写写成`age>40&&age<=20`。</br>
正确的判断逻辑:

- 当 age>60，判断为"老年人"
- 当 age>40，并且 age<=60 即!(age>60)，判断为"中年人"
- 当 age>20，并且 age<=40 即!(age>40)，判断为"青年人" </br>
  因此当使用 if-else 语句进行流程控制时，一定不要忽略了 else 所带的隐含条件</br>
  如果每次都需要去计算 if 和 else 的交集是一件很繁琐的事情</br>
  为避免上述错误情况，在使用 if-else 时有一条基本规则：
- _总是优先把包含范围小的条件放到前面处理_ ，如 age>60 和 age>20,明显 age>60 的范围更小，因此应该先处理 age>60 的情况

## if 表达式

Kt 的 if 可以作为表达式使用。也就是说，整个 if-else 最终会返回一个值，因此 if 可以代替 Java 的三目运算符`?:` ，
例如：

```kotlin
 fun main() {
     val age = 20
     //将if表达式赋值给变量
     val str = if(age>18) "大于18岁" else if(age<18) "小于18岁" else "等于20岁"
     println(str)
 }
```

如果分支包含多条语句，此时代码块最后一条语句作为整个代码块的值，
例如：

```kotlin
 fun main() {
     val age = 20
     //将if表达式赋值给变量
     val str = if(age>18) {
         println("大于18的分支")
         "大于18岁"
     } else if(age<18) {
         println("小于18的分支")
         "小于18岁"
     } else {
         println("等于18的分支")
         "等于18岁"
     }
     println(str)
 }
 /*
 打印结果:
 大于18的分支
 大于18岁
 */
```
