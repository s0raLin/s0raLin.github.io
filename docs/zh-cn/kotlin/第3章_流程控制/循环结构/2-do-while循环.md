do-while循环与while循环的区别在于：
* while是先判断循环条件，若为true再执行循环体
*do-while则是先执行循环体，然后在判断循环条件，若为真则进入下一次循环，否则终止循环 </br>
伪代码如下
```
 [init statements]
 do {
     body_statements
     [iteration_statements]
 }while(test_expression)
```
代码示例：
```kotlin
 fun main() {
     var count = 6  // [init statements]

     // do...while 循环
     do {
         println("当前数字: $count") // body_statements
         count++ // [iteration_statements]
     } while (count <= 5) // test_expression
 }
 /*
 输出
 当前数字: 6
 */
```
上述代码结果可知：与while不同的是，do-while中的循环体至少执行一次 </br>