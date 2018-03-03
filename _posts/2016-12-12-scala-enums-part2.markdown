---
layout: post

title:  'Scala Enumerations - Return of the (Java) Jedi'
date:   2016-12-12 23:00:00
description: 'Second part of Scala enumerations, after some discussions. Looking at enumerations libs overheads, and Java enums as an alternative.'

tags: [tutorials, scala, java, enumerations]
---
<span class="dropcap">O</span>n my [last blog post]({{ site.url }}/blog/scala-enums) I've explored some solutions to create enumerations in Scala while getting some important compiler safeties.

The features which were taken into account were:

* Exhaustive pattern matching
* No type erasure
* Default methods for (safe) serialization/deserialization
* List all possible values
* Add extra fields on enumeration values
* Ordering

That article gave place to [an interesting discussion on Reddit](https://www.reddit.com/r/scala/comments/5h5u8x/scala_enumerations/). The discussion went through two main focuses:

1. Overheads introduced by some of the solutions presented
2. Missing some alternatives

While the first point was never taken into account when writing the article, the second deserves a little deepening on this subject.

The reason why the runtime overhead was not considered is because the goal of those solutions was to achieve some compiler safeties as well some *nice-to-have features*, like default serialization and deserialization methods. I am surely not arguing that the introduced overhead should be ignored, I do simply believe that [premature optimization is the root of all evil](http://wiki.c2.com/?PrematureOptimization) **for most systems**, and those rare applications need to be correctly profiled before one starts thinking on how to optimize it. The goal was *simply* to write correct code.

### Yet another alternative to Scala.Enumeration

One of the alternatives referred on the discussion was the usage of *Symbols*, because "enumerations were just being used for decisions" in the examples. But the author ends referring that due to the fact that pattern matching with *Symbols* is not exhaustive, he always needs to keep a default case, which is not very optimal.

*Symbols* provide a simple way to get unique objects for equal strings. Since they are interned, they can be compared using reference equality.

When you have two *String* instances they are not guaranteed to be [interned](http://stackoverflow.com/questions/10578984/what-is-string-interning), so to compare them you must often check their contents by comparing lengths and even checking character-by-character whether they are the same. With `Symbol` instances, comparisons are a simple `eq` check (i.e. `==` in *Java*), so they are constant time (i.e. `O(1)`) to look up.

Although `Symbols` may have their use case, I would say they are not a good alternative for enumerations.

### Return of the (Java) Jedi

One of the advantages of *Scala*, it's the possibility to interoperate *Scala* and *Java* code in the same project very easily. Due to this particular feature, *Scala* developers can use tons of available *Java* libraries, instead of rewriting every single library they would need. Of course *Java* code has some things we don't like in *Scala*, like *exceptions*, or the usage of *null*, so it's frequent to appear a library rewritten in *Scala*.

Nevertheless, *Java* has a great implementation of Enumerations that should not have been discarded on my previous post. Have a look at this *Java* example:

~~~java
public enum WeekJava {
    Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
}
~~~

While very minimal, this implementation also has the advantage of less runtime overhead on the JVM. But why would we want to use *Java* (enums) ?

* Exhaustive pattern matching

~~~scala
scala> :paste
// Entering paste mode (ctrl-D to finish)

  def f(week: WeekJava) = {
    week match {
      case WeekJava.Monday => "I hate mondays"
    }
  }

// Exiting paste mode, now interpreting.

<console>:12: warning: match may not be exhaustive.
It would fail on the following inputs: Friday, Saturday, Sunday, Thursday, Tuesday, Wednesday
           week match {
           ^
f: (week: com.pedrorijo91.enums.WeekJava)String
~~~

* No type erasure. The following example would compile, while the Scala native enumeration wouldn't.

~~~scala
def f(week: WeekJava) = {
  week match {
    case WeekJava.Monday => "I hate mondays"
    case _ => "ok..."
  }
}

def f(week: AnotherJavaEnum) = {
  week match {
    case  AnotherJavaEnum.X => "X-files?"
    case _ => "ok..."
  }
}
~~~

* List all possible values is very straightforward.

~~~scala
scala>  WeekJava.values()
res0: Array[com.pedrorijo91.enums.WeekJava] = Array(Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
~~~

* Default methods for serialization/deserialization. Unfortunately the default `.valueOf()` method may throw an `IllegalArgumentException`. But there's a simple workaround to create a method with a Scala API:

~~~java
import scala.Option;

public enum WeekJava {
    Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday;

    public static Option<WeekJava> safeValueOf(String s) {
        try {
            return Option.apply(valueOf(s));
        } catch(IllegalArgumentException e) {
            return Option.empty();
        }
    }
}
~~~

Now you just need to use the new and safe method `.safeValueOf` we've just defined, and it will return a *Scala* `Option`.

* Add extra fields on enumeration values is also really simple

~~~java
public enum WeekJava {
    Monday("Monday", "Mo.", true),
    Tuesday("Tuesday", "Tu.", true),
    Wednesday("Wednesday", "We.", true),
    Thursday("Thursday", "Th.", true),
    Friday("Friday", "Fr.", true),
    Saturday("Saturday", "Sa.", false),
    Sunday("Sunday", "Su.", false);

    public final String name ;
    public final String abbreviation;
    public final boolean isWorkDay;

    WeekJava(String name, String abbreviation, boolean isWorkDay) {
        this.name = name;
        this.abbreviation = abbreviation;
        this.isWorkDay = isWorkDay;
    }
}
~~~

* There is no default ordering between enumeration values, but this can be achieved manually by including some info on the values, just like we did on other examples. Unfortunately the compiler requires that we override 5 methods instead of only 1, creating a little more boilerplate code:

~~~java
import scala.math.Ordered;

public enum WeekJava implements Ordered<WeekJava> {
    Monday("Monday", "Mo.", true, 2),
    Tuesday("Tuesday", "Tu.", true, 3),
    Wednesday("Wednesday", "We.", true, 4),
    Thursday("Thursday", "Th.", true, 5),
    Friday("Friday", "Fr.", true, 6),
    Saturday("Saturday", "Sa.", false, 7),
    Sunday("Sunday", "Su.", false, 1);

    public final String name;
    public final String abbreviation;
    public final boolean isWorkDay;
    public final int order;

    @Override
    public int compare(WeekJava that) {
        return this.order - that.order;
    }

    @Override
    public boolean $greater$eq(WeekJava that) {
        return this.compare(that) >= 0;
    }

    @Override
    public boolean $less$eq(WeekJava that) {
        return this.compare(that) <= 0;
    }

    @Override
    public boolean $greater(WeekJava that) {
        return this.compare(that) > 0;
    }

    @Override
    public boolean $less(WeekJava that) {
        return this.compare(that) < 0;
    }

    WeekJava(String name, String abbreviation, boolean isWorkDay, int order) {
        this.name = name;
        this.abbreviation = abbreviation;
        this.isWorkDay = isWorkDay;
        this.order = order;
    }
}
~~~

### Final Remarks

Despite the fact that Java *enums* were not approached on my [last blog post]({{ site.url }}/blog/scala-enums), they are an awesome alternative, specially if runtime overhead is a concern to your application.

The biggest problem one could point was the fact the deserialization method could throw an exception, but as we have seen, it's very easy to create a safe alternative. Still, you and your team must ensure the correct method is used in all cases, which may be a point of failure.

So, next time you have to define enumerations, don't forget about Java *enums* when choosing among available options :)

### First part

In case you missed it, make sure you read the [first part about Scala enumeration]({{ site.url }}/blog/scala-enums)
