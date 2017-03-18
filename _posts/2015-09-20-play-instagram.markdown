---
layout: post

title:  'Playing with Instagram API'
date:   2015-09-20 16:00:00
image: play-logo.png


tags: [projects]
---
<span class="dropcap">F</span>or those who don't know, the [Play Framework](https://www.playframework.com/) is the standard web framework for Scala (also available to Java), and it is similar to many other MVC frameworks, such as [Spring MVC](http://projects.spring.io/spring-framework/), [Ruby on Rails](http://rubyonrails.org/), [Django](https://www.djangoproject.com/), and so on.

And it has been a while since I've been wanting to play a little bit and experiment the Play Framework.
Unfortunately, I never had the time, or any good idea to start with it. And simply going through the available tutorials is not enough to learn about a library/framework, in my opinion.

But a few weeks ago I just found out an amazing website! It's is called [Like Creeper](http://likecreeper.com/).

<p align='center'><img src='/assets/img/like-creeper.gif' alt='Like Creeper' title='Like Creeper' width='500px'/></p>

It is a fairly simple idea, but real fun: making random likes in old photos from your friends in Instagram!

So, how does it works?

1. First it will ask you for access to your Instagram account;
2. Then, it will choose one of your friends (from those who you follow);
3. After that, it will pick an old photo randomly from the chosen friend;
4. Finally it posts a like in the chosen photo.
5. Now your friend will receive the notification that you liked its photo from a long time ago and he will be all like WTF!?!?!

Just give it a try!

### Insta Roulette

After that, and thinking that it will be a simple but funny task, I decided to clone it.
And so I started the [Insta Roulette](https://github.com/pedrorijo91/instaRoulette).

<p align='center'><img src='/assets/img/instaRoulette-home.png' alt='Insta Roulette home' title='Insta Roulette home' width='500px'/></p>

 My idea was not only to clone Like Creeper, but to try to introduce a few changes. Maybe it would be cool to challenge your friends. Something like:

* You would access the app
* You would choose a friend to challenge
* Your random like would be shown to you (or maybe just at the end?)
* If your friend accepted the challenge it would be chosen a random photo for him to like, and both likes would be posted
* If your friend declined the challenge, no like would be posted

I've made it to the first milestone, with the random like, very similar to Like Creep. Unfortunately, some problems have arisen, making it impossible to continue the project: Instagram restricted the access to most its API to business applications. This lead to the impossibility to deploy the app for general use, making me deciding to abort the development for now.

The design is fairly incomplete, but I would have spend more time on that if the app could be deployed. If Instagram decides to open its API again I will get back to finish this idea.

#### How to overcome

If you want to try the roulette for your own account just grab the project from [Github](https://github.com/pedrorijo91/instaRoulette). After cloning the project, get an access token and replace it in `app/services/Instagram#getAccessToken` method.

You can get a token using the [dev console](https://apigee.com/console/instagram), providing authorization, making any endpoint call, and inspecting the outgoing request, looking for the access token.

Now you just need to follow the instructions available in the repository to run the project.
<br>A screenshot from the final screen is available right below as an example:

<p align='center'><img src='/assets/img/instaRoulette-result.png' alt='Insta Roulette result' title='Insta Roulette result' width='800px'/></p>

### Instagram stats

Another app using Instagram API I've crossed lately is one of those smartphone apps that display some statistics about your Instagram account. Besides the number of followers/followings, some will display users who don't follow you back, ghost followers - I guess those who never liked/commented your photos - and many others. The problem is that those apps don't display the full results unless you pay.

Since I already had the structure for dealing with the Instagram API - from [Insta Roulette](https://github.com/pedrorijo91/instaRoulette) - I implemented some of those statistics:

* Users you follow
* Followers
* Followers you follow
* Users you follow but don't follow you back
* Users who follow you, but you don't follow back
* Pending incoming requests (in case you have a private account)

<p align='center'><img src='/assets/img/instaStats-result.png' alt='Instagram Stats result' title='Instagram Stats result' width='800px'/></p>

It's an handy app for me, as I like to maintain my Instagram account fairly restricted, and maybe it will turn out to be handy for you too. The code is also available at [Github](https://github.com/pedrorijo91/instagram-stats).

#### Instagram API access restriction

Once again, the restriction by Instagram API made this project impossible to complete and deploy for general usage. Follow the previous instructions to test this project by yourself just as in **Insta Roulette**.
