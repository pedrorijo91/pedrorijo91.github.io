---
layout: post

title:  'Creating forms on your Play application - Part 2'
date:   2018-02-20 21:00:00
description: 'Advanced HTML forms in Play framework.'
image:  scala-logo.png
image_alt: 'Scala language logo'

tags: [scala, play, forms]
---

<span class="dropcap">I</span>n the [last post]({{ site.url }}/blog/play-forms/) we saw how to get started using HTML forms in Play applications. We covered how to render forms using Play helpers, how to validate some inputs, and how does Play deals with those input errors.

On this second part, we are going to see some more advanced topics: how to do nested forms, how to add your own class to your form, how to protect your forms from some kind of attacks, and the **most important**: styling your forms!

### Nested forms

In many applications you end up with a form which can be grouped into smaller parts. A common use case is when you ask for a set of informations about an address (country, city, street, building, etc). If you plan to model that information in nested case classes, it's very easy to create a form for that:

~~~scala
case class Address(country: String, city: String, street: String, buildingNbr: Int)
case class Order(clientName: String, address: Address)
object Order {
  val form: Form[Order] = Form(
    mapping(
      "clientName" -> text,
      "address" -> mapping(
        "country" -> text,
        "city" -> text,
        "street" -> text,
        "buildingNbr" -> number
      )(Address.apply)(Address.unapply)
    )(Order.apply)(Order.unapply)
  )
}
~~~

and the corresponding form template:

~~~scala
@form(action = routes.AdvancedController.nestedFormPost()) {
    @inputText(userForm("clientName"))
    @inputText(userForm("address.country"))
    @inputText(userForm("address.city"))
    @inputText(userForm("address.street"))
    @inputText(userForm("address.buildingNbr"))

    <input type="submit" value="Submit">
}
~~~

Note that we called the nested properties *"address.field"*. That's a requirement to use nested forms this way.

### Custom bindings

At this point you should be able to cover most of the needs you have for your html forms. But what can you do if you are depending of an external library and you need to ask that information to the user? Is there a better solution other than create yet another DTO to hold the information before instantiate the external class with the exact same values?

> All problems in computer science can be solved by another level of indirection.

Well, there is, and it's called a custom binder. So imagine you have a case class which holds an [URL](https://docs.oracle.com/javase/7/docs/api/java/net/URL.html). All you need is to define an `implicit Formatter[URL]` with a *bind* and *unbind* methods:

~~~scala
case class FormWithURL(name: String, url: URL)
object FormWithURL {

  import play.api.data.format.Formatter
  import play.api.data.format.Formats._

  implicit object UrlFormatter extends Formatter[URL] {
    override val format = Some(("format.url", Nil))
    override def bind(key: String, data: Map[String, String]) = parsing(new URL(_), "error.url", Seq.empty)(key, data)
    override def unbind(key: String, value: URL) = Map(key -> value.toString)
  }

  val form = Form(
    mapping(
      "name" -> text,
      "url" ->  of[URL]
    )(FormWithURL.apply)(FormWithURL.unapply)
  )
}
~~~

### Make your forms beautiful

Finally, the moment you all have been waiting for: how can you make your forms gorgeous? Do you have to do plain HTML instead of using Play helpers to generate the forms?

We are lucky: Play Framework allow us to add extra information to the input field being rendered. These extra informations should be passed as a tuple with scala symbols: `symbol -> value`. If you are not familiar with Scala symbols you [should have a quick look into it](http://daily-scala.blogspot.pt/2010/01/symbols.html).

There are two types of symbols you can pass:

* special control symbols, starting with `_` (underscore);
* any other named symbol.

For the control symbols there a few available:

* `'_label -> "Custom label"`, which allows you to specify a custom label on your input.
* `'_id -> "myCustomId"`, which allows you to specify the id of the input.
* `'_help -> "Custom help"`, that allows you to add some helper text.
* `'_showConstraints -> false`, that enables you to omit the constraints shown in the form.
* `'_error -> Some(FormError("error-key", Seq("error message"), Seq.empty))`, to specify some custom error.
* `'_showErrors -> false`, to hide errors from users.

Let's see how we can use them and what happens:

~~~scala
@import helper._

@(userForm: Form[BasicForm])(implicit messages: Messages)

@main("Scala Play forms tutorial") {
    <h1>Scala Play forms tutorial</h1>

    @form(action = routes.BasicController.simpleFormPost()) {
        @inputText(userForm("name"),
            '_label -> "Custom label",
            '_id -> "myCustomId",
            '_help -> "Custom help",
            '_error -> Some(FormError("error-key", Seq("My custom error message"), Seq.empty)),
            '_showErrors -> true,
            'class -> "col-md-6",
            Symbol("data-lol") -> "lol")

        @inputText(userForm("age"),
           '_showConstraints -> false)

        <input type="submit" value="Submit">
    }
}
~~~

and this produces the following:

<p align='center'><img class='border' src='/assets/img/play-form-006.png' alt='Styled form using Play framework' title='Styled form using Play framework' width='3000px'/></p>

You can compare it with [the first post on play framework forms]({{ site.url }}/blog/play-forms/#getting-started).

This example contains all the possibilities I have explored so far:

* we specified a custom label;
* we specified a custom id;
* we customized the help text;
* we have enforced a custom error to show up;
* we specified a custom class (note that the class is not a special control symbol, so it doesn't take the underscore at the start);
* we specified a [data attribute](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) (due to symbol constructor limitation we need to use the alternative constructor to be able to use the `-` char);
* we omitted the constraints.

Now you have the possibility to completely stylish your forms!

### I want security (CSRF)

A very important area you should never overlook is security. A very easy attack is [Cross-Site Request Forgery (CSRF)](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)). It is an attack that tricks an user into executing unwanted actions on an application using the current session.

Fortunately for us, it is very easy to prevent this kind of attack. I recommend you to read the official documentation on how to [Protect against Cross Site Request Forgery](https://www.playframework.com/documentation/2.6.x/ScalaCsrf#Protecting-against-Cross-Site-Request-Forgery), but basically you use a CSRF token on your requests. This token gets placed either in the query string or body of every form submitted, and also gets placed in the user’s session. Play then verifies that both tokens are present and match.

### Conclusion

After the [initial steps into form usage in the Play Framework]({{ site.url }}/blog/play-forms) you should now be able to explore more advanced options provided by the Play Framework and its capabilities for dealing with HTML forms.

There are a few cases not very well documented and this series of blog posts try to help anyone who has to deal with some very common use cases, and I hope this may reveal useful for someone.

### Useful resources

If you are looking to start from the basics, here's the previous post: [Basic HTML forms in Play Framework]({{ site.url }}/blog/play-forms/).

If you want to see the working code, it's also available at [GitHub](https://github.com/pedrorijo91/scala-play-forms).
