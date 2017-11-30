---
layout: post

title:  'Why Tuples are evil'
date:   2017-11-30 21:00:00
description: 'Why Scala Tuples are evil and should be avoided'
image:  scala-logo.png
image_alt: 'Scala language logo'

tags: [scala, tuples, coding practices]
---

<span class="dropcap">W</span>hen I first started experimenting with Scala I found out about [tuples](http://www.scala-lang.org/api/2.12.3/scala/Tuple2.html). "Tuples are awesome" I thought. But they are not. Tuples are a trap you should avoid at all cost. Tuples are [the Eve's apple](https://en.wikipedia.org/wiki/Adam_and_Eve).

<p align='center'><img src='/assets/img/eve-apple.jpg' alt='Eve and the apple' title='Eve and the apple' width='400px'/></p>

### But what is a Tuple?

A tuple is a sorted group of values. It's a List with elements of different types, with constant size. If you are familiar with Scala, it's like a case class, but without name. Its fields don't have a name also. You refer to the fields of a tuple by it's order.

~~~scala
scala> val myTuple = ("hello", 42, "world!")
myTuple: (String, Int, String) = (hello,42,world!)

scala> myTuple._1
res0: String = hello
~~~

Scala distinguishes tuples according to the number of elements. This means that a tuple with 2 elements is a completely different and unrelated type of a tuple with 3 elements.

### Tuples seem awesome!

Now you are thinking just like me when I discovered tuples: "Look at this function returning an Int. I really need to retrieve this piece of information too, I will just convert the return type to a tuple and return both", and boom, problem solved! [Or is it](https://www.urbandictionary.com/define.php?term=Or%20is%20it)?

At first sight it may seem so, but sooner or later you will pay the price.

### Why are tuples so bad?

The bigger problems of using tuples:

- Usually, you can't easily understand what each tuple field means without getting a lot of context. This probably includes trace back until the moment the tuple was created. Instead of using a tuple, had you chosen for a case class with proper names, it would be really straightforward to understand the meaning of each field.

- If you want to evolve the tuple to hold more info (meaning, adding a new value to the tuple), you break code everywhere because now you have a new type. If you have a case class, you can add a new field, and the code will compile everywhere; now you'd just need to use the new field everywhere you want the extra info, and the remaining code can be left exactly the same.

### So, you never use tuples?

I do use tuples in some rare occasions. Tuples are mostly useful in 2 use cases:

- Creating a Map. Scala has a very easy syntax for creating Maps from tuples:

~~~scala
scala> Seq(("key1", 1), ("key2" , 10), ("key3" , 100)).toMap
res0: scala.collection.immutable.Map[String,Int] = Map(key1 -> 1, key2 -> 10, key3 -> 100)
~~~

- Tuple of non native types. Some time ago I started using more frequently [value classes](http://pedrorijo.com/blog/scala-interview-questions/#16-what-is-a-value-class). Value classes are great to express semantic meaning with types without paying the runtime cost of instantiating objects. These 2 approaches are completely different, wouldn't you agree?

~~~scala
val badTuple: (Int, String) = (16, "John Doe")
val readableTuple: (PersonAge, PersonName) = (PersonAge(16), PersonName("John Doe"))
~~~

### Conclusion

As any other coding convention, you should always think if in your specific situation the rule may be ignored. Coding style guides exist to help making the code more readable. **The goal is to make your code readable**, never forget that.

Also, remember that at the end of the day, you have to put code into production, so you may need to do some shortcuts. Just evaluate the trade-offs.

Scala did a great job providing the case classes syntax. Other languages like Java don't have the same easiness creating POJOs. So I would say most of the times, avoiding the tuple pitfall will not make you 'lose' much time, and it will compensate in the future when you need to evolve your code.
