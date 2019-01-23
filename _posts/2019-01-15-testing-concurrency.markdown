---
layout: post

title: 'Testing concurrent programs'
date: 2019-01-17 19:00:00
description: "Concurrent programs are hard to create correctly, and test them effectively it's even harder. Let's go through the existing mechanisms to help us on this goal."

tags: [concurrency, multi-thread, testing]
---

<span class="dropcap">N</span>ot a long time ago, I was interviewing a candidate for a senior developer position at [Feedzai](https://feedzai.com/), and one of the interviewing subjects I like to approach is concurrency and parallelism. This is usually a weak spot for many developers, and it's a critical subject at Feedzai due to the nature of the product.

Let me start by saying that if you are not familiar with concurrency on the JVM, I totally recommend the bible: [Java Concurrency in Practice](http://jcip.net/), by Brian Goetz. It's a must read with all the essentials!

<p align='center'><img src='/assets/img/java-concurrency-in-practice.jpg' alt='Java Concurrency in Practice' title='Java Concurrency in Practice' width='300px'/></p>

I feel like most experienced developers I have crossed with, have a good idea about the main concepts of multi-threading: thread pools, locks, race conditions, deadlocks, starvation, and so on. Some with higher confidence, some with a few flaws, as expected. But what I found very curious is the general lack of knowledge on the simple existance of thread synchronization mechanisms, which allow to control multiple threads to some extent, instead of relying in luck.

With this in mind, I thought about writing a few lines along synchronizing threads, which may be particulary useful if you need to test multi-threaded code.

### Synchronizing threads

It is often very useful to know how to synchronize a collection of threads. There are a few classes on the [java.util.concurrent package](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/package-summary.html) that can help us a lot here:

- [Semaphore](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/Semaphore.html)
- [CyclicBarrier](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CyclicBarrier.html)
- [CountDownLatch](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CountDownLatch.html)
- Phaser

#### Semaphore

This is probably the most known entity of the ones listed above. A semaphore is very similar to a lock, but it has a custom capacity, that can be bigger than the capacity of a lock, which is 1. A semaphore can be used to limit the access to some resource (database connection pool for instance). This way we can ensure no more than a certain amount of threads are acessing the resource at the same time.

The following snippet of code creates several threads to be executed concurrently. If we had no semaphore, we would have the number of concurrent threads working limited by the thread pool capacity of the ExecutorService:

~~~java
@Test
public void semaphoreExample() throws InterruptedException {
  // Executor service allows up to 4 concurrent threads
  ExecutorService es = Executors.newFixedThreadPool(4);

  // semaphore only allows 2 accesses/threads simultaneously
  Semaphore semaphore = new Semaphore(2);

  // we create 8 threads
  for(int i = 0; i < 8; i++) {
    final int threadIdx = i;
    es.submit(() -> {
      try {
        // we ask access to the semaphore.
        // If the semaphore is over max capacity (2), it will block the thread
        semaphore.acquire();

        // each thread spends some time 'inside' the semaphore doing some work
        for(int j = 0; j < 3; j++) {
          Thread.sleep(500);
          System.out.println(String.format(
            "Running thread %s on iteration %s",
            threadIdx, j
          ));
        }

        // each thread signals it no longer needs the semaphore access
        // by releasing it
        semaphore.release();
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
    });
  }

  es.shutdown();
  es.awaitTermination(120, TimeUnit.SECONDS);
}
~~~

Since we have a semaphore with capacity 2, we see only 2 threads simultaneously working (not blocked/waiting on the semaphore):

- thread 0 and thread 1
- thread 3 and thread 2
- thread 4 and thread 6
- thread 7 and thread 5

~~~
Running thread 0 on iteration 0
Running thread 1 on iteration 0
Running thread 1 on iteration 1
Running thread 0 on iteration 1
Running thread 0 on iteration 2
Running thread 1 on iteration 2
Running thread 3 on iteration 0
Running thread 2 on iteration 0
Running thread 2 on iteration 1
Running thread 3 on iteration 1
Running thread 2 on iteration 2
Running thread 3 on iteration 2
Running thread 4 on iteration 0
Running thread 6 on iteration 0
Running thread 6 on iteration 1
Running thread 4 on iteration 1
Running thread 6 on iteration 2
Running thread 4 on iteration 2
Running thread 7 on iteration 0
Running thread 5 on iteration 0
Running thread 5 on iteration 1
Running thread 7 on iteration 1
Running thread 7 on iteration 2
Running thread 5 on iteration 2
~~~

If no semaphore was being used, we would see 4 threads at each time, since it would be the ExecutorService limiting the concurrency. Just test it by yourself.

#### CyclicBarrier

The CyclicBarrier is probably the easiest concept to understand: you basically have a barrier that will make threads wait until some condition, which in the case of the `CyclicBarrier` is a certain number of threads arrived at the barrier.

Let's see how it can be used:

~~~java
@Test
public void barrierExample() throws InterruptedException {
  // Executor service allows up to 4 concurrent threads
  ExecutorService es = Executors.newFixedThreadPool(4);

  // we create a barrier to wait for 4 threads
  // barrier also prints message when it 'opens'
  CyclicBarrier barrier =
              new CyclicBarrier(4, () -> System.out.println("barrier open!"));

  // we create 20 threads
  for(int i = 0; i < 20; i++) {
    final int threadIdx = i;
    es.submit(() -> {
      try {
        System.out.println(String.format(
          "Thread %s waiting on other threads",
          threadIdx
        ));

        barrier.await();

        System.out.println(String.format(
          "Thread %s unblocked from barrier",
          threadIdx
        ));
      } catch (InterruptedException | BrokenBarrierException e) {
        e.printStackTrace();
      }
    });
  }

  // waiting for all threads to finish
  es.shutdown();
  es.awaitTermination(30, TimeUnit.SECONDS);
}
~~~

CyclicBarrier is specially usefull when you are running a pipeline in phases. You can't start phase 2 before finishing phase 1, and maybe you can run several parts of phase 1 in paralell. By using the CyclicBarrier you can synchronize the phase 1 threads with the starting of the phase 2, to make sure everything is perfectly aligned. Just remember to account for possible errors.

#### CountDownLatch

The CountDownLatch is a very powerful and versatile syncronization mechanism. Basically, a CountDownLatch allows threads to wait for an event to occur. The latch is initialized with a given count/capacity. Threads can now do one of 2 things:

- signal they have passed that point, by calling the `countDown()` method, which will decrease the count of the CountDownLatch;
- wait, by calling the `await()` method, which will block the thread until the CountDownLatch reachs 0.

#### Phaser

### Conclusion


http://jcip.net/
https://pragprog.com/book/pb7con/seven-concurrency-models-in-seven-weeks
https://www.youtube.com/watch?v=cN_DpYBzKso
github repo
