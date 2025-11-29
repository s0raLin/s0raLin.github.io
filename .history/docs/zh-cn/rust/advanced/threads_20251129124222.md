# chapter_16

在Rust中，每个进程最初只有一条主执行路径，被称为主线程。main函数执行的就是主线程。我们可以创建额外的线程，以实现并行执行任务或操作。Rust中的线程本质上就是操作系统线程或物理线程，Rust中的线程与操作系统线程存在一一对应的关系，这与一些语言的绿色线程(M: N线程模型)不同，绿色线程将多个逻辑线程(M)调度到少数个物理线程(N)上运行。
并行和并发变成是引入多线程模型的两个重要原因。
* 并行编程旨在将一个进程拆分为多个并行操作，以提升整体性能。
* 并发致力于提供系统的响应能力。例如在执行排序等计算密集型操作时，仍然能保持用户界面的响应。

你可能会觉得既然2个线程可以提升性能，那10个线程效果岂不是更好?然而事实并非如此。
决定是否带来性能改善的因素有很多，比如与操作系统相关的因素。一旦线程数量超过某个临界点，反而会导致性能下降。因为存在数据依赖和线程运行时开销(如上下文切换)，所以无法做到完全并行。

在Rust中，无畏并发的设计消除了并发变成的多种顾虑(数据竞争等)。

在一个进程这个空间中，每个线程也拥有私有资源。其中值得关注的是线程栈，用于维护该线程的局部变量、系统调用信息以及其他信息。在某些环境下，线程的默认栈大小可能是2MiB，对于拥有数十甚至上百个线程而言，栈空间的总占用是一笔相当大的内存开销。Rust为开发者提供了管理线程栈大小的机制，可以帮助你更好地管理内存占用。

相比于单线程，多线程的管理更加复杂
* 竞态条件，多个线程竞争贡献资源的情况。
* 死锁，一个线程无限期地等待另一个线程或资源变得可用。
* 不一致性，多线程应用程序如果实现不当会表现出不一致性。
尽管增加了复杂性，多线程仍然是创建可扩展、响应快、高性能应用程序的一个重要工具。

## 同步函数调用
```rust
fn hello() {
    println!("hello, world");
}

fn main() {
    println!("In main");
    hello();
    println!("Back in main");
}
```

每个函数都有局部变量，这些变量被放置在保存线程状态的栈上。
```rust
fn display() {
    let b = 2;
    let c = 3.4;
    println!("{} {}", b, c);
}

fn main() {
    let a = 1;
    println!("{}", a);
    display();
}
```
每个函数都会获得一块专门的存储区域，被称为栈帧，用于保存自己的私有数据。随着同步函数调用的不断深入，新的栈帧被持续压入栈中，导致栈的空间持续增长。当函数执行完毕后，对应的栈帧会从栈中移除。
![alt text](zh-cn/rust/images/stack_frames.png)

## 线程
Rust标准库中的thread模块提供了线程相关的功能。
* thread::spawn 该函数只接收一个参数(函数/闭包)作为新线程的入口点，用于创建并立即启动一个新线程。
```rust
pub fn spawn<F, T>(f: F)->JoinHandle<T> 
where F: FnOnce()->T+Send+'static
T: Send+'static
```
需要注意的是
1. spawn返回一个JoinHandle,用于线程同步和获取线程入口函数的返回值。
2. F是入口函数的类型参数，T是线程返回值的类型参数。
3. Send约束了该值可以安全地跨线程传递。
4. 'static生命周期是必须的，因为我们无法预知线程何时启动和结束，新线程的生命周期可能超过父线程，因此T和F都要求具有静态生命周期。
5. 父线程只是一个比喻性的说法，实际上这两个线程之间没有关系。

多线程示例
```rust
use std::thread;

fn main() {
    let thread = thread::spawn(|| println!("hello"));
    println!("In main");
}
```
main函数和闭包在独立的线程中同时运行。
这个例子会出现不稳定行为:
* 如果main函数率先完成，则程序退出，包括终止其他正在运行的线程。闭包的问候信息来不及显示
* 这两个线程的执行顺序是不确定的，当你多次运行代码，结果可能会不同。问候信息可能显示也可能不显示。

spawn函数会返回一个JoinHandle,我们可以用其join方法让当前线程等待，直到由它管理的线程执行完毕后才继续执行。这种等待一直持续到关联的线程被分离,例如被丢弃。
```rust
use std::thread;

fn main() {
    let thread = thread::spawn(||println!("hello"));

    println!("In main");
    let ret = thread.join(); // 等待线程结束
    println!("Break in main");
}
```
有时候可能需要获取线程的执行结果，也可以用JoinHandle,其join方法会阻塞当前线程，直到与其关联的线程执行完毕，join方法的返回值就是该线程的返回值(Ok(value))。
```rust
use std::thread;

fn main() {
    let t = thread::spawn(|| 1);
    let ret = t.join();
    println!("{}", ret.unwrap());
}
```

如果一个正在运行的线程没有成功完成执行，例如遇到了panic
* 对于主线程(通常是main函数)，那么整个程序将终止。
* 对于非主线程，线程将在栈展开后简单地终止，但其他线程将会继续执行。

如果该线程在join列表中，那么join函数会返回Err结果，作为对发生panic的通知。
```rust
use std::thread;

fn main() {
    let handle = thread::spawn(|| panic!("kaboom"));
    let ret = handle.join();

    match ret {
        Ok(value) => println!("{}",value),
        Err(msg) => println!("{:?}", msg),
    }
}
```

当线程由闭包创建时，可以通过捕获变量将数据传递给线程。这是线程常见的输入来源。然而线程异步方式运行，不受父线程作用域的限制。新线程的存在时间可能比父线程更长。因此为了避免数据所有权的问题，需要使用move关键字将捕获的数据所有权转移到闭包中。
```rust
use std::thread;

fn main() {
    let a = 10;
    let b = 20;
    let handle = thread::spawn(move || {
        let c = a + b;
        println!("result: {}", c)
    });

    let result = handle.join();
    println!("{:?}", result.unwrap());
}
```

作用域线程消除了普通线程使用捕获变量的一些限制。更重要的，作用域线程的生命周期是确定的。它不会比创建它的代码块(作用域)存活更久，因此不需要move关键字。
创建作用域线程需要使用thread::scope函数。该函数接收一个作用域对象作为参数，该对象定义了作用域线程的生存范围(作用域)。
```rust
fn scope<'env, F, T>(f: F)->T
where F: for<'scope> FnOnce(&'scope &Scope<'scope, 'env>)->T,
```
类型参数F将作用域对象描述为函数，T描述其返回值类型，'scope指作用域对象的生命周期。'env 用于任何借用值。因此'scope的生命周期不长与'env。
```rust
use std::thread;

fn main() {
    let mut count = 0;
    thread::scope(|s|{
        s.spawn(||count+=1);
    });
    println!("{}",count);
}
```


### thread类型
Thread是线程的句柄类型，同时是一种不透明类型。我们无法直接创建Thread类型的实例，只能通过工厂函数创建，也就是thread::spawn或Builder::spawn函数间接创建。
绝大多数情况下，线程本身不持有自己的句柄。拥有自身句柄将允许线程对自己进行管理。幸运的是，Rust提供了Thread::current()函数，可以获取代表当前线程的句柄。有了这个句柄，就可以调用各种方法操作或查询线程的状态了。
```rust
use std::thread;

fn main() {
    let thread_current = thread::current();
    let id = thread_current.id();
    let name = thread_current.name();
    println!("id: {:?}  name: {:?}", id, name);
}
```
* thread::id()返回一个ThreadId类型，这是一直不透明的类型，代表当前线程所运行的进程的唯一标识符。当一个线程终止后，它的ThreadId不会重复使用。
* thread::name()返回Result枚举，类型为&str，默认的名称是该线程的入口函数名。如果线程是通过闭包创建的，则没有线程名(None)
```rust
use std::thread;

fn main() {
    let thread_current = thread::current();
    let id = thread_current.id();
    let name = thread_current.name();
    println!("id: {:?}  name: {:?}", id, name);

    let result = thread::spawn(|| {
        println!("In thread2");
        let curr = thread::current();
        let id = curr.id();
        let name = curr.name();
        println!("{:?}", id);
        println!("{:?}", name);
    })
    .join();   
}
```

## CPU执行时间
* 并发运行的线程会共享CPU的执行时间。不同操作系统环境采用了不同的线程调度算法。大多数现代操作系统使用抢占式调度，线程也可以主动调用thread::yield_new函数主动让出剩余的时间片。这种方式更加友好。
* 我们还可以要求某个线程在指定时间段内睡眠，在睡眠期间，该线程不会活动CPU执行时间。这种做法通常是为了实现线程执行的同步和协调，也有可能是因为当前线程暂时没有可做的工作。thread::sleep函数会强制线程至少休眠指定的时间。
Duration类型提供了一些函数允许以不同精度指定睡眠时间长度。
1. duration::as_micros: microseconds 读取dur的总微秒数
2. duration::as_millis: milliseconds 读取dur的总毫秒数
3. duration::as_nanos: nanoseconds 读取dur的总纳秒数
4. duration::as_secs: seconds 读取dur的总秒数


```rust
use std::{thread, time::Duration};

fn main() {
    for (name, dur) in [("T1", 30), ("T2", 40)] {
        thread::spawn(move || {
            let mut n = 1;
            while n < 5 {
                println!("{} {}", name, n);
                n += 1;
                thread::sleep(Duration::from_millis(dur));
            }
        });
    }

    thread::sleep(Duration::from_secs(3));
}

```

各种操作系统在底层为阻塞同步(即自旋锁)提供了支持。在自旋锁机制中，线程会次序"自旋"执行一段无谓的循环代码，耗费CPU时间，直到所需的同步资源变为可用状态。当资源竞争程度不高时，自旋锁往往比其他同步机制(如互斥和信号量)更高效。
* thread::park函数启动一个自旋锁，并有效阻塞当前线程。每个线程都关联一个令牌。park函数会让线程阻塞直到该令牌变为可用状态或超时。
* unpark方法可以解除线程的阻塞状态(释放自旋锁),
* thread::park_timeout函数会让线程阻塞指定的时长，如果超时前线程没有被unpark,则该线程会自动唤醒。
```rust
use std::{thread::{self, Thread}, time::Duration};


fn main() {
    let open = store_open();
    
    //准备工作
    disable_alarm();
    open_registers();

    open.unpark();

    thread::sleep(Duration::from_millis(10));
}
fn disable_alarm() {

}
fn open_registers() {

}

fn store_open() -> Thread {
    thread::spawn(|| {
        thread::park();
        loop {
            println!("开店营业中");
        }
    })
    .thread()
    .clone()
}
```

## 线程Builder
线程有两个可配置的属性: 线程名称和栈大小。线程名称用字符串表示，栈大小则需指定以字节为单位的值。
可以通过Builder类型配置这些属性，配置完成后调用builder::spawn方法生成新线程，它会返回一个`Result<JoinHandle<T>>`类型的结果
* Builder::name函数用于设置线程的名称。为线程指定合理的名称方便调试。
* Builder::stack_size用于设置单个线程的栈空间大小。线程的初始栈大小由操作系统决定的，我们可以为除主线程外的任何线程设置栈大小，主线程的栈大小取决于运行环境。可以通过stack_size设置单个线程的栈大小，也可以通过RUST_MIN_STACK环境变量来统一指定所有新线程的默认栈大小。合理管理栈大小不仅可以提升性能，还可以减少进程的内存占用。

由于name()和stack_size()返回的都是Builder类型，因此可以链式调用。
```rust
use std::{result, thread::{self, Builder}, time::Duration};

fn main() {
    let builder = Builder::new().name("Thread1".to_string()).stack_size(4096);
    let result = builder.spawn(||{
        let thread = thread::current();
        println!("id:{:?} name:{:?}",thread.id(), thread.name());
    });

    
    let handle = result.unwrap();
    let result = handle.join();
}
```

## 通信顺序进程
通信顺序进程(CSP)理论，为线程编程定义了一种新颖的模型，在该模型中1,线程直接通过实现FIFO队列语义的异步消息传递对象来进行通信。CSP要求线程之间通过消息传递对象交换信息，而非共享内存。
在Rust中，通信是线程之间的传输管道，它有两个部分: 发送者和接收者。发送者通过通道发送消息，接收者从管道接收消息。通道接收多生产这单消费者模型(每个通道有一个接收者，但可以有多个发送者)
> 注意，发送者和接收者是同一管道的两端，如果任何一方变得无效，则通过通道的通信将无效。

支持线程同步的工具在标准库std::sync模块中，包括互斥、锁和通道。其中通道有各种类型。
* Sender: 异步通道
* SyncSender: 同步通道

## 异步通道
异步通道没有大小限制，理论上可以无限存储数据。发送数据到通道时，发送者永远不会阻塞，但同时也无法确定接收者何时真正从通道获取数据，可能是立即获取，也可能永不获取。只有当接收者试图从空通道读取数据时，通道才会阻塞。
使用mpsc::channel函数创建一个异步通道
```rust
fn channel<T>()->(Sender<T>, Receiver<T>)
```
此函数返回一个包含通道双端的元组`(Sender<T>, Receiver<T>)`。类型参数T指定了可以通过该通道传输的数据类型。
* Sender使用Sender::send函数将数据插入通道，如果需要多个发送端，则可以克隆Sender。
* Receiver使用Receiver::recv函数从通道读取数据。
以下是异步通道的重要方法
```rust
fn Sender::send(&self, t: T)->Result<(), SendError<T>>
fn Receiver::recv(&self)->Result<T, RecvError>
```

示例
```rust
use std::{sync::mpsc, thread};

fn main() {
    let (sender, receiver) = mpsc::channel();

    thread::spawn(move || {
        sender.send("hello");
    });

    let data = receiver.recv().unwrap();
    
    println!("{}",data);
}
```
该示例中，mpsc::channel函数返回一个包含Sender和Receiver的元组，代表通道的两端。在另一个线程中调用send方法向通道发送"hello"信息，在主线程中调用recv方法从通道中接收数据。recv方法会一直阻塞到有数据插入通道。

```rust
use std::{sync::mpsc, thread};

fn main() {
    let (sender, receiver) = mpsc::channel();
    let sender1 = sender.clone();
    let sender2 = sender.clone();

    thread::spawn(move ||{
        for i in 0..5 {
            sender.send(i);
        }
    });
    thread::spawn(move ||{
        for i in 10..15 {
            sender1.send(i);
        }
    });

    thread::spawn(move ||{
        for i in 20..25 {
            sender2.send(i);
        }
    });

    let handle = thread::spawn(move || {
        while let Ok(data) = receiver.recv() {
            println!("data: {}",data);     
        }
    });

    handle.join();
}
```

如果通道的任何一端断开连接，该通道将变得无法使用。这种情况发生在通道的Sender或Receiver被丢弃时，你将无法向该通道继续插入数据，但你仍然可以从通道中读取剩余的数据。
```rust
use std::{sync::mpsc, thread, time::Duration};

fn main() {
    let (sender, receiver) = mpsc::channel();

    thread::spawn(move||{
        sender.send(1);
    });

    let data = receiver.recv();
    println!("{:?}",data);

    thread::sleep(Duration::from_secs(3));
    let data = receiver.recv();
    println!("{}",data.unwrap());
}
```
我们创建了一个异步通道，在向通道发送一个整数后，Sender端很快就被丢弃了，此时整个通道立即失效。你可以接收之前插入的那个整数(1),但当再次尝试从通道中接收数据就会引发panic,因为通道此时已经失效且为空。

## 同步通道
与异步通道不同的是，同步通道的大小是有界限的。在某些场景下，受限的通道大小反而更有益处，例如在实现消息队列时，我们可能希望限制队列中的消息数量以提高效率，这时同步通道更合适。
使用mpsc::sync_channel函数创建同步通道:
```rust
fn sync_channel<T>(bound: usize)->(SyncSender<T>, Receiver<T>)
```
* bound参数用于设置通道的最大容量，通道中的项目数量不能超过这个限制。
* 返回值是一个元组，包含同步通道的发送者(SyncSender)和接收者(Receiver)。
* 使用SyncSender::send函数向通道发送数据。如果同步通道已满，则send函数会阻塞到另一个线程接收数据，给通道腾出空间。
* 与异步通道的Recevier相同，使用Receiver::recv方法从通道接收数据，通道为空时会阻塞。
```rust
fn send(&self, t: T)->Result<(), SenderError<T>>
```

示例
```rust
use std::{sync::mpsc, thread};

fn main() {
    let (sender, receiver) = mpsc::sync_channel(1);
    let handle = thread::spawn(move ||{
        sender.send(1);
        println!("Sent 1");
        sender.send(2);
        println!("Sent 2");
    });

    let data = receiver.recv().unwrap();
    println!("data:{}",data);
    handle.join();
}
```
由于容量的限制(1)，只有第一个数据发送成功，直到使用recv取出一个数据项，这就为第二个数据项插入留下了空间。虽然第二个数据项被发送到通道，但是它从未被接收和消费。对于某些应用程序，可能会发生问题。

## rendezvous通道
rendezvous通道提供了数据可靠传输的保证，从而解决了上述问题--如何确定通道中的数据何时被成功接收。rendezvous通道实际上是一个容量为0的同步通道。对于这种通道，SyncSender::send函数是阻塞的，只有当发送的数据被接收者取走后，该函数才会解除阻塞，可以把它视为一种可靠传输的通信机制。

示例
```rust
use std::{sync::mpsc, thread, time::Duration};

fn main() {
    let (sender, receiver) = mpsc::sync_channel(0);
    let handle = thread::spawn(move || {
        sender.send(1);
        println!("数据已接收");
    });

    thread::sleep(Duration::from_secs(10));

    let data = receiver.recv().unwrap();
    println!("{}", data);
    handle.join();
}
```

## try方法
试图向一个已经满了的通道继续发送数据时，发送者会被阻塞，既然这样，优势可能更倾向于先收到一个通知而不是直接阻塞，这就需要用到try_send方法。如果通道已满，则该方法返回TrySendError作为通知。以下是方法的定义
```rust
fn try_send(&self, t: T)->Result<(), TrySendError<T>>
```
示例
```rust
use std::sync::mpsc;

fn main() {
    let (sender, receiver) = mpsc::sync_channel(2);

    sender.send(1);
    sender.send(2);

    let err = sender.try_send(3).unwrap_err();

    println!("{}",err);
}
```
接收者同样会被阻塞!当通道为空时调用revc方法时会进入阻塞状态，直到有发送者向通道插入数据，一旦有数据项，接收者就会解除阻塞状态并直接从通道取走那个数据项。try_revc提供了一种非阻塞的替代方案，当通道为空时try会返回一个Err结果，这样接收者线程将不会被阻塞而顺利执行。方法定义如下:
```rust
fn try_recv(&self)->Result<T, TryRecvError>
```
try_recv方法的一个有效使用场景是执行空闲任务，线程原本是会被阻塞的，有了try_recv，就可以利用这段时间执行其他工作:
* 分阶段完成工作。资源清理就是一个很好的例子。通常资源清理工作较为耗时，一般需要在应用程序结束时执行。但我们利用空闲时间提前做部分清理工作可以减轻程序结束时的工作量。
* 非常适合处理低优先级或可选的任务。这些任务可以在没有其他更重要的事情需要处理时执行，例如执行用户界面处理程序。

```rust
use std::{sync::mpsc, thread::Builder};

fn main() {
    let (sender, receiver) = mpsc::sync_channel(10);

    let builder = Builder::new().name("发送者".to_string()).stack_size(4096);
    let result = builder.spawn(move || {
        let messages = [
            "message 1".to_string(),
            "message 2".to_string(),
            "message 3".to_string(),
        ];
        for message in messages {
            sender.send(message);
        }
    });

    let builder = Builder::new().name("接收者".to_string()).stack_size(4096);
    let result = builder.spawn(move || {
        loop {
            match receiver.try_recv() {
            Ok(msg) => {
                if msg.len()==0 {
                    break 0;
                }
                println!("{}", msg);
                
            },
            Err(_) => idle_work(),
        }
        }
    });

    let handle = result.unwrap();
    handle.join();
}

fn idle_work() {
    println!("idle_work");
}
```
recv_timeout函数是recv的另一个变体。recv_timeout函数会在管道为空时阻塞，但是当超过指定时间时，rev_timeout函数会被唤醒并返回RecvTimeoutError作为Err结果，以下是该函数定义
```rust
fn recv_timeout(&self, timeout: Duration)->Result<T, RecvTimeoutError>
```

示例
```rust
use std::{sync::mpsc, thread, time::Duration};

fn main() {
    let (sender, receiver) = mpsc::sync_channel(10);

    thread::spawn(move ||{
        thread::sleep(Duration::from_millis(200));
        sender.send(1);
    });
    let data = receiver.recv_timeout(Duration::from_millis(100));
    match data {
        Ok(value) => println!("接收到数据: {}", value),
        Err(_) => println!("Time out没有接收到数据"),
    }
}
```
也可以用迭代器的方式从一个通道接收数据项。迭代器可以扩大通道的用例，使其更具有扩展性。使用iter方法可以获取迭代器，然后可以使用next方法来访问通道的数据项。
```rust
use std::sync::mpsc;

fn main() {
    let (sender, receiver) = mpsc::sync_channel(10);

    sender.send(1);
    sender.send(2);
    sender.send(3);

    let mut iter = receiver.iter();
    println!("{}",iter.next().unwrap());
    println!("{}",iter.next().unwrap());
    println!("{}",iter.next().unwrap());
}
```

使用迭代器让通道更具有扩展性。你甚至可以使用for-in来迭代一个通道，这是因为Receiver实现了Iteraotr接口，当通道内没有数据项或通道变得无效时，for循环会停止迭代。
```rust
use std::{sync::mpsc, thread};

fn main() {
    let (sender, receiver) = mpsc::sync_channel(10);
    let sender1 = sender.clone();
    let handle = thread::spawn(move || {
        sender.send(1);
        sender.send(2);
    }); //发送者被丢弃
    for item in receiver {
        println!("{}", item);
    }
}
```


## 商店示例
```rust
use std::{
    sync::mpsc::{self, Receiver, Sender, SyncSender, channel},
    thread,
    time::Duration,
};

/// 使用channel函数创建一个异步通道来通知商店即将关闭
/// 当一个消息被发送到该通道时，商店应该被关闭，因此接收者被命名为(closing)
/// store_open函数负责管理商店的开启，closing通道作为其唯一参数，在函数内创建一个独立的线程来处理闭店操作。
/// 开店的准备工作(关闭报警系统和打开收银机)可以并行执行，因为这些任务被作为单独的线程启动，并使用join方法等待准备工作完成，
/// 准备工作完成后，商店就可以开门了! 之后的循环代表处理顾客事件的过程。
/// 在循环内通过使用match表达式调用closing的try_recv方法来检查商店是否应该关闭，如果closing通道接受到数据，那就是要关闭商店,进入Ok分支执行关闭操作，否则进入默认分钟继续接待顾客
fn main() {
    let (sender, closing) = channel::<()>();

    store_open(closing);

    thread::sleep(Duration::from_secs(2));

    store_closing(sender);
}

fn store_open(closing: Receiver<()>) {
    thread::spawn(move || {
        //营业准备
        let alarms = thread::spawn(|| {
            // TODO 关闭报警系统
            println!("关闭报警系统");
        });
        let registers = thread::spawn(|| {
            // TODO 打开收银机
            println!("打开收银机");
        });
        alarms.join();
        registers.join();

        //开始营业
        loop {
            match closing.try_recv() {
                Ok(msg) => {
                    break;
                }
                Err(_) => {
                    // TODO 处理用户事件
                    println!("正在营业");
                    thread::sleep(Duration::from_secs(2));
                }
            }
        }
    });
}

/// store_closing函数，接收一个Sender作为参数，第一步向closing通道发送一个值，这里选择空元组，通知store_open函数开始进行闭店操作(即停止接待客人)
/// .sleep函数给了store_open中的线程一个机会清理然后退出。
/// 创建单独的线程来重新启动报警器和关闭收银机。等它们完成，商店就关闭了
fn store_closing(sender: Sender<()>) {
    sender.send(());
    thread::sleep(Duration::from_secs(2));

    let alarms = thread::spawn(|| {
        // TODO 打开报警系统
        println!("打开报警系统");
    });
    let registers = thread::spawn(|| {
        // TODO 关闭收银机
        println!("关闭收银机");
    });

    alarms.join();
    registers.join();
    println!("闭店了");
}
```
