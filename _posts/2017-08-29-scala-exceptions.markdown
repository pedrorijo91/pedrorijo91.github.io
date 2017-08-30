---
layout: post

title:  'Dealing with exceptions in Scala'
date:   2017-08-29 21:00:00
description: 'How to deal with exceptions in Scala. try/catch vs Try vs Catch'
image:  scala-logo.png
image_alt: 'Scala language logo'

tags: [scala, exceptions, try catch, scala.util.Try]
---

<span class="dropcap">J</span>ava exceptions are one of the [most controversial Java language features](https://stackoverflow.com/questions/613954/the-case-against-checked-exceptions). [Checked exceptions](http://www.javapractices.com/topic/TopicAction.do?Id=129) are one of the reasons why Java exceptions became so hated. Programmers just abuse them by always catching them and dismissing them which leads to problems being hidden and ignored that would otherwise be presented to the user <sup>[1](http://www.artima.com/intv/handcuffs.html)</sup>. In no time you will end up with code like this:

~~~java
private String myMethod() {
     try {
       methodThatThrowsIOException()
     } catch (IOException e) {
       //What to do?   
     }
   }
~~~

This will create code paths with errors ignored instead of properly propagate the error until the method which knows how to deal with the error.

<p align='center'><img src='/assets/img/java_logo.png' alt='Java logo' title='Java logo' width='150px'/></p>

So, there are [tons](https://blog.philipphauer.de/checked-exceptions-are-evil/) of [blog](https://testing.googleblog.com/2009/09/checked-exceptions-i-love-you-but-you.html) [posts](http://www.mindview.net/Etc/Discussions/CheckedExceptions) about the exception system in Java; what about Scala?

Scala has many differences from Java, but it also has exceptions (it doesn't have checked exceptions though), and it provides some mechanisms to deal with them. I want to approach 3 mechanisms (do you know any other technique?):

- (Java) try/catch
- scala.util.Try
- Catch objects (scala.util.control.Exception)

### try/catch

This technique is very similar to the [Java try/catch](https://docs.oracle.com/javase/tutorial/essential/exceptions/catch.html), but it uses Scala pattern matching on the catch clause.

~~~scala
try {
  methodThatMayThrowAnException()
} catch {
  case e: MyException => // do stuff
  case e: NonFatal => // do stuff
  case _: Throwable => // do stuff
} finally {
  anotherPieceOfCode() // useful to close a database connection for instance
}
~~~

And what's the problem with this approach? Well, you have to deal with the exception in this part of the code. Or you can do the same mistake than in Java, by throwing the exception to be catch by another method (please, avoid that).

### Try

The most common approach when you want to propagate an exception, is to encoding such possibility using the Scala type system. This means the return type will provide the information that an exception may be thrown. Scala offers the `scala.util.Try` type, which represents a computation that may either result in an exception (`scala.util.Failure`), or return a successfully computed value (`scala.util.Success`).

~~~scala
def myMethod(s: String): Try[Int] = {
  Try(s.toInt)
}

scala> myMethod("30")
res0: scala.util.Try[Int] = Success(30)

scala> myMethod("foo")
res1: scala.util.Try[Int] = Failure(java.lang.NumberFormatException: For input string: "foo")
~~~

The `scala.util.Try` class provides many convenient methods like the usual `.map`, `.flatMap`, `.fold`, `.getOrElse`, and [many others](http://www.scala-lang.org/api/2.12.x/scala/util/Try.html).

Note: only non-fatal exceptions are caught on Try.

### Catch objects

There's still another exception handling mechanism in Scala, which is encapsulated in the  [scala.util.control.Exception](http://www.scala-lang.org/api/2.12.0/scala/util/control/Exception$.html) class. Unfortunately it's barely known, and there are even fewer examples of its usage.

It's a neat mechanism which allows you to compose exception handlers where you can specify the behaviour upon exceptions found. You can for instance wrap the block passed into the handler in an Option or a Try.
You can test it easily since the class provides some default handlers. Just start by importing it into your scope:

~~~scala
scala> import scala.util.control.Exception._

// no exception, the execution should go just fine
scala> Exception.allCatch.opt(3)
res0: Option[Int] = Some(3)

// an exception will be thrown
scala> Exception.allCatch.opt(0/0)
res1: Option[Int] = None // result wrapped in an empty Option

// lets keep the exception using an Either instead of an Option
scala> Exception.allCatch.either(3)
res2: scala.util.Either[Throwable,Int] = Right(3)

// and when we find an exception a Left value is produced
scala> Exception.allCatch.either(0/0)
res3: scala.util.Either[Throwable,Int] =
  Left(java.lang.ArithmeticException: / by zero)

// a Try wrapper is also available
scala> Exception.allCatch.withTry(0/0)
res4: scala.util.Try[Int] = Failure(java.lang.ArithmeticException: / by zero)

// Exception.noCatch is another default handler that doesn't catch anything...
scala> Exception.noCatch.withTry(0/0)
java.lang.ArithmeticException: / by zero
  at .$anonfun$res6$1(<console>:13)
  at scala.runtime.java8.JFunction0$mcI$sp.apply(JFunction0$mcI$sp.java:12)
  at scala.util.control.Exception$Catch.$anonfun$withTry$1(Exception.scala:253)
  at scala.util.control.Exception$Catch.apply(Exception.scala:224)
  at scala.util.control.Exception$Catch.withTry(Exception.scala:253)
  ... 29 elided
~~~

and it's not hard to define custom handler:

~~~scala
scala> import scala.util.control.Exception

scala> val myCustomCatcher = Exception.catching(classOf[ArithmeticException], classOf[ClassCastException])

scala> myCustomCatcher.opt(0/0)
res0: Option[Int] = None

// it will not catch unexpected exceptions
scala> myCustomCatcher.opt("aa".toInt)
java.lang.NumberFormatException: For input string: "3a"
  at java.lang.NumberFormatException.forInputString(NumberFormatException.java:65)
  at java.lang.Integer.parseInt(Integer.java:580)
  at java.lang.Integer.parseInt(Integer.java:615)
  at scala.collection.immutable.StringLike.toInt(StringLike.scala:301)
  at scala.collection.immutable.StringLike.toInt$(StringLike.scala:301)
  at scala.collection.immutable.StringOps.toInt(StringOps.scala:29)
  at .$anonfun$res11$1(<console>:13)
  at scala.runtime.java8.JFunction0$mcI$sp.apply(JFunction0$mcI$sp.java:12)
  at scala.util.control.Exception$Catch.$anonfun$opt$1(Exception.scala:242)
  at scala.util.control.Exception$Catch.apply(Exception.scala:224)
  at scala.util.control.Exception$Catch.opt(Exception.scala:242)
  ... 29 elided
~~~

And there are many other possible usages of Catch objects. The two other cases I would like to cover are

* providing default values
* composing multiple Catchs

~~~scala
// no exception will be thrown
scala> scala.util.control.Exception.failAsValue(classOf[ArithmeticException])(-42)(0/1)
res0: Int = 0

// divide by 0 creates an exception. using default value -42
scala> scala.util.control.Exception.failAsValue(classOf[ArithmeticException])(-42)(0/0)
res1: Int = -42

scala> val formatDefaulting: Catch[Int] = failAsValue(classOf[NumberFormatException])(0)
scala> val nullDefaulting: Catch[Int] = failAsValue(classOf[NullPointerException])(-1)
scala> val otherDefaulting: Catch[Int] = nonFatalCatch withApply(_ => -100)

scala> val combinedDefaulting: Catch[Int] = formatDefaulting or nullDefaulting or otherDefaulting

scala> def p(s: String): Int = s.length * s.toInt

// NumberFormatException
scala> combinedDefaulting(p("tenty-nine"))
res0: Int = 0

// NullPointerException
combinedDefaulting(p(null: String))
res1: Int = -1

// nonFatal exception
combinedDefaulting(throw new IllegalStateException)
res2: Int = -100

// everything ok
combinedDefaulting(p("11"))
res3: Int = 22
~~~

#### But why use Catch class?

Probably you have never seen anyone using this technique. And why would anyone use it? Everyone uses `try/catch` or `scala.util.Try`. Well, I think this approach may have some advantages (unfortunately couldn't promote this exception handling mechanism to production code yet 😅):

* reusing exception handling logic. Each `Catch` object contains some exception handling logic. So basically you could just use the same block for handling exceptions all over your code (or at least reuse in some related parts of the code)
* Conversion to monads with the opt and either methods of the Catch class (one can argue the scala Try is also able to do it)

### Conclusion

If you are programming in Scala you probably already knew about the `try/catch` mechanism, and you may already chain your `scala.util.Try` instances in your code. But `scala.util.control.Exception` is an hidden feature, or at least unknown, for most Scala developers. While it won't probably be your next favorite toy, it can be handy.

I don't really remember how did I got to know `scala.util.control.Exception`, but I thought it could be interesting to explore, and share my findings. I hope you find it useful also :)

Let me know if you usually use any other technique for handling exceptions in your Scala code base!

### Useful resources

* [Exception Handling in Scala, by Ted Gao](http://ted-gao.blogspot.pt/2012/05/exception-handling-in-scala.html)
* [Scala’s Advance exception handling techniques, by  Piyush Mishra](https://piyushmishra889.wordpress.com/2014/12/15/scalas-advance-exception-handling-techniques/)
* [scala.util.control.Exception scaladocs](http://www.scala-lang.org/api/2.12.0/scala/util/control/Exception$.html)
