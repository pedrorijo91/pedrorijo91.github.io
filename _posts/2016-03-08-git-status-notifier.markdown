---
layout: post

title:  'Git Status Notifier'
date:   2016-03-08 21:00:00

#tags: [git, projects]
---
<span class="dropcap">G</span>it has become one of the most essential tools for every developer. While most developers trust in [GitHub](https://github.com) to host their git repositories, [Bitbucket](https://bitbucket.org/), and more recently [Gitlab](https://gitlab.com/), have become worthy alternatives.

When users rely so much on those services for the everyday workflow, it became crucial for both, the providers and the users, to have almost non existing downtimes. One common approach to provide information to users about technical issues was to offer a status service (and API) for consulting the service status, similar to many other web services:

* [GitHub status](https://status.github.com/)
* [Bitbucket status](http://status.bitbucket.org/)
* [Gitlab status](https://status.gitlab.com/)

### DDOS

It is still fresh in memory the [huge attack against GitHub](http://thehackernews.com/2015/03/github-hit-by-massive-ddos-attack-from_27.html), just 1 year ago. Although rare, those kind of attacks can harm many developers who see themselves in trouble to proceed with their regular workflow (even if Git is a distributed system, it is still a problem when the Git server is down). Besides those big and somehow rare attacks, minor issues happen that may cause some itches. Now, if you work at a company like [Travis](https://travis-ci.org/), or [Codacy](https://www.codacy.com/), who depend heavily on git and the corresponding servers 24/7, every itch may become a bit more problematic.  

### How to detect

Currently, I find that there's a problem on GitHub/Bitbucket when I try to do push or pull on git and it takes too much time (and probably failing). Or I just saw a post on [Hacker News](https://news.ycombinator.com/) where someone is complaining about a problem a couple of hours ago. But I want to know as soon as those services have any minor problem. So I built a small monitor: [Git Status Notifier](https://github.com/pedrorijo91/git-status-notifier).

### Git Status Monitor

Git Status Notifier is a small and extensible monitor for GitHub and Bitbucket services (thinking about monitor Gitlab soon also) that alerts through Slack, Hipchat, or Email (using [Sengrid](https://sendgrid.com/)) - and still thinking about using [Twillio](https://www.twilio.com/) for SMS notifications.

It is built using one Akka actor for each provider (one for GitHub and one for Bitbucket, if enabled). Each actor makes a request to the API and compares with the previous one. If there's any change, it will notify, using the configured channels.

#### How to run

It is pretty simple to run it. All configurations are defined in the configuration file:

* providers monitored
* request timeout
* time between checks
* date time format (message display)

Each notification channel must also be enabled (by default every channel is disabled).
Besides that, each notification channel requires some settings, like the token, the room, etc.

Feel free to check the project on [GitHub](https://github.com/pedrorijo91/git-status-notifier) to get more details.
