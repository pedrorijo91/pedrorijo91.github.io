---
layout: post

title:  'Scala Enumerations'
date:   2016-12-05 21:00:00
description: 'How to use enumerations in Scala? Is the native approach the best one? Which problems does it brings? Are there any interesting alternatives?'

tags: [tutorials, scala, java, enumeration]
---
<span class="dropcap">E</span>numerations are a language feature specially useful for modeling a finite set of entities. A classical example is modeling the weekdays as an enumeration: one value for each of the seven days. Scala, as many other languages, provides a native way to represent enumerations:

~~~scala
object Weekday extends Enumeration {
  val Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday = Value
}
~~~

Now we can safely represent weekdays without using primitive types like `String` or `Int`.
Scala Enumerations also provide a set of useful features:

* Serialize and Deserialize methods - unfortunately, it may throw an exception :(

~~~scala
scala> Weekday.Monday.toString
res0: String = Monday

scala> Weekday.withName("Monday")
res1: Weekday.Value = Monday

scala> Weekday.withName("Mondai")
java.util.NoSuchElementException: No value found for 'Mondai'
  at scala.Enumeration.withName(Enumeration.scala:124)
  ... 32 elided
~~~

* Provide an human-readable value

~~~scala
object Weekday extends Enumeration {
    val Monday = Value("Mo.")
    val Tuesday = Value("Tu.")
    val Wednesday = Value("We.")
    val Thursday = Value("Th.")
    val Friday = Value("Fr.")
    val Saturday = Value("Sa.")
    val Sunday = Value("Su.")
  }

scala> Weekday.Monday.toString
res0: String = Mo.
~~~

* Listing all possible values

~~~scala
scala> Weekday.values
res0: Weekday.ValueSet = Weekday.ValueSet(Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
~~~

* Ordering. By default, enumeration values are ordered by the order they are declared. This can be overridden

~~~scala
object Weekday extends Enumeration {
  val Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday = Value
}

scala> Weekday.values.toList.sorted
res0: List[Weekday.Value] = List(Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
~~~

~~~scala
object Weekday extends Enumeration {
  val Monday = Value(1)
  val Tuesday = Value(2)
  val Wednesday = Value(3)
  val Thursday = Value(4)
  val Friday = Value(5)
  val Saturday = Value(6)
  val Sunday = Value(0)
}

scala> Weekday.values.toList.sorted
res1: List[Weekday.Value] = List(Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday)
~~~

### Problems with *scala.Enumeration*

Nevertheless, this approach has some problems. There are two main disadvantages:

* Enumerations have the same type after erasure.

~~~scala
object Weekday extends Enumeration {
    val Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday = Value
 }

 object OtherEnum extends Enumeration {
   val A, B, C = Value
 }

 def test(enum: Weekday.Value) = {
   println(s"enum: $enum")
 }

 def test(enum: OtherEnum.Value) = {
   println(s"enum: $enum")
 }

 <console>:25: error: double definition:
def test(enum: Weekday.Value): Unit at line 21 and
def test(enum: OtherEnum.Value): Unit at line 25
have same type after erasure: (enum: Enumeration#Value)Unit
         def test(enum: OtherEnum.Value) = {
             ^
~~~

* There’s no exhaustive matching check during compile. The following example would compile without any warnings, but it would fail on runtime with a `scala.MatchError` exception to weekdays other than Monday and Sunday:

~~~scala
def nonExhaustive(weekday: Weekday.Value) {
  weekday match {
    case Monday => println("I hate Mondays")
    case Sunday => println("The weekend is already over? :( ")
  }
}
~~~

In Scala we heavily rely on the compiler powerful type system, and with this approach, the compiler is not able to find non exhaustive pattern matching clauses, nor to use overloaded methods for different Enumerations.

<p align='center'><img src='/assets/img/explosion.jpg' alt='Explosion' title='Explosion' width='300px'/></p>

In order to avoid such problems, other solutions have been developed:

* using *sealed case objects*
* [itemized](https://github.com/rbricks/itemized)
* [enumeratum](https://github.com/lloydmeta/enumeratum)

## Sealed case objects

If you decide to use *sealed case objects*, the Scala compiler can solve both existing problems in Scala enumerations. The compiler is able both to detect non exhaustive pattern matching and also to avoid type erasure problems.

~~~scala
sealed trait Weekday

case object Monday extends Weekday
case object Tuesday extends Weekday
case object Wednesday extends Weekday
case object Thursday extends Weekday
case object Friday extends Weekday
case object Saturday extends Weekday
case object Sunday extends Weekday

def test(weekday: Weekday) = {
    weekday match {
      case Monday => println("I hate Mondays")
      case Sunday => println("The weekend is already over? :( ")
    }
}

<console>:15: warning: match may not be exhaustive.
It would fail on the following inputs: Friday, Saturday, Thursday, Tuesday, Wednesday
           weekday match {
           ^
test: (weekday: Weekday)Unit
~~~

Another really nice feature, is the possibility to include more fields on the enumeration values ([Scala enumerations only provides an index and a name](https://github.com/scala/scala/blob/2.12.x/src/library/scala/Enumeration.scala#L154)). Just use a (sealed) `abstract class` instead of a (sealed) `trait`.

~~~scala
sealed abstract class Weekday( val name: String,
                               val abbreviation: String,
                               val isWorkDay: Boolean)

case object Monday extends Weekday("Monday", "Mo.", true)
case object Tuesday extends Weekday("Tuesday", "Tu.", true)
case object Wednesday extends Weekday("Wednesday", "We.", true)
case object Thursday extends Weekday("Thursday", "Th.", true)
case object Friday extends Weekday("Friday", "Fr.", true)
case object Saturday extends Weekday("Saturday", "Sa.", false)
case object Sunday extends Weekday("Sunday", "Su.", false)
~~~

### Problems with *sealed case objects*

But this approach has its own set of problems too:

* there is no simple way to retrieve all the enumeration values
* there are no default serialize/deserialize methods
* there is no default ordering between enumeration values - this can be achieved manually by including some info on the values, check the example:

~~~scala
sealed abstract class Weekday( val name: String,
                               val abbreviation: String,
                               val isWeekDay: Boolean,
                               val order: Int) extends Ordered[Weekday] {

  def compare(that: Weekday) = this.order - that.order
}

case object Monday extends Weekday("Monday", "Mo.", true, 2)
case object Tuesday extends Weekday("Tuesday", "Tu.", true, 3)
case object Wednesday extends Weekday("Wednesday", "We.", true, 4)
case object Thursday extends Weekday("Thursday", "Th.", true, 5)
case object Friday extends Weekday("Friday", "Fr.", true, 6)
case object Saturday extends Weekday("Saturday", "Sa.", false, 7)
case object Sunday extends Weekday("Sunday", "Su.", false, 1)

scala> Monday < Tuesday
res0: Boolean = true
~~~

## itemized

[itemized](https://github.com/rbricks/itemized) is a OSS lib that's part of [rbricks](http://rbricks.io/), a collection of composable, small-footprint libraries for Scala.

*itemized* provides macros and typeclasses for enums encoded as *sealed trait hierarchies* - our previous example

~~~scala
import io.rbricks.itemized.annotation.enum

@enum trait Weekday {
  object Monday
  object Tuesday
  object Wednesday
  object Thursday
  object Friday
  object Saturday
  object Sunday
}
~~~

but itemized comes with some additional [features](https://github.com/rbricks/itemized#features):

* list all enumeration values ([WIP](https://github.com/rbricks/itemized/issues/4))
* default serialization/deserialization methods

~~~scala
scala> import io.rbricks.itemized.ItemizedCodec

scala> ItemizedCodec[Weekday].fromRep("Monday")
res0: Option[Weekday] = Some(Monday)

scala> val weekday: Weekday = Planet.Monday

scala> import io.rbricks.itemized.ItemizedCodec.ops._

scala> weekday.toRep
res1: String = Earth
~~~

### Problems with *itemized*

Although it makes easier to create type safe enumerations by using small annotations, it also brings some disadvantages:

* there is no way to [add more fields to enumeration values](https://github.com/rbricks/itemized/issues/11). Since part of the work is made by the macro, at this point, there is no way to pass those values
* although it provides indexed values, there's still no default [order on enumeration values](https://github.com/rbricks/itemized/issues/10)

## enumeratum

Enumeratum is a type-safe and powerful enumeration implementation for Scala that offers exhaustive pattern match warnings.

~~~scala
import enumeratum._

sealed trait Weekday extends EnumEntry
object Weekday extends Enum[Weekday] {
  val values = findValues // mandatory due to Enum extension

  case object Monday extends Weekday
  case object Tuesday extends Weekday
  case object Wednesday extends Weekday
  case object Thursday extends Weekday
  case object Friday extends Weekday
  case object Saturday extends Weekday
  case object Sunday extends Weekday
}
~~~

~~~scala
def test(weekday: Weekday) = {
    weekday match {
      case Weekday.Monday => println("I hate Mondays")
      case Weekday.Sunday => println("The weekend is already over? :( ")
    }
  }

<console>:18: warning: match may not be exhaustive.
It would fail on the following inputs: Friday, Saturday, Thursday, Tuesday, Wednesday
           weekday match {
           ^
test: (weekday: Weekday)Unit
~~~

Besides nonExhaustive pattern matching warnings, enumeratum also provides:

* listing possible values (because the value `values` needs to be implemented on Enum inheritance)
* default serialization/deserialization methods (with and without throwing exceptions)

~~~scala
scala> Weekday.withName("Monday")
res0: Weekday = Monday

scala> Weekday.withName("Momday")
java.util.NoSuchElementException: Momday is not a member of Enum (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
  at enumeratum.Enum$$anonfun$withName$1.apply(Enum.scala:82)
  at enumeratum.Enum$$anonfun$withName$1.apply(Enum.scala:82)
  at scala.Option.getOrElse(Option.scala:121)
  at enumeratum.Enum$class.withName(Enum.scala:81)
  at Weekday$.withName(<console>:13)
  ... 43 elided

scala> Weekday.withNameOption("Monday")
res2: Option[Weekday] = Some(Monday)

scala> Weekday.withNameOption("Momday")
res3: Option[Weekday] = None
~~~

* Adding extra values to enumeration. It is very similar to how we could add extra values with simple *sealed case objects*

~~~scala
sealed abstract class Weekday( val name: String,
                               val abbreviation: String,
                               val isWorkDay: Boolean) extends EnumEntry

case object Weekday extends Enum[Weekday] {
  val values = findValues
  case object Monday extends Weekday("Monday", "Mo.", true)
  case object Tuesday extends Weekday("Tuesday", "Tu.", true)
  case object Wednesday extends Weekday("Wednesday", "We.", true)
  case object Thursday extends Weekday("Thursday", "Th.", true)
  case object Friday extends Weekday("Friday", "Fr.", true)
  case object Saturday extends Weekday("Saturday", "Sa.", false)
  case object Sunday extends Weekday("Sunday", "Su.", false)
}
~~~

* Ordering can be achieved in the same way that we did in *sealed hierarchies*. Just need to mixin with the `Ordered[]` trait and implement the `compare` method.

~~~scala
sealed abstract class Weekday(val order: Int) extends EnumEntry with Ordered[Weekday] {
   def compare(that: Weekday) = this.order - that.order
 }

 object Weekday extends Enum[Weekday] {
   val values = findValues

   case object Monday extends Weekday(2)
   case object Tuesday extends Weekday(3)
   case object Wednesday extends Weekday(4)
   case object Thursday extends Weekday(5)
   case object Friday extends Weekday(6)
   case object Saturday extends Weekday(7)
   case object Sunday extends Weekday(1)
 }
~~~

* Support for several libraries and frameworks that can be real useful on bigger applications. Check the [project documentation](https://github.com/lloydmeta/enumeratum#table-of-contents)

# Conclusion

If you are just starting into Scala I would recommend to use the native approach with `scala.Enumeration`. As you feel more comfortable using more Scala features, and as you start enjoying compiler safeties you will probably want to migrate to something else. My two recommendations would be:

* **sealed hierarchies** if you do not want to depend on external libraries
* **enumeratum** as it provides all the features referred here

## Relevant features referred

* Exhaustive pattern matching
* No type erasure
* Default methods for (safe) serialization/deserialization
* List all possible values
* Add extra fields on enumeration values
* Ordering

## Follow up

If you want to see more alternatives, check out the follow up on [Scala Enumerations - Return of the (Java) Jedi]({{ site.url }}/blog/scala-enums-part2)
