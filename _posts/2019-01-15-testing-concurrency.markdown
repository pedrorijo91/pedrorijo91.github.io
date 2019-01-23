---
layout: post

title: 'Testing concurrent programs'
date: 2019-01-17 19:00:00
description: "Concurrent programs are hard to create correctly, and test them effectively it's even harder. Let's go through the existing mechanisms to help us on this goal."

tags: [concurrency, multi-thread, testing]
---

<span class="dropcap">N</span>ot a long time ago, I was interviewing a candidate for a senior developer position at [Feedzai](https://feedzai.com/), and one of the interviewing subjects I like to approach is concurrency and parallelism. This is usually a weak spot for many developers, and it's a critical subject at Feedzai due to the nature of the product.

<p align='center'><img src='/assets/img/java-concurrency-in-practice.jpg' alt='Java Concurrency in Practice' title='Java Concurrency in Practice' width='300px'/></p>

Let me start by saying that if you are not familiar with concurrency on the JVM, I totally recommend the bible: [Java Concurrency in Practice](http://jcip.net/), by Brian Goetz. It's a must read with all the essentials!

I feel like most experienced developers I have crossed with have a good idea about the main concepts of multi-threading: thread pools, locks, race conditions, deadlocks, starvation, and so on. Some with higher confidence, some with a few flaws, as expected. But what I found very curious is general lack of knowledge on the simple existance of thread synchronization mechanisms, which allow to control multiple threads to some extent, instead of relying in luck.

<p align='center'><img src='/assets/img/confused.jpg' alt='Confused guy' title='Confused guy' width='400px'/></p>

With this in mind, I thought about writing a few lines along synchronizing threads, which may be particulary useful while testing multi-threaded code.

### The classic concurrent counter

As any other blog post on multi-threaded code, let's start by the classic example: our old friend, the counter, of course. So let's start by creating a (buggy) counter:

~~~java
public class Counter {

    private long current;

    public Counter() {
        this.current = 0L;
    }

    // we are missing a synchronization primitive here to prevent
    // race conditions - we should be using 'synchronized' keyword
    public void inc() {
        this.current += 1;
    }

    public long getCount() {
        return this.current;
    }
}
~~~

As you can see, there's one method that changes the internal state, the method `inc()`, which doesn't have a syncronization strategy to deal with concurrent invocations, which will lead to concurrency bugs.

Let's naively assume that our code is correct, and test it.

### Automated tests on multi-threaded code

Now we are soo proud of our counter implementation that we want to create a unit test to prove it can handle multi-threaded environments.

One of the most important aspects of testing multi-threaded code, is to reduce the flakyness, because you never control how are instructions from different threads being interchanged. Something that may help, are thread syncronization mechanisms. The JDK comes with a few under the [java.util.concurrent package](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/package-summary.html), but we will look at them later. For now let's start with a more naive test and see the problems.

How can we start testing our counter then? Well, we will need to have a counter instance (obviously) and multiple threads invoking the potentialy dangerous code - in this case, the `inc()` method, since it's the only that changes the internal state. Finally we should check everything is as supposed to at the end.

Since multiple threads are changing the state concurrently, it would be hard to make sure that each operation goes as intended - if we wanted to check that for thread A, before calling the `inc()` method the current value was `X`, and immediatly afterwards it was `X + 1` we would need to remove the concurrency, or to create some way to make that operation atomic - as such, let's just look at the final state for the sake of simplicity.

~~~java
@Test
public void testCounterLowConcurrency() throws InterruptedException {

  // the number of concurrent threads using the counter
  int nbrConcurrentThreads = 2;

  // let's use ExecutorService to manage the threads
  ExecutorService es = Executors.newFixedThreadPool(nbrConcurrentThreads);

  // the counter instance to be tested
  Counter c = new Counter();

  // let's create 10 concurrent threads
  int nbrOfThreads = 10;
  for(int i = 0; i < nbrOfThreads; i++) {
      es.submit(c::inc);
  }

  // waiting for all threads to finish
  es.shutdown();
  es.awaitTermination(30, TimeUnit.SECONDS);

  // if the initial counter value was 0, after
  // incrementing 10 times it should be 10 right?
  Assert.assertEquals(nbrOfThreads, c.getCount());
}
~~~

If we start by setting `nbrConcurrentThreads` to 1, which means only 1 thread will be using the counter, our test will pass - no big surprise here: the counter logic is pretty simple and is perfectly fine for a single threaded environment.

Now, if we set `nbrConcurrentThreads` to 2, the test could still pass some (most?) of the times: it all depends on how unlucky you are (and that's one of the most complicated problems of testing multi-threaded code: it is very flaky and bugs are hard to reproduce). If you are lucky, your test should capture the problem and output something like this:

~~~
java.lang.AssertionError:
Expected :10
Actual   :9
~~~

And why will it still pass sometimes? Because we have such a small number of threads trying to modify the counter (remember we only have 2 concurrent threads), it may happen that they don't try to modify it at the same time.

The probability of finding the problem during the testing phase decreases if you add more randomness into your thread - like accessing the database - other than modifying the counter state.

### Releasing all the threads!

So you may be thinking: "Why don't we add more threads, and increase the concurrency (increasing the value of `nbrConcurrentThreads`)?"

Surely that would make our tests more likely to fail. Probably so likely that it would fail everytime you ran them. Just try it:

- increase `nbrConcurrentThreads` to 8 for instance,
- and increase the number of created threads on the loop to 10.000;

~~~java
@Test
public void testCounterHighConcurrency() throws InterruptedException {
    int nbrConcurrentThreads = 8;

    ExecutorService es = Executors.newFixedThreadPool(nbrConcurrentThreads);

    Counter c = new Counter();

    int nbrOfThreads = 10_000;
    for(int i = 0; i < nbrOfThreads; i++) {
        es.submit(c::inc);
    }

    es.shutdown();
    es.awaitTermination(60, TimeUnit.SECONDS);

    Assert.assertEquals(nbrOfThreads, c.getCount());
}
~~~

You will now hardly see the test passing. But the flakyness will always be there, even if hidden or in a very small factor.

### Using the right tools for the job

But there are more complicated multi-threaded environments. For instance, imagine that our counter now allows other threads to subscribe to changes, so that they are notified upon the counter increment. How do we make sure the subscriber was called?

One possibility is having some global variable that the subscriber updates. But now, how long should we wait? Maybe we should wait 1 second? Maybe 30 seconds? Or 1 minute? Will we be waiting more time than needed most of the times? Surely. Then why not pooling the global variable value? It should work yes, but the code gets a bit more messy than it should.


// TODO
And what can we use to help us dealing with multi-threaded environments and to test our code under these conditions?

It is often very useful to know how to synchronize a bunch of threads. There are a few classes on the [java.util.concurrent package](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/package-summary.html) that can help us a lot here:

- [Semaphore](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/Semaphore.html)
- [CyclicBarrier](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CyclicBarrier.html)
- [CountDownLatch](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CountDownLatch.html)
- Phaser

#### Semaphore

This is probably the most known entity of the ones listed above. A semaphore is very similar to a lock, but it has a specified capacity, that can be bigger than the capacity of a lock, which is 1. A semaphore can be used to limit the access to some resource (as our `counter` intance being tested). This way we can ensure no more than X threads are acessing the resource.

The semaphore is not directly usable for our test case, but let's see how it can be used on common situations.

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

The CyclicBarrier is probably the easiest concept to understand: you basically have an entity (barrier) that will make threads wait until a certain number of threads arrives at the same point.

While not 100% bullet proof to ensure threads are concurrently (and interchangeably) doing possible dangerous actions, at least you know that all threads were released at same time, on that specific point.

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

The CountDownLatch is a very powerful and versatile syncronization mechanism. It can simulate a lock, it can simulate a semaphore, it can simulate a CyclicBarrier, and much more. Basically, a CountDownLatch is initialized with a given count/capacity. Threads can now do one of 2 things:

- signal they have passed that point, by calling the `countDown()` method, which will decrease the count of the CountDownLatch;
- wait that other threads, by calling the `await()` method, which will block the thread until the CountDownLatch reachs 0.

#### Phaser

### Conclusion


http://jcip.net/
https://pragprog.com/book/pb7con/seven-concurrency-models-in-seven-weeks
https://www.youtube.com/watch?v=cN_DpYBzKso
github repo
