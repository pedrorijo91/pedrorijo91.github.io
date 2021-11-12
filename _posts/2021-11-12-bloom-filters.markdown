---
layout: post

title: 'Bloom Filters'
date: 2021-11-12 20:00:00
description: 'Bloom Filters as space-efficient alternatives to Sets'

tags: [data structures]
---

[Bloom filters](https://en.wikipedia.org/wiki/Bloom_filter) were my first contact with probabilistic data structures a couple of years ago. Probabilitic data structures allow us to make a trade-off between the certainity of an operation and the space needed for the data structure. They are very useful for dealing with large amounts of data. They usually recur to one or more parameters to tune that certainity as we need.

Some of its more common applications include:

* Determining whether a user ID or domain is already taken
* Reducing disk lookups for the non-existing keys in a database
* Filtering out previously shown posts on recommendation engines
* Checking words for misspellings and profanity with a spellchecker
* Identifying malicious URLs, blocked IPs, and fraudulent transactions
* Counting the number of active users or total unique clicks on a website (with [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog), which is built on top of Bloom Filter)

### What is exactly a Bloom filter?

As said before, a Bloom filter is a probabilistic data structure. It can be used to find if a given element is in the set with a certain error rate.

A Bloom filter provides only 2 operations: **Adding** an element and **lookup** an element. Removing elements is not supported in traditional implementations.

The *lookup* is the main operation. And there are two possible answers:

* The element is not present, which can be answered with full certainty;
* The element **may** be present in the set, where the certainty depends on the chosen parameters.

An important detail is that the more elements we add, the larger the probability of having false positives on the lookup.

### How does a Bloom filter works?

A bloom filter relies in 3 parameters:

* a bitmap with **m** bits initiliazed as *0*;
* **k** hash functions, which map a given element to one of the **m** bitmap positions;
* the number **n** of inserted elements.

It is important that each hash function is independent and uniformly distributed, otherwise the amount of false positives can get out of control. Speed of each hash function is also important for performance considerations.

#### Adding elements

To add a new element to the set we hash it with each of the hash functions. Each will return one bit to be set. 

Let's go through what happens when we try to add an element:

We'll assume we have a Bloom filter where *m = 10* and *k = 3*. As such we'll have 3 independent hash functions and a bitmap with 10 elements (indexed from 0 to 9), each initialized as *0*

 <figure>
  <img src='/assets/img/bloom_filter/bloom_add_0.png' title='Initial state for our Bloom filter' width='600px'/>
  <figcaption>Initial state for our Bloom filter</figcaption>
</figure> 

Now we want to add the element `"random_string"` to our Bloom filter. We start by hashing the element with the first hash function. The output of the hash function will determine what changes we'll need to apply to the bitmap. 

 <figure>
  <img src='/assets/img/bloom_filter/bloom_add_1.png' title='Element hashed through hash function 1' width='600px'/>
  <figcaption>Element hashed through hash function 1 - output is (index) 7</figcaption>
</figure> 

Let' imagine the output is 7. This means we'll mark the bitmap index 7 as *1*.

 <figure>
  <img src='/assets/img/bloom_filter/bloom_add_2.png' title='Bitmap index 7 is now marked' width='600px'/>
  <figcaption>Bitmap index 7 is now marked</figcaption>
</figure> 

At this moment we have bitmap `0000000100`. We now need to hash the element with the other two hash functions.

 <figure>
  <img src='/assets/img/bloom_filter/bloom_add_3.png' title='Element hashed through all hash functions' width='600px'/>
  <figcaption>Element hashed through all hash functions</figcaption>
</figure> 


 <figure>
  <img src='/assets/img/bloom_filter/bloom_add_4.png' title='Bitmap index 2 is now marked as well' width='600px'/>
  <figcaption>Bitmap index 2 is now marked as well</figcaption>
</figure> 

Notice that for this particular element the third hash function returned the same index as the second. For this reason we'll have a *no-op* for the third hash function.

What if we added another element? Adding more elements would be just about repeating the process:

 <figure>
  <img src='/assets/img/bloom_filter/bloom_add_5.png' title='New element hashed through all hash functions' width='600px'/>
  <figcaption>New element hashed through all hash functions</figcaption>
</figure> 

 <figure>
  <img src='/assets/img/bloom_filter/bloom_add_6.png' title='Bitmap indexes marked after inserting another element' width='600px'/>
  <figcaption>Bitmap indexes marked after inserting another element</figcaption>
</figure> 

#### Lookup

How can we now check if some element exists in the Bloom filter?

Looking up for an element starts by hashing it through all the hash functions:

 <figure>
  <img src='/assets/img/bloom_filter/bloom_lookup_0.png' title='Lookup element hashed through all hash functions' width='600px'/>
  <figcaption>Lookup element hashed through all hash functions</figcaption>
</figure> 

We now look if any of the indicated bits is not set. This would mean the element is not present for sure. 

 <figure>
  <img src='/assets/img/bloom_filter/bloom_lookup_1.png' title='Bitmap indexes marked after inserting new element' width='600px'/>
  <figcaption>Bitmap indexes checked for lookup. Index 3 is not marked - Element does not belong to set</figcaption>
</figure> 

In this particular example, index 3 is not marked. So we know for sure the element was not added to the set before. Because if it had been added, those bits would be marked already.

On the other hand, if all bits are set, the element may be present. But it is also possible that those bits are set through an unfortunate combination of other elements. The likelihood of having that happening is controled by the **m**, **k**, and **n** parameters. And this is why the size of the bitmap and the number of hash functions is very important when using Bloom filters.

#### Which values should we choose for each parameter?

Classic answer: *it depends*. Mostly on the number of expected elements **n**.

We want to keep **k** a small number. The more hash functions we have, the slower will be our bloom filter. It will also fill up quicker since each hash function can fill another bit in the worst case. But if we have too few, we'll have more false positives. 

Wikipedia has a [good section on the optimal number of hash functions](https://en.wikipedia.org/wiki/Bloom_filter#Optimal_number_of_hash_functions), which I recommend you to read for more details, but the high level approach is the following:

1. We need to estimate the number of elements **n** we'll have in our set;
2. We then need to choose a bitmap size, where we need to take into account our memory constraints;
3. We can compute the optimal value for **k** using the formula: `(m/n)ln(2)`;
4. We finally compute the error rate using the formulas linked in the Wikipedia.
5. We can tune the error rate by trying other bitmap sizes in step 2.

There's also [this great website](https://hur.st/bloomfilter/) that computes all those parameters if we want to test them out.

### Conclusion

Bloom filters are a widely used data structure when we have large amounts of data. Besides the classic implementation many [other extensions](https://en.wikipedia.org/wiki/Bloom_filter#Extensions_and_applications) exist (e.g. [Counting Bloom filter](https://en.wikipedia.org/wiki/Counting_Bloom_filter)).

Bloom filters are also just the entry point for [many other probabilistic data structures](https://en.wikipedia.org/wiki/Category:Probabilistic_data_structures).