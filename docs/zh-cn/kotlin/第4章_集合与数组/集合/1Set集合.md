## 添加Set集合
* Kotlin 的 Collection 集合和 Set 集合的功能基本相同， Set 集合只是为Collection 集合增加了额外的限制：集合元素不允许重复
* 实际上 Kotlin 并没有真正为只币4 平台实现任何 Set 集合类（只是通过别名借用了 Java 集合框架的类），因此不推荐通过构造器创建 Set 集合，而是推荐使用 Kotlin 提供的工具函数来创建 Set 集合 。</br>
Kotlin 提供了如下函数来创建 Set 集合。
* `setOf()`: 返回一个不可变集合。该函数可以接受0或多个参数，作为集合的元素
* `multableSetOf()`: 返回一个可变集合。该函数可以接受0或多个参数，作为集合的元素 </br>
注意事项：在Kotlin1.1中，上面两种方法实际返回的是LinkedHashSet实例，但从目前的实现来看，上面两个方法返回的 Set 集合都会记住元素的添加顺序一一这是LinkedHashSet 的特征所决定的 。
* `hashSetOf()`: 该函数返回可变的 HashSet 集合。该函数可接受 0 个或多个参数，这些参数将作为集合的元素。
* `linkedSetOf()`: 该函数返回可变的 LinkedHashSet 集合。该函数可接受 0 个或多个参数，这些参数将作为集合的元素。
* `sortedSetOf()`: ：该函数返回可变的 TreeSet 集合 。该函数可接受 0 个或多个参数，这些参数将作为集合 的元素 。
```kotlin
 fun main(args: Array<String>) {
     // 创建不可变集合，返回值是 Set
     val set = setOf("Java", "Kotlin", "Go")
     println(set) // 集合元素按添加顺序排列（实际上底层是 LinkedHashSet）

     // 创建可变集合，返回值是 MutableSet
     val mutableSet = mutableSetOf("Java", "Kotlin", "Go")
     println(mutableSet) // 集合元素按添加顺序排列
     println("setOf 的返回对象的实际类型：${set.javaClass}")
     println("mutableSetOf 的返回对象的实际类型：${mutableSet.javaClass}")

     // 创建 HashSet 集合
     val hashSet = hashSetOf("Java", "Kotlin", "Go")
     println(hashSet) // 不保证元素的顺序

     // 创建 LinkedHashSet 集合
     val linkedHashSet = linkedSetOf("Java", "Kotlin", "Go")
     println(linkedHashSet) // 集合元素按添加顺序排列

     // 创建 TreeSet 集合（需要通过 sortedSetOf）
     val treeSet = sortedSetOf("Java", "Kotlin", "Go")
     println(treeSet) // 集合元素按字典顺序（由小到大）排列
 }
```
从上面的运行结果可以看出， Kotlin 的 4 个工具函数创建的 Set 集合都能维护元素的顺序，
* 其中 setOf()、mutableSetOf()、linkedSetOf()创建的 Set 集合能维护元素的添加顺序(这是LinkedHashSet 的特征所决定的)
* sortedSetOf()函数创建的 Set 集合会按照大小对元素排序。
* 如果真正希望 Set 集合不维护元素顺序，只有通过 hashSetOf（）函数创建 Set 集合才行 。

----

## 使用Set方法
除 Java 原生 Set 的各种方法之外， KotLin 的 Set 还扩展了大量方法，在 Set 集合中有很多方法与 Array 的方法功能相似
1. 元素判断
* in / !in：判断元素是否存在于集合中（底层用 contains）
2. 条件检查
* all {}：是否所有元素都满足条件。
* any {}：是否有任一元素满足条件。
* none {}：是否所有元素都不满足条件。

3. 查找元素
* find {}：查找第一个满足条件的元素（找不到返回 null）。
* first {}：从前往后找第一个满足条件的元素（找不到抛异常）。
* last {}：从后往前找第一个满足条件的元素（找不到抛异常）。
* firstOrNull {}：找第一个满足条件的元素（找不到返回 null）。

4. 集合运算
* intersect()：交集。
* union()：并集。
* +：相加，相当于并集。
* -：相减，去掉公共元素。

5. 集合转换
* map {}：映射为新值。
* associateBy {}：转换为 Map，key 由 Lambda 生成，value 是原集合元素。
* filter {}：过滤。
* drop(n)：丢掉前 n 个元素。
* reversed()：反转（返回 List）。
* distinctBy {}：根据条件去重。
* flatMap {}：展开集合，例如把字符串集合展开成字符集合。

6. 聚合运算
* fold(initial) { acc, e -> ... }：迭代累计（从初始值开始累加）。
* count {}：统计满足条件的元素个数。
* max() / min()：取最大/最小值（字典序比较）。

7. 分组
* groupBy {}：根据条件分组，返回 Map<key, List>。

### 代码示例
```kotlin
 fun main(args: Array<String>) {
     // 创建不可变集合，返回值是 Set
     val set = setOf("Java", "Kotlin", "Go")

     // 判断是否所有元素的长度都大于 4
     println(set.all { it.length > 4 })   // 输出 false

     // 判断是否任一元素的长度都大于 4    println(set.any { it.length > 4 })   // 输出 true

     //判断是否任意元素的长度都不大于 4    println(set.none { it.length > 4 }) //输出 false

     // 以 Lambda 表达式的值为 key ，集合元素为 value，组成 Map 集合    val map = set.associateBy { "《$it 核心指南》" }
     println(map)
     // 输出：
     // {《Java 核心指南》=Java, 《Kotlin 指南》=Kotlin, 《Go 核心指南》=Go}
     // in、!in 运算符（底层用 contains）    println("Java" in set)    // 输出 true
     println("C++" !in set)    // 输出 true

     // 返回删除 Set 集合前两个元素后的集合    val droppedList = set.drop(2)
     println(droppedList)      // 输出 [Go]

     // 对 Set 集合元素进行过滤：要求集合元素包含 "li"    val filteredList = set.filter { "li" in it }
     println(filteredList)     // 输出 [Kotlin]

     // 查找 Set 集合中第一个包含 "li" 的元素    val foundStr1 = set.find { "li" in it }
     println(foundStr1)        // 输出 Kotlin

     // 查找 Set 集合中第一个包含 "gang" 的元素    val foundStr2 = set.find { "gang" in it }
     println(foundStr2)        // 输出 null

     // 将 Set 集合中的所有字符串拼接在一起    val foldedList = set.fold("") { acc, e -> acc + e }
     println(foldedList)       // 输出 JavaKotlinGo

     // 查找某个元素的出现位置    println(set.indexOf("Go")) // 输出 2

     // 将每个集合元素映射成新值，返回所有新值组成的 List    val mappedList = set.map { "《疯狂 $it 讲义》" }
     println(mappedList)
     // 输出：
     // [《疯狂 Java 讲义》, 《疯狂 Kotlin 讲义》, 《疯狂 Go 讲义》]
     // 获取最大值（字典序比较）    println(set.max())        // 输出 Kotlin

     // 获取最小值（字典序比较）    println(set.min())        // 输出 Go

     // 反转集合顺序（转 List 再反转）    val reversedList = set.reversed()
     println(reversedList)     // 输出 [Go, Kotlin, Java]

     // 定义另一个集合    val bSet = setOf("Lua", "Erlang", "Kotlin")

     // 计算两个集合的交集
     println(set intersect bSet)  // 输出 [Kotlin]

     // 计算两个集合的并集    println(set union bSet)      // 输出 [Java, Kotlin, Go, Lua, Erlang]

     // 集合相加，相当于并集    println(set + bSet)          // 输出 [Java, Kotlin, Go, Lua, Erlang]

     // 集合相减，减去公共的元素    println(set - bSet)          // 输出 [Java, Go]



     val langs = setOf(
         "Java", "Kotlin", "Rust", "Go",
         "JavaScript", "TypeScript", "Python", "C", "C++"
     )
     // 从集合的末尾开始往前找，找到最后一个满足条件的元素
     val last = langs.last { "C" in it }
     println(last)

     // 从集合开头往后找，找到第一个满足条件的元素。
     val first = langs.first { "li" in it }
     println(first)


     // 统计所有语言名称长度 > 4 的数量
     val count = langs.count { it.length > 4 }
     println("长度大于 4 的语言有：$count 个") // 输出 5

     // 按照名称长度进行分组    val grouped = langs.groupBy { it.length }
     println("按长度分组：$grouped")
     // 可能输出：{4=[Java, Rust], 6=[Kotlin, Python], 2=[Go, C], 3=[C++] ...}

     // 找出第一个以 "J" 开头的语言    val startsWithJ = langs.firstOrNull { it.startsWith("J") }
     println("第一个以 J 开头的语言：$startsWithJ") // 输出 Java

     // 去重：以首字母为 key 去重    val distinct = langs.distinctBy { it.first() }
     println("按首字母去重后的集合：$distinct")
     // 输出：[Java, Kotlin, Rust, Go, Python, C]

     // flatMap 展开：每个字符串拆成字符    val chars = langs.flatMap { it.toList() }
     println("展开成字符列表：${chars.take(20)}...") // 输出前 20 个字符

     println()
 }
```
上面程序中后两行粗体字代码使用了+、-运算符对集合进行操作。这是由于 Set 集合提供
了 operator 修饰的 plus 、 minus 方法，因此可使用+、-运算符操作集合。</br>

上面程序中的代码使用了 intersect 、 union 运算符来操作 Set 集合，
Kotlin 规定以 infix 修饰的方法，能以运算符的方式进行调用。

----

## 遍历Set
### 一、for-in遍历
```kotlin
 fun main() {
     // 创建一个不可变集合
     val langs = setOf("Java", "Kotlin", "Rust", "Go", "Python")

     // 使用 for-in 遍历集合
     for (lang in langs) {
         println("编程语言: $lang")
     }
 }
```
</br>使用 for-in 循环遍历 Set 元素时无须获得 Set 元素的个数，也无
须根据索引来访问 Set 元素， for-in 循环自动迭代 Set 的 每个元素，当每个元素都被送代一 次
后， for-in 循环自动结束 。

### forEach()遍历
由于 Set 集合继承了 Iterable ，因此可使用该接口中定义的 forEach（）方法来遍历集合。
```kotlin
 fun main() {
     // 创建一个不可变Set集合
     val langs = setOf("Java", "Kotlin", "Rust", "Go", "Python")

     // 使用 forEach 方法来遍历 Set 集合
     langs.forEach { println(it) }
 }
```
### 遍历Set集合的索引
由于 setOf()方法返回的 Set 集合是有序的，因此程序
可以通过索引来遍历 Set 集合， Set 集合提供了 indices 方法返回其索引的区间
```kotlin
 fun main() {
     //创建一个不可变的Set集合
     val langs = setOf("Java", "Kotlin", "Rust", "Go", "Python")
     //遍历Set集合的索引
     for(index in langs.indices) {
         //根据索引遍历Set集合
         println(langs.elementAt(index))
     }
 }
```

## 可变Set
使用 mutableSetOf()、 hashSetOf()、
linkedSetOf()、 sortedSetOf()函数返回的集合都是可变的，其中后面三个函数返回的集合类型都
是明确的，依次是 HashSet、LinkedHashSet、TreeSet 。

### 添加元素
* add(element: E): 每调用一次方法，就向集合添加一个元素element
* addAll(elements: Collection<E>): 批量添加多个元素 </br>
示例
```kotlin
 fun main() {
     val language = mutableSetOf("Swift")
     //添加一个元素
     language.add("Java")
     language.add("Go")

     println(language)
     println(language.count())
     // ["Lua", "Go", "Swift"]
     // 3

     language.addAll(setOf("Kotlin","Python","JS"))

     println(language)
     println(language.count())
     // [Swift, Java, Go, Kotlin, Python, JS]
     // 6
 }
```

### 删除元素
* remove(element: E): 删除指定元素，删除成功则返回 true
* removeAll(elements: Collection<E>)：批量删除 Set 集合中的多个元素。
* retainAll(elements: Collection<E>): 只保留 Set 集合中与 elements 集合共有的元素。
* clear(): 清空集合。</br>

示例
```kotlin
 fun main() {
     // 创建可变集合
     val languages = mutableSetOf("Kotlin", "OC", "PHP", "Perl", "Ruby", "Go")

     // 删除单个元素
     languages.remove("PHP")
     languages.remove("Perl")
     println(languages)
     // 输出示例: [Kotlin, OC, Ruby, Go]

     // 批量删除多个元素
     languages.removeAll(setOf("Ruby", "Go"))
     println(languages)
     // 输出示例: [Kotlin, OC]

     //仅保留与elements匹配的元素
     languages.retainAll(setOf("Kotlin"))
     println(languages)
     // 输出示例: [Kotlin]

     // 清空集合
     languages.clear()
     println(languages.count())
     // 输出: 0
 }
```
Set 和 MutableSet 都包含一个 iterator() 的方法，但
* 普通 Set 的 iterator() 方法返回的是
Iterator 对象，该 Iterator 对象只有 hasNext() 和 next() 两个方法;
* 而 MutableSet 的 iterator() 方法
返回的是 MutableIterator 对象，该对象除 hasNext() 和 next() 两个方法之外，还提供了一个
remove() 方法，该方法可用于在遍历时删除元素。</br>

示例
```kotlin
 fun main() {
     val set = mutableSetOf("aa", "eyz", "abc")
     val it = set.iterator()  // 返回 MutableIterator

     while (it.hasNext()) {
         val e = it.next()
         println(e)
         // 遍历时删除元素
         if (e.length < 3) {
             it.remove()
             println(set) // 输出当前集合状态
         }
     }
 }
```