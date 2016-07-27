---
layout: post

title:  'How to make the Scala compiler to review your code'
date:   2016-07-19 23:00:00

tags: [tutorials]
---
<span class="dropcap">C</span>ode review has become [one of the most important (and used) techniques](https://blog.codinghorror.com/code-reviews-just-do-it/) when it comes to code quality. The code review process may have very different workflows and subtleties, but it is often driven around the following steps:

* The developer responsible by the code (a new feature, a bug fix, a refactor, etc) sends his changes to other colleagues (in git it is called a patch, that can be transformed into a [pull request](https://help.github.com/articles/using-pull-requests/), [merge request](http://docs.gitlab.com/ce/gitlab-basics/add-merge-request.html), or any other name your Git repository hosting service calls it).
* His colleagues will read his changes. As they read the code, they will approve the changes, or comment on some point in which they disagree or don't totally understand.
* If there is any question, the author will clarify. If there's any controversial change for any reviewer a bigger discussion may take place, until all the involved developers agree with the changes.
* When no more unsolved issues are present, the changes will be included in the main code.

<p align='center'><img src='/assets/img/code-review-cartoon.jpg' alt='Code Review' title='Code Review' width='300px'/></p>

This process allows to detect most bugs before they go into productionBut most of those changes can be automated. Unfortunately, a [big part of the review comments have to do with code style and bad practices](http://blog.codacy.com/2015/04/08/20-of-code-review-comments-are-about-style-and-best-practices-2/). But most of those reviews can be automated, or at least the problems can be automatically detected.

In order to reduce the time spent on the review process, several different solutions are available:

* A [formal code style](https://github.com/google/styleguide). Document and/or provide [format settings](https://github.com/google/styleguide/commit/0249a38579160e135cbd7eb5099898611683200e) for the most used IDEs (which can be hard due to the wide range of available text editors/IDEs).
* [Linters](https://en.wikipedia.org/wiki/Lint_(software)) (static analysis tools). Language dependent, every major programming language has some static analysis tool/linter available. [There are hundreds](https://en.wikipedia.org/wiki/List_of_tools_for_static_code_analysis). Furthermore, many online platforms are emerging which provide several static analysis tools making it easy to configure some rules across all your projects. One of them is [Codacy](https://www.codacy.com/).
* Use the compiler flags itself. This technique is only valid for compiled languages, but compilers often include flags to check some code standards. [gcc](https://gcc.gnu.org/) for instance provides the infamous `-pedantic` and `-Wall` among [many others](https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html#Warning-Options).

<p align='center'><img src='/assets/img/compiling.png' alt='Code compiling' title='Code compiling' width='300px'/></p>


### How can the Scala compiler help me?

Just like gcc, the scala compiler has its own set of flags for detecting some undesired code patterns. Unfortunately, the list of available flags is a bit scattered, but you can find them by typing `scalac -help`, `scalac -X`, `scalac -Xlint:help` and `scalac -Y` (note that each command provides information about a different set of flags).

To better understand the difference between all of those different options, check [this SO answer](http://stackoverflow.com/a/38032455/4398050).

By typing `scalac -X` you will get several interesting flags. My favourite is `-Xfatal-warnings`, which will make the compilation fail if any warning is found. It is particularly useful to demand that you fix the issues. Otherwise it will be a question of time until your code base is full of warnings that someone decided that could be postponed.

### Which flags should I use?

Well, it really depends on you, but here's my set of flags:

#### -deprecation
Emit warning and location for usages of deprecated APIs.

Because deprecated methods have a (good) reason to be deprecated, we should avoid using them

~~~scala
$ cat Example.scala
object Example {

  @deprecated("not safe, use m2 instead", "v.0.1.0") def m1(x: Int) = x + 1

  def test = m1(3)
}

$ scalac -deprecation Example.scala
Example.scala:5: warning: method m1 in object Example is deprecated: not safe, use m2 instead
  def test = m1(3)
             ^
one warning found
~~~

#### -Xfatal-warnings
Fail the compilation if there are any warnings.

#### -Xlint:missing-interpolator
A string literal appears to be missing an interpolator id.

~~~scala
$ cat Example.scala
object Example {

  def transformation(str: String) = "This_is_my_str_transformed_ $str _END"

}

$ scalac -Xlint:missing-interpolator Example.scala
Example.scala:3: warning: possible missing interpolator: detected interpolated identifier `$str`
  def transformation(str: String) = "This_is_my_str_transformed_ $str _END"
                                    ^
one warning found
~~~


#### -Ywarn-unused-import
Warn when imports are unused

Unused imports increase the change of merging conflicts on CVS. Even worst, you may be importing some implicit into scope, that is not currently being used, but may start to be used when you add some code, without you even noticing.


#### -Ywarn-unused
Warn when local and private vals, vars, defs, and types are unused.

If you have unused vals, vars, defs, or types in your code, there is a big change that you may have a bug. While sometimes these warnings are just a consequence of a refactor, without any big problem besides useless computation, they may indicate you are passing the wrong argument to some function.

~~~scala
$ cat Example.scala
object Example {

 def method(x: Int) = {
   val y = 4

   aux(x)
 }

 def aux(y: Int) = y + 4

}

$ scalac -Ywarn-unused Example.scala
Example.scala:4: warning: local val in method method is never used
   val y = 4
       ^
one warning found
~~~


#### -Ywarn-dead-code
Warn when dead code is identified.

~~~scala
$ cat Example.scala
object Example {

  def m: Unit = {
    println("step1")
    return
    println("step2")
  }

}

$ scalac -Ywarn-dead-code Example.scala
Example.scala:5: warning: dead code following this construct
    return
    ^
one warning found
~~~

#### -Ywarn-numeric-widen
Warn when numerics are widened.

[Numeric widening](http://www.scala-lang.org/files/archive/spec/2.11/06-expressions.html#numeric-widening) is an implicit conversion between two numbers of different types (Int and Double, for instance) useful for many cases, but it may be an [huge source of bugs](https://groups.google.com/d/msg/scala-internals/Gi-54GeWv-M/vy1fjqE0FosJ)

~~~scala
$ cat Example.scala
object Example {

  def m(x: Double) = {
    println(s"x is: $x")
  }

  def caller = {
    val i: Int = 2
    m(i)
  }

}

$ scalac -Ywarn-numeric-widen Example.scala
Example.scala:9: warning: implicit numeric widening
    m(i)
      ^
one warning found
~~~

<!-- ### Problems using flags

Unfortunately, depending on which frameworks you are going to use, you will probably face some small bugs.  While I was trying to add my own set of flags to the compilation options I had to deal with some problems. Many of them due to some magic [Play](https://www.playframework.com/) does.

#### routes

unused import  https://github.com/playframework/playframework/pull/6284
unused val -> https://github.com/playframework/playframework/issues/6302 -->

### Just try yourself

Now it's time for you to try some (all?) available flags and find your own set of options to include on the compilation. Be patient, as sometimes you may [struggle with some bugs](https://github.com/playframework/playframework/pull/6284).
