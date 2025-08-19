* 类型? 声明可空类型
* ?. 不为空时才访问
* ?:指定值 不为空时返回当前值 为空时返回指定值
* !! 明确了该类型不为空，强制调用，为null时会抛异常
注意：NPE就是我们所说的空指针异常
## 可空类型和不可空类型
```kotlin
 fun main() {
     val str = "abc"
     //由于str转换为Int可能失败，因此num可能为空
     //val num1: Int = str.toInt() //错误，"abc"不能转换为Int,因此报错NumberFormatException: For input string: "abc"
     //println(num1)

     val num2: Int? = str.toIntOrNull() //正确，返回一个null用可空类型接收
     println(num2)
     //val num3: Int = str.toIntOrNull() //错误，可空类型才能接受null
 }
```
## 安全调用
可空类型不能直接访问属性和调用方法
```kotlin
 fun main() {
     val str: String? = null
     println(str.length)//错误，因为会导致空指针异常,所以Kotlin不允许这种操作
 }
```
通过?.安全调用
```kotlin
 user?.dog?.name
```
只有不为null时才调用，反之则不会抛异常，而是返回null
此外，还可以通过let函数
```kotlin
 fun main() {
     val str: String? = null
     str?.let {
         println(str.length)
     }
 }
```
当不为null时才执行let中的代码块

## Elvis 运算
也就是?:运算符。当左边不为null时，返回左边的值，当左边为null时，返回右边的值
```kotlin
 fun main() {
     val str: String? = null
     //当str为null时，返回长度0
     val length = str?.length ?: 0
     println(length)
 }
```

## 强制调用
如果你喜欢简单粗暴的方式，那么可以使用!!来强制调用，但这种调用可能会引发npe
我们一般在明确变量不为null时使用
```kotlin
 fun test01() {
     val line = readLine()!! //从控制台读取一行输入(以\n为结束标志)
     println(line)
 }
```