---
layout: post

title:  'Seven Languages in Seven Weeks - Book review'
date:   2015-05-21 15:15:00
image: Nerd-reading.jpg

tags: [books]
---
<span class="dropcap">R</span>ecently I've finished reading the book 'Languages in Seven Weeks'. It is part of [Seven in Seven series](https://pragprog.com/categories/7in7) and it approaches seven different programming languages: [Ruby](https://www.ruby-lang.org/en/), [IO](http://iolanguage.org/), [Prolog](http://www.swi-prolog.org/), [Scala](http://scala-lang.org/), [Erlang](http://www.erlang.org/), [Clojure](http://clojure.org/), and [Haskell](https://www.haskell.org/). 

The publisher, [The Pragmatic Bookshelf](https://pragprog.com/), introduces this book by making reference to a recommendation by [The Pragmatic Programmer](https://pragprog.com/the-pragmatic-programmer), which states "You should learn a programming language every year", and suggesting that this book will make you learn *seven* new languages in about two months.

<p align='center'><img src='/assets/img/7lang7weeks.jpg' alt='7lang7weeks' title='7 Languages in 7 Weeks cover' width='400px'/></p>

First you need to understand that you are obviously not going to learn a whole language with this book. It's impossible to master a programming language in a single week (as you probably already know). In one week you can get through the basics, you can even get to some advanced language-specific features if you are a experienced programmer, but there's a lot to explore until you master a language.

This book will present you seven distinct languages, its features, as well as its strengths and weaknesses, and will also make you reason about several language components and understand decisions behind each programming language. It will give you just a *"flavour"* of each language - more than an Hello World, but definitely not the whole of the language. It will present not only programming languages but also new paradigms like [Functional Programming](http://en.wikipedia.org/wiki/Functional_programming), [Logic Programming](http://en.wikipedia.org/wiki/Logic_programming), [Object Oriented Programming](http://en.wikipedia.org/wiki/Object-oriented_programming), and also combined paradigms like we see in Scala with Object Oriented and Functional Programming combined together.

Each chapter is dedicated to one language, and it's split into five sections:

* A brief introduction to the language and a very interesting interview with the language creator.
* 'Day 1' is all about syntax, REPL, and some very basic concepts. 
* 'Day 2' usually starts introducing some more complex language features like data structures, modules, classes and so on. 
* 'Day 3' presents you language advanced features in order to solve a proposed problem. The problem is chosen to show in which kind of problems the language provides an adequate set of features. For instance, in the Prolog chapter the final problem is a Sudoku solver due to Prolog efficiency in solving [CSPs](http://en.wikipedia.org/wiki/Constraint_satisfaction_problem), the Ruby chapter provides a problem focused on meta programming and dynamic typing, while Haskell problem is all about monads.
* A conclusion section, with a small resume of the language, its core strengths and weaknesses.

Despite all the amazing things this book accomplish there are some issues that could have been avoided in my opinion:

* Each language is compared to a fictional character, a decision that may have not been that nice. At least for me, some of the comparisons were not very obvious (some of them because I didn't knew the film/character), leading you to miss some information the author though it was sending in such an easy way.
* The name of the sections could be clearer about what will you learn in those pages. It could make easier to understand what I'm reading with a proper contextualisation given by the section title.
* As the end of the book was becoming closer, I started thinking that the book was focusing in the same features and problems again. Maybe because it were features I had already learn, but I started thinking that I was not learning anything new in some of the final sections.

In short, this book will not only make you know and understand language features that you probably don't mess with everyday in your current job, but it will also make you understand which programming language fits a specific problem. It has increased my desire in learning a new language and it probably will make me spend some time with Ruby and Clojure. Still, this book assumes that you will do much work by your own, so don't expect just to read your daily chapter and go to sleep. Try to search and learn by yourself, complementing the book and you will certainly enjoy those seven weeks!

Among the several new features, I really liked to learn about Erlang's '*let-it-crash*' philosophy for building fault-tolerant systems. It's something that I've never heard until now. I've been across with unification (Prolog), pattern matching (Scala and [ML](http://smlnj.org/)), meta-programming (Java), actors ([Scala Akka](http://akka.io/)), but let-it-crash philosophy is something really new for me and it surely opened my mind.

If you want to, take a look at my solutions and use them to compare with your own (or if you are just curious about how does it look each language) in my [github repo](https://github.com/pedrorijo91/7lang7weeks).