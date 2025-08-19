与Java类似，List 集合的最大特征就是集合元素都有对应的顺序索引。 List 集合允许使用
重复元素，可以通过索引来访问指定位置的集合元素。 List 集合默认按元素的添加顺序设置元
素的索引，比如第一个添加的元素索引为0、第二个添加的元素索引为1...

----

## 创建List集合
Kotlin 同样并未真正实现 List 集合，它只是通过别名借用了 Java 体
系中的 ArrayList 集合 。因此不推荐通过构造器来创建 List 集合，而是推荐使用工具函数来创
建 List 集合。
```kotlin
 // 1. 不可变 List
 listOf(): List<T>
 // 返回不可变的 List 集合，可以接受 0 个或多个参数作为元素。
 // 说明：Kotlin 1.1 中实际返回的是 java.util.ArrayList 的不可变实例，由 JDK 提供。

 // 2. 去除 null 的不可变 List
 listOfNotNull(): List<T>
 // 返回不可变的 List 集合，会自动去掉传入参数中的 null 值。
 // 简而言之，返回的 List 不包含 null 元素。

 // 3. 可变 List
 mutableListOf(): MutableList<T>
 // 返回可变的 MutableList 集合，可以接受 0 个或多个参数作为元素。
 // 实际返回的是 Kotlin 熟悉的 ArrayList 实例，可以修改（增删改）元素。

 // 4. 可变 ArrayList
 arrayListOf(): ArrayList<T>
 // 返回可变的 ArrayList 集合，可以接受 0 个或多个参数作为元素。
 // 本质上就是可修改的 ArrayList。
```
代码示例
```kotlin
 fun main() {
     // 创建不可变 List，允许包含 null 值
     val list1 = listOf("Java", "Kotlin", null, "G")
     println(list1)  // 输出: [Java, Kotlin, null, G]

     // 创建不可变 List，不包含 null 值
     val list2 = listOfNotNull("Java", "Kotlin", null, "G")
     println(list2)  // 输出: [Java, Kotlin, G]

     // 创建可变 List，允许包含 null 值
     val mutableList = mutableListOf("Java", "Kotlin", null, "G")
     println(mutableList)  // 输出: [Java, Kotlin, null, G]

     // 打印各集合的实际类型
     println("listOf 返回对象的实际类型: ${list1.javaClass}")           // class java.util.Arrays$ArrayList 或 kotlin.collections.ImmutableCollections$ListN
     println("listOfNotNull 返回对象的实际类型: ${list2.javaClass}")    // class kotlin.collections.ImmutableCollections$ListN
     println("mutableListOf 返回对象的实际类型: ${mutableList.javaClass}") // class java.util.ArrayList

     // 创建 ArrayList 集合
     val arrayList = arrayListOf("Java", "Kotlin", null, "G")
     println(arrayList)  // 输出: [Java, Kotlin, null, G]
 }
```

## 使用List方法
List 同样提供了与 Set 相似的集合操作方法 。通常来说 ， Set 支持的操作 ， List 一般都能支
持，它还增加了通过索引操作集合元素的方法。
* get(index: Int)： 带 operator 修饰的方法，因此可用“［］“运算符访问集合元素 。注意：[]是null安全的get()调用
* indexOf(element: E)： 返回集合元素在 List 中的索引。
* lastIndexOf(element: E)： 从后往前，返回集合元素在 List 中最后一次的出现位置。
* sublist(fromIndex: Int, toIndex: Int) ： 返回从起始位置到结束位置 List 集合的(新)子集合。 </br>
示例代码
```kotlin
 fun main() {
     // 创建一个不可变的 List
     val languages = listOf("Java", "Kotlin", "Python", "Java", "C++", "Kotlin")

     // 使用 get 或 [] 获取元素（索引从 0 开始）
     println(languages[0]) // 输出: Java
     println(languages.get(2)) // 输出: Python

     // indexOf：返回元素第一次出现的位置
     println(languages.indexOf("Kotlin")) // 输出: 1

     // lastIndexOf：返回元素最后一次出现的位置
     println(languages.lastIndexOf("Kotlin")) // 输出: 5

     // subList：获取子集合，注意 toIndex 是开区间（不包含）
     val subLanguages = languages.subList(1, 4)
     println(subLanguages) // 输出: [Kotlin, Python, Java]
 }
```

## 可变List
使用 mutableListOf()、 arrayListOf() 函数返回的 List 集合都是可变的
可以对该 List 的元素执行添加、插入、删除、替换等操作 </br>
示例代码：
```kotlin
 fun main() {
     // 使用 mutableListOf 创建可变 List
     val mutableList = mutableListOf("Java", "Kotlin", "Python")
     println("初始 mutableList: $mutableList") //[Java, Kotlin, Python]

     // 添加元素
     mutableList.add("C++")
     println("添加元素 C++ 后: $mutableList") //Java, Kotlin, Python, C++]

     // 在指定位置插入元素
     mutableList.add(1, "Rust") // 在索引1处插入 Rust
     println("在索引1插入 Rust 后: $mutableList") //[Java, Rust, Kotlin, Python, C++]

     // 删除元素
     mutableList.remove("Python") // 删除指定元素
     println("删除 Python 后: $mutableList") //[Java, Rust, Kotlin, C++]

     // 删除指定索引的元素
     mutableList.removeAt(0) // 删除索引0的元素
     println("删除索引0元素后: $mutableList") //[Rust, Kotlin, C++]

     // 替换元素
     mutableList[1] = "Go" // 将索引1的元素替换为 Go
     println("将索引1的元素替换为 Go 后: $mutableList") //[Rust, Go, C++]

     // 清除元素
     mutableList.clear()
     println("清空所有元素后: $mutableList") //[]

     println("\n—— 使用 arrayListOf() ——")
     // 使用 arrayListOf 创建可变 List（本质也是 ArrayList）
     val arrayList = arrayListOf("HTML", "CSS", "JavaScript")
     println("初始 arrayList: $arrayList") //[HTML, CSS, JavaScript]

     // 添加元素
     arrayList.add("TypeScript")
     println("添加 TypeScript 后: $arrayList") //[HTML, CSS, JavaScript, TypeScript]

     // 插入元素
     arrayList.add(2, "Python")
     println("在索引2插入 Python 后: $arrayList") //[HTML, CSS, Python, JavaScript, TypeScript]

     // 删除元素
     arrayList.remove("CSS")
     println("删除 CSS 后: $arrayList") //[HTML, Python, JavaScript, TypeScript]

     // 替换元素
     arrayList[0] = "Kotlin"
     println("将索引0元素替换为 Kotlin 后: $arrayList") //[Kotlin, Python, JavaScript, TypeScript]
 }

```