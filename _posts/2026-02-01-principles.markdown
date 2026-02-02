---
layout: post

title: 'Some of my favorite programming principles'
date: 2026-02-01 12:00:00
description: 'Sharing some of my favorite programming principles'

tags: [development practices]
---

Software development is full of [principles](https://en.wikipedia.org/wiki/List_of_software_development_philosophies#Rules_of_thumb,_laws,_guidelines_and_principles).

These are nice guidelines on how to build your applications. Not hard rules, as there are always trade-offs for each decision, but usually they are still very valid.

I want to quickly cover some of my favourites and why I found them super useful when working on real-life applications.

### Principle of Least Surprise

The first principle I would like to cover is the Principle of least surprise, also known as Principle of least astonishment.

It is not one of the most commonly mentioned, but it states that when designing a system, API, or even a function, the behaviour should be as obvious and predictable as possible for the user.

This principle makes even more sense when we remember that code is gonna be read more times than written, meaning we should first aim for readability.

As an example, recently I was doing a code review, and we were introducing a method named `getOrganizationPaymentConfiguration(organizationID)` that would either fetch the corresponding organization configuration from the database or create if there was none. It is not a huge problem in this specific context, but the method clearly hides a writing transaction where we do not expect one. 

Other common examples include seemingly inoffensive methods with side effects, such as sending emails.

### KISS

KISS, which means "Keep It Simple, Stupid", is a principle that puts simplicity in first place. The principle urges developers to avoid unnecessary complexity that may not even be needed, such as multiple layers of abstractions.

As stated in the previous example, given that code should be easy to read, having a simple implementation will help reducing the amount of bugs, while making it easier to understand and extend when needed.

### YAGNI

Finally, the You Ain't Gonna Need It principle has become one of my favorites recently. For a long time I always thought that the code should be ready for many possible future improvements, only to understand that 2 or 3 years later, we never actually needed to implement those. Or that we had rewritten the service from scratch given the system requirements changed a lot, which is definitely common in fast-growing startups.

So now I always keep in mind to not add unnecessary things when developing while balancing with making it somehow easy to extend in the future if needed. 

An example of this practice is a notification engine. Most applications have one as you likely need to send emails to your users. But these can get really complex if you start considering other notifications such SMS or Slack messages. Or other features like group messages, retries, scheduled notifications, etc. But do you need all of that? Maybe it's better to not try to implement everything as you may not need all of that. If you do, you add those new capabilities at the time. 

### Conclusion

This was just a quick post to share a few principles that have helped me write better, more maintainable code in real projects. The Principle of Least Surprise, KISS, and YAGNI all point in the same direction: optimize for clarity today, and let real requirements guide tomorrow’s complexity.

You do not need to follow these ideas dogmatically, but keeping them in mind during code reviews, design discussions, and day‑to‑day coding can make your systems easier to reason about and safer to change. Next time you add a method, design an API, or sketch a new feature, have them in mind.