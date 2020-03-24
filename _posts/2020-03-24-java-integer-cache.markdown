---
layout: post

title: 'When 1 + 1 = 3'
date: 2020-03-24 18:00:00
description: 'How to make Java saying 1 + 1 = 3 by messing with Integer cache'
image: mindblown.jpg

tags: [java]
---

<span class="dropcap">I</span> was looking at some old gists of mine yesterday and I found one that I thought it was worth sharing. It's not something new for anyone who has been using Java for some time probably, but it's one of those things newcomers get amazed every time. 

For this we are going to use the 'new' java REPL (you need java 9 or newer) as it's easier than setting up a full maven/gradle project.

So, in what consists this 'trick' we are talking about? You are probably familiar with the expression `1 + 1 = 2` right? Which is usually applied to explain simple situations.

Well, Java says otherwise...

```
jshell> 1 + 1
$6 ==> 3
```

And how is this possible? To understand how this works, we need to get a bit into the internals of the `Integer` class.

The current `Integer` class implementation contains a cache, which was introduced to save memory and to improve performance for Integer type objects handlings. Integer instances are cached and reused. The blog [Javapapers has an excellent article on the topic](https://javapapers.com/java/java-integer-cache/). It's a quick read, and it will explain `IntegerCache` much better than me :)

Now back to our little dark magic. The trick here is to mess with the IntegerCache through reflection. By changing the cache value for a given `int`, you will be able to do all sort of hacks.

```
$ jshell
|  Welcome to JShell -- Version 11.0.2
|  For an introduction type: /help intro

jshell> import java.lang.reflect.Field;

jshell> Field value = Integer.class.getDeclaredField("value");
value ==> private final int java.lang.Integer.value

jshell> value.setAccessible(true);

jshell> value.set(2, 3);

jshell> 1 + 1
$6 ==> 3
```

And voilá, you are now a professional hacker. But...

```
jshell> value.set(129, 130);

jshell> 129
$8 ==> 129
```

Why is 129 returning 129 instead of 130? If you read the article I mentioned, there's one important detail:

> The Javadoc comment clearly states that this class is for cache and to support the autoboxing of values between 128 and 127. 

So this trick only works for smaller numbers (actually, the high value of 127 can be modified by using a VM argument `-XX:AutoBoxCacheMax=<size>`.)

Some other java classes also allow you to hack them. Just have fun exploring :)

```
jshell> Field v = String.class.getDeclaredField("value");
v ==> private final byte[] java.lang.String.value

jshell> v.setAccessible(true);

jshell> String s = "hello!";
s ==>

jshell> v.set(s, "cheers" .getBytes());

jshell> System.out.println(s);
cheers
```

### Other articles

* [https://javapapers.com/java/java-integer-cache/](https://javapapers.com/java/java-integer-cache/)
* [https://dzone.com/articles/java-integer-cache-why-integervalueof127-integerva](https://dzone.com/articles/java-integer-cache-why-integervalueof127-integerva)
* [https://dzone.com/articles/the-internal-cache-of-integers](https://dzone.com/articles/the-internal-cache-of-integers)
* [https://stackoverflow.com/questions/3131136/integers-caching-in-java](https://stackoverflow.com/questions/3131136/integers-caching-in-java)
* [https://javax0.wordpress.com/2017/05/03/hacking-the-integercache-in-java-9/](https://javax0.wordpress.com/2017/05/03/hacking-the-integercache-in-java-9/)