---
layout: post

title:  'Mac and homebrew, the perfect marriage'
date:   2015-09-07 18:30:00
image: home-brew.png
image_alt: 'Homebrew package manager logo'

---
<span class="dropcap">L</span>ast week, on September 1<sup>st</sup>, I started a new adventure on [Codacy](https://www.codacy.com/).

Codacy is an automated code review tool that allows developers to improve code quality and monitor technical debt. It aims to improve the code review process. To achieve such goal, not only automates the code review process, but also integrates with existing project management tools such [Bitbucket](https://bitbucket.org/), [Github](https://github.com/), [Travis CI](https://travis-ci.org/), and so on.

<p align='center'><img src='/assets/img/codacy-homepage.jpg' alt='Codacy homepage' title='Codacy homepage' width='500px'/></p>

As usual, when getting a new job, you have to configure your workstation once again. Having a mac, you do not have that native amazing tool as you have in Linux distributions: `apt-get` (or `yum`, or some other equivalent), a command-line tool for handling packages, that allows you to install most of your software easily.

Of course, if you are a mac user, you are probably aware of [Homebrew](http://brew.sh/), the equivalent command-line tool for mac. Using `brew` you can get a lot of software installed in your mac. Nevertheless, there is still plenty of software you have to download for yourself, open the installer, and drag to your `Applications` folder. And that sucks. I don't want to open dozens of websites, look for the latest version, download it, and drag them to the `Applications` folder. I want to have a script that can install all the software I need, without my intervention.

<p align='center'><img src='/assets/img/brew-install-git.jpg' alt='brew install git' title='brew install git' width='600px'/></p>

Fortunately, I got to meet [Homebrew Cask](https://caskroom.github.io/), an extension to Homebrew that promises to end with the drag to install action. To install it, just type in your terminal:

<code>brew install caskroom/cask/brew-cask</code>

And <i>voilà</i>, you are ready to install all the software you need !
</br>
For instance, you can install [Skype](http://www.skype.com), [Slack](https://slack.com/), [Hipchat](https://www.hipchat.com/), [Dropbox](https://www.dropbox.com/), [Intellij](https://www.jetbrains.com/idea/), [Vlc](http://www.videolan.org/vlc/), even [Popcorn-time](https://popcorntime.sh/) ! Just find out what's available at [Cask Search](https://caskroom.github.io/search) !

Just select those you need and recommend those you think it could be handy.
