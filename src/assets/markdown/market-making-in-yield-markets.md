# Market-Making in Yield Markets

## Part 1: An introduction to market-making strategy

**Date not found**

**Likes:** 4

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Faeab1443-2f95-4268-91f0-c7b1d6142ed3_3298x1535.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Faeab1443-2f95-4268-91f0-c7b1d6142ed3_3298x1535.png)

### Background

In my previous article, “[So… Why an Orderbook?](https://swivel.substack.com/p/so-why-an-orderbook)” I walked through the reasoning behind our decision to implement an orderbook for interest-rates and cash-flow tokens.

As a quick TL;DR, the primary benefits are:

  * Increased general capital efficiency (similar to spot markets)

  * The ability for LPs to manage inventory with respect to:

    * Underlying rates

    * Time-decay (Theta)

    * Sensitivity to rate variance (Delta)

    * Underlying rate volatility (Vega) 

  * Combined Principal Token and Yield Token liquidity pools (+100% capital efficiency)

  * Free limit orders + order cancellation




* * *

 **To demonstrate these benefits, we recently released example Swuniswap-v3 which not only emulates contemporary AMM implementations, but completely outperforms any competitor LPs.**

Today’s article provides a quick overview of these strategies, as well as a suggested partner implementation in python.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Ff86cdf9b-a043-4674-a587-aca7f35f07e8_10446x5664.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Ff86cdf9b-a043-4674-a587-aca7f35f07e8_10446x5664.png)

* * *

# Introduction to Liquidity Provision

The most common LP is a simple market-neutral Uniswap position, which has an equal allocation of assets on each side of the market.

On Uni v3 for example, if the market price of a spot asset is $50, an LP might set a range from $25-$100, with the majority of the LP’s capital sitting close to $25 and $100.

####  **Time-Decay (Theta):**

In rate markets, if the market rate is 5% APR, an analogous LP may quote from 2.5% - 10%. 

However, Yield Token (YT) prices decay at a consistent rate meaning LPs must adjust their prices as time passes to account for this decay.

Some AMMs (e.g. YieldSpace, Element/Tempus Balancer Pools, Pendle AMM) automatically adjust their prices over time, as shown below.

[![Pendle AMM — A Closer Look. A deeper dive on Pendle&#39;s AMM for asset… | by  Pendle Team | Pendle | Medium](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fdab676e9-cb8d-4793-9cdb-7de337c94adf_381x278.gif)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fdab676e9-cb8d-4793-9cdb-7de337c94adf_381x278.gif)Pendle AMM Time Decay

Alternatively, in implementations using concentrated liquidity (e.g. CLOBs, Uniswap v3) LPs would regularly cancel, and replace their orders with updated quotes.

* * *

#### Underlying Rates:

YTs are also valued based on an expectation of future yield; thus YT prices are inherently tied to current underlying lending rates.

For example, if the current rate for USDC on Compound is 5% APY, a YT might trade at ~0.04 USDC at 1 year until maturity, with the expectation it will earn .05c.

If rates change, and the current rate on Compound then drops to 2.5%, YT prices should also fall in value to ~0.02 USDC.

 **Unfortunately, no YT AMMs account for this primary facet of YT pricing, leaving LPs exposed to significant and unavoidable inventory risk.**

Using the example of a similar derivative market, these AMM's operate similar to a Ribbon Finance vault that cant change its strikes. This just isn’t reasonable for LPs.

* * *

#### Rate Sensitivity (Delta):

Projections of future yield (and therefore YT value) also depend on how sensitive the value of a yield token is to underlying rate movements. 

If the underlying rate is volatile, then the YT price is more likely to revert to an LPs entry price, and YT quotes are less variable. 

For example, if an underlying rate tends to vary from 3-7%, a Swivel LP can more safely place inventory around 5%, knowing that inventory risk is marginally reduced and the YT will have reduced sensitivity to variance in the underlying rate.

 **No contemporary Yield Token AMMs adjust quotes with respect to underlying rate sensitivity.**

* * *

#### Concentrated Liquidity / Hybrid AMMs

One potential, way to address the above concerns might be a hybrid CLOB/AMM like Uniswap V3 or Sushi Trident in which a user can regularly cancel their orders and update their quotes.

Unfortunately, such an implementation requires prohibitive transaction costs to regularly move liquidity (as shown below).

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F63d84b51-0f95-412c-b875-acefea3e3fef_4018x1017.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F63d84b51-0f95-412c-b875-acefea3e3fef_4018x1017.png)Fig 4. Returns assuming 200% base APY, daily rebalances, 75 GWEI transactions

When adjusting liquidity only once per 24 hours, LPs on Ethereum mainnet receive a -130% APY, while LPs on L2s like Optimism receive a ~46% reduction in revenue.   
(Even with unrealistic 75 GWEI transactions)

When LPs then shorten the liquidity adjustment period to the suggested 10 minutes, even those LPs utilizing the leading L2s still burn ~$20-25,000 _per day._

* * *

## Swivel & Swuniswap

With all these factors considered, a viable solution must offer the custom liquidity ranges of Uni v3, while also offering the ability to cancel/move liquidity at little to no cost.

 **Swivel’s Exchange is the only venue that provides these capabilities — allowing users to place limit orders and create custom liquidity ranges at no cost.**

By providing quotes with short expiries, LPs can easily adjust their prices with respect to any number of variables — all without incurring transaction fees that significantly impact their returns.

 **Simply put, an LP running the same range strategy on Swivel will significantly outperform a similar LP on any AMM.**

For an example integration, check out the additional article we released today: [Market-Making with Swivel.py](https://swivel.substack.com/p/market-making-with-swivelpy)

* * *

 **About Swivel Finance**

Swivel is the decentralized protocol for fixed-rate lending and tokenized cash-flows.

Currently [live](https://swivel.exchange/) on Rinkeby, Swivel Finance provides lenders the most efficient way to lock in a fixed rate as well as trade rates, and liquidity providers the most familiar and effective way to manage their inventory. Through our exchange, traders can take on positions with minimal slippage, even in low liquidity markets. 

* * *

[Website](https://swivel.finance/) | [Substack](https://swivel.substack.com/) | [Discord](https://discord.gg/SkYskDQyVY) | [Twitter](https://twitter.com/SwivelFinance) | [Github](https://github.com/Swivel-Finance) | [Gitcoin](https://gitcoin.co/grants/1773/swivel-finance) | [Careers](https://angel.co/swivel-finance/recruiting/listings)

* * *
