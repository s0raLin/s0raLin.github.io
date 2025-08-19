when分支取代了Java原有的switch语句</br>
```java
 public class SwitchTest {
     public static void main(String[] args) {
          char score = 'B';
          switch(score) {
              case 'A':
                  System.out.println("优秀"); break;
              case 'B':
                  System.out.println("良好"); break;
              case 'C':
                  System.out.println("中等"); break;
              case 'D':
                  System.out.println("及格"); break;
              default:
                  System.out.println("不及格");
          }
     }
 }
```
上述程序使用Kt实现
```kotlin
 fun main() {
     val score = 'B'
     when(score) {
         'A' -> println("优秀")
         'B' -> println("良好")
         'C' -> println("中等")
         'D' -> println("及格")
         else -> println("不及格")
     }
 }
```
通过比较可以发现，when的改进:
* 不再需要case关键字
* 不再需要break
* 冒号:改为`->`
* else更明确，更有意义(default代表默认，而switch中代表否则) </br>
when分支可以包含多条语句，这些语句通过`{}`包含成一整个代码块，
例如：
```kotlin
 fun main() {
     val score = 'B'
     when(score) {
         'A' -> {
             println("优秀")
             println("望百尺竿头更进一步")
         }
         'B' -> {
             println("良好")
             println("不拼一把，你都不知道自己的能力")
         }
         'C' -> println("中等")
         'D' -> println("及格")
         else -> {
             println("不及格")
             println("啥也不说了，下次再来")
         }
     }
 }
 /*
 输出:
 良好
 不拼一把，你都不知道自己的能力
 */
```
如果 when 分支只是 switch 分支的简化，那也不过如此。事实上， when 分支比 switch 分
支更强大，下面是 when 分支的 3 个小改进。
* when 分支可以匹配多个值。
* when 分支匹配不要求是常量，可以是任意表达式 。
* when 分支对条件表达式的类型没有任何要求 。</br>

例如
```kotlin
 fun main() {
      val input = readLine() ?: ""

      when (input.lowercase()) { // 条件表达式是字符串
          "yes", "y", "ok" -> println("你选择了同意") // 匹配多个值
          "no", "n" -> println("你选择了拒绝")
          else -> println("无法识别的输入")
      }

      val num = 15
      when { // 这里没有指定条件表达式，可以写任意逻辑判断
          num % 2 == 0 -> println("$num 是偶数")
          num in 10..20 -> println("$num 在 10 到 20 之间")
          else -> println("其它情况")
      }
     // 分支匹配任意表达式（这里是函数返回值）
     fun getLuckyNumber() = 7
     val guess = 7
     when (guess) {
         getLuckyNumber() -> println("猜对了！")
         else -> println("猜错了！")
     }
 }
 /*
  * 输出：
  * 输入: y
  * 输出: 你选择了同意
  * 15 在 10 到 20 之间
  * 猜对了！
  **/
```

## when表达式
与if分支同样的，when也可以作为表达式
例如:
```kotlin
 fun main() {
     val score = 'B'
     val str = when(score) {
         'A' -> { println("望百尺竿头更进一步");"优秀" }
         'B' -> { println(“不拼一把，你都不知道自己的能力");“良好” }
         'C' -> “中等”
         'D' -> “及格”
         else -> { println("啥也不说了，下次再来");"不及格" }
     }
     println(str)
 }
 /*
 输出：
 不拼一把，你都不知道自己的能力
 良好
 */
```

## when分支处理范围
通过`in`和`!in`运算符，我们还可以检查表达式是否位于指定区间或集合中，例如：
```kotlin
 fun main() {
     val score = 85

     when (score) {
         in 90..100 -> println("优秀")
         in 75..89 -> println("良好")
         in 60..74 -> println("及格")
         !in 0..100 -> println("成绩不合法")
         else -> println("不及格")
     }
 }
 /*
 输出：
 良好
 */
```

## when分支处理类型
通过`is`和`!is`语句，可以用when分支检查是否为指定类型
```kotlin
 fun describe(obj: Any) {
     when (obj) {
         is String -> println("这是一个字符串，长度为 ${obj.length}")
         is Int -> println("这是一个整数，值为 $obj")
         is Double -> println("这是一个双精度浮点数，值为 $obj")
         !is Number -> println("这不是数字类型")
         else -> println("其他类型")
     }
 }

 fun main() {
     describe("Kotlin")   // 匹配 is String 分支
     describe(42)         // 匹配 is Int 分支
     describe(3.14)       // 匹配 is Double 分支
     describe(true)       // 匹配 !is Number 分支
 }

```
代码解释
describe函数传入一个Any类型，函数体判断是否是某个类型
* is：判断变量是否是某种类型，并且自动智能类型转换（smart cast）。
* !is：判断变量是否不是某种类型。</br>
when 结合类型判断时非常适合写多类型处理逻辑。

## when 条件分支
when完全可以取代if-else-if-else...链，每个分支都是一个布尔表达式，
例如：
```kotlin
 fun grade(score: Int) {
     when {
         score >= 90 -> println("优秀")
         score >= 75 -> println("良好")
         score >= 60 -> println("及格")
         else -> println("不及格")
     }
 }

 fun main() {
     grade(95)  // 输出：优秀
     grade(80)  // 输出：良好
     grade(65)  // 输出：及格
     grade(50)  // 输出：不及格
 }
```
从上面代码可以看出，当布尔表达式为true时，when将会执行该分支的代码