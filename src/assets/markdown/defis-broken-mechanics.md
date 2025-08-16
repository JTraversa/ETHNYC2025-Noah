# DeFi's Broken Mechanics

## Part 1: Maturity Coordination & IMM Dates

**Date not found**

**Likes:** 6

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F654a94e7-7ace-4889-a452-2d005cb0b163_2554x1433.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F654a94e7-7ace-4889-a452-2d005cb0b163_2554x1433.png)

* * *

As a key tenet of decentralized finance, composability enables most important use cases outside of simple remittance. Without composability, the wider thesis of DeFi legos and atomic rehypothecation becomes a distant dream, and without composability we are stuck in the stone age of finance.

Fortunately, most developers recognize the importance of composable design, and a functional layer of DeFi exists for integration across AMM, stablecoin, and lending markets.

 _ **However unfortunately, these implementation standards have failed to translate over to expirable markets such as fixed rates or options.**_

* * *

# Composability & IMM Dates 📅

In traditional finance contracts mature weekly, monthly quarterly, yearly, etc., however regardless of any contract’s period, their expirations or maturities are intentionally coordinated.

This coordination results in certain dates upon which all contracts expire/mature, traditionally known as IMM (International Monetary Market) dates.

 _ **These IMM dates ensure the fungibility and composability of positions across venues and instruments, facilitating liquid markets for all market participants.**_

### IMM Date Benefits

  1.  **Liquidity Concentration:** IMM dates result in the concentration of liquidity within normally fragmented markets.

  2.  **Increased Arbitrage:** IMM dates allow traders to arbitrage across multiple venues and contexts, further increasing liquidity.

  3.  **Structured Products:** IMM dates allow for the creation of structured products as multiple maturing products can be combined.

  4.  **Integration Consistency:** IMM dates allow for integrators to utilize expirable mechanics without worrying about future inconsistencies.




### IMM Dates & DeFi

As already stated, DeFi currently lacks any significant maturity/expiration coordination efforts.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F45c53a77-9990-4e61-9c76-a7ea44c464ac_985x834.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F45c53a77-9990-4e61-9c76-a7ea44c464ac_985x834.png)Fixed-Rate Maturities — September 2022

Maturity dates across fixed-rates alone vary by up to 2 weeks, a frustrating situation where expirations are close, but not close enough for activity.

That said, we at Swivel, along with our partners across the fixed rate and options (and expirable futures) space have begun to establish our own coordination efforts.

Through this coordination our coalition will be able to release DeFi native products that cannot be replicated or contented with.

* * *

## Choosing A Maturity (Identifying Ideal Expirations) ⏳

Since the mid ‘70s, traditional IMM dates have been established as “the third Wednesday of March, June, September and December”, however there is no particular reason to say that DeFi’s coordination should conform to the same standard.

Previously both our team at Swivel and our friends at Yield Protocol had utilized FTX, the most liquid futures expiration market, as a source for our own maturity coordination.

While this methodology may have shown its flaws with FTX’s collapse, we still believe that allowing the arbitrage and concentration of liquidity between DeFi and crypto’s futures exchanges results in the healthiest and most liquid markets.

 _ **With Binance as the largest remaining futures venue, “the last Friday of each calendar quarter at 08:00:00 UTC” then becomes the target for DeFi.**_

* * *

## Technical Limitations 🛠️

Unfortunately for some protocols, setting an option’s or fixed-rate position’s maturity date is not as simple as identifying an arbitrary date.

For these protocols, there may be technical limitations that prevent the launch of a market with an arbitrary date — especially when accounting for variables such as blocktime or leap years.

For example APWine, a yield tokenization and fixed-rate lending protocol, has their markets on rolling 90 day periods. 

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F358792c0-b20f-4de7-b021-dd6120975e9f_930x633.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F358792c0-b20f-4de7-b021-dd6120975e9f_930x633.png)APWine’s Current Rolling Maturities

This means that while their infrastructure has the convenience of persistent liquidity and automatic rollovers, they cannot arbitrarily launch new markets and coordinate with the wider space.

* * *

## Practical Limitations 🚧

For some other protocols, there may also be practical limitations surrounding either the formation of their liquidity or regularity of their market launches.

One such protocol would be Notional, where their markets consistently roll between 3, 6, and 12 months. This periodic rolling results in some periods of coordination lapsing and prevents the *consistent* arbitrary choice of maturity, though it does not prevent coordination completely.

* * *

# A Path Forward 🧭

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9211e3d0-b049-4f2d-9a2b-7fefde93e42d_896x640.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9211e3d0-b049-4f2d-9a2b-7fefde93e42d_896x640.png)

Though perfect coordination is likely impossible, we as an industry have already begun to coalesce upon certain standards for expirable mechanics such as [EIP-5095](https://eips.ethereum.org/EIPS/eip-5095) and [2266](https://eips.ethereum.org/EIPS/eip-2266).

 _ **With these efforts and alongside our “DeFi - Alliance” of fixed-rate and options protocols we can establish a single date for the maturation of our instruments and enable a new wave of market growth and development.**_

Further, we will soon be releasing novel products that harness the power of this newfound composability.

Check out our friends at [Illuminate](http://docs.illuminate.finance) and [Contango](http://contango.exchange) for a view into this new wave, keep your eyes and ears peeled for new Swivel product announcements, and stay tuned to our [Monday Market Outlook](https://twitter.com/SwivelFinance/status/1617628404609871872) spaces for some unique alpha opportunities with the Swivel team + guests 🔥🔥🔥 !

* * *

 **Swivel** is the protocol for fixed-rate lending and tokenized cash-flows.

Currently live on [Mainnet](https://mainnet.swivel.exchange/), Swivel provides lenders the most efficient way to lock in a fixed rate as well as trade rates, and liquidity providers the most familiar and effective way to manage their capital.

* * *

[Website](https://swivel.finance/) | [Substack](https://swivel.substack.com/) | [Discord](https://discord.gg/SkYskDQyVY) | [Twitter](https://twitter.com/SwivelFinance) | [Github](https://github.com/Swivel-Finance) | [Gitcoin](https://gitcoin.co/grants/1773/swivel-finance) | [Careers](https://angel.co/swivel-finance/recruiting/listings)

* * *
