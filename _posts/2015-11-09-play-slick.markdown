---
layout: post

title:  'Play framework, Slick and MySQL Tutorial'
date:   2015-11-09 23:00:00
image: play-slick-mysql.png


tags: [tutorials]
---
<span class="dropcap">T</span>ypical nowadays applications need to store some persistent data frequently. And when we talk about persistent storage we are talking about databases. Among the most common applications, we have web applications. And it is uncommon to have a web application that does not require persistent storage. 

Building webapps in Scala is typically done using the [Play framework](https://www.playframework.com/). And for persistent storage, Scala developers typically appeal to [Slick](http://slick.typesafe.com/). Even though it is possible to use Java libraries and frameworks like the well-know [Hibernate](http://hibernate.org/) - described as an *high-performance Object/Relational persistence and query service* - Slick has a Scala-like API, where everything is pretty similar to Scala collections, making Slick way more attractive to Scala developers. 

Another difference that should be kept in mind, is that Slick is not an ORM like Hibernate. Slick is more like a functional-relational mapper. And a more detailed difference between Slick and ORMs is available in the [Slick documentation](http://slick.typesafe.com/doc/2.1.0/orm-to-slick.html). Slick also allows the use of multiple backends, meaning that you can use a lot of different databases with slick (H2, MySQL, PostgreSQL, and [many others](http://slick.typesafe.com/doc/3.1.0/supported-databases.html)).

As stated in Slick docs:

> Slick is a modern database query and access library for Scala. It allows you to work with stored data almost as if you were using Scala collections (...). You can write your database queries in Scala instead of SQL, thus profiting from the static checking, compile-time safety and compositionality of Scala.

## Webapps with persistent storage

When building a webapp in Scala with persistent storage you will probably think about using Play and Slick together. 
To achieve that you probably want to use [Play Slick](https://github.com/playframework/play-slick), a Play module that makes Slick a first-class citizen of Play. It consists of two features:

* Integration of Slick into Play's application lifecycle.
* Support for Play database evolutions.

This module tries to provide an easy way to integrate Play and Slick, but while I was looking for some minimal example I noticed that there was missing some updated example which used `Play 2.4` and `Slick 3.1.0`. 
Here are the closest examples I've found: 

* [Play Slick samples](https://github.com/playframework/play-slick/tree/master/samples), that are pretty hard to reuse due to the [complex sbt setup](https://github.com/playframework/play-slick/issues/278#issuecomment-144388541)
* An example which combines Play 2.4 and Slick 3, but that uses [HikariCP](http://brettwooldridge.github.io/HikariCP/), and without the use of the Play Slick module, at [https://github.com/wsargent/play-slick-3.0/](https://github.com/wsargent/play-slick-3.0/)
* And finally, a really nice [tutorial](http://playhorizon.blogspot.in/p/play-scala-tutorials_23.html) and [code](https://github.com/bhavyalatha26/play-scala-slick-example), that unfortunately has a lot of useless code for those who just want to use Play and Slick. Between other issues, it provides string internationalization, uses dependency injection with [guice](https://github.com/google/guice), abuses in the use of `Traits` and implementing classes, and so on. All those features just make the example less clean.

That said, I decided to compile the available examples and tutorials in the most simple and comprehensive example I could, mostly based on the [last example](http://playhorizon.blogspot.in/p/play-scala-tutorials_23.html).
This example uses MySQL database, but it should be straightforward to implement it using other database.

## Creating a Play app with Slick from scratch

First, there are some required software you need to have available at your machine:

1. Scala
2. [sbt](http://www.scala-sbt.org/)
3. [Activator](https://www.typesafe.com/community/core-tools/activator-and-sbt) (not essential, but nice for getting a Play app template)
4. [MySQL](https://www.mysql.com/), as we have chosen MySQL as the database

After installing everything you need, make sure you have MySQL server running, and a database named `playScalaSlickExample` (you may chose another name, it will be described how to change later).

### Making the webapp

Now it's time to start creating our app. The simplest way to do it is to run: 

~~~ 
activator new application-name play-scala
~~~

specifying your application name by replacing *application-name* by the desired name.
If you opted by not installing activator you can create a sbt project manually, adding the dependencies and the [correct folder structure](https://www.playframework.com/documentation/2.0/Anatomy).

At this moment you should have your base template, something like [this](https://github.com/pedrorijo91/play-slick3-steps/tree/step1)

The next step is to add all the logic and models without using a database. We'll make it using a variable representing the sequence of users (please, never use variables in Scala again). To do that, we'll need to:

####1. Create the model 

Besides the User, we'll need a case class for the form submitted data (UserFormData), an object to deal with form submission (UserForm), and a object to answer queries (Users). 

Besides that, we'll create a service layer. This is not strictly necessary, but it's a good practice to have a service layer that's responsible to get and manipulate the information the controller needs. In our case it is so simple that we'll omit it, but you can check it on [Github](https://github.com/pedrorijo91/play-slick3-steps/blob/master/app/services/UserService.scala).

~~~scala
case class User(id: Long, firstName: String, lastName: String, mobile: Long, email: String)

case class UserFormData(firstName: String, lastName: String, mobile: Long, email: String)

object UserForm {

  val form = Form(
    mapping(
      "firstName" -> nonEmptyText,
      "lastName" -> nonEmptyText,
      "mobile" -> longNumber,
      "email" -> email
    )(UserFormData.apply)(UserFormData.unapply)
  )
}

object Users {

  var users: Seq[User] = Seq()

  def add(user: User): String = {
    users = users :+ user.copy(id = users.length) // manual id increment 
    "User successfully added"
  }

  def delete(id: Long): Option[Int] = {
    val originalSize = users.length
    users = users.filterNot(_.id == id)
    Some(originalSize - users.length) // returning the number of deleted users
  }

  def get(id: Long): Option[User] = users.find(_.id == id)

  def listAll: Seq[User] = users

}
~~~

####2. Add the controllers 

Now it's time to add the endpoints to which the application will respond. 

~~~scala
class ApplicationController extends Controller {

  def index: Action[AnyContent] = Action { implicit request =>
    val users = UserService.listAllUsers
    Ok(views.html.index(UserForm.form, users))
  }

  def addUser() = Action { implicit request =>
    UserForm.form.bindFromRequest.fold(
      // if any error in submitted data
      errorForm => Ok(views.html.index(errorForm, Seq.empty[User])),
      data => {
        val newUser = User(0, data.firstName, data.lastName, data.mobile, data.email)
        val res = UserService.addUser(newUser)
        Redirect(routes.ApplicationController.index())
      })
  }

  def deleteUser(id: Long) = Action { implicit request =>
    UserService.deleteUser(id)
    Redirect(routes.ApplicationController.index())
  }

}
~~~

Besides the controller you'll also need to configure the [routes file](https://github.com/pedrorijo91/play-slick3-steps/blob/master/conf/routes):

~~~
GET     /                           controllers.ApplicationController.index
POST    /add                        controllers.ApplicationController.addUser
GET     /delete/:id                 controllers.ApplicationController.deleteUser(id : Long)
~~~


####3. And don't forget about the views

Finally, we'll need to create the view to our application. The view will display a user creation form, and the existent users list.

Once again, you can check it out on [Github](https://github.com/pedrorijo91/play-slick3-steps/tree/step2/app/views).

At this moment you should have something similar to [this code](https://github.com/pedrorijo91/play-slick3-steps/tree/step2)

### Persisting data

This was the first part. Now it's time to configure the database for our application. Let's go through each step:

####0. Declare dependencies

Of course, first we'll need to declare some dependencies to use slick, play-slick, and mysql - the chosen database for us. Add these 3 dependencies to your `build.sbt`

~~~
 "mysql" % "mysql-connector-java" % "5.1.34"
 "com.typesafe.play" %% "play-slick" % "1.1.0"
 "com.typesafe.play" %% "play-slick-evolutions" % "1.1.0"
~~~

Also, if you have a `jdbc` dependency declared in your `build.sbt` file, remove it, or it will cause some errors in the compilation.

####1. Add configurations to `conf/application.conf`

We need to specify how will the play application connect to the database.
The following lines specify the database driver, in this case MySQL, the database and its user/password. Whatever the name you choose to the database (if you prefer other name to `playScalaSlickExample`), make sure it exists before starting the application.

~~~
slick.dbs.default.driver = "slick.driver.MySQLDriver$"
slick.dbs.default.db.driver = "com.mysql.jdbc.Driver"
slick.dbs.default.db.url = "jdbc:mysql://localhost/playScalaSlickExample"
slick.dbs.default.db.user = "root"
slick.dbs.default.db.password = ""
~~~

####2. Integrate our models with slick

Now it's time to convert our models to slick objects, i.e. provide information for slick to map between classes and tables.

In our case, we want to map the `User` class/instances. Our case class will suffer no changes, but we need to create another class that tells slick how to map. I like to name those classes something like `XTableDef`, where `X` is the name of the model (case) class, but you can give them different names.

~~~scala
class UserTableDef(tag: Tag) extends Table[User](tag, "user") {

  def id = column[Long]("id", O.PrimaryKey,O.AutoInc)
  def firstName = column[String]("first_name")
  def lastName = column[String]("last_name")
  def mobile = column[Long]("mobile")
  def email = column[String]("email")

  override def * =
    (id, firstName, lastName, mobile, email) <>(User.tupled, User.unapply)
}
~~~

Note that the *O.PrimaryKey* and *O.AutoInc* constants indicate Slick that the *id* column is the primary key, and it should be incremented by the database itself.

Now we also need to adapt our `Users` object, that was used to make the queries.

To get the database object we can write

~~~scala
val dbConfig = DatabaseConfigProvider.get[JdbcProfile](Play.current)
~~~

We'll also need to create a table query. This table query object will map to the table, meaning all queries are done through this object

~~~scala
val users = TableQuery[UserTableDef]
~~~

Now we'll rewrite the methods to use the database instead of the in-memory sequence holding all users. This will change the methods signature, leading to changes in the service and possibly controllers.

~~~scala
object Users {

  val dbConfig = DatabaseConfigProvider.get[JdbcProfile](Play.current)

  val users = TableQuery[UserTableDef]

  def add(user: User): Future[String] = {
    dbConfig.db.run(users += user).map(res => "User successfully added").recover {
      case ex: Exception => ex.getCause.getMessage
    }
  }

  def delete(id: Long): Future[Int] = {
    dbConfig.db.run(users.filter(_.id === id).delete)
  }

  def get(id: Long): Future[Option[User]] = {
    dbConfig.db.run(users.filter(_.id === id).result.headOption)
  }

  def listAll: Future[Seq[User]] = {
    dbConfig.db.run(users.result)
  }
}
~~~

####3. Add database evolution

Database evolutions allow you to declare migrations when you add new tables, modify them, or delete some.
Since the database should be empty for now, evolutions will take care of adding the User table.

[Play evolutions](https://www.playframework.com/documentation/2.4.x/Evolutions) include a `Ups` and a `Downs` sections. The `Downs` section can be applied if Play thinks something went wrong and needs to rollback. You can disable this feature - may be danger to have downs in production - in the configurations with

~~~
play.evolutions.autoApplyDowns=false
~~~

The evolution scripts should be in the directory `conf/evolutions/%databaseName%` with the name of the scripts stating at **1.sql**, incrementing at each evolution. Play keeps track of which evolutions has already applied in a table called *play_evolutions*. 

Our evolution script, `1.sql`:

~~~
# User schema

# --- !Ups
create table `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `first_name` TEXT NOT NULL,
  `last_name` TEXT NOT NULL,
  `mobile` BIGINT NOT NULL,
  `email` TEXT NOT NULL
)

# --- !Downs
drop table `user`
~~~

### Play with it

Now everything should be up and running ! Also, the final version is available at [Github](https://github.com/pedrorijo91/play-slick3-steps/tree/step3) in case you want to check something.

Try it out at `localhost:9000`, add more persistent data, and your own slick queries, and start creating your own applications. 