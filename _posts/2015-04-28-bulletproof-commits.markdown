---
layout: post

title:  'Bulletproof Commits'
date:   2015-04-28 12:00:00

tags: [projects]
---
<span class="dropcap">H</span>ave you ever committed code that made you feel ashamed? Maybe, for instance, a print statement you used for debugging just because you were too lazy to use the debugger? Maybe you even had that crazy idea of using a *not so pretty* print message? (Don't worry, we all felt desperate to that point.)

If the project you are working on has strong code review practices then, those print statements should get caught before going to production. Nevertheless, the code review process may let pass those pieces of code undetected when the diff set gets too large and there may be some time constraints.

One simple solution is to review your own code before committing. How? I've found out recently a very useful feature on git, the *'git add -p'* command (if you use some git client I don't know how to use this feature, but there's probably an equivalent functionality). 
This command allows you to "interactively choose hunks of patch between the index and the work tree and add them to the index"<sup>[1](http://git-scm.com/docs/git-add)</sup>, giving you a chance to review the difference before adding modified contents to the index.

But who has the patience to review every chunk of code carefully? Well, maybe no one?

[Commit 4 dummies](https://github.com/pedrorijo91/commit4dummies) is a side project I've developed to help me detecting junk code before committing it. It is based on another git feature that allows you to automate such code revision: [Git Hooks](http://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks).

<p align='center'><img src='/assets/img/screencapture-commit4dummies.png' alt='commit4dummies' title='Commit 4 dummies project' width='800px'/></p>

Git Hooks are custom scripts that run on specific events, and there are two groups:

* [Client-side hooks](http://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks#Client-Side-Hooks), triggered by operations like committing and merging.
* [Server-side hooks](http://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks#Server-Side-Hooks), which run on network operations, such as receiving pushed commits. [Travis](https://travis-ci.org/), [Jira](https://www.atlassian.com/software/jira) and many other code services are based on server-side hooks, also known as webhooks.

In the [documentation](http://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) you can learn about the several client-side and server-side hooks. For the purpose of reviewing committing code we focus on *'pre-commit'* hooks. As declared in the documentation, "The pre-commit hook is run first, before you even type in a commit message", meaning it's the perfect tool for our goal.

So, how is this hook implemented? The basic idea is to make a *'grep'* search through the diff set for some words that should be defined in the *'keywords.conf'* file. This file is a simple text file, containing, in each line, the file extension and the words to look for. Take a look in this simple [example](https://github.com/pedrorijo91/commit4dummies/blob/master/keywords.conf). This file allows anyone to configure the hook to its own needs without much effort.

Some worthy details:

* The *'grep'* search does not looks for the exact word, meaning that looking for *'print'* could match with *'println'*.
* This hook assumes that you are only looking in the last diff set, meaning that if you are applying the hook to an ongoing project then you should probably make a manual *'grep'* search yourself.
* Only added on edited files in the staging area are considered: removed files are ignored.
* A *'git stash'* and *'git stash pop'* commands are executed to match against staged version of the file, otherwise you could be matching against a version different from the one committing (this operation should be transparent for the developer). This feature differs this hook from most of the available on the web, since this details is usually forgotten.
* For each match the user is prompted for continuation/abortion, because it may exist some false positives.
* Some coloured feedback is printed to the console

> Note: 
> You can always skip you client-side hooks with *'git commit --no-verify'*