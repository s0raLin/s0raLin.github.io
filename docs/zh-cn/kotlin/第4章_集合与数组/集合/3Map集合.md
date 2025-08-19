与Java相同，Kotlin中的Map也用于保存 key-value 对。不同的是Kotlin中Map也分为可变和不可变 </br>
实际上 Kotlin 并没有真正为只币4 平台实现任何 Map 集合类（只是通过别名借用了 Java集合框架的类），
因此不推荐通过构造器创建 Map 集合，而是推荐使用 Kotlin 提供的工具函数来创建 Map 集合。

----
## 创建Map集合
* mapOf(): 该函数返回一个不可变的Map集合，该函数接收0或多个key-value作为Map的元素。
* mutableMapOf(): 该函数返回可变的 MutableMap 集合。该函数可接受 0 个或多个key-value 对，
这些 key-value 对将作为集合的元素
注意事项：</br>
对于 Kotlin 1. l 而言 ，上面两个函数实际返回的是 LinkedHashMap 的实例
上面两个方法返回的 Map 集合都会记住 key-value 对的添加顺序
一一 这是由 LinkedHashMap 的特征所决定的 。

* hashMapOf（）： 该函数返回可变的 HashMap 集合。该函数可接受 0 个或多个 key-value
对，这些 key-value 对将作为 Map 的元素。
* linkedMapOf（）：该函数返回可变的 LinkedHashMap 集合 。该函数可接受 0 个或多个
key-value 对，这些 key-value 对将作为 Map 的元素 。
注意事项：</br>
如果开发者明确希望在程序中使用LinkedHashMap 集合，则建议使用
linkedMapOf()函数，而不要使用 mapOf()、 mutableMapOf()这两个函数，虽然它
们在 Kotlin 1.1 中确实也返回 LinkedHashMap 集合
* sortedMapOf()：该函数返回可变的 TreeMap 集合。该函数可接受 0 个或多个 key-value
对，这些 key-value 对将作为 Map 的元素。</br>

示例代码
```kotlin
 fun main(args: Array<String>) {
     // 创建不可变 Map，返回值是 Map
     val map = mapOf("Java" to 86, "Kotlin" to 92, "Go" to 78)
     println(map) // key-value 对按添加顺序排列 输出： {Java=86, Kotlin=92, Go=78}

     // 创建可变 Map，返回值是 MutableMap
     val mutableMap = mutableMapOf("Java" to 86, "Kotlin" to 92, "Go" to 78)
     println(mutableMap) // key-value 对按添加顺序排列 输出：{Java=86, Kotlin=92, Go=78}

     println("mapOf 的返回对象的实际类型: ${map.javaClass}") //class java.util.LinkedHashMap
     println("mutableMapOf 的返回对象的实际类型: ${mutableMap.javaClass}") //class java.util.LinkedHashMap

     // 创建 HashMap 集合
     val hashMap = hashMapOf("Java" to 86, "Kotlin" to 92, "Go" to 78)
     println(hashMap) // 不保证 key-value 对的顺序 输出：{Go=78, Java=86, Kotlin=92}

     // 创建 LinkedHashMap 集合
     val linkedHashMap = linkedMapOf("Java" to 86, "Kotlin" to 92, "Go" to 78)
     println(linkedHashMap) // key-value 对按添加顺序排列 输出：{Java=86, Kotlin=92, Go=78}

     // 创建 TreeMap（SortedMap）集合
     val treeMap = sortedMapOf("Java" to 86, "Kotlin" to 92, "Go" to 78)
     println(treeMap) // key-value 对按 key 由小到大排列 输出：{Go=78, Java=86, Kotlin=92}
 }
```
从上面的运行结果可以看出，上面有 4 个工具函数创建的 Map 集合都能维护 key-value 对
的顺序:
* 其中 mapOf()、 mutableMapOf()、 linkedMapOf()创建的 Map 集合能维护元素的添加顺
序
* sortedMapOf()函数创建的 Map 集合会按照 key 大小对 key-value 对排序。
如果真正希望 Map 集合不保证 key-value 对的顺序，只有通过 hashMapOf()函数创建 Map
集合才行。这也是由 Java 集合框架提供的 HashMap 、 LinkedHashMap 、 TreeMap 实现类的特
征所决定的。
* Java 的 Set集合其实是由 Map 集合所维护的，因此如果有某个 Set，那么就一定有对应的 Map 。

## 使用Map的方法
示例
```kotlin
 fun main() {
     // ===============================
     // 创建 Map
     // ===============================
     // 不可变 Map
     val immutableMap = mapOf("Java" to 86, "Kotlin" to 92, "Go" to 78)
     println("不可变 Map: $immutableMap")

     // 可变 Map
     val mutableMap = mutableMapOf("Java" to 86, "Kotlin" to 92)
     println("可变 Map: $mutableMap")

     // ===============================
     // 访问 Map
     // ===============================
     println("Java 的分数: ${immutableMap["Java"]}")               // 86
     println("Kotlin 的分数: ${immutableMap.get("Kotlin")}")      // 92
     println("C 的分数: ${immutableMap.getOrDefault("C", 0)}")    // 0
     println("Map 是否包含 Go: ${immutableMap.containsKey("Go")}") // true
     println("Map 是否包含值 92: ${immutableMap.containsValue(92)}") // true

     println("所有 key: ${immutableMap.keys}")       // [Java, Kotlin, Go]
     println("所有 value: ${immutableMap.values}")   // [86, 92, 78]

     // ===============================
     // 遍历 Map
     // ===============================
     println("遍历 Map:")
     for ((key, value) in immutableMap) {
         println("$key -> $value")
     }

     immutableMap.forEach { (key, value) ->
         println("Key: $key, Value: $value")
     }

     // ===============================
     // 查询与过滤
     // ===============================
     val filteredMap = immutableMap.filter { it.value > 80 }  // value 大于 80
     println("过滤后的 Map: $filteredMap") // {Java=86, Kotlin=92}

     val firstEntry = immutableMap.entries.first { it.key.contains("K") }
     println("第一个 key 包含 K 的条目: $firstEntry") // Kotlin=92

     val lastEntry = immutableMap.entries.last { it.value < 90 }
     println("最后一个 value 小于 90 的条目: $lastEntry") // Go=78

     // ===============================
     // Map 变换
     // ===============================
     val doubledValuesMap = immutableMap.mapValues { it.value * 2 }
     println("value 翻倍后的 Map: $doubledValuesMap") // {Java=172, Kotlin=184, Go=156}

     val upperCaseKeysMap = immutableMap.mapKeys { it.key.uppercase() }
     println("key 大写后的 Map: $upperCaseKeysMap") // {JAVA=86, KOTLIN=92, GO=78}


 }
```

operator 修饰了 plus、minus 方法，因此可使用＋、-运算符操作集合, </br>
代码示例一
```kotlin
 fun main() {
     val map1 = mapOf("Java" to 86, "Kotlin" to 92)

 // 合并另一个 Map
     val map2 = map1 + mapOf("Go" to 78, "Rust" to 90)
     println(map2) // {Java=86, Kotlin=92, Go=78, Rust=90}

 // 添加单个键值对
     val map3 = map1 + ("Python" to 100)
     println(map3) // {Java=86, Kotlin=92, Python=100}


 }
```
代码示例二
```kotlin
 fun main() {
     val map = mapOf("Java" to 86, "Kotlin" to 92, "Go" to 78)

 // 删除单个 key
     val map1 = map - "Java"
     println(map1) // {Kotlin=92, Go=78}

 // 删除多个 key
     val map2 = map - listOf("Java", "Go")
     println(map2) // {Kotlin=92}
 }
```

## 遍历Map
* Map 集合由多个 key-value 对组成，因此遍历 Map 集合时既可通过对 key-value 对进行遍
历，也可先遍历 key ，再通过 key 来获取对应的 value 进行遍历 。
* Kotlin 的 Map 提供了 operator 修饰的 get()方法，因此可通过“［］”运算符根据 key 来获取
value 。
* 此外， Map 也可直接用 for-in 循环进行遍历，这时循环变量的类型是 Entry （即 key-value
对）。</br>
下面程序示范了对 Map 集合的几种遍历方式。
```kotlin
 fun main(args: Array<String>) {
     // 创建不可变 Map 集合
     val map = mapOf(
         "Java" to 86,
         "Kotlin" to 92,
         "Go" to 76
     )

     // 1. 遍历 Map 的 key-value 对（entries）
     println("遍历 entries：")
     for (entry in map.entries) {
         println("${entry.key} -> ${entry.value}")
     }

     // 2. 先遍历 Map 的 key，再通过 key 获取 value
     println("\n通过 keys 遍历：")
     for (key in map.keys) {
         println("$key -> ${map[key]}")
     }

     // 3. 直接用 for-in 循环解构 Map
     println("\nfor-in 解构遍历：")
     for ((key, value) in map) {
         println("$key -> $value")
     }

     // 4. 用 Lambda 表达式遍历 Map
     println("\nforEach 遍历：")
     map.forEach { (key, value) ->
         println("$key -> $value")
     }
 }

```

## 可变的Map
除使用 mapOf()函数返回的集合是不可变集合之外，
使用 mutableMapOf()、 hashMapOf()、linkedMapOf()、
sortedMapOf()函数返回的集合都是可变的，其中后面三个函数返回的
集合类型都是明确的，依次是 HashMap 、 LinkedHashMap 、 TreeMap。 </br>
可变的 Map 为操作 key-value 对提供了如下方法。
* clear()
清空所有的 key-value 对。
* put(key: K, value: V)
放入一个 key-value 对。如果原来已经存在该 key，则新的 value 会覆盖原有的 value。
* putAll(from: Map<out K, V>)
批量放入多个 key-value 对。
* remove(key: K)
删除指定的 key-value 对。 </br>

代码示例
```kotlin
 fun main() {
     // 创建可变Map，返回值是 MutableMap
     val mutableMap = mutableMapOf("Java" to 86, "Kotlin" to 92, "Go" to 76)
     println("初始可变Map: $mutableMap")
     // 输出: {Java=86, Kotlin=92, Go=76}

     // put(): 添加或更新key-value
     mutableMap.put("Python", 88)  // 添加新元素
     mutableMap.put("Java", 90)    // 更新已有key的value
     println("put()操作后: $mutableMap")
     // 输出: {Java=90, Kotlin=92, Go=76, Python=88}

     // putAll(): 批量添加多个key-value
     val newMap = mapOf("C" to 85, "Rust" to 80)
     mutableMap.putAll(newMap)
     println("putAll()操作后: $mutableMap")
     // 输出: {Java=90, Kotlin=92, Go=76, Python=88, C=85, Rust=80}

     // remove(): 删除指定key
     mutableMap.remove("Go")
     println("remove()操作后: $mutableMap")
     // 输出: {Java=90, Kotlin=92, Python=88, C=85, Rust=80}

     // clear(): 清空所有key-value
     mutableMap.clear()
     println("clear()操作后: $mutableMap")
     // 输出: {}
 }
```