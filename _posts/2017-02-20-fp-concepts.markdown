---
layout: post

title:  'Functional Programmings concepts'
date:   2017-02-20 21:00:00
description: 'Functional Programming concepts. What is referential transparency? That are pure functions? What is idempotence? What is the Uniform Access Principle?'
image:  lambda.png
image_alt: 'Lambda symbol - often related with functional programming'

tags: [functional programming, referential transparency, pure functions, idempotence, uniform access principle]
---

<span class="dropcap">F</span>rom time to time I find myself reading an article that refers to some concepts that I've already read about but I keep forgetting about their definition.

Among many of those concepts I want to approach three of them:

* referential transparency,
* uniform access principle,
* idempotence.

Unfortunately this is still not the classic post explaining what is a monad :smile:, but if you want to understand monads [this should be your starting point](http://stackoverflow.com/a/28139260/4398050).

These three concepts are quite usual in functional programming. And none of them is hard, but it's just one of those things I can't remember whenever I find them. And my way to make sure I will never forget about stuff again is to write about it.

So what do they actually mean?

### Referential Transparency and Pure Functions

Referential transparency is a property of an expression. Referential transparency makes it easier to reason about the behavior of programs.

For an expression to have referential transparency it must be possible to replace it by it's value without affecting the program behavior. This means that an expression always evaluates to the same result in any context.

If an expression doesn't respect referential transparency, we say the expression is referential opaque. (More about [referential transparency here](https://wiki.haskell.org/Referential_transparency).)

Examples of expressions with referential transparency:

~~~scala
3 + 2
~~~

~~~scala
{
  val x = 5
  val y = 37

  x + y * 5
}
~~~

Referential transparency is the requirement to have a *pure function*. And by the definition of referential transparency, a pure function will not have side effects.

~~~scala
// this is a pure function
def pure(x: String): Boolean = {
  x.length > 5
}
~~~

And an example of a impure function:

~~~scala
var global = 100

// this is not a pure function
def impure(x: String): Boolean = {
  myFunctionThatWritesIO() // this is a side effect
  x.length > global // global can be modified externally, changing the return value
}
~~~

But how can you use pure functions, which don't have side effects (like IO operations), to build useful programs? Well, it is possible because *pure functions* capture the side effects for later execution. Haskell IO monad is one of the most known example of this. Instead of doing the actual side effect, the function returns the side effect wrapped in some type (avoiding to say Monad...) for later execution. The computation of the execution plan is pure, but when it is run it is unsafe and impure because it contains IO (or other) effects.

Finally, referential transparency must not be seen as a mere definition, but the source of many good things about functional programming. Referentially transparent expressions are context insensitive, which enables local reasoning on one hand, and high composability and compositionally on the other.

### Idempotence

Idempotence is a property of certain operations/functions. A function is idempotent if and only if the result of applying it twice is the same as the result of applying it once, i.e., if you apply `f` again to the result of `f(x)` you will get the same result again. This can be translated into:

~~~
∀x . f(f(x)) = f(x)
~~~

For instance, sorting a list is idempotent, as sorting it a second time has no effect.

### Uniform Access Principle

The Uniform Access Principle was first defined on the Objected-Oriented world by Bertrand Meyer (originally in the book *Object-Oriented Software Construction*) and it states that

> *"All services offered by a module should be available through a uniform notation, which does not betray whether they are implemented through storage or through computation.”*

In practice this means that the syntax used to manipulate attributes (stored) and methods (computations) should be the same. Some languages like Java don't respect this principle, as you can access an object field through:

~~~java
obj.field;
~~~

but a method should be accessed through:

~~~java
obj.method(); // Note the need for the parenthesis
~~~

In Java, such principle is *simulated* through the usage of getters/setters:

~~~java
obj.getField(); // now you don't know if it's simply returning a value, or if there's a computation beneath
~~~

In Scala, there's no such difference:

~~~scala
obj.field
obj.method // as long as the method is parameterless of course
~~~

This allows to change simple class fields into methods without much effort during the code refactor.

You can see this all over Scala. [Scala best practices](https://www.youtube.com/watch?v=ol2AB5UN1IA) say your code "shouldn't care" if it's dealing with an `Option` or a collection, because all of them can be treated equally in most situations just be using common higher order functions like `.map`, `.foreach`, `.flatMap`, `.filter`, `.isEmpty`, etc.

This principle also brings some eventual problems: if you are accessing a value that requires an expensive computation (an heavy database query for instance) and you are not aware of the cost, the system may become slow.

Sometimes you don't care about the implementation underneath, and sometimes you have to be aware of it.

### Final notes

Take into account that many definitions for each of the previous concepts are available, and there's not a consensus in many occasions. Just use the definitions I presented as an entry point to the concepts, so that you can start understanding them. Much more detailed information is widely available if you are interested in deepening your knowledge on functional programming concepts.

Also, if you found some incoherence just let me know!

### Edit

Thanks to precious feedback I received (on [reddit](https://www.reddit.com/r/scala/comments/5zqk2l/functional_programmings_concepts/) and on the comments) about some misdefinitions. On one hand, it made me learn a little more, and on the other hand, you guys helped to transmit the correct knowledge to anyone who reads this.
