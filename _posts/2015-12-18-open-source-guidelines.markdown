---
layout: post

title:  'Open Source Development: a few guidelines'
date:   2015-12-18 00:10:00
image: openSource.jpg

tags: [tutorials, open-source]
---

This post was originally published on [Codacy blog by me](http://blog.codacy.com/2015/12/17/open-source-development-a-few-guidelines/):

<p align='center'><img src='/assets/img/codacy-logo-name.png' alt='Codacy' title='Codacy' width='300px'/></p>

I believe the Open Source movement is the biggest breakthrough in software development. Open Source has allowed many projects to increase the number of contributors (and contributions) to unreachable standards for any enterprise. Just take a look at the [Linux kernel](https://github.com/torvalds/linux), which counts with 500,000+ commits and 5,600+ contributors.

<p align='center'><img src='/assets/img/linuxGH.png' alt='Linux kernel, an open source example' title='Linux kernel, an open source example' width='700px'/></p>

In this evolution, platforms such as [SourceForge](https://sourceforge.net/), [Google Code](https://code.google.com/), [Bitbucket](https://bitbucket.org/), and especially [GitHub](https://github.com/) played a fundamental role connecting developers all around the world and wide-spreading remote contributions.

Personally, I had the opportunity of working on Open Source projects while working at [FenixEdu](http://fenixedu.github.io/). At Codacy, we also have [several open source](https://github.com/codacy) projects. We have some docker engines to support our code analysis, we have some code coverage tools that help users to import coverage reports to Codacy, and we also have projects like our Scala clients for [Bitbucket API](https://github.com/codacy/bitbucket-scala-client) and [Stash API](https://github.com/codacy/stash-scala-client). While the last two should be far more interesting to the general community, having all of them open source allows users to report problems and get fixes way faster. It's not uncommon to have  users contributing to improve our tools. A good example is our [python-codacy-coverage](https://github.com/codacy/python-codacy-coverage/pulls?q=is%3Apr+is%3Aclosed) project which has received valuable help from the community.

<p align='center'><img src='/assets/img/gh-world.png' alt='' title='' width='400px'/></p>

Lately we have also been devoting more time to our open source projects. We have been busy on providing proper documentation and taking a careful look for created issues and pending pull requests.

In this process we realized that it is very common to have users who want to contribute to the Open Source movement but don't really know how to start, so we decided to collect some good practices for all of those who want to contribute to the Open Source movement and simply don't know how to.

### If you are an open source project owner:

* **<u>Create a README file</u>**, providing an overview about the project as well as some usage instructions. This may include some [project badges](/assets/img/node-badges.png) (look at our [node-codacy-coverage](https://github.com/codacy/node-codacy-coverage) project as an example) that visually indicate several stats. I usually include the build status, current release version, coverage, and Codacy project grade. It is also a common practice to include a *Troubleshooting* section, for common errors and how to solve them.
* **<u>Create a CONTRIBUTING file</u>**, providing instructions on how to contribute to the project. Take a look at [this Codacy project](https://github.com/codacy/bitbucket-scala-client/blob/master/CONTRIBUTING.md), for instance.
* **<u>Automate tasks.</u>** A new contributor may not be fully into the project. By providing a simple mechanism to compile, run, and test, he will be much more efficient. An easy way to quickly provide a fully configured environment may be to use [dockers](https://www.docker.com/).
* **<u>Integrate with a Continuous Integration (CI) platform.</u>** The CI helps you by assuring the contributions don't break your project. CI should be built upon tests - a piece of code all managers like to postpone when the sprint gets short - that can be run to ensure no previous code has been broken by recent changes. There are plenty of CI platforms available. Among the most used ones we have [CircleCI](https://circleci.com/), [Travis](https://travis-ci.org/), [Bamboo](https://www.atlassian.com/software/bamboo/), [CodeShip](https://codeship.com/), and [Jenkins](https://jenkins-ci.org/).
* **<u>Define coding standards</u>**, usually followed by format settings for the most common IDE(s). At Codacy we have our own IntelliJ settings so we can reduce visual pollution on commits diffs. Codacy can be used to automatically review code, and integrated in development workflows, so you don't waste time enforcing coding standards.
* **<u>Create issues for known/reported problems.</u>** This allows contributors to be aware of contributing opportunities. Also, make an effort to keep issues updated, i.e., answer existing comments, close solved issues, correctly label them, and so on. Labels can help you say which problems won't be solved, which you need some help with, which ones are bugs, performance, improvements, etc.
* **<u>Watch incoming pull requests.</u>** Contributions will appear in the form of pull requests. Don't let a pull request remain ignored for weeks without a single word to the author.
* **<u>Tag your releases appropriately.</u>** This way users can inspect the code at the state of each release, allowing them to debug some eventual problem. GitHub provides [documentation on tags](https://help.github.com/articles/creating-releases/) which may be useful. Also, [semantic versioning](http://semver.org/) is the current standard to project versioning. Among other properties, users are immediately aware what kind of changes the new version introduces. There is also this great post on [working with semantic versions](https://blog.gopheracademy.com/advent-2015/semver/), check it out to better understand the topic.
* **<u>Choose a license.</u>** It is very common not to have a license in your Open Source. Mostly because no one really understands licenses. [Choose a license](http://choosealicense.com/) demystifies all these ghosts. If you don't care about it, use the [MIT License](http://choosealicense.com/licenses/mit/), which is one of the most permissive ones out there. If you really want to check the differences between existing license, [check this list](http://choosealicense.com/licenses/).
* **<u>Ask for help</u>** if you can't manage all the work of maintaining the project. There are always users available to help maintaining a project. Discuss the idea/vision of your project so you both get aligned before starting to work together.

### If you want to contribute to an open source project:

It should be pretty easy if the project owners have followed the previous guidelines.

* **<u>Read all the documentation</u>** they made an effort to create (*README*, and specially *CONTRIBUTING*, if present). The documentation should provide enough info for you to start.
* **<u>Fork</u>** the project
* **<u>Announce you are on a issue.</u>** If you are trying to solve a reported issue, comment that you intend to solve it, and possibly discuss with the project maintainers the best approach **before starting to code**
* **<u>Create a new branch</u>** on your fork and code your solution (it's always good to add/fix tests)
* **<u>Open a pull request</u>** after having pushed your changes.
* **<u>Iterate your changes</u>** as the project maintainers comment your code
* Your pull request should be accepted as you converge to an accepted solution

If there is no documentation about how to contribute, try to make the most clean and understandable code so reviewers can have their work eased. Put yourself in a reviewer situation. Would you like to review your own code?  Would you like to have that code in your project? If you can't find a nice solution, remind that the community is always there to help.

<p align='center'><img src='/assets/img/calvin-arguing.jpeg' alt='' title='' width='400px'/></p>

There are also some discussions about what are the best practices to contribute through pull requests. While some may argue that a pull request should contain a single commit, gathering all changes and making sure that every commit is in a deployable state, others defend that a pull request may be logical split into several smaller chunks (commits) , making it easier to review the pull request. Check some discussions [here](http://ndlib.github.io/practices/one-commit-per-pull-request/#git-rebase-interactive), [here](http://codeinthehole.com/writing/pull-requests-and-other-good-practices-for-teams-using-github/), or even in [reddit](https://www.reddit.com/r/git/comments/343jld/do_you_prefer_pull_requests_that_contain_one/) about pull requests best practices.

That is all you should need if you want to start contributing to Open Source projects.

### First timers

Still on Open Source contributions, Kent C. Dodds (maintainer of [angular-formly](https://github.com/formly-js/angular-formly)), wrote a very [interesting article](https://medium.com/@kentcdodds/first-timers-only-78281ea47455#.3ghth459p), where besides some good practices, Kent introduces a awesome new  initiative: **contributions to first timers only**.

First timers are developers who never had the change to contribute to a Open Source project, developers who want to make their first ever contribution.

<p align='center'><img src='/assets/img/dark-side.jpg' alt='' title='' width='200px'/></p>

This initiative creates a soft entry to Open Source for those who have been looking for the opportunity but may have been frighten by the process. This also increases the number of open source contributors in the community, making every project to benefit from it in the long term. That is why more projects should think about  creating opportunities to first timers.

If you are looking into your first Open Source contribution just [search for it in GitHub](https://github.com/search?utf8=%E2%9C%93&q=label%3Afirst-timers-only+is%3Aopen&type=Issues&ref=searchresults).

And keep in mind, if you want to improve your code quality, Codacy is fully integrated with GitHub and Bitbucket, and it is [free to Open Source](https://www.codacy.com/pricing)
