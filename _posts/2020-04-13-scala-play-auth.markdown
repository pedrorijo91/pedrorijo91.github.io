---
layout: post

title: 'Implementing Authentication on Play Framework'
shortTitle: 'Authentication on Play Framework'
date: 2020-04-13 18:00:00
description: 'Implementing User Authentication on Scala Play Framework'
image: 

tags: [scala, play-framework, authentication, tutorials]
---

<span class="dropcap">O</span>ne of the most common things on any web application is authentication. Almost every web app needs authentication. If you want to have users then you'll need to implement authentication. And there are many different ways to implement it today. From the classic user / password, to login with other social accounts (Google, Facebook, GitHub, etc), using [JWT tokens](https://jwt.io/), or even by using external services like [auth0](https://auth0.com/).

User authentication is a sensitive topic: everyone expects to work flawlessly, and if there's any security issue it can easily take the full company down.

A small disclaimer: I'm by no means an expert on the subject, and I do not intend to make this blog post a tutorial on security and user authentication. If you are new to the subject, I recommend this [web security essentials blog post series](https://www.sohamkamani.com/blog/2017/01/16/web-security-essentials/) by [Soham Kamani](https://twitter.com/sohamkamani). It's a very good crash course on web security and covers a wide range of topics such as:

1. [Sessions and cookies](https://www.sohamkamani.com/blog/2017/01/08/web-security-session-cookies/)
2. [Password storage](https://www.sohamkamani.com/blog/2017/01/01/web-security-password-storage/)
3. [CORS (Cross origin resource sharing)](https://www.sohamkamani.com/blog/2016/12/21/web-security-cors/)
4. [XSS (Cross site scripting)](https://www.sohamkamani.com/blog/2016/11/24/web-security-xss/)
5. [CSRF (Cross site request forgery)](https://www.sohamkamani.com/blog/2017/01/14/web-security-cross-site-request-forgery/)
6. [SQL Injection](https://www.sohamkamani.com/blog/2016/11/24/what-is-sql-injection/)

### Implementing User Authentication

So what is this article about? Well, if you understood the general idea, now it's time to actually implement user authentication. 

Several web frameworks provide very easy to use solutions which require very little work for the developer (sometimes a [class annotation](https://docs.oracle.com/javase/tutorial/java/annotations/) is all that takes to validate authentication). To be honest, I never had implemented user authentication from scratch using the Play Framework, so I was a bit curious to see how it could be achieved.

Let's start by doing a very short summary on how authentication will work.

### Quick overview on authentication

If you've read the [Sessions and cookies tutorial](https://www.sohamkamani.com/blog/2017/01/08/web-security-session-cookies/) listed before you can skip this section. If you didn't, here are some important aspects of how authentication works:

- Each request needs to be authenticated, i.e., you cannot assume that after a login request all the requests from the same address / device will be from the same user;
- You don't want to make the user type the username / email in every request;
- To avoid that, after the login request you provide a secret (a session token) to the user / caller
- The session token should be hard to guess;
- The session token is mapped to a single user;
- The user / client now uses that token in every request;
- To make this automatic and invisible to the user, you add the token as a cookie;
- The browser will include the cookie with the token in every request following the login;
- The session token should have a limited duration for safety reasons.

 <figure>
  <img src='https://www.sohamkamani.com/848da0226ad6b6ad9be76df3d4ebcf8c/session-cookie-2.svg' alt='Authentication workflow' title='Authentication workflow' width='600px'/>
  <figcaption>User Authentication workflow - source: <a href="https://www.sohamkamani.com/blog/2017/01/08/web-security-session-cookies/">Soham Kamani</a></figcaption>
</figure> 

### Getting started

The first thing I did was look for existing libs / authentication mechanisms in Play Framework. Despite most frameworks do have plugins for authentication (for instance [Spring Session](https://spring.io/projects/spring-session)), Play doesn't offer anything like that. But to be fair, Play makes it very easy to implement. 

I found a few open source solutions to handle authentication on Play Framework:

* [Play2-auth](https://github.com/t2v/play2-auth) - last commit 4 years ago
* [SecureSocial](https://github.com/jaliss/securesocial) - last commit almost 2 years ago
* [Silhouette](https://github.com/mohiva/play-silhouette) - seems to be the only reliable solution from what I could find

 But since none of them seem to have become a standard until now, I decided to try and implement it by myself. It's not hard, and I always recommend to do it ourselves to understand the fundamentals. 
 
 Feel free to look at [the working example](https://github.com/pedrorijo91/play-auth-example/) while we go through the necessary steps.

 <p align='center'><img src='/assets/img/dyi.jpg' alt='DYI' title='DYI' width='600px'/></p>

As usual, let's start by creating a new Play Framework app from scratch by using the [existing template](https://github.com/playframework/play-scala-seed.g8):

```
$ sbt new playframework/play-scala-seed.g8
```

This should create a template app containing a `HomeController.scala` file which contains the controller of our tutorial. 

Before heading into the juicy part of managing users and their requests we'll need to add some extras to the current app:

- A `User` representation (model)
- A `UserDAO` which will fetch user information from DB
- A `SessionDAO` which will store Session Tokens

For the sake of simplicity during this tutorial, we'll replace persistent storage in DB with an in-memory Map. 

Databases are obviously a must if you plan to run this in a real environment, but you should also take into account that these tables are going to be accessed a lot (in every request), so you should probably consider some sort of caching mechanism.

For `User` we create the following simple code:

~~~scala
package models

import scala.collection.mutable

case class User(username: String, password: String)

object UserDAO {

  // Map username -> User
  private val users: mutable.Map[String, User] = mutable.Map()

  def getUser(username: String): Option[User] = {
    users.get(username)
  }

  // this method should be thread safe
  def addUser(username: String, password: String): Option[User] = {
    
    // check if user already exists and return error if it does  
    if(users.contains(username)) {
      Option.empty
    } else {
      val user = User(username, password)
      users.put(username, user)
      Option(user)
    }
  }

}
~~~

And for the session:

~~~scala
package models

import java.time.LocalDateTime
import java.util.UUID

import scala.collection.mutable

case class Session(token: String, username: String, expiration: LocalDateTime)

object Session {

  // Map token -> Session
  private val sessions= mutable.Map.empty[String, Session]

  def getSession(token: String): Option[Session] = {
    sessions.get(token)
  }

  def generateToken(username: String): String = {
    // we use UUID to make sure randomness and uniqueness on tokens  
    val token = s"$username-token-${UUID.randomUUID().toString}"
    sessions.put(token, Session(token, username, LocalDateTime.now().plusHours(6)))

    token
  }

}
~~~

Now that we have our base built, let's create a route for a private page. By default the template we used already adds a public homepage. Let's add a route for the private page:

~~~
GET     /         controllers.HomeController.index // default (public page)
GET     /priv     controllers.HomeController.priv // some private page
~~~

And now we can focus on the actual session management on the controller. 

Take into account that there are a few possible alternatives, so let's go through each one. All of them are pretty much equivalent, so it's up to you which solution to follow.

#### Starting raw

As I said before, it's relatively easy and low effort to implement session management with Play, so let's try to do it.

Remembering what we saw earlier, what we need is to access a specific cookie and compare its value with the one stored in the server. This is our first solution for user authentication:

~~~scala
// public page controller method
def index() = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.index())
}

// private page controller method
def priv() = Action { implicit request: Request[AnyContent] =>

    val userOpt = extractUser(request)

    userOpt
        .map(user => Ok(views.html.priv(user)))
        .getOrElse(Unauthorized(views.html.defaultpages.unauthorized())) 
}

private def extractUser(req: RequestHeader): Option[User] = {

    val sessionTokenOpt = req.session.get("sessionToken")

    sessionTokenOpt
        .flatMap(token => SessionDAO.getSession(token))
        .filter(_.expiration.isAfter(LocalDateTime.now()))
        .map(_.username)
        .flatMap(UserDAO.getUser)
}
~~~

In the above snippet we can look at the implementation for a public page under `index()` method, and for a private one under `priv()` method. The private page starts by fetching the user from the request, by calling the `extractUser(req: RequestHeader)` method. This method contains the necessary logic to parse the request session.

As we can see, it's fairly easy to access the session by calling `val sessionTokenOpt = req.session.get(<whatever_session_key_we_define>)`. Play provides this utility method to access a special Cookie, meant to keep session tokens. We could just simply manage sessions as normal cookies by using `request.cookies.get(<whatever_session_key_we_define>)`, but this helper give us some nice advantages. For instance, session cookies are stored in JWT format, meaning they are signed. You can read more on the advantages of using the Play Sessions instead of normal Cookies and how to configure session on [the official Play documentation](https://www.playframework.com/documentation/2.8.x/SettingsSession).

The next interesting part is to see that given a request session, we now go into the `SessionDAO` to get the full session info. We then check if it has already expired, and if doesn't, then we get the corresponding session `User`. And that's it, we have the `User` which made the request and that can be used to get whatever private data you need.

But maybe you noticed as we would need to add to every private route the very same first line:

~~~scala
    val userOpt = extractUser(request)
~~~

We can further leverage the power of scala by using Higher Order Functions and implicit parameters and create a much better flow. Let's see how:

~~~scala
def priv() = Action { implicit request: Request[AnyContent] =>
  withUser(user => Ok(views.html.priv(user)))
}

private def withUser[T](block: User => Result)(implicit request: Request[AnyContent]): Result = {
  val user = extractUser(request)

  user
    .map(block)
    .getOrElse(Unauthorized(views.html.defaultpages.unauthorized())) // 401, but 404 could be better from a security point of view
}
~~~

And now sounds a lot cleaner!

#### Play helpers

But we can reduce our code even further by using Play `Security` object which provides utility methods for doing what we did already:

~~~scala
def priv() = withPlayUser { user =>
    Ok(views.html.priv(user))
}

private def withPlayUser(block: User => Result): EssentialAction = {
    Security.WithAuthentication(extractUser)(user => Action(block(user)))
}
~~~

Can you guess what `Security.WithAuthentication` does under the hood? Let's look at it! 

~~~scala
  def WithAuthentication[A](
      userinfo: RequestHeader => Option[A]
  )(action: A => EssentialAction): EssentialAction = {
    Authenticated(userinfo, DefaultUnauthorized)(action)
  }

  def Authenticated[A](
      userinfo: RequestHeader => Option[A],
      onUnauthorized: RequestHeader => Result
  )(action: A => EssentialAction): EssentialAction = {
    EssentialAction { request =>
      userinfo(request)
        .map { user => action(user)(request) }
        .getOrElse { Accumulator.done(onUnauthorized(request)) }
    }
  }
~~~

Well, this sounds strangely familiar doesn't it? :)

While it's not a big difference, delegating this important functionality to the (already tested) framework gives you some confidence the code works fine. And if there's any security bug found, you can simply update the framework version to get the fix for free.

#### Using Play custom Actions

There's still another improvement we can make. We can add this logic to a custom `Action`, which is what the [documentation recommends](https://www.playframework.com/documentation/2.8.x/ScalaActionsComposition#Authentication).

This requires a bit more understanding of the framework, but it's still fairly easy and can be accomplished with a few lines of code. First we need to create our new custom Action:

~~~scala
class UserRequest[A](val user: Option[User], request: Request[A]) 
     extends WrappedRequest[A](request)

class UserAction @Inject()
  (val parser: BodyParsers.Default)
  (implicit val executionContext: ExecutionContext)
    extends ActionBuilder[UserRequest, AnyContent] 
      with ActionTransformer[Request, UserRequest] {

        def transform[A](request: Request[A]) = Future.successful {
          val user = extractUser(request)
          new UserRequest(user, request)
        }
}
~~~

And now we can use it on our controller:

~~~scala
class HomeController @Inject()
  (val controllerComponents: ControllerComponents, val userAction: UserAction) 
    extends BaseController {

      def index() = Action { implicit request: Request[AnyContent] =>
        Ok(views.html.index())
      }

      def priv() = userAction { userReq: UserRequest[AnyContent] =>
        userReq.user.map(user => Ok(views.html.priv(user)))
          .getOrElse(Unauthorized(views.html.defaultpages.unauthorized()))
      }
}  
~~~

First note that we need to inject our new custom action on the controller class constructor. After that, its usage is very straightforward. Just like we did for our public page, but instead of creating an `Action`, we create our new `UserAction`, and we have instant access to the request user.

And finally, how can we test this? Well, are missing users and the login right?

### Login

Creating users has little importance on this session management tutorial so we won't go into much detail. We'd just need to have a page with a registration form, receive the data on the server side, and creating a new user on our database. If you are not sure on how to do it you can quickly see how to create a form on [Creating forms on your Play application]({{ site.url }}/blog/play-forms/) and how to store data persistently on [Play Framework and Slick example]({{ site.url }}/blog/play-slick-updated/).

The login is a bit more interesting. It's on the login where session management starts.

First we need a login endpoint. This is a simple endpoint that receives an username and password. This endpoint should **always be a POST endpoint and the user credentials should be sent in the POST body**. The POST data is encrypted. If you use a GET, you'll be exposing sensitive data to attackers. Thus said, we'll be using a GET **just for the sake of this example**

~~~
GET     /login     controllers.HomeController.login(username, password)
~~~

And the corresponding controller method:

~~~scala
  def login(username: String, pass: String) = Action { implicit request: Request[AnyContent] =>
    if (isValidLogin(username, pass)) {
      val token = SessionDAO.generateToken(username)

      Redirect(routes.HomeController.index()).withSession(request.session + ("sessionToken" -> token))
    } else {
      // we should redirect to login page
      Unauthorized(views.html.defaultpages.unauthorized()).withNewSession
    }
  }

  private def isValidLogin(username: String, password: String): Boolean = {
    UserDAO.getUser(username).exists(_.password == password)
  }
~~~

So the logic here is to first check if the given login is valid. Since we are storing passwords in plain text this is easy. Otherwise we'd need to hash the received password to check if they matched ([See how to storage passwords securely](https://www.sohamkamani.com/blog/2017/01/01/web-security-password-storage/)).

If the login is valid, we now create a new session token and respond to the request with a new session token stored in the session Cookie.

Don't forget that the token generation should use a random factor. This makes it hard for attackers to guess and helps avoiding duplicated tokens.

~~~scala
object SessionDAO {

  private val sessions= mutable.Map.empty[String, Session]

  def getSession(token: String): Option[Session] = {
    sessions.get(token)
  }

  def generateToken(username: String): String = {
    val token = s"$username-token-${UUID.randomUUID().toString}"
    sessions.put(token, Session(token, username, LocalDateTime.now().plusSeconds(30)))

    token
  }

}
~~~

### Working example

If you had any problems following the tutorial, make sure you look at the [working example repository](https://github.com/pedrorijo91/play-auth-example). Just follow the [README](https://github.com/pedrorijo91/play-auth-example/blob/master/README.md) file to run in your local environment, and play with it!

Leave a comment here or in the repository github page if you are stuck somehow.

### Conclusion

Authentication is a fundamental functionally for any web application. Each framework provides its own set of tools to make a developer life easier. In case of our Play Framework, it requires a minimal amount of work to implement any of the several alternative solutions we covered.

But it's not over yet. Now that you have users, you'll probably need to implement user permissions. Maybe you want admin users to access some special settings. Maybe you have a kind of users that play a Manager role. Or maybe you want to provide a more fined grained authorization mechanism. Authorization it's another different beast, a bit more complex than authentication. Nevertheless, don't be afraid. Start with a simple mechanism, and make it extensible. What may work for your initial application won't most likely work in the long term as you get more users and more features.

And please, don't forget to [properly store any password and tokens](https://www.sohamkamani.com/blog/2017/01/01/web-security-password-storage/) you may need to save.

### Useful resources

* [Play Actions Composition](https://www.playframework.com/documentation/2.8.x/ScalaActionsComposition#Authentication)
* [play-silhouette](https://github.com/mohiva/play-silhouette)
* [Play Framework and silhouette tutorial](https://blog.knoldus.com/play-framework-security-with-silhouette/)
* Another [Play Authentication tutorial](https://alvinalexander.com/scala/how-to-implement-user-authentication-play-framework-application/), by Alvin Alexander, and the [corresponding code example](https://alvinalexander.com/scala/play-framework-login-authentication-example-project/)
* [auth0](https://auth0.com/), Authentication as a service
