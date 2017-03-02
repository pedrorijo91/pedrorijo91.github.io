---
layout: post

title:  'Scala interview questions'
date:   2017-03-10 21:00:00
description: 'Some basic, or not so basic, questions about Scala. Interview level questions. Preparing your next Scala interview.'
image:  scala-logo.png

tags: [scala, interview, questions, concepts]
---

<span class="dropcap">O</span>n the other day I saw a post asking for usual questions on Scala related job interviews. Among some answers I saw a reference to a [GitHub repository](https://github.com/Jarlakxen/Scala-Interview-Questions#language-questions) with several questions, not only Scala specific, but also about functional programming, and even general questions.

While one can argue about the effectiveness of those questions to filter job applicants, I found those questions an interesting exercise.

Here's the list of questions I decided to answer to exercise myself, mostly from that repository:

1. What is the difference between a `var`, a `val` and `def`?
2. What is the difference between a `trait` and an `abstract class`?
3. What is the difference between an `object` and a `class`?
4. What is a `case class`?
5. What is the difference between a Java future and a Scala future?
6. What is the difference between `unapply` and `apply`, when would you use them?
7. What is a companion object?
8. What is the difference between the following terms and types in Scala: `Nil`, `Null`, `None`, `Nothing`?
9. What is `Unit`?
10. What is the difference between a `call-by-value` and `call-by-name` parameter?
11. Define uses for the `Option` monad and good practices it provides.
12. How does `yield` work?
13. Explain the implicit parameter precedence.
14. What operations is a `for comprehension` syntactic sugar for?
15. Streams:
	* What consideration you need to have when you use Scala's `Streams`?
	* What technique does the Scala's `Streams` use internally?
16. What is a `value class`?
17. Option vs Try vs Either
18. What is function currying?

### Answers

Before you decide to read my answers (which may even not be right - but I do hope they are :sweat_smile:), try to answer them yourself.

#### 1. What is the difference between a `var`, a `val` and `def`?

A `var` is a variable. It's a mutable reference to a value. Since it's mutable, its value may change through the program lifetime. Keep in mind that the variable type cannot change. You may say it behaves similarly to Java variables.

A `val` is a value. It's an immutable reference, meaning that its value never changes. Once assigned it will always keep the same value. It's similar to constants in another languages.

A `def` is a function declaration. It is evaluated on call.

~~~scala
var x = 3 // x is of type Int. If you force it to be of type Any then this example would work
x = 4 // accepted by the language/compiler
x = "error" // not accepted by the compiler

val y = 3
y = 4 // would produce an error 'error: reassignment to val'

def fun(name: String) = "Hey! My name is: " + name
fun("Scala") // "Hey! My name is: Scala"
fun("java") //  "Hey! My name is: Java"
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

lazy val heavyComputation = someReallyHeavyComputation()

methodThatMayThrowAnException()
heavyComputation
~~~

#### 2. What is the difference between a `trait` and an `abstract class`?

The first difference is that a `class` can only extend one other `class`, but an unlimited number of `traits`.

While `traits` only support `type parameters`, `abstract classes` can have `constructor parameters`.

Also, `abstract classes` are interoperable with Java, while `traits` are only interoperable with Java if they do not contain any implementation.

#### 3. What is the difference between an `object` and a `class`?

An `object` is a singleton instance of a `class`. It does not need to be instantiated by the programmer.

If an `object` has the same name that a `class`, the `object` is called a `companion object`. A `companion object` has access to `methods` of private visibility of the class, and the class also has access to private methods of the object. If compared with Java, companion objects hold the "static methods" of a class.

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

A `case class` is syntactic sugar for a class that is immutable and decomposable through pattern matching (because they have an `apply` and `unapply` methods).

Case classes contain a companion object which holds the `apply` method. This fact makes possible to instantiate a case class without the `new` keyword. They also come with some helper methods like the `.copy` method, that eases a slightly changed copy from the original.

Finally, case classes are compared by structural equality instead of by reference, i.e., they come with a method which compares two case classes by their values/fields, instead of comparing by reference.

Case classes are specially useful to be used as DTOs.

~~~scala
case class MyCaseClass(number: Int, text: String, others: List[Int])

val dto = MyCaseClass(3, "text", List.empty)
dto.copy(number = 5) // will produce an instance equal to the original, with number = 5 instead of 3
~~~

#### 5. What is the difference between a Java future and a Scala future?

This one I had to google a little about it. I have never used Java futures, so it was impossible for me to say.

Obviously, I was not the first to search for the differences between both futures. I found a  [really clean and simple answer on Stackoverflow](http://stackoverflow.com/a/31368177/4398050) which highlights the fact that the Scala implementation is in fact asynchronous without blocking, while in Java you can't get the future value without blocking.

Scala provides an API to manipulate the future as a monad or by attaching callbacks for completion. Unless you decide to use the [`Await`](http://docs.scala-lang.org/overviews/core/futures.html#blocking-outside-the-future), you won't block your program using Scala futures.

#### 6. What is the difference between `unapply` and `apply`, when would you use them?

`unapply` is a method that needs to be implemented by an object in order for it to be an extractor. Extractors are used in pattern matching to access an object constructor parameters. It's the opposite of a constructor.

The `apply` method is a special method that allows you to write `someObject(params)` instead of `someObject.apply(params)`. This usage is common in `case classes`, which contain a companion object with the `apply` method that allows the nice syntax without to instantiate a new object without the `new` keyword.

#### 7. What is a companion object?

If an `object` has the same name that a `class`, the object is called a `companion object`. A companion object has access to methods of private visibility of the class, and the class also has access to private methods of the object. If comparing to Java, companion objects hold the "static methods" of a class.

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

The `None` is the empty representation of the `Option` monad (see answer #11).

`Null` is a Scala trait, where `null` is its only instance. The `null` value comes from Java and it's an instance of any object, i.e., it is a subtype of all reference types, but not of value types.  It exists so that reference types can be assigned `null` and value types (like `Int` or `Long`) can’t.

`Nothing` is another Scala `trait`. It's a subtype of any other type, and it has no subtypes. It exists due to the complex type system. It has *zero* instances. It's the return type of a method that never returns normally, for instance, a method that always throws an exception. [The reason Scala has a bottom type is tied to its ability to express variance in type parameters.](http://james-iry.blogspot.pt/2009/08/getting-to-bottom-of-nothing-at-all.html).

Finally, `Nil` represents an empty List of anything of size zero.

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

As it may be seen, the `call-by-name` example makes the computation **only when needed**, and **everytime**, while the `call-by-value` **only computes once**, but it **computes before invoking** the function (`callByName`).

#### 11. Define uses for the `Option` monad and good practices it provides.

The `Option` monad is the Scala solution to the null problem from Java. While in Java the absence of a value is modeled through the `null` value, in Scala its usage is discouraged, in flavor of the `Option`.

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

`yield` generates a value to be kept in each iteration of a loop. `yield` is used in for comprehensions as to provide a syntactic alternative to the combined usage of `map`/`flatMap` and `filter` operations on monads.

~~~scala
scala> for (i <- 1 to 5) yield i * 2
res0: scala.collection.immutable.IndexedSeq[Int] = Vector(2, 4, 6, 8, 10)
~~~

#### 13. Explain the implicit parameter precedence.

Implicit parameters can lead to unexpected behavior if one is not aware of the precedence when looking up.

1. implicits declared locally
2. imported implicits
3. outer scope (implicits declared in the class are considered outer scope in a class method for instance)
4. inheritance
5. package object
6. implicit scope like companion objects

A nice [set of examples can be found here](http://eed3si9n.com/implicit-parameter-precedence-again).

#### 14. What operations is a `for comprehension` syntactic sugar for?

A `for comprehension` is a alternative syntax for the composition of several operations on monads.

A `for comprehension` can be replaced by `foreach` operations (if no yield keyword is being used), or by `map`/`flatMap` and `filter` (actually, while confirming my words I [found out about the `withFilter` method](http://docs.scala-lang.org/tutorials/FAQ/yield.html#translating-for-comprehensions)).

~~~scala
for {
  x <- c1
  y <- c2
  z <- c3
} yield {...}
~~~

is translated into

~~~scala
c1.flatMap(x => c2.flatMap(y => c3.map(z => {...})))
~~~

#### 15. Streams: What consideration you need to have when you use Scala's `Streams`? What technique does the Scala's `Streams` use internally?

While Scala `Streams` can be really useful due to its lazy nature, it may also come with some unexpected problems.

Scala `Streams` can be infinite, but your memory isn't. If used wrongly, streams can lead to memory consumption problems. One must be cautious when saving references to a `stream`. One common guideline, is not to assign a stream (head) to a `val`, but instead, make it a `def`.

This is a consequence of the technique behind `streams`: memoization

#### 16. What is a `value class`?

Because we all had the nasty bug where you where using an integer thinking it would represent an age, but it was actually a street number, it's considered a good practice to wrap primitive types into more meaningful types.

[Value classes](http://docs.scala-lang.org/overviews/core/value-classes.html) allow a developer to increase the program type safety without incurring into penalties from allocating runtime objects.

There are some [constraints](http://docs.scala-lang.org/overviews/core/value-classes.html#when-allocation-is-necessary) and [limitations](http://docs.scala-lang.org/overviews/core/value-classes.html#limitations), but the basic idea is that at compile time the object allocation is removed, by replacing the value classes instance by primitive types. [More details can be found on its SIP](http://docs.scala-lang.org/sips/completed/value-classes.html#expansion-of-value-classes).

#### 17. Option vs Try vs Either

All of these 3 monads allow us to represent a computation that did not executed as expected.

An `Option`, as explained on answer #11, represents the absence of value. It can be used when searching for something for instance. Database accesses often return `Option`.

`Try` is the monad approach to the java `try/catch` block. It wraps runtime exceptions.

If you need to provide a little more info about the reason the computation has failed, `Either` may be very useful. With `Either` you specify two possible return types: the expected/correct/successful and the error case which can be as simple as a `String` message to be displayed to the user, or a full [ADT](https://en.wikipedia.org/wiki/Algebraic_data_type).   

#### 18. What is function currying?

Currying is a technique of making a function that takes multiple arguments into a series of functions that take a part of the arguments.

~~~scala
def add(a: Int)(b: Int) = a + b

val add2 = add(2)(_)

scala> add2(3)
res0: Int = 5
~~~
