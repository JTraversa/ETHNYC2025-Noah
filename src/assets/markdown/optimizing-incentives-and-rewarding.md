# Optimizing Incentives & Rewarding Liquid Markets

## A Review of SIP(#004) and the Incentivization of Liquid Markets

**Date not found**

**Likes:** 1

In recent weeks, our Swivilians have put forward multiple proposals surrounding the proper incentivization of our most important stakeholders — our liquidity providers.

In particular, with the ratification of [SIP (#004)](https://vote.swivel.finance/#/proposal/0x843f80d23c9c991a7ae9ddb2ff8e4d5ae3b5c93b2fa22d940ff0a7ef54b01795), we’ve added two key facets to our unique volume based incentive program — Time & Quote Distance

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fad94c1e5-2c7b-499e-b600-46aad544e1ff_10680x6201.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fad94c1e5-2c7b-499e-b600-46aad544e1ff_10680x6201.png)

* * *

## Rewarding Liquid Orderbooks

While liquid markets are key for any orderbook, the mechanics behind rewarding orderbook liquidity providers are all but solidified. 

Even for established and liquid markets like dYdX, recent proposals ([1](https://commonwealth.im/dydx/proposal/discussion/2519-incentivize-liquidity-providers-on-spread),[ 2](about:blank)) are in the works to revise and rework their incentives to properly balance democratization and efficient incentivization.

That said, orderbook reward schemes are generally placed into one of two categories:

  * Rewarding Orderbook Snapshots — E.g. dYdX randomized snapshots

  * Rewarding Volume — E.g. LOOKS trading incentives




* * *

## Rewarding Orderbook Snapshots

Without strictly rewarding volume, exchanges must attempt to find ways to identify which liquidity providers are… providing the most liquidity!

Specifically, this liquidity must be close to a fair market price, and it must be deep enough for counterparties to trade efficiently.

Unfortunately measuring liquidity in a fair, yet decentralized manner can be quite difficult. To do so, exchanges like dYdX implement custom and relatively complicated algorithms:

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F72e60a36-4797-4c83-bc4d-81315ace5c07_1600x288.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F72e60a36-4797-4c83-bc4d-81315ace5c07_1600x288.png)dYdX Cumulative Liquidity Incentive Algorithm

In this case, dYdX takes randomized samples roughly every 1-2 minutes, and weighs any orders that are within a minimum depth and maximum spread.

Unfortunately, such incentive mechanisms box out normal users’ contributions, leading dYdX to now begin to _[Take A Step Towards A More Equitable Reward Structure](https://commonwealth.im/dydx/discussion/4407-a-step-towards-a-more-equitable-liquidity-provider-reward-structure)._

* * *

## Rewarding Volume

Thus far, the most prolific and successful implementation of volume-based orderbook liquidity incentives is the LOOKSRARE trading incentive program.

Unlike the complicated reward mechanics offered by dYdX, LOOKS offers simple incentives in direct proportion to the daily reward pool based on volume contribution.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F2372ad95-211a-4cf9-8d18-fe859c245a70_698x233.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F2372ad95-211a-4cf9-8d18-fe859c245a70_698x233.png)

The simplicity of the LOOKS trading incentive structure led to an impressive growth story. Today LOOKSRARE trades comparable volumes with Opensea, even with reduced incentives.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Ffab40cde-8cc9-4c0b-95dc-c78f5e77d841_916x375.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Ffab40cde-8cc9-4c0b-95dc-c78f5e77d841_916x375.png)

* * *

## Optimizing Volume Rewards

As with LOOKSRARE, Swivel’s liquidity incentives also incorporate volume-based mechanisms, and similarly, we’ve seen impressive volume comparable to many spot markets. To date, we’ve processed over $250m in transactions, and have stabilized at roughly $2m per day!

That said, also similar to LOOKS, a large portion of our early incentives were unfortunately farmed by non-ideal order flow.

#### Identifying Offenders 🕵️

 _By analyzing the patterns of offenders we confirmed our intuitive finding that offenders would do one of two things:_

  * Place orders, and quickly fill them preventing others from capturing the same opportunity — ⏳ A time based manipulation; or

  * Place orders far from fair market price, ensuring no rational participant will fill it, and trading safely with themselves — 📐A quote distance manipulation.




#### Preventing Offences 🛑

To prevent offenses, both dimensions of potential reward abuse (i.e.: placing and filling orders too quickly, or placing orders in unviable states must be addressed.

To do this, we are introducing the additional dimensions to our liquidity incentive mechanisms:

  * Time 🕒 — The time between when an order is placed, and it is filled. In order to receive full rewards, an order must sit unfilled for 30 minutes. Orders filled before then have their reward weighted linearly.

  * Quote Distance 📏 — The distance between fair market price and an order at the time it is filled. Orders must be within 5 orders of market price, and 20% of market price in order to receive rewards. Orders beneath the 20% threshold have their reward weighted linearly.




* * *

## Conclusion

As of last week, 5-01-2022, [SIP(#004)](https://vote.swivel.finance/#/proposal/0x843f80d23c9c991a7ae9ddb2ff8e4d5ae3b5c93b2fa22d940ff0a7ef54b01795) and our liquidity incentive optimizations are live!

This means that our community’s concerns surrounding toxic flow or wash trading should be 🚫 no more!

With these changes, we can retain the advantage of volume-based incentives — equitable rewards — without sacrificing the efficiency that may normally come with otherwise efficient mechanisms like randomized orderbook snapshots.

* * *

## What’s Next

####  **Coordinating the Un-coordinated 🗺️**

One of the unique things about fixed rates is the increased amount of coordination necessary to create a collaborative environment.

Stay tuned for our next blog on how we’re working to create a Schelling point for fixed-yields!

###  **Arbitrum ⚡**

Our arbitrum testnet is now live! Feel free to reach out in our[ discord](https://discord.gg/swivel) to get an early look!

Keep an eye out for launch info and talks with the guys from Rari & Fei! 🏎️🏎️🏎️

And as always, drop on by our[Discord](https://discord.gg/swivel) to become a Swivilian and push DeFi forward!

* * *

###  **About Swivel Finance**

Swivel is the protocol for fixed-rate lending and tokenized cash-flows.

Currently live on[ Rinkeby](https://rinkeby.swivel.exchange/) and on[ Mainnet](https://mainnet.swivel.exchange/), Swivel provides lenders the most efficient way to lock in a fixed rate as well as trade rates, and liquidity providers the most familiar and effective way to manage their inventory.

* * *

[Website](https://swivel.finance/) | [Substack](https://swivel.substack.com/) | [Discord](https://discord.gg/SkYskDQyVY) | [Twitter](https://twitter.com/SwivelFinance) | [Github](https://github.com/Swivel-Finance) | [Gitcoin](https://gitcoin.co/grants/1773/swivel-finance) | [Careers](https://angel.co/swivel-finance/recruiting/listings)

* * *
