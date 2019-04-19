---
layout: post

title: 'Play Framework and Slick example updated'
date: 2019-04-23 21:00:00
description: 'The updated version of the Play Framework, Slick, and MySQL tutorial and demo application. Now for Play 2.7.X'
image: play-slick-mysql.png
image_alt: 'Play framework, Slick, and MySQL logos'

tags: [tutorials, play-framework, scala, slick, mysql]
---

<span class="dropcap">I</span>t was more than 3 years ago that I struggled to find a tutorial for integrating the Play Framework with Slick.

At the time I decided to write the most comprehensive tutorial I could make on how to create a full app with persistent storage using:

* **Play Framework** - the most adopted MVC framework in the scala ecosystem,
* **Slick** - the standard database access framework in scala,
* **MySQL** - because I had always used Postgres and wanted to try MySQL.

I looked for existing demo apps and started removing all the boilerplate I could. I removed dependency injection, useless controllers, internationalization, etc.

Back to the present, the [resulting tutorial]({{ site.url }}/blog/play-slick) I wrote got a very good feedback. Lot of visits, lot of comments (27 comments wow), a few github issues, and even pull requests. It was awesome to feel I was helping people getting into the scala ecosystem.

In these 3 years I got some people asking, and even contributing, to update the demo app to Play 2.5. But since I've been a bit away from scala, I let the tutorial become deprecated.

<p align='center'><img src='/assets/img/update.jpg' alt='Time to update' title='Time to update' width='600px'/></p>

With the release of [Play 2.7.0 on February](https://github.com/playframework/playframework/releases/tag/2.7.0), I decided to finally update the demo app. You can find the updated demo for the newest version in the [GitHub repository](https://github.com/pedrorijo91/play-slick3-steps), as well as all the [other versions](https://github.com/pedrorijo91/play-slick3-steps/branches).

You can see the differences on the corresponding [pull request](https://github.com/pedrorijo91/play-slick3-steps/pull/11). No big changes were needed. Let's go through the differences step by step from the [original guide]({{ site.url }}/blog/play-slick):

### 0. Creating a new play template project

First difference: `activator` is no longer the way to create new projects from a template. Where before you'd do:

~~~
activator new application-name play-scala
~~~

now you do:

~~~
sbt new playframework/play-scala-seed.g8
~~~

#### 1. Creating the model

This step suffers no major changes since it's just plain scala code. But since Play Framework moved into Guice as the default dependency injection, we are going to stop relying in scala objects, and creating classes.

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

class Users() { // notice the change here

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

#### 2. Application Controllers

Here we have a few more small changes, mostly due to dependency injection.

~~~scala
@Singleton
class ApplicationController @Inject()
  (cc: ControllerComponents, userService: UserService)
   extends AbstractController(cc) with Logging {

  def index() = Action.async { implicit request: Request[AnyContent] =>
    userService.listAllUsers map { users =>
      Ok(views.html.index(UserForm.form, users))
    }
  }

  def addUser() = Action.async { implicit request: Request[AnyContent] =>
    UserForm.form.bindFromRequest.fold(
      // if any error in submitted data
      errorForm => {
        logger.warn(s"Form submission with error: ${errorForm.errors}")
        Future.successful(Ok(views.html.index(errorForm, Seq.empty[User])))
      },
      data => {
        val newUser = User(0, data.firstName, data.lastName, data.mobile, data.email)
        userService.addUser(newUser).map( _ => Redirect(routes.ApplicationController.index()))
      })
  }

  def deleteUser(id: Long) = Action.async { implicit request: Request[AnyContent] =>
    userService.deleteUser(id) map { res =>
      Redirect(routes.ApplicationController.index())
    }
  }

}
~~~

#### 3. UI views

Here we have no changes 🎉!

### Adding persistent storage

Now let's go through the steps to add storage configuration.

#### 0. Depencies

As expected, dependencies got new versions:

~~~scala
"com.typesafe.play" %% "play-slick" % "4.0.0",
"com.typesafe.play" %% "play-slick-evolutions" % "4.0.0",
"mysql" % "mysql-connector-java" % "8.0.15",
~~~

#### 1. Configurations

Some configurations keys have changed, but no big deal:

~~~
# this allows to skip some form security checks
# see https://www.playframework.com/documentation/2.7.x/Filters#disabling-default-filters
play.filters.disabled+=play.filters.csrf.CSRFFilter

slick.dbs.default.profile = "slick.jdbc.MySQLProfile$"
slick.dbs.default.db.driver = "com.mysql.jdbc.Driver"
slick.dbs.default.db.url = "jdbc:mysql://localhost/example?serverTimezone=UTC"
slick.dbs.default.db.user = "root"
slick.dbs.default.db.password = ""
~~~

#### 2. Integrate models with slick

The table definition is exactly the same as the original (for Play 2.4 tutorial), but due to dependency injection once again, we have a minor change on the way to get the database config provider:

~~~scala
import slick.jdbc.MySQLProfile.api._

class UserTableDef(tag: Tag) extends Table[User](tag, "user") {

  def id = column[Long]("id", O.PrimaryKey,O.AutoInc)
  def firstName = column[String]("first_name")
  def lastName = column[String]("last_name")
  def mobile = column[Long]("mobile")
  def email = column[String]("email")

  override def * =
    (id, firstName, lastName, mobile, email) <>(User.tupled, User.unapply)
}

class Users @Inject() (protected val dbConfigProvider: DatabaseConfigProvider)
  (implicit executionContext: ExecutionContext)
  extends HasDatabaseConfigProvider[JdbcProfile] {

    // the HasDatabaseConfigProvider trait gives access to the
    // dbConfig object that we need to run the slick queries

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

#### 3. Evolutions

Database evolutions also keep exactly the same 🎉🎉🎉 !

#### 4. Final Remarks

As you can see, the tutorial is still quite simple, and I hope it helps solving those small but annoying issues when starting with Play and Slick.

If you want to know everything that has changed, you should have a look at the official migration guides: [Play 2.7 migration guide](https://www.playframework.com/documentation/2.7.x/Migration27).

### Resources

* Detailed tutorial for Play 2.4.X: [{{ site.url }}/blog/play-slick]({{ site.url }}/blog/play-slick)
* Play 2.4 and Slick demo app: [https://github.com/pedrorijo91/play-slick3-steps/tree/play-2.4](https://github.com/pedrorijo91/play-slick3-steps/tree/play-2.4)
* Play 2.7 and Slick demo app: [https://github.com/pedrorijo91/play-slick3-steps/tree/play-2.7](https://github.com/pedrorijo91/play-slick3-steps/tree/play-2.7)
* Migration from Play 2.4 demo to Play 2.7 demo: [https://github.com/pedrorijo91/play-slick3-steps/pull/11](https://github.com/pedrorijo91/play-slick3-steps/pull/11)
