---
layout: post

title:  'Scala interview questions'
date:   2017-03-14 21:00:00
description: 'Some basic, or not so basic, questions about Scala. Interview level questions. Preparing your next Scala interview.'
image:  scala-logo.png
image_alt: 'Scala language logo'
redirect_from:
  - blog/scala-lang
  - blog/scala-lang/

tags: [scala, interview, programming languages]
---

<span class="dropcap">O</span>n the other day I saw a post asking for usual questions on Scala related job interviews. Among some answers I saw a reference to a [GitHub repository](https://github.com/Jarlakxen/Scala-Interview-Questions#language-questions) with several questions, not only Scala specific, but also about functional programming, and even more generic questions.

And while one can argue about the effectiveness of those questions to filter job applicants, I found those questions an interesting exercise.

Here's the list of questions I decided to answer to exercise myself, mostly from that repository:

1. [What is the difference between a `var`, a `val` and `def`?](#1-what-is-the-difference-between-a-var-a-val-and-def)
2. [What is the difference between a `trait` and an `abstract class`?](#2-what-is-the-difference-between-a-trait-and-an-abstract-class)
3. [What is the difference between an `object` and a `class`?](#3-what-is-the-difference-between-an-object-and-a-class)
4. [What is a `case class`?](#4-what-is-a-case-class)
5. [What is the difference between a Java future and a Scala future?](#5-what-is-the-difference-between-a-java-future-and-a-scala-future)
6. [What is the difference between `unapply` and `apply`, when would you use them?](#6-what-is-the-difference-between-unapply-and-apply-when-would-you-use-them)
7. [What is a companion object?](#7-what-is-a-companion-object)
8. [What is the difference between the following terms and types in Scala: `Nil`, `Null`, `None`, `Nothing`?](#8-what-is-the-difference-between-the-following-terms-and-types-in-scala-nil-null-none-nothing)
9. [What is `Unit`?](#9-what-is-unit)
10. [What is the difference between a `call-by-value` and `call-by-name` parameter?](#10-what-is-the-difference-between-a-call-by-value-and-call-by-name-parameter)
11. [Define uses for the `Option` monad and good practices it provides.](#11-define-uses-for-the-option-monad-and-good-practices-it-provides)
12. [How does `yield` work?](#12-how-does-yield-work)
13. [Explain the implicit parameter precedence.](#13-explain-the-implicit-parameter-precedence)
14. [What operations is a `for comprehension` syntactic sugar for?](#14-what-operations-is-a-for-comprehension-syntactic-sugar-for)
15. [Streams:](#15-streams-what-consideration-you-need-to-have-when-you-use-scalas-streams-what-technique-does-the-scalas-streams-use-internally)
	* What consideration you need to have when you use Scala's `Streams`?
	* What technique does the Scala's `Streams` use internally?
16. [What is a `value class`?](#16-what-is-a-value-class)
17. [Option vs Try vs Either](#17-option-vs-try-vs-either)
18. [What is function currying?](#18-what-is-function-currying)
19. [What is Tail recursion?](#19-what-is-tail-recursion)
20. [What are High Order Functions?](#20-what-are-high-order-functions)

### Answers

Before you decide to read my answers (which may even not be right - but I do hope they are :sweat_smile:), try to answer them yourself.

#### 1. What is the difference between a `var`, a `val` and `def`?

A `var` is a variable. It's a mutable reference to a value. Since it's mutable, its value may change through the program lifetime. Keep in mind that the variable type cannot change in Scala. You may say that a `var` behaves similarly to Java variables.

A `val` is a value. It's an immutable reference, meaning that its value never changes. Once assigned it will always keep the same value. It's similar to constants in another languages.

A `def` creates a method (and [a method is different from a function](https://tpolecat.github.io/2014/06/09/methods-functions.html) - thanks to AP for his comment). It is evaluated on call.

~~~scala
var x = 3 // x is of type Int. If you force it to be of type Any then this example would work
x = 4 // accepted by the language/compiler
x = "error" // not accepted by the compiler

val y = 3
y = 4 // would produce an error 'error: reassignment to val'

def fun(name: String) = "Hey! My name is: " + name
fun("Scala") // "Hey! My name is: Scala"
fun("Java") //  "Hey! My name is: Java"
~~~

**Bonus:** what's a `lazy val`? It's almost like a `val`, but its value is only computed when needed. It's specially useful to avoid heavy computations (using [short-circuit](https://en.wikipedia.org/wiki/Short-circuit_evaluation) for instance).

~~~scala
lazy val x = {
  println("computing x")
  3
}

val y = {
  println("computing y")
  10
}

y + y // x was still not computed, "computing x" was not yet printed
x + x // x is required, x is going to be computed, a "computing x" message will be printed *once*
~~~

#### 2. What is the difference between a `trait` and an `abstract class`?

The first difference is that a `class` can only extend one other `class`, but an unlimited number of `traits`.

While `traits` only support `type parameters`, `abstract classes` can have `constructor parameters`.

Also, `abstract classes` are interoperable with Java, while `traits` are only interoperable with Java if they do not contain any implementation.

#### 3. What is the difference between an `object` and a `class`?

An `object` is a singleton instance of a `class`. It does not need to be instantiated by the developer.

If an `object` has the same name that a `class`, the `object` is called a `companion object` (check [Q7 for more details](#what-is-a-companion-object)).

~~~scala
class MyClass(number: Int, text: String) {
  def classMethod() = ???
}

object MyObject {
  def objectMethod() = ???
}

new MyClass(3, "text").classMethod()
MyClass.classMethod() // won't compile
MyObject.objectMethod() // you don't need to create an instance to call the method
~~~

#### 4. What is a `case class`?

A `case class` is syntactic sugar for a class that is immutable and decomposable through pattern matching (because they have an `apply` and `unapply` methods). Being decomposable means it is possible to extract its constructors parameters in the pattern matching.

Case classes contain a companion object which holds the `apply` method. This fact makes possible to instantiate a case class without the `new` keyword. They also come with some helper methods like the `.copy` method, that eases the creation of a slightly changed copy from the original.

Finally, case classes are compared by structural equality instead of being compared by reference, i.e., they come with a method which compares two case classes by their values/fields, instead of comparing just the references.

Case classes are specially useful to be used as DTOs.

~~~scala
case class MyCaseClass(number: Int, text: String, others: List[Int])

val dto = MyCaseClass(3, "text", List.empty)
dto.copy(number = 5) // will produce an instance equal to the original, with number = 5 instead of 3

val dto2 = MyCaseClass(3, "text", List.empty)

dto == dto2 // will return true even if different references

class MyClass(number: Int, text: String, others: List[Int]) {}

val c1 = new MyClass(1, "txt", List.empty)
val c2 = new MyClass(1, "txt", List.empty)

c1 == c2 // will return false because they are different references
~~~

#### 5. What is the difference between a Java future and a Scala future?

This one I had to google a little about it. I have never used Java futures, so it was impossible for me to answer.

Obviously, I was not the first to search for the differences between both futures. I found a  [really clean and simple answer on StackOverflow](http://stackoverflow.com/a/31368177/4398050) which highlights the fact that the Scala implementation is in fact asynchronous without blocking, while in Java you can't get the future value without blocking.

Scala provides an API to manipulate the future as a monad or by attaching callbacks for completion. Unless you decide to use the [`Await`](http://docs.scala-lang.org/overviews/core/futures.html#blocking-outside-the-future), you won't block your program using Scala futures.

#### 6. What is the difference between `unapply` and `apply`, when would you use them?

`unapply` is a method that needs to be implemented by an object in order for it to be an [extractor](http://docs.scala-lang.org/tutorials/tour/extractor-objects.html). Extractors are used in pattern matching to access an object constructor parameters. It's the opposite of a constructor.

The `apply` method is a special method that allows you to write `someObject(params)` instead of `someObject.apply(params)`. This usage is common in `case classes`, which contain a companion object with the `apply` method that allows the nice syntax to instantiate a new object without the `new` keyword.

#### 7. What is a companion object?

If an `object` has the same name that a `class`, the object is called a `companion object`. A companion object has access to methods of private visibility of the class, and the class also has access to private methods of the object. Doing the comparison with Java, companion objects hold the "static methods" of a class.

Note that the companion object has to be defined in the same source file that the class.

~~~scala
class MyClass(number: Int, text: String) {

  private val classSecret = 42

  def x = MyClass.objectSecret + "?" // MyClass.objectSecret is accessible because it's inside the class. External classes/objects can't access it
}

object MyClass { // it's a companion object because it has the same name
  private val objectSecret = "42"

  def y(arg: MyClass) = arg.classSecret -1 // arg.classSecret is accessible because it's inside the companion object
}

MyClass.objectSecret // won't compile
MyClass.classSecret // won't compile

new MyClass(-1, "random").objectSecret // won't compile
new MyClass(-1, "random").classSecret // won't compile
~~~

#### 8. What is the difference between the following terms and types in Scala: `Nil`, `Null`, `None`, `Nothing`?

The `None` is the empty representation of the `Option` monad ([see answer #11](#define-uses-for-the-option-monad-and-good-practices-it-provides)).

`Null` is a Scala trait, where `null` is its only instance. The `null` value comes from Java and it's an instance of any object, i.e., it is a subtype of all reference types, but not of value types.  It exists so that reference types can be assigned `null` and value types (like `Int` or `Long`) can’t.

`Nothing` is another Scala `trait`. It's a subtype of any other type, and it has no subtypes. It exists due to the complex type system Scala has. It has *zero* instances. It's the return type of a method that never returns normally, for instance, a method that always throws an exception. [The reason Scala has a bottom type is tied to its ability to express variance in type parameters.](http://james-iry.blogspot.pt/2009/08/getting-to-bottom-of-nothing-at-all.html).

Finally, `Nil` represents an empty List of anything of size zero. `Nil` is of type `List[Nothing]`.

All these types can create a sense of emptiness right? Here's a little help [understanding emptiness in Scala](http://www.nickknowlson.com/blog/2013/03/31/representing-empty-in-scala/).

<p align='center'><img src='/assets/img/scala_type_hierarchy.png' alt='Scala type hierarchy' title='Scala type hierarchy' width='700px'/></p>

#### 9. What is `Unit`?

`Unit` is a type which represents the absence of value, just like Java `void`. It is a subtype of `scala.AnyVal`. There is only one value of type Unit, represented by `()`, and it is not represented by any object in the underlying runtime system.

#### 10. What is the difference between a `call-by-value` and `call-by-name` parameter?

The difference between a `call-by-value` and a `call-by-name` parameter, is that the former is computed before calling the function, and the later is evaluated when accessed.

Example: If we declare the following functions

~~~scala
def func(): Int = {
  println("computing stuff....")
  42 // return something
}

def callByValue(x: Int) = {
  println("1st x: " + x)
  println("2nd x: " + x)
}

def callByName(x: => Int) = {
  println("1st x: " + x)
  println("2nd x: " + x)
}
~~~

and now call them:

~~~scala
scala> callByValue(func())
computing stuff....
1st x: 42
2nd x: 42

scala> callByName(func())
computing stuff....
1st x: 42
computing stuff....
2nd x: 42
~~~

As it may be seen, the `call-by-name` example makes the computation **only when needed**, and **every time** it is called, while the `call-by-value` **only computes once**, but it **computes before invoking** the function (`callByName`).

#### 11. Define uses for the `Option` monad and good practices it provides.

The `Option` monad is the Scala solution to the `null` problem from Java. While in Java the absence of a value is modeled through the `null` value, in Scala its usage is discouraged, in flavor of the `Option`.

Using `null` values one might try to call a method on a null instance, because the developer was not expecting that there could be no value, and get a `NullPointerException`. Using the `Option`, the developer always knows in which cases it may have to deal with the absence of value.

~~~scala
val person: Person = getPersonByIdOnDatabaseUnsafe(id = 4) // returns null if no person for provided id
println(s"This person age is ${person.age}") // if null it will throw an exception

val personOpt: Option[Person] = getPersonByIdOnDatabaseSafe(id = 4) // returns an empty Option if no person for provided id

personOpt match {
  case Some(p) => println(s"This person age is ${p.age}")
  case None => println("There is no person with that id")
}
~~~

#### 12. How does `yield` work?

`yield` generates a value to be kept in each iteration of a loop. `yield` is used in for comprehensions as to provide a syntactic alternative to the combined usage of `map`/`flatMap` and `filter` operations on monads ([see answer #14](#what-operations-is-a-for-comprehension-syntactic-sugar-for)).

~~~scala
scala> for (i <- 1 to 5) yield i * 2
res0: scala.collection.immutable.IndexedSeq[Int] = Vector(2, 4, 6, 8, 10)
~~~

#### 13. Explain the implicit parameter precedence.

Implicit parameters can lead to unexpected behavior if one is not aware of the precedence when looking up.

So, what's the order the compiler will look up for implicits?

1. implicits declared locally
2. imported implicits
3. outer scope (implicits declared in the class are considered outer scope in a class method for instance)
4. inheritance
5. package object
6. implicit scope like companion objects

A nice [set of examples can be found here](http://eed3si9n.com/implicit-parameter-precedence-again).

#### 14. What operations is a `for comprehension` syntactic sugar for?

A `for comprehension` is a alternative syntax for the composition of several operations on monads.

A `for comprehension` can be replaced by `foreach` operations (if no `yield` keyword is being used), or by `map`/`flatMap` and `filter` (actually, while confirming my words I [found out about the `withFilter` method](http://docs.scala-lang.org/tutorials/FAQ/yield.html#translating-for-comprehensions)).

~~~scala
for {
  x <- c1
  y <- c2
  z <- c3 if z > 0
} yield {...}
~~~

is translated into

~~~scala
c1.flatMap(x => c2.flatMap(y => c3.withFilter(z => z > 0).map(z => {...})))
~~~

[More examples by Loïc Descotte](https://gist.github.com/loicdescotte/4044169).

#### 15. Streams: What consideration you need to have when you use Scala's `Streams`? What technique does the Scala's `Streams` use internally?

While Scala `Streams` can be really useful due to its lazy nature, it may also come with some unexpected problems.

The biggest problem is that Scala `Streams` can be infinite, but your memory isn't. If used wrongly, streams can lead to memory consumption problems. One must be cautious when saving references to a `stream`. One common guideline, is not to assign a stream (head) to a `val`, but instead, make it a `def`.

This is a consequence of the technique behind `streams`: [memoization](https://en.wikipedia.org/wiki/Memoization)

#### 16. What is a `value class`?

Have you ever had one of those nasty bugs where you were using an `integer` thinking it would represent something but it actually represented a totally different thing ? For instance, an `integer` representing an age, and another representing an height getting mixed (180 years old and 25 centimetres tall do look weird no?).

Because of that, it's considered a good practice to wrap primitive types into more meaningful types.

[Value classes](http://docs.scala-lang.org/overviews/core/value-classes.html) allow a developer to increase the program type safety without incurring into penalties from allocating runtime objects.

There are some [constraints](http://docs.scala-lang.org/overviews/core/value-classes.html#when-allocation-is-necessary) and [limitations](http://docs.scala-lang.org/overviews/core/value-classes.html#limitations), but the basic idea is that at compile time the object allocation is removed, by replacing the value classes instance by primitive types. [More details can be found on its SIP](http://docs.scala-lang.org/sips/completed/value-classes.html#expansion-of-value-classes).

#### 17. Option vs Try vs Either

All of these 3 monads allow us to represent a computation that did not executed as expected.

An `Option`, as explained on [answer #11](#define-uses-for-the-option-monad-and-good-practices-it-provides), represents the absence of value. It can be used when searching for something. For instance, database accesses often return `Option` in lookup queries.

`Try` is the monad approach to the Java `try/catch` block. It wraps runtime exceptions.

If you need to provide a little more info about the reason the computation has failed, `Either` may be very useful. With `Either` you specify two possible return types: the expected/correct/successful and the error case which can be as simple as a `String` message to be displayed to the user, or a full [ADT](https://en.wikipedia.org/wiki/Algebraic_data_type).   

~~~scala
def personAge(id: Int): Either[String, Int] = {
  val personOpt: Option[Person] = DB.getPersonById(id)

  personOpt match {
    case None => Left(s"Could not get person with id: $id")
    case Some(person) => Right(person.age)
  }
}
~~~

#### 18. What is function currying?

Currying is a technique of making a function that takes multiple arguments into a series of functions that take a part of the arguments.

~~~scala
def add(a: Int)(b: Int) = a + b

val add2 = add(2)(_)

scala> add2(3)
res0: Int = 5
~~~

Currying is useful in many different contexts, but most often when you have to deal with `Higher order functions`.

#### 19. What is Tail recursion?

In "normal" recursive methods, a method calls itself at some point. This technique is used in the naive implementation of the [Fibonacci number](https://en.wikipedia.org/wiki/Fibonacci_number), for instance. The problem with this approach is that at each recursive step, another chunk of information needs to be saved on the stack. In some cases, an huge number of recursive steps can occur, leading to stack overflow errors.

Tail recursion solves this problem. In tail recursive methods, all the computations are done before the recursive call, and the last statement is the recursive call. Compilers can then take advantage of this property to avoid stack overflow errors, since tail recursive calls can be optimized by not inserting info into the stack.

You can ask the compiler to enforce tail recursion in a method with [@tailrec](https://www.scala-lang.org/api/current/scala/annotation/tailrec.html)

~~~scala
def sum(n: Int): Int = { // computes the sum of the first n natural numbers
  if(n == 0) {
    n
  } else {
    n + sum(n - 1)
  }
}

@tailrec // just to ensure at compile time
def tailSum(n: Int, acc: Int = 0): Int = {
  if(n == 0) {
    acc
  } else {
    tailSum(n - 1, acc + n)
  }
}
~~~

if we now run both versions, what would happen?

~~~scala
> sum(5)
sum(5)
5 + sum(4) // computation on hold => needs to add info into the stack
5 + (4 + sum(3))
5 + (4 + (3 + sum(2)))
5 + (4 + (3 + (2 + sum(1))))
5 + (4 + (3 + (2 + 1)))
15

tailSum(5) // tailSum(5, 0) because the default value
tailSum(4, 5) // no computations on hold
tailSum(3, 9)
tailSum(2, 12)
tailSum(1, 14)
tailSum(0, 15)
15
~~~

#### 20. What are High Order Functions?

High order functions are functions that can receive or return other functions. Common examples in Scala are the `.filter`, `.map`, `.flatMap` functions, which receive other functions as arguments.

### Conclusion

This was a fun and valuable exercise, both to deep my knowledge on some topics, and to learn about other topics I never had contact with until now, like the Java futures.

The answers I provide may offer some discussion points, but the goal was to provide a line of thought on those topics. There's a lot more that can be said on each topic, depending on whom is asking them. Typical interviewers may ask you to go deeper on some of the topic to better understand your knowledge of the subject, or may ask you to relate two or more of the subjects.

If you are preparing yourself to an interview, make sure you are comfortable in those topics, and don't simply memorize answers.
