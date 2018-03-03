---
layout: post

title:  'Saving JSON responses to your model in Scala'
date:   2016-01-05 20:00:00
image:  json-logo.png
image_alt: 'JSON logo'

tags: [tutorials, scala, json, play-framework]
---
<span class="dropcap">I</span>f you deal with external APIs (like Twitter, Facebook, Intercom, Github, and many others) on a regular basis there's a big chance that you have already dealt with [JSON](http://www.json.org/) answers before.

*JSON* (JavaScript Object Notation) is a lightweight data-interchange format. It is easy for humans to read and write. It is easy for machines to parse and generate. It is a text format that is completely language independent but uses conventions that are familiar to programmers of the C-family of languages.

JSON is built on two structures:

* A collection of name/value pairs. In various languages, this is realized as an object, record, struct, dictionary, hash table, keyed list, or associative array.
* An ordered list of values. In most languages, this is realized as an array, vector, list, or sequence.

A JSON object can be as simple as

~~~json
{
  "key": "value"
}
~~~

containing just a simple key and value pair - in the limit, it could also be an empty set of key-values pair - or as complex as one wishes it:

~~~json
{
  "widget" : {
    "debug" : "on",
    "window" : {
      "title" : "Sample Konfabulator Widget",
      "name" : "main_window",
      "width" : 500,
      "height" : 500
    },
    "image" : {
      "src" : "Images/Sun.png",
      "name" : "sun1",
      "hOffset" : 250,
      "vOffset" : 250,
      "alignment" : "center"
    },
    "text" : {
      "data" : "Click Here",
      "size" : 36,
      "style" : "bold",
      "name" : "text1",
      "hOffset" : 250,
      "vOffset" : 100,
      "alignment" : "center",
      "onMouseUp" : "sun1.opacity = (sun1.opacity / 100) * 90;"
    }
  }
}
~~~

There are [many other examples available](http://json.org/example.html).

## Scala and JSON

In most cases you will want to access and save information contained on the JSON document. [Play](https://www.playframework.com/) provides a very complete library for dealing with JSON objects, [Play JSON](https://www.playframework.com/documentation/2.4.x/ScalaJson).

> Note: If you are not including Play on your dependencies you can just include Play Json with

> `libraryDependencies += "com.typesafe.play" % "play-json_2.11" % "2.4.6"`

For this example we will use [GitHub API](https://developer.github.com/v3/). If you access [my user endpoint](https://api.github.com/users/pedrorijo91) you will get information about my user, in JSON. You should get something like:

~~~json
{
  "login": "pedrorijo91",
  "id": 1999050,
  "avatar_url": "https://avatars.githubusercontent.com/u/1999050?v=3",
  "gravatar_id": "",
  "url": "https://api.github.com/users/pedrorijo91",
  "html_url": "https://github.com/pedrorijo91",
  "followers_url": "https://api.github.com/users/pedrorijo91/followers",
  "following_url": "https://api.github.com/users/pedrorijo91/following{/other_user}",
  "gists_url": "https://api.github.com/users/pedrorijo91/gists{/gist_id}",
  "starred_url": "https://api.github.com/users/pedrorijo91/starred{/owner}{/repo}",
  "subscriptions_url": "https://api.github.com/users/pedrorijo91/subscriptions",
  "organizations_url": "https://api.github.com/users/pedrorijo91/orgs",
  "repos_url": "https://api.github.com/users/pedrorijo91/repos",
  "events_url": "https://api.github.com/users/pedrorijo91/events{/privacy}",
  "received_events_url": "https://api.github.com/users/pedrorijo91/received_events",
  "type": "User",
  "site_admin": false,
  "name": "Pedro Rijo",
  "company": "Codacy",
  "blog": "http://pedrorijo.com/",
  "location": "Lisbon, Portugal",
  "email": null,
  "hireable": true,
  "bio": null,
  "public_repos": 35,
  "public_gists": 4,
  "followers": 23,
  "following": 62,
  "created_at": "2012-07-18T14:34:35Z",
  "updated_at": "2016-01-05T00:02:37Z"
}
~~~

Now let's parse it. Suppose this answer is saved in a value named `jsonString`, then all you need to do is:

~~~scala
import play.api.libs.json.Json
val jsonObject = Json.parse(jsonString)
~~~

and you will get the JSON object, ready to be easily queried. The easiest way to access fields is using the `'\'` operator.
For instance, to get the `login` field you just need to write:

~~~scala
val login = jsonObject \ "login"
~~~

and you will get a `JsValue` with the value `pedrorijo91`. You can now convert this to a `String`, or any other type, using:

~~~scala
login.as[String]
~~~

> Note: when testing, it may be useful to experiment on the sbt console, and when saving the JSON strings in a value, the [triple quote](http://www.scala-lang.org/old/node/5514) may be handy

## Saving JSON documents to model objects

That was the first part. What about saving the information? You probably want to map it to domain objects. The easiest way is to use `case classes`.

Imagine that some API returned the following answer:

~~~json
{
  "username": "pedrorijo91",
  "friends": 100,
  "enemies": 10,
  "isAlive": "true"
}
~~~

and you have the following model:

~~~scala
case class User(username: String, friends: Int, enemies: Int, isAlive: Boolean)
~~~

To easily convert your JSON object to an `User`, add the companion object with an implicit formatter:

~~~scala
case class User(username: String, friends: Int, enemies: Int, isAlive: Boolean)

object User {
  implicit val userJsonFormat = Json.format[User]
}
~~~

Now, if you simply do:

~~~scala
val jsonString = """ {"username":"pedrorijo91","friends":100,"enemies":10,"isAlive":"true"} """
val jsonObject = Json.parse(jsonString)
jsonObject.as[User]
~~~

You will get an `User` with the expected fields defined. You can get to know more on the [official documentation](https://www.playframework.com/documentation/2.4.x/ScalaJson#JsValue-to-a-model)

> Note, actually you just need `Json.reads[User]` on the companion object. The `format` allows you to also write a model as JSON directly.

## Life ain't perfect

Unfortunately, some APIs we deal with, are not as nice. Suppose that instead of a `isAlive` field, the JSON had an `is_alive` field. Then the mapping between JSON and our model wouldn't be direct as before.

There are two alternatives:

1.  Adapt the case class

    Instead of a a `isAlive` we can name the class field `is_alive`

    ~~~scala
    case class User(username: String, friends: Int, enemies: Int, is_alive: Boolean)
    ~~~

    This creates an awful field accessor (`is_alive`). One solution may be to hide that accessor, creating a wrapper. Add the `private` qualifier and create a wrapper method:

    ~~~scala
    case class User(username: String, friends: Int, enemies: Int, private val is_alive: Boolean) {
      def isAlive: Boolean = is_alive
    }
    ~~~    

2.  Create a custom Reads on the companion object

    ~~~scala
    case class User(username: String, friends: Int, enemies: Int, isAlive: Boolean)

    object User {

      import play.api.libs.functional.syntax._
      import play.api.libs.json._

      implicit val userReads: Reads[User] = (
          (JsPath \ "username").read[String] and
          (JsPath \ "friends").read[Int] and
          (JsPath \ "enemies").read[Int] and
          (JsPath \ "is_alive").read[Boolean]
        ) (User.apply _)
    }
    ~~~

    This custom Reads maps each JSON field to the case class constructor, allowing you to keep a nice case class, while creating instances directly from JSON objects.


Yet another problem, what about APIs returning JSON with optional fields? What if the `isAlive` field is not always present? Then the solution would be to use `readNullable` and make the field optional:

~~~scala
case class User(username: String, friends: Int, enemies: Int, isAlive: Option[Boolean])

object User {

  import play.api.libs.functional.syntax._
  import play.api.libs.json._

  implicit val userReads: Reads[User] = (
      (JsPath \ "username").read[String] and
      (JsPath \ "friends").read[Int] and
      (JsPath \ "enemies").read[Int] and
      (JsPath \ "is_alive").readNullable[Boolean]
    ) (User.apply _)
}
~~~

Now you can map JSON answers to your model and deal with that information with all the benefits Scala provides.

What about you? Do you have any other technique for dealing with JSON in Scala?


## Follow up

If you want to see more advanced features, check out the follow up on [Saving JSON to Scala model - Part 2]({{ site.url }}/blog/scala-json-part2)

Also, checkout the source code at [GitHub](https://github.com/pedrorijo91/scala-play-json-examples) if you have any doubt.
