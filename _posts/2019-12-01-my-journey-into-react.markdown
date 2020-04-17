---
layout: post

title: 'My journey into React'
date: 2019-12-01 15:00:00
description: 'My experience coming from the JVM into front-end development with React'
image: react-logo.png

tags: [frontend, react, redux]
---

<span class="dropcap">R</span>ecently I decided to face a new career challenge at [TripAdvisor](https://www.tripadvisor.com/). One of the biggest reasons I wanted this change was to be able to leave a pure java backend position and becoming fullstack. 

I always believed that a good engineer needs to have a certain level of perception of how all parts of the system work. It's impossible to know the full details on all areas, but there's a healthy level of knowledge we must pursue, in my honest opinion. And there's no better way to understand how things work than working on them 🙂.

For someone without any experience doing frontend development, and not even familiar with javascript syntax and ecosystem (npm, yarn, package.json, package-lock, etc...), there's a lot to learn.

### Front-end development at TripAdvisor

At TripAdvisor we use [React](https://reactjs.org/) as the main library to build our UI on one of our platforms. Along with React, we also use [Redux](https://redux.js.org/) and some other open source libraries that I haven't been able to explore properly yet ([redux-forms](https://redux-form.com/) and [react-intl](https://github.com/formatjs/react-intl) for instance).

React seems to be the currently most adopted front-end library, so I was really excited to start working on it. I started digging all the official tutorials, some recommended tutorials, internal Udemy courses, and I manage to become familiar with the main concepts fairly quickly. 

There are still some more advanced topics which I haven't look at yet ([React Hooks](https://reactjs.org/docs/hooks-intro.html), I'm looking at you). It's hard to properly understand the motivation for some of the advanced features without first dominating the basics, and having suffered some of the pains advanced features aim to help solving.

Luckily for me, we also have a lot of internal documentation on common React patterns we apply here. The documentation is not only very good at explaining the problem and the motivation, but also the solution - which typically consists in some custom React component developed internally.

### Parachuting into an existing codebase

While it's awesome to have many problems solved already in the codebase, it's also a curse when you are learning the basics. If don't look carefully at what's happening under the hood, you'll never know on how to setup stuff from the start. 

Take the simplest example: I'll never need to [setup a Redux store](https://github.com/zalmoxisus/redux-devtools-extension#11-basic-store) in the TripAdvisor application, but for any app from scratch that needs to be configured properly. Or simply understanding whatever practices are required by React (or whatever lib/framework you are using), and which are simply the standard that a couple of people agreed.

### DIY

To better understand the fundamentals I always try to build something from scratch (and many times I end writing a [tutorial]({{ site.url }}/tags/#tutorials) myself here in my blog). Most of the times I explore different approaches from the one I'm used to. While often I reach the conclusion that other approaches don't work as well as I expected, it makes me better understand the limitations and advantages of each alternative.

This time was no different, and inspired by [blackjack break](https://blackjackbreak.com/), I decided to create my own blackjack game in React (and Redux for state management).

The result can be seen at [https://blackjack-redux.netlify.com/](https://blackjack-redux.netlify.com/) (please ignore the lack of css - that's a problem for another day), and the code is available at [pedrorijo91/blackjack-react-redux](https://github.com/pedrorijo91/blackjack-react-redux).

There's nothing to highlight that you can't learn in one of the many available tutorials, but it was specially useful for me to put my hands on, and learn the common mistakes while designing your React components and Redux state.

### Conclusion

While the game itself is not 100% finished (not all the rules of blackjack are implemented), the general structure of the game is there, and it shouldn't be very hard to hack the rest. But I feel like I won't learn much more now...

I've made mistakes while developing my simple app, but I've also learn how to deal with the ecosystem: from dealing with dependencies, integrating other published react modules, deploying a javascript application, and setting unit tests on javascript.

That's why I totally recommend you to implement a small/simple side project whenever you truly want to understand something new. Just give it a try!