---
layout: post

title:  'Are Scala Streams really lazy?'
date:   2018-07-01 21:30:00
description: 'Are Scala Streams really lazy?'
image:  scala-logo.png
image_alt: 'Scala language logo'

tags: [scala, streams]
---

<span class="dropcap">I</span>f you have been using Scala, or even Java 8, you have probably seen the concept of a `Stream`.

A `Stream` is a lazy collection. This means a `Stream` can been seen as a list where each element is computed/evaluated as needed. Several other properties make `Streams` different from lists, sets and other common collections. You can see those differences in detailed both on [Java Stream docs](https://docs.oracle.com/javase/8/docs/api/java/util/stream/package-summary.html#package.description) and [Scala Stream docs](https://www.scala-lang.org/api/2.12.3/scala/collection/immutable/Stream.html).

### But are Scala Streams really lazy?

According to the [official scala documentation](https://www.scala-lang.org/api/2.12.3/scala/collection/immutable/Stream.html): `The class Stream implements lazy lists where elements are only evaluated when they are needed.`.

But is it really true?

While working on a side project I  came across an unexpected exception due to eager evaluation of a stream. And so I started to dig a bit more and found out this can be easily reproduced:

~~~scala
scala> Stream(1/0)
java.lang.ArithmeticException: / by zero
  ... 28 elided
~~~

But this could be just because the argument is being passed by value and not by name. And it's a valid point. But look at this more complex expression:

~~~scala
scala> Stream.continually(1).partition(_ % 2 == 0)
java.lang.OutOfMemoryError: GC overhead limit exceeded
  at scala.collection.immutable.Stream$$$Lambda$1035/560897187.get$Lambda(Unknown Source)
  at java.lang.invoke.LambdaForm$DMH/589431969.invokeStatic_L_L(LambdaForm$DMH)
  at java.lang.invoke.LambdaForm$MH/1747585824.linkToTargetMethod(LambdaForm$MH)
  at scala.collection.immutable.Stream$.$anonfun$continually$1(Stream.scala:1236)
  at scala.collection.immutable.Stream$$$Lambda$1035/560897187.apply(Unknown Source)
  at scala.collection.immutable.Stream$Cons.tail(Stream.scala:1169)
  at scala.collection.immutable.Stream$Cons.tail(Stream.scala:1159)
  at scala.collection.immutable.Stream.filterImpl(Stream.scala:503)
  at scala.collection.immutable.Stream.filterImpl(Stream.scala:201)
  at scala.collection.TraversableLike.filter(TraversableLike.scala:259)
  at scala.collection.TraversableLike.filter$(TraversableLike.scala:259)
  at scala.collection.AbstractTraversable.filter(Traversable.scala:104)
  at scala.collection.immutable.Stream.partition(Stream.scala:586)
  ... 19 elided
~~~

This `OutOfMemoryError` indicates that there is something happening (i.e., being computed), while the `Stream` should be lazy.

### The evil Cons

So what's going on here? Are streams lazy or not?

In fact they are. But Streams are built upon a structure called [Cons](https://www.scala-lang.org/api/current/scala/collection/immutable/Stream$$Cons.html), that is kinda of a pair:  `A lazy cons cell, from which streams are built.`

But `Cons` is a pair that's not lazy (it is eager) on the first element. This means that when you instantiate a `Cons`, you will evaluate the first element, even if the second it's not evaluated immediately. And Streams are a sequence of `Cons`. So when you create a `Stream`, you are defining a lazy list of `Cons`, where the first element (the Stream head) needs to be evaluated. And this is why we get these errors.

### Solution

But how hard can it be to solve this problem? Well, there are good news: Scala 2.13 (to be released somewhere in 2018) solves this problem, not on the `Stream` class, but by [providing a new lazy collection called LazyList](https://www.scala-lang.org/blog/2018/06/13/scala-213-collections.html#lazylist-is-preferred-over-stream) as part of the work on scala collections.

### Conclusion

While Streams are a natural structure for lazy collections one must have in mind the detail on the eagerness of `Cons` to avoid unexpected errors. If this is a no go for you, you should look for alternatives while Scala 2.13 is not released:

* [Cats streams](https://github.com/typelevel/cats/blob/master/core/src/main/scala/cats/instances/stream.scala)
* [Akka streams](https://doc.akka.io/docs/akka/current/stream/)
* [scalaz-stream](https://github.com/scalaz/scalaz-stream)
