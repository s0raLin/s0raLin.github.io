| 运算符  | 对应的方法     |
| ------- | -------------- |
| a in b  | b.contains(a)  |
| a !in b | !b.contains(a) |

示例

```kotlin
 fun main() {
     val list = listOf(1, 2, 3, 4)

     // a in b → b.contains(a)
     println(2 in list)   // true，相当于 list.contains(2)

     // a !in b → !b.contains(a)
     println(5 !in list)  // true，相当于 !list.contains(5)
 }
```

由于 String 中有一个带参数(String)的 contains()方法，Kotlin 即可用 in 运算符进行计算
