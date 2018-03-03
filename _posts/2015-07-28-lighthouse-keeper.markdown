---
layout: post

title:  'Lighthouse keeper - yet another ping'
date:   2015-07-26 20:00:00
image: lighthouse-keeper.jpg

#tags: [projects]
---
<span class="dropcap">I</span>t has been a while since my last post, but between some side projects, summer vacation, and personal hobbies, it hasn't been exactly easy to get time to write something.

Today I want to talk about another small project I finished not long time ago!

<p align='center'><img src='/assets/img/GYC2015-logo.png' alt='GYC2015' title='GoYouth Conference 2015' width='300px'/></p>

It all started at [Go Youth Conference 2015](http://www.goyouthconf.com/) (or GYC 2015) last April.
GYC is an unique conference, created by a group of young entrepreneurs in 2012, with one clear goal, to inspire and empower young people to create their own future. Where entrepreneurs can exchange ideas, start meaningful conversations and be introduced to powerful content that can help them to thrive and take charge of their economic future.
This year edition presented us an excellent line-up, containing speakers such as:

* [Morten Primdahl](https://twitter.com/primdahl), Co-Founder and CTO at [Zendesk](https://www.zendesk.com/);
* [Burt Helm](http://www.burthelm.com/), Senior Contributing Writer at [Inc.](http://www.inc.com/);
* [Kathryn Minshew](https://twitter.com/kmin), Co-Founder and CEO at [The Muse](https://www.themuse.com/);
* [Filipa Neto](https://uk.linkedin.com/in/filipacneto), Co-Founder and Managing Director at [Chic By Choice](http://chic-by-choice.com);
* [Or Arbel](https://twitter.com/orarbel), Co-founder and CEO at [Yo](https://www.justyo.co/);
* and even [Ray Chan](https://hk.linkedin.com/in/raychan/pt), Co-Founder and CEO at [9GAG](http://9gag.com/)

<p align='center'><img src='/assets/img/yo-logo.png' alt='Yo' title='Yo' width='200px'/></p>

And what really made this project happen was the talk by Or Arbel. In his talk he introduced Yo. Do you remember Yo?</br>
Yo is a mobile app launched a little more than a year ago (early 2014). It made a huge impact: first it seemed the next big thing, the next social network. Then, it seemed the most pathetic mobile app someone ever did. It had a single functionality: send a 'yo' (a notification, a Snapchat without image, video, text, or any other thing) to someone else - currently it is possible to incorporate links, images, and GPS coordinates.
[Business Insider](http://www.businessinsider.com/whats-happened-to-7-million-app-yo-now-that-the-hype-has-died-2014-9) and [Entrepreneur](http://www.entrepreneur.com/article/243311) wrote some interesting articles about Yo, just check them !

But Or Arbel made me (and probably everybody in the audience) see the true power of Yo: Yo could replace those 5 seconds calls just to say "Hey man, I'm already at your door to pick you up, just hurry up", or "Hey mom, I'm leaving school now. I'll arrive home in 10 minutes". Even better, it could work as a notification for some service, like a blog. The blog owner (or any automated mechanism) would send a Yo to all its subscribers and they would know a new post had just been released. Well, everything seems nice, but I could use my RSS reader for that, or making a simple (probably free) phone call to my friends and mom...

But that's not the truly power of Yo: Yo is a notification infrastructure that only requires a publisher, and some subscribers. The most powerful example Or Arbel gave us was from a conflict country (I think is Iraq, but not sure) which wanted to implemented a civilian notification channel for missile alert for years, and using Yo it was able to implement it with almost no effort and in very little time.

During his talk, Or Arbel told us about Yo API, and that it would have great new features in the coming months, so I decided to take a look at [Yo API](http://docs.justyo.co/docs). Well, it was simple, and it would be fun to play a bit with it. But what could I do with Yo API? The first idea that crossed my mind was a small python script that would check if a specified URL is responding. If not, it would notify someone (possibly the owner/manager) through Yo. And so was born [lighthouse-keeper](https://github.com/pedrorijo91/lighthouse-keeper) !

<p align='center'><img src='/assets/img/lighthouse-keeper-github.png' alt='lighthouse-keeper repository' title='lighthouse-keeper repository' width='800px'/></p>

Lighthouse-keeper reads several properties from a configuration file:

* URL that should be checked
* ping definitions (time between each ping request, maximum of errors before notifying, and connection timeout)
* yo definitions (api token, notifiers, and an optional link to be send in the yo notification)
* email definitions, if you want to notify by email also (server, account, password, recipients, email subject, email body)

It is a very simple project, one that can be done easily in a weekend, used just to play with Yo API. It is not error safe, many error cases are not being checked. So, if you plan to use it, you'll probably have to test it a bit and make some fixes.

Feel free to take a look in [github](https://github.com/pedrorijo91/lighthouse-keeper).
