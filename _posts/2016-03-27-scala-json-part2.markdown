---
layout: post

title:  'Saving JSON to Scala model - Part 2'
date:   2016-03-26 19:00:00
image:  json-logo.png
image_alt: 'JSON logo'

tags: [tutorials, scala, play-framework, json]
---
<span class="dropcap">F</span>ollowing up [my previous post on mapping json objects to Scala models]({{ site.url }}/blog/scala-json/), it is time to present some more advanced use cases.

In the past weeks I have found myself in cases where a little more 'magic' was needed:

1. Read dates from the json (`org.joda.DateTime`)
2. Mapping primitive types (as `Long`) to a custom `case class`
3. Nested objects

## Reading dates from Json objects

Imagine you have a Json object, with a Unix timestamp field:

~~~json
{
  "field": "example field",
  "date": 1459014762000
}
~~~

How to map it?

* Define the corresponding `case class`
* Define a custom mapper. To read a DateTime one can use the default adapter provided by the library:

~~~scala
case class JsonExampleV1(field: String, date: DateTime)
object JsonExampleV1{
  implicit val r: Reads[JsonExampleV1] = (
    (__ \ "field").read[String] and
      (__ \ "date").read[DateTime](Reads.DefaultJodaDateReads)
    )(JsonExampleV1.apply _)
}
~~~

Just test it:

~~~scala
scala> val jsonV1 = """{ "field": "example field", "date": 1459014762000 }"""
jsonV1: String = { "field": "example field", "date": 1459014762000 }

scala> Json.parse(jsonV1).as[JsonExampleV1]
res0: JsonExampleV1 = JsonExampleV1(example field,2016-03-26T17:52:42.000Z)
~~~

## Reading custom case classes

Now, if you do wrap your object identifiers for type safety, you will enjoy this:


~~~json
{
  "id": 91,
  "data": "Some data"
}
~~~

and the corresponding `case classes`:

~~~scala
case class MyIdentifier(id: Long)

case class JsonExampleV2(id: MyIdentifier, data: String)
~~~

Now you just need to read the primitive type (`Long`), and `map` to your idenfier:

~~~scala
object JsonExampleV2 {
  implicit val r: Reads[JsonExampleV2] = (
      (__ \ "id").read[Long].map(MyIdentifier) and
    (__ \ "data").read[String]
    )(JsonExampleV2.apply _)
}
~~~

Again, let's test it:

~~~scala
scala> val jsonV2 = """ { "id": 91, "data": "String data" }"""
jsonV2: String = " { "id": 91, "data": "String data" }"

scala> Json.parse(jsonV2).as[JsonExampleV2]
res1: JsonExampleV2 = JsonExampleV2(MyIdentifier(91),String data)
~~~

## Reading nested objects

This one was motivated from a [Stackoverflow question](http://stackoverflow.com/questions/36202938/scala-play-reads-parse-nested-json/36210676).

Basically, the json answer contains an `id` field, and a json array with friends, where each friend object is composed of another `id` and a `since` field.

I will present two options:

* using a `case class` to save all the information of each friend
* extract only the `id` (as the author pretends)

#### Using case classes

Not very difficult, but remember that the `Friends` json mapper definition needs to come before the `Response` json mapper:

~~~scala
case class Friends(id: Long, since: String)
object Friends {
  implicit val fmt = Json.format[Friends]
}

case class Response(id: Long, friend_ids: Seq[Friends])

object Response {

  implicit val userReads: Reads[Response] = (
    (JsPath \ "id").read[Long] and
      (JsPath \ "friends").read[Seq[Friends]]
    ) (Response.apply _)
}
~~~

#### Extract only the ids

This solution was presented by [another user](http://stackoverflow.com/a/36215248/4398050) and it's a little bit more elaborated:

~~~scala
case class Response(id: Long, friend_ids: Seq[Long])

object Response {

  implicit val userReads: Reads[Response] = (
    (__ \ "id").read[Long] and
      (__ \ "friends").read[Seq[Long]](Reads.seq((__ \ "id").read[Long]))
    )(Response.apply _)
}
~~~

## I want to learn more

If you are stuck with some error, check the source code at [GitHub](https://github.com/pedrorijo91/scala-play-json-examples).

If you want to read a little more about solutions from other authors, check these useful links:

* [Reactive Xplore Group](http://reactive.xploregroup.be/blog/13/Play-JSON-in-Scala-intro-and-beyond-the-basics)
* Wojciech Programming Blog [Part 1](http://www.wlangiewicz.com/2016/03/23/json-in-play-framework-techniques-for-making-compatible-mappings/) and [Part 2](http://www.wlangiewicz.com/2016/03/25/json-play-framework-advanced-libraries/)
* [Scala reddit](https://www.reddit.com/r/scala/comments/4bz89a/how_to_correctly_parse_json_to_scala_case_class/) where I got some of the knowledge
