---
layout: post

title:  'EuroMillions -  European lottery'
date:   2015-08-02 22:00:00
image: euromillions-logo.jpg
image_alt: 'Euromillions game logo'

tags: [projects]
---
<span class="dropcap">D</span>o you play lucky games? Maybe sometimes you go the casino for some time in the blackjack? Or maybe you prefer the roulette? Or maybe you are a little bit more old school and you prefer the lottery?
If that's the case, and if you live in Europe, then there's most likely that you know [EuroMillions](http://www.euro-millions.com/).

EuroMillions is a European lottery that takes place on Tuesday and Friday evenings. Whereas national lotteries are generally limited to the residents of one particular country, the EuroMillions lottery pools the stakes to create huge jackpots and prizes. As the main prize pool can roll over to the next draw if there is no jackpot winner, prizes can, after a few weeks without a winner, be as high as €190 million.

<p align='center'><img src='/assets/img/euromillions-portugal-ticket.jpg' alt='EuroMillions Portuguese ticket' title='EuroMillions Portuguese ticket' width='500px'/></p>

### Beting
A simple bet is fairly trivial, just choose:

* 5 numbers, from 1 to 50;
* 2 other numbers, called stars, from 1 to 11.

and that's all.
There is also the possibility of making multiple bets (choosing more than 5 numbers and/or 2 stars), but that's not relevant for now.

### How about the prizes?
The prize list is detailed [here](http://www.euro-millions.com/odds-of-winning) and in the table below, but in short: you have to guess at least 2 numbers, or 3 numbers and stars to be a winner. It seems easy right?

<p align='center'><img src='/assets/img/euromillions-prizeList.png' alt='EuroMillions prize list' title='EuroMillions prize list' width='400px'/></p>

### Why this project?

I started to play regularly with some friends recently, and we started to felt some problems:

* We never knew which numbers and stars to choose. So we played random tickets.
* After a while we wanted to play semi-random. We had some mandatory numbers/stars, but we wanted the rest to be random.
* The next step was to get a fixed ticket. And it would be awesome to be able to check the prize without much effort. And we found out a [mobile app](https://itunes.apple.com/app/euro-millions/id318331476) for that.
* But now we have a set of tickets we play each week. And the app only checks for one ticket at the time. So, if we want to check all the tickets, we would need to introduce one ticket at a time...


So, how to solve it? Make an [EuroMillions project](https://github.com/pedrorijo91/euromillions-generator) able to solve all these problems ! Actually, all these problems could be avoided if we just played online, but we don't like it a lot :)


<p align='center'><img src='/assets/img/euromillions-github.png' alt='euromillions repository' title='euromillions repository' width='800px'/></p>

### The project

This project is written in [Scala](http://scala-lang.org/), and it uses [sbt](http://www.scala-sbt.org/) for dependency management and build tool.

The simplest task is to generate a random ticket. This can be accomplished through a simple command that will print to the terminal the generated numbers and stars:

`sbt run`

So, the first problem is solved, generate a random bet. The next feature is to provide some *lucky numbers/stars* upon ticket generation. So, if you want a semi-random ticket you just need to pass those numbers in the command line:

`sbt "run -n 7 -n 13 -s 10`"

or

`sbt "run --number 7 --number 13 --star 10`"

would produce a ticket containing numbers 7 and 13, along with three other random numbers, and 10, plus another random number as stars. And yeah, I know the syntax is a bit ugly and it would be much better to run something like

`sbt "run -n 1 2 3"`

or

`sbt "run -n 1,2,3"`

but this is the syntax [Argot](https://github.com/bmc/argot) provides for lists. If anyone knows any command-line parser for Scala more user-friendly just let me know.

### Draw results

In order to solve the last two problems another option has been added:

`sbt "run -p"`

or

`sbt "run --prize"`

This option requires a configuration file. The file must contain an [mashape API key](https://www.mashape.com/) to fetch data from the [public endpoint](https://market.mashape.com/creativesolutions/euromillions#findlast). See the [example](https://github.com/pedrorijo91/euromillions-generator/blob/master/src/main/resources/application.conf.example) for more details on expected format.

The configuration file is parsed with [typesafehub/config](https://github.com/typesafehub/config) using [HOCON](https://github.com/typesafehub/config/blob/master/HOCON.md) format. It is recommended to name the file as `src/main/resources/application.conf`. Other names/directories may be allowed. Check the [typesafe/config documentation](https://github.com/typesafehub/config#standard-behavior) for more details.

Results will be printed to standard output.

### Have I won?

If you specify your ticket(s), then your prize(s) will be automatically checked and the result presented. See the [example](https://github.com/pedrorijo91/euromillions-generator/blob/master/src/main/resources/application.conf.example) for more details on how to include your ticket(s) on the configurations file.

And voilà, there you have it, a fully functional EuroMillions helper command line application !

A detailed explanation about the project is available in the [README](https://github.com/pedrorijo91/euromillions-generator/blob/master/README.md) file of the repository.

Just get in touch if you win some big prize with this project !

<p align='center'>:grin:</p>

Now, maybe the next step is to make a deployable webapp instead of just a command line interface...

<p align='center'><img src='/assets/img/euromillions-winner.jpg' alt='EuroMillions winners' title='EuroMillions winners' width='400px'/></p>
