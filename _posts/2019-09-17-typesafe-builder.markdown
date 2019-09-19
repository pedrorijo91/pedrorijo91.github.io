---
layout: post

title: 'Type safe builder pattern'
date: 2019-09-17 18:00:00
description: 'How to create a type safe builder pattern'
image: ghost.png

tags: [tutorials, builder pattern, type safety, scala, java]
---

<span class="dropcap">A</span> powerful type system allows you to write code that is verified by the compiler to be correct to some extent before you ship it into production. 

I've defended [this]({{ site.url }}/blog/tuples-are-evil/) [idea]({{ site.url }}/blog/strings-as-types/) of making the compiler verify your code as much as possible before. 

How many of us had to debug a production issue because the code was using two function parameters in the wrong order with the same type (most likely Strings...) ? If the types were different, the compiler would have detected the problem before going into production.

In this blog post I want to talk about a recent situation I faced myself: a usage of the builder pattern that became too much error prone.

### The Builder pattern

The builder pattern is a very common design pattern when you have to deal with classes (or POJOs) containing too many fields/parameters. Sometimes you can avoid using it by simplify the code, grouping some of the parameters. But often you simply have to deal with a class holding 10 parameters. 

If you have been working more in Scala, you probably didn't see a lot of Builder pattern applications. But it's very common in Java. The lack of usage in Scala it's due to 3 existing language features that can replace builders usage: 

1. case classes, that make it really easy to create these grouping classes;
2. named parameters, to identify a parameter in a long list of arguments;
3. default arguments, that make obvious which are mandatory parameters and which are optional.

Nevertheless you may end up in a situation where you need to construct your object across different layers of your application (due to framework specifics or legacy reasons). In such cases a builder may be your best solution. So let's see the typical usage in java using a class that will hold information for your new fancy car:

```java
public class MyCarPOJO {

    private final String name;
    private final String manufacturer;
    private final String model;
    private final String serialNumber;
    private final String license;
    private final Date licenseDate;
    private final List<String> extras;
    private final int currentKilometers;
    private final String carStandName;
    private final String sellerName;

    public MyCarPOJO(String name, String manufacturer, String model,
                     String serialNumber, String license, Date licenseDate,
                     List<String> extras, int currentKilometers, 
                     String carStandName, String sellerName
    ) {
        this.name = name;
        this.manufacturer = manufacturer;
        this.model = model;
        this.serialNumber = serialNumber;
        this.license = license;
        this.licenseDate = licenseDate;
        this.extras = extras;
        this.currentKilometers = currentKilometers;
        this.carStandName = carStandName;
        this.sellerName = sellerName;
    }
}
```

And every time you need to create a new instance you'd do something like this:

```java
new MyCarPOJO("Herbie", "Volkswagen", "Fusca 1963", "A13NB392H", "007-Lisbon", 
new Date(), new ArrayList<String>(), 20, "FROM FACTORY", "Volkswagen");
```

I think we all agree the code above needs some improvements, right? With so many parameters you end up not even knowing what each parameters means at some point. The builder pattern can help a lot increasing the readability of the code:

```java
// note that some Builder definitions are nested inside the real class, 
// and the constructor may not be public to enforce the usage of the builder.
// I do agree with those solutions, but for the sake of simplicity I 
// decided to follow this design solution.
public class MyCarPOJOBuilder {

    private String name;
    private String manufacturer;
    private String model;
    private String serialNumber;
    private String license;
    private Date licenseDate;
    private List<String> extras;
    private int currentKilometers;
    private String carStandName;
    private String sellerName;

    public MyCarPOJOBuilder withName(String name) {
        this.name = name;
        return this;
    }

    public MyCarPOJOBuilder withManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
        return this;
    }

    public MyCarPOJOBuilder withModel(String model) {
        this.model = model;
        return this;
    }

    public MyCarPOJOBuilder withSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
        return this;
    }

    public MyCarPOJOBuilder withLicense(String license) {
        this.license = license;
        return this;
    }

    public MyCarPOJOBuilder withLicenseDate(Date licenseDate) {
        this.licenseDate = licenseDate;
        return this;
    }

    public MyCarPOJOBuilder withExtras(List<String> extras) {
        this.extras = extras;
        return this;
    }

    public MyCarPOJOBuilder withCurrentKilometers(int currentKilometers) {
        this.currentKilometers = currentKilometers;
        return this;
    }

    public MyCarPOJOBuilder withCarStandName(String carStandName) {
        this.carStandName = carStandName;
        return this;
    }

    public MyCarPOJOBuilder withSellerName(String sellerName) {
        this.sellerName = sellerName;
        return this;
    }

    public MyCarPOJO build() {
        return new MyCarPOJO(name, manufacturer, model, serialNumber, license, licenseDate, extras, currentKilometers, carStandName, sellerName);
    }
}
```

Now it becomes much more readable to create new instances:

```java
 MyCarPOJO myCar = new MyCarPOJOBuilder()
                .withName("Herbie")
                .withManufacturer("Volkswagen")
                .withModel("Fusca 1963")
                .withSerialNumber("A13NB392H")
                .withLicense("007-Lisbon")
                .withLicenseDate(new Date())
                .withExtras(new ArrayList<String>())
                .withCurrentKilometers(20)
                .withCarStandName("FROM FACTORY")
                .withSellerName("Volkswagen")
                .build();
```

Ok, this surely looks way better. But there's still a slight problem...

### Incomplete builders

Until now our constructor doesn't do any verification. But imagine that the `CarStandName` and `SellerName` are optional, which means we could remove the last two setters of our builder chain for cases where it would make sense - for instance, when the car is bought directly to the constructor, or when bought from your neighbour. 

If you are in a bigger codebase you'll quickly learn that it is really hard to find out which parameters are optional and which aren't. If you happen to build the POJO without setting the mandatory fields, you'll get a runtime error while building the object, which is not good!

The most common solution to help developers understand the mandatory parameters is to put those in the builder constructor instead of having an empty constructor:

```java
// instead of new MyCarPOJOBuilder().withName("name") etc...
new MyCarPOJOBuilder(
  "Herbie", "Volkswagen", "Fusca 1963", "A13NB392H", 
  "007-Lisbon", new Date(), new ArrayList<String>(), 20
).withCarStandName("FROM FACTORY")
  .withSellerName("Volkswagen")
  .build();
```

But if we have too many mandatory params we are back to the start with a ton of parameters on the constructor.

### Phantom Types 👻

What we'd like to have is to have the compiler only allowing to call the `.build()` method upon having all the mandatory parameters filled.

In Scala this can be achieved by using **phantom types**. A phantom type is never instantiated, is an abstract type used to enforce type constraints. These types exist at compile time, but are erased at runtime.

Let's start with a simpler example before we use phantom types in our builder example:

Imagine that we have a `TV`, which you obviously want to turn on and off. But it doesn't make sense to turn off a television that is already off right?

```scala
trait TvState

case object TvOn extends TvState
case object TvOff extends TvState

case class Tv(state: TvState) {

  def turnOn(): Tv = if(state == TvOff) {
      Tv(TvOn)
  } else {
      throw new IllegalStateException("You cannot turn on an already on TV")
  }

def turnOff(): Tv = if(state == TvOn) {
      Tv(TvOff)
  } else {
      throw new IllegalStateException("You cannot turn off an already off TV")
  }
}
```

As you can see, we are throwing exceptions at runtime if we call the wrong method on the wrong state.

```scala
Tv(TvOn)
    .turnOff()
    .turnOff() // will throw an exception
```

Phantom types are very useful here. They can help us encode the state constraints in the type system:

```scala
object Tv {
  sealed trait State
  sealed trait On extends State
  sealed trait Off extends State
}

case class Tv[S <: Tv.State](){
  def turnOn(implicit ev: S =:= Tv.Off) = Tv[Tv.On]()
  def turnOff(implicit ev: S =:= Tv.On) = Tv[Tv.Off]()
}
```

The code became much cleaner because phantom types allowed us to remove the state check on the methods (if you are new to Scala implicit evidence parameters see the resources section at the bottom).
And if you now try to do the same mistake again, it won't compile:

```scala
Tv[Tv.On]()
  .turnOff
  .turnOff // compile error: Cannot prove that example.Tv.Off =:= example.Tv.On
```

### Type-safe Builder

Now that we saw how we can use phantom types, it's time to use them to create our type safe Builder. Remember our initial goal: we only want to allow to build the object if all the mandatory parameters are set, and we want to detect it at compile time.

```scala
sealed trait CarInfo
object CarInfo {
    sealed trait Empty extends CarInfo
    sealed trait Name extends CarInfo
    sealed trait Manufacturer extends CarInfo
    sealed trait Model extends CarInfo
    sealed trait SerialNumber extends CarInfo
    sealed trait License extends CarInfo
    sealed trait LicenseDate extends CarInfo
    sealed trait Extras extends CarInfo
    sealed trait CurrentKm extends CarInfo

    type MandatoryInfo = Empty with Name with Manufacturer with Model 
        with SerialNumber with License with LicenseDate 
        with Extras with CurrentKm
}

case class MyCarPOJOBuilder[I <: CarInfo](
    name: String = "",  manufacturer: String = "", model: String = "",
    serialNbr: String = "", license: String = "", licenseDate: Date = new Date(),
    extras: List[String] = List.empty, currentKm: Int = 0,
    carStandName: String = "N/A", sellerName: String = "N/A") {

  def withName(name: String): MyCarPOJOBuilder[I with CarInfo.Name] = 
    this.copy(name = name)
  
  def withManufacturer(manufacturer: String): MyCarPOJOBuilder[I with CarInfo.Manufacturer] = 
    this.copy(manufacturer = manufacturer)
  
  def withModel(model: String): MyCarPOJOBuilder[I with CarInfo.Model] = 
    this.copy(model = model)
  
  def withSerialNumber(serialNbr: String): MyCarPOJOBuilder[I with CarInfo.SerialNumber] = 
    this.copy(serialNbr = serialNbr)
  
  def withLicense(license: String): MyCarPOJOBuilder[I with CarInfo.License] = 
    this.copy(license = license)
  
  def withLicenseDate(licenseDate: Date): MyCarPOJOBuilder[I with CarInfo.LicenseDate] = 
    this.copy(licenseDate = licenseDate)
  
  def withExtras(extras: List[String]): MyCarPOJOBuilder[I with CarInfo.Extras] = 
    this.copy(extras = extras)
  
  def withCurrentKm(currentKm: Int): MyCarPOJOBuilder[I with CarInfo.CurrentKm] = 
    this.copy(currentKm = currentKm)

  // Optional parameters
  def withCarStandName(carStandName: String): MyCarPOJOBuilder[I] = 
    this.copy(carStandName = carStandName)

  def withSellerName(sellerName: String): MyCarPOJOBuilder[I] = t
    his.copy(sellerName = sellerName)

  def build(implicit ev: I =:= CarInfo.MandatoryInfo): MyCarPOJO = 
    MyCarPOJO(name, manufacturer, model, serialNbr, 
        license, licenseDate, extras, currentKm, 
        carStandName, sellerName)
}

case class MyCarPOJO(name: String,  manufacturer: String, model: String,
                     serialNbr: String, license: String, licenseDate: Date,
                     extras: List[String], currentKm: Int,
                     carStandName: String, sellerName: String)
```

Using the code above we are able to create a builder instance that ensures no incomplete POJO is created, verified by the compiler instead of getting runtime errors. Nevertheless this approach is not very common in Scala because `case class`, `named parameters`, and `default arguments` produce solutions with much less boilerplate. Unfortunately Java doesn't have such language features, nor a type system as powerful as Scala that would allows us to create the builder pattern safely, but....

#### Java type-safe builder pattern

When trying to find a solution to Java I came across with [jilt](https://github.com/skinny85/jilt), a Java annotation processor used for automatically generating type-safe Builder pattern implementations.

You can see an extensive description on the [author's blog post](https://www.endoflineblog.com/type-safe-builder-pattern-in-java-and-the-jilt-library). I confess that I haven't tried it yet, but it seems to be very helpful. 

The high level solution for the optional parameters problem is to use several `interfaces` chained:

```java
public interface UserBuilders {
    interface Email {
        FirstName email(String email);
    }

    interface FirstName {
        LastName firstName(String firstName);
    }

    interface LastName {
        Build lastName(String lastName);
    }

    interface Build {
        Build username(String username);
        Build displayName(String displayName);
        User build();
    }
}
```

You can see this solution requires a specific order - you can not fill first the last name, and then the email, and so on. For most of the use cases this will not be a blocker, but it's not as robust as the Scala solution. Nevertheless you should totally have a look at it :)

#### Final Remarks

As your codebase grows you'll face many pains. Many of those can be solved by properly using the type system. 

The Builder pattern is just another example. You probably can find a few more examples in your daily job.  

Obviously, using the type system is not the only solution - proper tests, and documentation (code comments anyone?) can be the best solution sometimes - but it's easy to forget to change some tests upon a code change. On the other hand, the compiler always checks everything you ask him to do!

#### Resources

* [Classic Java Builder pattern](https://www.javaworld.com/article/2074938/too-many-parameters-in-java-methods-part-3-builder-pattern.html) 
* [What is a Scala evidence parameter?](https://stackoverflow.com/questions/34499663/what-precisely-is-a-scala-evidence-parameter)
* [Java Builder pattern with Jilt library](https://www.endoflineblog.com/type-safe-builder-pattern-in-java-and-the-jilt-library)
