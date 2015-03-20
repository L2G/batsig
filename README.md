# batsig
Listener/repeater for short messages; written for the [No Agenda Show][]'s "bat
signal" but adaptable to other uses

## Summary

This is still in a very early stage of development, but please feel free to
contact [me][] with questions.

## Requirements

* [Node.js][]

## Known bugs

The Twitter tuner is not optimized for "high volume streams" as recommended
by [Twitter's streaming API
documentation](https://dev.twitter.com/streaming/overview/processing).  Handling
of incoming tweets at the rate of more than one every few seconds is likely to
be unpredictable.  There is also no detection or special handling of duplicate
tweets, as the Twitter docs also recommend.

Using addTuner() on more than one repeater to make them listen to the same
tuner can cause undesirable behavior.  In particular, I have added the Twitter
tuner to both the Pushover repeater and the null repeater at the same time, and
then have seen each Twitter message cause _two_ Pushover notifications to be
sent.

There is no useful documentation for how to set this up.

The coding style is all over the map because I'm still new to Node.js.

There are no unit tests, integration tests, etc.

This should be organized and made usable like any other npm package.

## License

The code is made available to you under the terms of the MIT License; see the
[COPYING][] file for details.

[No Agenda Show]: http://www.noagendashow.com/
[me]: https://github.com/L2G
[Node.js]: https://nodejs.org/
[COPYING]: COPYING
