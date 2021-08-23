---
layout: post

title: 'Using Java Service Loader'
date: 2021-08-23 20:00:00
description: 'Using Java Service Loader to allow pluggable code'

tags: [java, service loader, plugin, tutorial]
---

Some time ago I was working on a Java project which needed to allow other developers to bind their implementations to the project. Something like a plugin system which we see in many other software packages. We needed to define an interface, some default implementations but allowing other developers to add their implementations. And we needed to load these random plugins at runtime because our application wasn't open-source, and we were not bundling their code in our codebase.

If you have never done something like this, you are lucky. Today I want to show how Java has built-in capabilities to create a pluggable application using the [Service Loader](https://docs.oracle.com/javase/8/docs/api/java/util/ServiceLoader.html). This is a very simple but powerful mechanism provided by the language to enhance the extensibility of our applications.

### Java Service Loader requirements

In order to make use of this mechanism, we need a few things:

* We need to define the interface that the plugin needs to implement (also called Service interface)
* Our application must load the available services at runtime using the [ServiceLoader#load](https://docs.oracle.com/javase/8/docs/api/java/util/ServiceLoader.html#load-java.lang.Class-) method
* Developers wanting to create a plugin must create a class implementing the interface we defined before (a Service)
* Developers also need to add a specific file in the resource directory META-INF/services of their plugin
* Finally, we just need to create a JAR file from our plugin code and add it to the application classpath.

### Walkthrough example

Let's implement our example. First, we need to have [maven](https://maven.apache.org/) installed. An easy way is just to use [homebrew](https://brew.sh/) and run: 

~~~bash
$ brew install maven
~~~

For this tutorial we'll be using java version 8:

~~~bash
$ java -version
openjdk version "1.8.0_282"
OpenJDK Runtime Environment (AdoptOpenJDK)(build 1.8.0_282-b08)
OpenJDK 64-Bit Server VM (AdoptOpenJDK)(build 25.282-b08, mixed mode)
~~~

#### Setting up our example

If you are not familiar with maven, it's a widely used java build tool. Similar to [SBT](https://www.scala-sbt.org/), it eases the dependency management and building of our projects.

Now we are going to make use of [maven archetypes](https://maven.apache.org/guides/introduction/introduction-to-archetypes.html) to bootstrap our project. Archetypes allow us to create a project from a given template:

~~~bash
$ mvn archetype:generate -DgroupId=com.pedrorijo91 -DartifactId=java-service-loader -DarchetypeArtifactId=maven-archetype-quickstart -DarchetypeVersion=1.4 -DinteractiveMode=false
~~~

At this moment we should have something like this: [source code](https://github.com/pedrorijo91/java-service-loader-example/tree/4eac8fa64452a73c139bc854f566ea0c3eebbf45).

#### Defining the service interface

Now that we have our skeleton ready we can start hacking our way to our pluggable application.
The first thing we need is to define the plugin interface. Let's call it `MyService` and add a few methods:

~~~java
package com.pedrorijo91;

public interface MyService {

    String getName();

    int doManyThings(int limit);
}
~~~

#### Adding a default implementation

A default implementation is always handy right? Let's create one!

~~~java
package com.pedrorijo91;

public class DummyService implements MyService {

    @Override
    public String getName() {
        return "dummy";
    }

    @Override
    public int doManyThings(int limit) {
        return 0;
    }
}
~~~

#### Loading service implementations

Now that we've defined a default implementation, we want to try and use it. As mentioned before, we must use the [ServiceLoader#load](https://docs.oracle.com/javase/8/docs/api/java/util/ServiceLoader.html#load-java.lang.Class-) method to get an instance of a `ServiceLoader`:

~~~java
ServiceLoader<MyService> serviceLoader = ServiceLoader.load(MyService.class);
~~~

But how do get access to the services found? The trick here is that `ServiceLoader` implements `Iterable`, so we can just iterate on it. Let's use the `App#main` method for this:

~~~java
package com.pedrorijo91;

import java.util.*;

public class App {
    public static void main( String[] args ) {
        ServiceLoader<MyService> serviceLoader = ServiceLoader.load(MyService.class);

        Map<String, MyService> services = new HashMap<>();
        for (MyService service : serviceLoader) {
            System.out.println("I've found a service called '" + service.getName() + "' !");
            services.put(service.getName(), service);
        }

        System.out.println("Found " + services.size() + " services!");
    }
}
~~~

In our example, we are using the *name* as a key to lookup services just to make it easier for future usages. In order to run it we first need to compile the project:

~~~bash
$ mvn package
~~~

and now we can run it:

~~~bash
$ java -cp target/java-service-loader-1.0-SNAPSHOT.jar com.pedrorijo91.App
Found 0 services!
~~~

Ups! No services found? Why?

#### Declaring our service

We forgot one detail: we need to declare our service on a specific file so that it gets identified as a *Service* by *ServiceLoader*. 

According to the [official javadoc](https://docs.oracle.com/javase/8/docs/api/java/util/ServiceLoader.html):

> A service provider is identified by placing a provider-configuration file in the resource directory META-INF/services. The file's name is the fully-qualified binary name of the service's type. The file contains a list of fully-qualified binary names of concrete provider classes, one per line

This translates roughly to: we need to create a `src/main/resources/META-INF/services/com.pedrorijo91.MyService` file with the following contents:

~~~bash
$ cat src/main/resources/META-INF/services/com.pedrorijo91.MyService
com.pedrorijo91.DummyService
~~~

And now everything works just fine:

~~~bash
$ mvn package && java -cp target/java-service-loader-1.0-SNAPSHOT.jar com.pedrorijo91.App
[INFO] Scanning for projects...
[INFO]
[INFO] ----------------< com.pedrorijo91:java-service-loader >-----------------
[INFO] Building java-service-loader 1.0-SNAPSHOT
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- maven-resources-plugin:3.0.2:resources (default-resources) @ java-service-loader ---
[INFO] Using 'UTF-8' encoding to copy filtered resources.
[INFO] Copying 1 resource
[INFO]
[INFO] --- maven-compiler-plugin:3.8.0:compile (default-compile) @ java-service-loader ---
[INFO] Nothing to compile - all classes are up to date
[INFO]
[INFO] --- maven-resources-plugin:3.0.2:testResources (default-testResources) @ java-service-loader ---
[INFO] Using 'UTF-8' encoding to copy filtered resources.
[INFO]
[INFO] --- maven-compiler-plugin:3.8.0:testCompile (default-testCompile) @ java-service-loader ---
[INFO] Nothing to compile - all classes are up to date
[INFO]
[INFO] --- maven-surefire-plugin:2.22.1:test (default-test) @ java-service-loader ---
[INFO]
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.pedrorijo91.AppTest
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.023 s - in com.pedrorijo91.AppTest
[INFO]
[INFO] Results:
[INFO]
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO]
[INFO] --- maven-jar-plugin:3.0.2:jar (default-jar) @ java-service-loader ---
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  1.330 s
[INFO] Finished at: 2021-08-23T20:22:13+01:00
[INFO] ------------------------------------------------------------------------

I've found a service called 'dummy' !
Found 1 services!
~~~

### Automating service declaration

We've seen how to explore java Service Loader to create a plugin system. But in my experience, the missing `META-INF/service` or small typos are a very common source of bugs. It's a very manual and error-prone step. Thankfully Google created the [AutoService project](https://github.com/google/auto/tree/master/service) that automates this step.

To use it, we need to add the correct dependency:

~~~xml
  <dependencies>
    <dependency>
      <groupId>com.google.auto.service</groupId>
      <artifactId>auto-service</artifactId>
      <version>1.0</version>
    </dependency>
  </dependencies>
~~~

Now we can delete the `src/main/resources/META-INF/services/com.pedrorijo91.MyService` file, and add an annotation to our `DummyService`:

~~~java
package com.pedrorijo91;

import com.google.auto.service.AutoService;

@AutoService(MyService.class)
public class DummyService implements MyService {

    @Override
    public String getName() {
        return "dummy";
    }

    @Override
    public int doManyThings(int limit) {
        return 0;
    }
}
~~~

And the file gets generated automatically without any manual work:

~~~bash
$ mvn package && java -cp target/java-service-loader-1.0-SNAPSHOT.jar com.pedrorijo91.App
[INFO] Scanning for projects...
[INFO]
[INFO] ----------------< com.pedrorijo91:java-service-loader >-----------------
[INFO] Building java-service-loader 1.0-SNAPSHOT
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- maven-resources-plugin:3.0.2:resources (default-resources) @ java-service-loader ---
[INFO] Using 'UTF-8' encoding to copy filtered resources.
[INFO] Copying 0 resource
[INFO]
[INFO] --- maven-compiler-plugin:3.8.0:compile (default-compile) @ java-service-loader ---
[INFO] Nothing to compile - all classes are up to date
[INFO]
[INFO] --- maven-resources-plugin:3.0.2:testResources (default-testResources) @ java-service-loader ---
[INFO] Using 'UTF-8' encoding to copy filtered resources.
[INFO] skip non existing resourceDirectory /Users/pedro.rijo/repos/personal/java-service-loader-example/java-service-loader/src/test/resources
[INFO]
[INFO] --- maven-compiler-plugin:3.8.0:testCompile (default-testCompile) @ java-service-loader ---
[INFO] Nothing to compile - all classes are up to date
[INFO]
[INFO] --- maven-surefire-plugin:2.22.1:test (default-test) @ java-service-loader ---
[INFO]
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.pedrorijo91.AppTest
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.026 s - in com.pedrorijo91.AppTest
[INFO]
[INFO] Results:
[INFO]
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO]
[INFO] --- maven-jar-plugin:3.0.2:jar (default-jar) @ java-service-loader ---
[INFO] Building jar: /Users/pedro.rijo/repos/personal/java-service-loader-example/java-service-loader/target/java-service-loader-1.0-SNAPSHOT.jar
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  1.717 s
[INFO] Finished at: 2021-08-23T21:05:51+01:00
[INFO] ------------------------------------------------------------------------

I've found a service called 'dummy' !
Found 1 services!
~~~

### Conclusion

Creating a pluggable system may sound like a very complex task, but the Java ServiceLoader shows how easy it can be for simpler use cases. Just give it a try!

In case you had any error, here's the [GitHub repository with the code example](https://github.com/pedrorijo91/java-service-loader-example). 

