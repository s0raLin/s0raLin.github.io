for-in循环专门用于遍历范围、序列和集合等，语法格式如下：
```
 for(常量名 in 字符串|范围|集合|序列|可迭代对象) {
     statements
 }
```
对于上面语法格式有两点说明。
* for-in 循环中的常量无须声明。 for-in 循环中的常量将会在每次循环开始时自动被赋值
* for-in 循环可用于遍历任何可迭代对象。所谓可选代对象就是该对象包含一个 iterator
方法，且该方法的返回值对象具有 next()、 hasNext()方法，这三个方法都使用 operator修饰。
* for-in循环可以用于遍历范围

## 遍历范围
```kotlin
 fun main() {
     // 遍历 1 到 5 的范围
     for (i in 1..5) {
         println("i = $i")
     }

     // 遍历 5 到 1 的递减范围
     for (i in 5 downTo 1) {
         println("i = $i")
     }

     // 遍历步长为 2 的范围
     for (i in 1..10 step 2) {
         println("i = $i")
     }
 }
```

## 遍历集合
```kotlin
 fun main() {
     val fruits = listOf("苹果", "香蕉", "橙子")

     for (fruit in fruits) {
         println(fruit)
     }
 }
```
遍历字符串
```kotlin
 fun main() {
     val text = "Hello"

     for (char in text) {
         println(char)
     }
 }
```
## 遍历序列
```kotlin
 fun main() {
     val numbers = sequenceOf(10, 20, 30)

     for (num in numbers) {
         println(num)
     }
 }
```
## 自定义可迭代对象
```kotlin
 // 定义一个自定义可迭代类
 class MyNumberRange(private val start: Int, private val end: Int) : Iterable<Int> {

     // 实现 iterator() 方法，返回一个迭代器对象
     override fun iterator(): Iterator<Int> {
         return MyIterator(start, end)
     }

     // 定义迭代器类
     class MyIterator(private val start: Int, private val end: Int) : Iterator<Int> {
         private var current = start

         // 判断是否还有下一个元素
         override fun hasNext(): Boolean = current <= end

         // 返回当前元素并移动到下一个
         override fun next(): Int {
             if (!hasNext()) throw NoSuchElementException()
             return current++
         }
     }
 }

 fun main() {
     val myRange = MyNumberRange(1, 5)

     // 可以直接用 for-in 遍历自定义对象
     for (num in myRange) {
         println(num)
     }
 }


```