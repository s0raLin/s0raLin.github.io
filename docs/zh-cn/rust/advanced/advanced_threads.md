# chapter_17

在很多方面，进程内的线程就像住在一个房子里的多个家庭成员。他们必须共享资源，并且常常会无意中竞争这些资源。如果没有适当的协调，那么这可能会导致冲突和不可预测的行为。同样有时也需要线程同步。join 和通道都为线程之间的协调提供了帮助。

增加必要的同步有助于创建一个安全的环境，从而促使更多并行化。你可以自信地增加并行化层，而无需担心线程之间的冲突。然而，过度同步可能会增加应用程序的复杂性，降低性能。
并行编程本质上比顺序变成更复杂。当问题出现时，人民更倾向于增加同步以获得更可预测的结果。当增加同步来解决问题的情况反复出现时，会产生大量的技术债务。最终你将得到一个在并行应用程序外壳下运行的、本质上是顺序执行的程序。虽然同步往往是合理的，有时甚至是必要的，但请记住要保持并行程序的并行性。
在你第一个程序"Hello World"中，你可能体验到了线程同步。println!宏通常用于显示问候语，它通过内部互斥保证了安全。如果没有这种同步，则多个线程可能会同时使用 println!宏，从而导致不可预测的结果。

---

## 互斥

mutex 是(mutual exclusion（互相排斥）)的缩写，互斥是最知名的同步原语。它提供了对共享数据的互斥访问。

- 共享数据访问可能会导致不可预测的结果，尤其是数据可变的情况下。通过互斥，你可以防止线程同时访问共享数据。互斥可以保证对数据的顺序访问，保护共享数据。
- 互斥体可以被锁定或解锁。当被锁定时，互斥体强制执行互斥的并发策略。拥有锁的线程可以独占访问数据。同时另一个线程(或多个线程)在尝试获取已经锁定的互斥体是会被阻塞。当互斥体解锁时，等待的线程可能会获得锁。如果成功，被阻塞的线程将被唤醒，并且可以访问共享数据。
- 互斥体具有线程亲和性。当它被锁定时，必须由同一个线程来解锁。这可以防止其他线程窃取对互斥体的访问。想象一下那种混乱，任何想要访问互斥体的线程，都可以简单地解锁它并访问被保护的值，后果将不堪设想。幸运的是，在 Rust 中这是被阻止的，因为这里没有解锁函数。
  在许多语言中，互斥的使用和源码中函数的正确放置有关。当访问被保护的数据时，你必须使用互斥体的 lock 和 unlock 方法将其包围起来。因此，同步的正确性完全基于程序员的自律性--将互斥体放在正确的位置。这在重构过程中可能会成为更大的问题，因为被保护的数据或任何互斥体可能会被无意间移动或删除。由于这些原因，Rust 采取了不同的方法，并且将被保护的数据与互斥体关联。这种直接的关联防止了其他语言中发生的问题。

### Mutex 互斥体

- Mutex 类型是互斥体的一种实现。它位于 std::sync 模块中，与其他同步组件一样，Mutex 是泛型的，其中 T 代表被保护的数据。
- 你可以用 Mutex::new 构造函数创建一个新的互斥体，该构造函数也是泛型(T)的，唯一的参数是被保护的数据,函数定义如下:

```rust
fn new(t: T)->Mutex<T>
```

Mutex::lock 函数用于锁定 Mutex 并独占受保护的数据。如果 Mutex 处于解锁状态，那么你将获取锁并继续执行。当 Mutex 已经锁定时，当前(尚未获取到锁)的线程将被阻塞直到可以获取锁

```rust
fn lock(&self)->LockResult<MutexGuard<'_, T>>
```

look 函数返回一个 MutexGuard。它实现了 Deref(解引用) trait,从而提供内部值(即受保护的数据)的访问。MutexGuard 确保当前线程可以安全地访问数据。重要的是，当 MutexGuard 被释放时，Mutex 会自动解锁，这就是 Rust 不需要解锁函数的原因。

```rust
use std::sync::Mutex;

fn main() {
    {
        let mutex = Mutex::new(0);
        let mut guard = mutex.lock().unwrap();

        *guard += 1;
        println!("{}", *guard);
        // 解锁互斥体
    }
}
```

示例

```rust
use std::{sync::Mutex, thread};

fn main() {
    let mutex = Mutex::new(0);
    thread::scope(|s| {
        for count in 1..=2 {
            s.spawn(|| {
                let mut guard = mutex.lock().unwrap();
                *guard += 1;
                println!("当前:{:?} Data:{}", thread::current().id(), *guard);
            });
        }
    });
}
```

你可能会在无意中导致互斥体泄漏。因为互斥体在 MutexGuard 的生命周期内保持锁定状态，如果 MutexGuard 从未被释放，或只是延迟释放，那该互斥体将对其他线程不可用，这可能导致死锁。这是由多种原因引起的，包括对 MutexGuard 的管理不良。

```rust
use std::{sync::Mutex, thread, time::Duration};

fn main() {
    let mut hello = String::from("hello");
    let mutex = Mutex::new(&mut hello);
    {
        let mut guard = mutex.lock().unwrap();
        guard.push_str(", world");
        // 做一些耗时的事情，其他线程会暂停等待
        thread::sleep(Duration::from_secs(10));
    } // 解锁互斥体

    thread::scope(|s|{
        s.spawn(||{
            println!("进入这里");
            let mut guard = mutex.lock().unwrap();
            guard.push_str("小王");
        });
    });
}
```

下面的示例几乎是相同的代码，区别是 MutexGuard 没有与变量进行绑定。这意味着 MutexGuard 是临时的，并在下一行代码中会被释放，此时互斥体会被解锁，我们无需等到代码可的结尾才解锁互斥体。

```rust
use std::{sync::Mutex, thread, time::Duration};

fn main() {
    let mut hello = String::from("hello");
    let mutex = Mutex::new(&mut hello);

    (*mutex.lock().unwrap()).push_str(", world");
    // 保护被丢弃，解锁互斥体
    // 做一些耗时的事情
}
```

你也可以显式地释放 MutexGuard 来解锁互斥体

```rust
use std::{sync::Mutex, thread, time::Duration};

fn main() {
    let mut hello = String::from("hello");
    let mutex = Mutex::new(&mut hello);
    {
        let mut guard = mutex.lock().unwrap();
        guard.push_str(", world");
        drop(guard); //显式释放，解锁互斥体
        do_something();
    }

    thread::scope(|s|{
        s.spawn(||{
            let mut guard = mutex.lock().unwrap();
            guard.push_str("！");
        });
    });

    println!("{}", hello);
}

fn do_something() {
    thread::sleep(Duration::from_secs(3));
}
```

### 非作用域互斥体

你可以与非作用域线程共享一个互斥体，而 Arc(原子类型计数)类型正是以这种方式共享互斥体的最佳解决方案。
多线程应用程序往往需要共享所有权(多个线程共享数据的所有权)。Arc 类型支持共享所有权，并通过引用计数来追踪所有者的数量。当最后一个共享所有者(即线程)退出后时，计数器降至 0,此时共享数据被释放。引用计数是以原子的方式进行的，以防止竞争条件或引用计数被破坏。
Arc 位于 std::sync 模块中。可以通过 Arc::new 来创建一个新的 Arc,它的唯一参数是共享数据。

```rust
fn new(data: T)->Arc<T>
```

你可以克隆(clone)以与其他线程共享。每次克隆，引用计数都会增加。此外，Arc 实现了 Deref trait,以提供对内部值的访问。

```rust
use std::{sync::Arc, thread};

fn main() {
    let arc_orig=Arc::new(0);
    let arc_clone = arc_orig.clone();
    let handle = thread::spawn(move ||{
        println!("Thread2 {}", arc_clone); //Deref
    });


    println!("Thread1 {}", arc_orig);

    handle.join();
}
```

上面代码中，主线程为一个整数值创建了一个 Arc,然后克隆一个 Arc 并增加引用计数，克隆的 Arc 随后被移动到另一个线程。现在两个线程共享着数据，println!宏会自动解引用 Arc 以显示底层值。因为值是共享的，所以两个线程显示相同的结果。
随着共享 Arc 数量的增加，命名可能会成为问题。导致 Arc 被命名为 arc1、arc2、...。一个更好的解决方案是通过变量遮蔽在各个线程使用相同的名称。

```rust
use std::{sync::Arc, thread};

fn main() {
    let arc = Arc::new(0);
    { // 新代码块
        let arc = arc.clone();
        let handle = thread::spawn(move || {
            println!("{}", arc); // Deref
        });
        handle.join();
    } // 代码块结束
    println!("{}",arc);
}
```

需要注意的是 Arc 只提供了共享所有权的引用计数，但它不是一个 Mutex.Arc 不会对数据访问进行同步，然而，Arc 非常适合与非作用域共享 Mutex。Arc 共享 Mutex,而 Mutex 保护数据。

示例
在本示例中，Mutex 保护一个整数值(初始值为 0),Mutex 通过 Arc 类型的变量 arc_mutex 进行共享。创建了一个 vec 来存储 for 循环生成的 handle

```rust
use std::{
    sync::{Arc, Mutex},
    thread,
};

fn main() {
    let arc_mutex = Arc::new(Mutex::new(0));
    let mut handles = vec![];
    for i in 0..=2 {
        let arc_mutex = Arc::clone(&arc_mutex);
        let handle = thread::spawn(move || {
            let mut guard = arc_mutex.lock().unwrap();
            *guard += 1;
            println!("{}", guard);
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join();
    }
}
```

for 循环生成新线程，每个线程捕获 arc_mutex 的克隆版本。然后 arc_mutex 以同步对整数值的访问。如果获得了锁，则返回 MutexGuard,它被解引用以访问内部值，然后该值递增。在随后的 for 循环中，对每个 JoinHandle 调用 join 等待

## 互斥体中毒

当一个线程在锁定互斥体时发生 panic,并释放 MutexGuard 时，该互斥体就会中毒，底层的状态是不确定的，因此尝试锁定该互斥体会返回一个错误(PoisonError)。
互斥体中毒会强制应用程序认识到潜在的问题。你也可以自行决定如何处理互斥体中毒的问题，当然你也可以选择忽略它，不过后果自负。

锁定一个中毒的互斥体会返回一个 Result 类型的 Err,具体来说是 PoisonError。PoisonError::io_inner 函数返回中毒的互斥体的 MutexGuard，通过它，你可以向往常一样访问底层数据。

```rust
use std::{
    sync::{Arc, Mutex},
    thread,
};

fn main() {
    let arc_mutex = Arc::new(Mutex::new(0));

    let arc_mutex_clone = arc_mutex.clone();
    let handle = thread::spawn(move || {
        let mut guard = arc_mutex_clone.lock().unwrap();
        *guard += 1;
        println!("子线程：已将值修改为 {}，但马上要崩溃！", *guard);
        panic!("子线程崩溃！");
    });

    // 捕获 join 结果，防止 panic 影响主线程
    if let Err(e) = handle.join() {
        println!("主线程：检测到子线程发生崩溃：{:?}", e);
    }

    match arc_mutex.lock() {
        Ok(guard) => println!("主线程：成功获取锁，当前值为 {}", *guard),
        Err(poisoned) => {
            let guard = poisoned.into_inner();
            println!(
                "主线程：检测到互斥体中毒，但仍成功恢复访问，值为 {}",
                *guard
            );
        }
    }
}
```

互斥体还有一个 try_lock 函数。与 lock 不同的是，try_lock 在互斥体已经锁定时不会阻塞。代码将继续执行，函数返回一个 Err 作为 Result。这允许你在互斥体被锁定时做一些其他的事情。

## 读写锁

读写锁类似于互斥，用于保护数据。它允许多个读者同时访问数据，

- 写者对数据拥有独占访问权，可以修改数据
- 读者只能读取数据
  RwLock 实现了读写锁。保护对读者和写者的实现。
- 读者调用 read 方法来获取读者锁。如果成功，则返回 RwLockReadGuard,作为底层值，锁会一直有效，直到 RwLockReadGuard 被释放。而如果存在活跃的写锁，read 函数将会阻塞。

```rust
fn read(&self)->LockResult<RwLockReadGuard<'_, T>>
```

- 写者通过 RwLock::write 函数获取写入锁，如果成功，则返回 Result 包裹的 RwLockWriteGuard。而锁会在 RwLockWriteGuard 释放时解锁。如果存在未完成的读取锁(读取锁未解锁)或另一个活跃的写入锁，则 write 函数会阻塞

```rust
fn write(&self)->LockResult<RwLockWriteGuard<'_, T>>
```

读写锁可能会中毒，但仅限于写线程。当 RwLockWriteGuard 在 panic 期间被释放时，读写锁会变成中毒状态。此时 read 和 write 都将返回一个错误。
如果有多个等待的写入锁，则获取锁的顺序是不可预测的。

```rust
use std::{
    sync::{Arc, RwLock},
    thread,
    time::Duration,
};

fn main() {
    let rwlock = RwLock::new(0);
    let arc = Arc::new(rwlock);
    let mut handles = vec![];

    for i in 1..=3 {
        let arc = arc.clone();
        let handle = thread::spawn(move || {
            let guard = arc.read().unwrap();
            println!("Read Lock {} Data {}", i, *guard);
            thread::sleep(Duration::from_millis(400));
            println!("Reader UnLock");
        });
        handles.push(handle);
    }

    for i in 1..3 {
        let mut guard = arc.write().unwrap();
        println!("Write Lock");
        *guard += 1;
        thread::sleep(Duration::from_millis(600));
        println!("Write UnLock");
    }

    for handle in handles {
        handle.join();
    }
}
```

RwLock 也有 try_read 和 try_write 函数。这些函数是非阻塞的，如果锁不可用，则返回 Err,但执行会继续。

## 条件变量

条件变量提供基于自定义事件的线程同步。有些语言称条件变量为事件。条件变量的语义是由你决定的，使得每个变量都具有独特性。因此，条件变量也被认为是自定义同步机制。当其他同步类型不适用时，条件变量通常是最佳解决方案，因为它可以被定制。
将互斥体和条件变量配合使用，可以用来提供锁机制。它们通常在一个元组中结合使用。这样可以防止条件变量不经意地与其关联的互斥锁解耦，避免使用错误的互斥锁。此外，条件变量有一个关联的布尔值，用以确认事件的状态。 **布尔值应该由互斥体保护** 。
条件变量是 Condvar 类型，你可以用 Condvar::new 函数创建一个 Convar.它不需要任何参数。

```rust
fn new()->Condvar
```

为了等待一个事件，Condvar::wait 函数会阻塞当前线程，直到收到事件通知。wait 函数的唯一参数来自关联互斥体的 MutexGuard,返回一个新的 MutexGuard。因此，在调用 wait 函数之前，必须锁定互斥体。

> 注意: wait 函数会解锁互斥体

```rust
pub fn wait<'a, T>(
        &self,
        guard: MutexGuard<'a, T>
    )->LockResult<MutexGuard<'a, T>>
```

Condvar::notify_one 和 Condvar::notify_all 函数将通知等待的线程事件已经发生或已完成。

- notify_one 函数唤醒一个等待的线程，即使有多个线程正在等待。
- notify_all 函数通知所有等待的线程

```rust
fn notify_one(&self)
fn ontify_all(&self)
```

示例

```rust
use std::{sync::{Arc, Condvar, Mutex}, thread, time::Duration};

/// * 声明了setup_envent的Arc，它内部将Condvar和Mutex配对。Mutex保护一个布尔值，该值指示设置是否已完成
/// * 创建一个专用线程来执行设置，接收一个setup_event元组的克隆，在执行设置之前，我们锁定Mutex并接收相关的锁保护(setup状态)
/// * 当设置完成后，使用锁保护将setup_status更新为true。然后使用notify_one函数通知其他线程 设置已经完成。
/// * 锁定互斥体，得到包含设置状态的MutexGuard
/// * wait函数阻塞线程并从互斥体释放锁。
/// * 线程将保持阻塞状态，直到有通知表示事件已经发生。在本例子中，该事件是设置已经完成
/// !在while循环中调用wait函数，当从等待中唤醒时，线程需要重新检查条件以确保没有发生虚假唤醒。
/// !如果发生虚假唤醒，则条件保持不变，线程应该继续等待适当的事件。这种检查对于设置事件来说可能没有必要。
/// !事件状态不太可能从假变为真(设置已完成到设置未完成),然后再变为假。总的来说，这是Condvar的最佳使用模式。
fn main() {
    let setup_event = Arc::new((Mutex::new(false), Condvar::new()));
    {
        let setup_event = setup_event.clone();
        thread::spawn(move||{
            let mutex = &setup_event.0;
            let cond = &setup_event.1;

            let mut setup = mutex.lock().unwrap();

            println!("Doing setup");
            thread::sleep(Duration::from_secs(2));
            *setup=true;
            cond.notify_one();
        });


    }
    let mutex = &setup_event.0;
    let cond = &setup_event.1;

    let mut setup = mutex.lock().unwrap();
    while !(*setup) {
        println!("Wait for setup to complete");
        setup=cond.wait(setup).unwrap();
    }
    println!("Main program started");

}
```

## 原子操作

Rust 的基础数据类型中包含了全套原子类型。具体的原子类型清单在不同操作系统上会有不同。
尽管涉及多个汇编级别的步骤，但原子操作是单个不可中断的步骤执行的。以防在跨线程共享操作时发生数据损坏，或其他问题。使用原子类型可以将某些操作(如读和写)，作为一个单元执行。最重要的是，原子类型的实现并不包括锁，从而提升了性能。
我们已经间接地使用了原子操作。例如 Arc 类型会原子性地增加引用计数。这样是为了更安全地修改引用计数。
原子类型位于 std::sync::atomic 模块中

- AtomicBool
- AtomicI8、AtomicI16 等
- AtomicU8、AtomicU16 等
- AtomicPtr
- AtomicIsize 和 AtomicUsize

### 存储和加载

所有原子类型的接口是一致的，这些接口用于存储(store)和加载(load)数据。此外他们的值可以通过共享引用修改。
原子操作具有一个排序参数，该参数提供了对操作排序的保证。最不受限制的排序是 Relaxed,它保证了单个变量的原子性。然而，它对于多个变量的相对顺序没有任何保证，例如由内存屏障提供的那些保证。
load 和 store 函数是原子类型的核心功能。store 函数用于更新值，load 函数用于获取值。

```rust
fn load(&self, order: Ordering)->u8
fn store(&self, val u8, order: Ordering)
```

示例

```rust
use std::time::Duration;
use std::{sync::atomic::AtomicU8, thread};
use std::sync::atomic::Ordering::Relaxed;

fn do_something() {
    thread::sleep(Duration::from_millis(2000));
}
fn main() {
    static LOAD: AtomicU8 = AtomicU8::new(0);

    let handle = thread::spawn(|| {
        for i in 0..100 {
            do_something();
            LOAD.store(i, Relaxed);

        }
    });

    thread::spawn(||{
        loop {
            thread::sleep(Duration::from_millis(2000));
            let value = LOAD.load(Relaxed);
            println!("Pct done {}", value);
        }
    });

    handle.join();
}
```

## 获取和修改

获取(fetch)和修改(modify)比加载和存储更复杂。
有一些函数支持 fetch 和 modify 操作，包括 fetch_add、fetch_sub、fetch_or、fetch_and 等。
使用两个线程计算一个累加总和，使用 AtomicU32::fetch_add 函数为例

```rust
fn fetch_add(&self, val: u32, order: Ordering)->u32
```

```rust
use std::sync::atomic::Ordering::Relaxed;
use std::time::Duration;
use std::{sync::atomic::AtomicU32, thread};

fn main() {
    static TOTAL: AtomicU32 = AtomicU32::new(0);
    let handle = thread::spawn(|| {
        for i in 0..100 {
            TOTAL.fetch_add(i, std::sync::atomic::Ordering::Relaxed);
        }
    });
    {
        let handle = thread::spawn(|| {
            for i in 100..200 {
                TOTAL.fetch_add(i, Relaxed);
            }
        });
        handle.join();
    }

    handle.join();

    println!("{}",TOTAL.load(Relaxed));
}
```

每个线程都对累加和做出了贡献，最后使用 load 方法获取总数。如果操作不是原子的，那么并行线程中的加法操作可能会破坏数据。

## 比较和交换

设想对个线程争相修改同一个值，第一个到达的线程会原子性地修改这个值。稍后到达的线程应该注意到这个变化，并且不应该再修改这个值。这种情景在并行编程相对常见，也是比较并交换操作的基础。

在比较和交换操作中，你需要指明一个预期值。

- 如果找到预期值，则当前值更新为一个新值，这就是交换。
- 然而如果没有找到预期值，就假定另一个线程已经修改了该值，当这种情况发生时，不应该再进行另一次交换。
  两个线程尝试更新一个 AtomicU32 类型，方法定义如下

```rust
pub fn compare_exchange(&self, current: u32, new: u32,
    success: Ordering, failure: Ordering)->Result<u32, u32>
```

- current 是预期值，如果 current 与当前值相匹配，原子类型 AtomicU32 的值会被更新为 new 参数的值。
  最后两个参数是独立 Ordering 类型参数
- 第一个 Ordering 参数用于交换操作
- 第二个 Ordering 参数在操作未交换时使用。
- 如果交换没有发生，则返回一个 Err

```rust
use std::{sync::atomic::AtomicU8, thread};

fn main() {
    use std::sync::atomic::Ordering::Relaxed;
    static TOTAL: AtomicU8 = AtomicU8::new(0);
    let handle1 = thread::spawn(|| {
        TOTAL.compare_exchange(0, 1, Relaxed, Relaxed)
    });

    let handle2 = thread::spawn(||{
        TOTAL.compare_exchange(0, 2, Relaxed, Relaxed)
    });

    handle1.join();

    let ret = handle2.join();

    println!("{:?}",ret);

    println!("Value is {}",TOTAL.load(Relaxed));
}
```
