# So... Why An Orderbook?

## Tokenized Cash-Flows Part 4: The Advantages of an Orderbook

**Date not found**

**Likes:** 1

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fa56fcd66-b39e-4bfa-9131-e4427981e211_3298x1535.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fa56fcd66-b39e-4bfa-9131-e4427981e211_3298x1535.png)

* * *

Since our recent [Rinkeby testnet](https://swivel.exchange) launched last month we’ve been blown away by our community’s stress tests and feedback, particularly regarding our design’s benefits / trade-offs.

We’ve discussed the topic a bit in the past, particularly in a previous article ([link](https://swivel.substack.com/p/cash-flow-instruments-pt-3-interest)) comparing some aspects of different tokenization designs. However in response to renewed interest it’s time for a closer look at Swivel’s competitive edge.

Specifically, the edge that stems largely from one design choice: _**Our implementation of an instrument optimized orderbook as opposed to an AMM.**_

* * *

## The Downsides of Tokenized Yield AMMs

Although AMMs are effective at bootstrapping liquidity for new markets as they provide even the least informed market participants an easy way to contribute liquidity, simplified bootstrapping comes with major trade-offs.

In spot markets, the primary trade-off is capital efficiency, as the most popular AMMs are constant product market makers, meaning that (as visualized below) at any given point, very little capital is allocated at market prices.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F7ed74b2e-5a03-4245-9da5-3f03b30c201e_973x381.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F7ed74b2e-5a03-4245-9da5-3f03b30c201e_973x381.png) **Fig 1.** Uniswap v2 pricing **Fig 2.** Uniswap v2 capital allocation 

This critique holds true for tokenized yield AMMs. Moreover, further drawbacks arise for AMMs due to the unique nature of tokenized yields and cash-flows.

### Constant Function Market Making

Optimized CFMMs (e.g. Curve, Dodo, Clipper, etc.,) have improved spot markets with modified liquidity formulas, while others like Yield, Notional, Element and Pendle have innovated to account for time-based appreciation/decay for cash-flow tokens.

These innovations set a great baseline for further development, yet still leave deterrents for informed market participants. 

Simply put, a yield-token is worth its projected future yield. However as rates and rate volatility changes, this projected future yield changes, and AMM yield-token prices remain the same / stale. The result is a constantly stale price, and suboptimal liquidity provision.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F0af63285-6113-4c50-81aa-c879f789f871_8942x4476.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F0af63285-6113-4c50-81aa-c879f789f871_8942x4476.png)Fig 3. HEGIC Returns Q4 2020 - Q4 2021

A similar relationship exists between a spot market and its derivatives. In options markets, prices constantly react to spot prices and spot volatility, which means an AMM must also somehow accommodate these factors. 

Currently, options AMMs, while rapidly developing, still have difficulties accounting for live volatility which leads to extremely poor returns for liquidity providers (LPs) as seen above for HEGIC LPs.

While not directly analogous, the same decay of market alpha can be expected of yield-token AMMs which struggle to account for time, current rates, and implied rate volatility.

### Custom Liquidity Pools (Uni v3, Trident)

One solution for these pricing factors is a hybrid orderbook/AMM such as Uniswap v3 or the upcoming Sushi Trident release.

With either, an LP can create custom liquidity positions/allocations. This means that as rates change or time passes, an LP can individually adjust their position with regard to new data, and proactively ensure they have an edge in the market.

However, the tradeoff is the transaction fees paid to move one’s position when reacting to these variables.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F63d84b51-0f95-412c-b875-acefea3e3fef_4018x1017.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F63d84b51-0f95-412c-b875-acefea3e3fef_4018x1017.png)Fig 4. Returns assuming 200% base APY, daily rebalances, 75 GWEI transactions

As visualized above, the fees paid to maintain a market edge (solely time-based) significantly impact, or entirely negate an already optimistic 200% APY for LP’s. 

Swivel LPs are unimpacted and over 30 days yield $4516.  
Uniswap LPs on Optimism have their APY reduced 46% yielding $2422, 108% APR.  
Uniswap LPs on Mainnet have their gains negated, losing $2720, -130% APR.

* * *

## The Benefits of Tokenized-Yield Orderbooks

While the aforementioned issues with yield-token AMMs are influences on Swivel’s design choices, our off-chain orderbook along with the ability to place limit orders provides further tangible benefits.

#### Slippage

As we’ve noted in [prior articles](https://swivel.substack.com/p/another-look-at-defi-fixed-rates), fixed-rate markets have had issues with slippage on large orders, with just a $500 order leading to 15-30%+ slippage across Yield and Notional as recent as this past Spring.

Many users *refuse* to accept this amount of slippage, and Swivel serves this userbase with the ability to place limit orders. These limit orders are cost-free, and similar to 0x’s gasless trades, market orders may be free in the future as well.

#### Transaction Costs

As opposed to the 3-6 transactions that others may require, Swivel’s orderbook only requires 0-2. 

A user can place a limit order and (depending on the token) completely avoid paying for the order, and/or approvals.

#### Efficient Pricing

Across all cash-flow tokenization protocols, yield-tokens (nTokens) and principal-tokens (zcTokens) are priced according to the following formula:

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F8f70e314-fa88-4c56-8663-24ea72e95100_547x41.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F8f70e314-fa88-4c56-8663-24ea72e95100_547x41.png)

This means that at any point in time, if a user knows the price of 1 nToken, they can identify the price of 1 zcToken in underlying.

Swivel’s orderbook accommodates for this implied pricing, allowing for one single orderbook to serve users selling both nTokens and zcTokens.

 _ **The result is an additional 100% increase in capital efficiency when compared to two separate AMM pools.**_

* * *

## Conclusion

While AMMs can serve as a great liquidity bootstrapping mechanism, they appear to fall short in various markets, particularly for yield-tokens.

Without addressing changes in the underlying rate as well as implied rate volatility and time decay, many AMM LPs constantly lose an edge to the market, while other AMMs that allow LPs to accommodate for these factors have impractical transaction costs.

Swivel’s orderbook and limit orders allows LPs to maintain their edge, while providing users the best prices, and the least transaction costs.

#### TLDR: So Why An Orderbook?

\- General capital efficiency  
\- Efficient liquidity management (Δ rates, Δ vol, theta)  
\- Implied Orderbook Pricing (additional +100% capital efficiency)  
\- Minimal slippage  
\- Gas-free limit orders  
\- 0-2 transactions instead of 3-6

#### What’s Next?

Join our [discord](https://discord.gg/TUTzRySEap), show your worth, and become a member of ṱ̸͝ḧ̵̝̙̀e̶̥̐̄ ̸̜̀̿b̷̞́̎o̵͚̍͜ạ̷̡̾͂r̶̼̓̃ḏ̸̛̩̃r̵̘̈́́ơ̷͙͎̚o̸̮̥͆m̷̮͚̀͝ .

Our [testnet](https://swivel.exchange/) is still (and always will be) live! Check it out and drop us useful feedback in our discord for cash rewards.

With our mainnet around the corner, we’ve got a lot to talk about across our token, code_423n4 audit and roadmap! Stay tuned for another announcement later this week!

And most importantly, we’re hiring! If all this sounds interesting to you, feel free to reach out in [discord](https://discord.gg/TUTzRySEap) or [apply](https://www.notion.so/swivelfinance/Swivel-Finance-Job-Board-86a2054c6f61486e9c98494b7cf35f33). We’re onboarding folks in positions with most any skillset so if you’re passionate please reach out!

— Julian Traversa

* * *

[Website](https://swivel.finance/) | [Substack](https://swivel.substack.com/) | [Discord](https://discord.gg/SkYskDQyVY) | [Twitter](https://twitter.com/SwivelFinance) | [Github](https://github.com/Swivel-Finance) | [Gitcoin](https://gitcoin.co/grants/1773/swivel-finance) | [Careers](https://angel.co/swivel-finance/recruiting/listings)

* * *

## Citations:

  1. Young, J. (2020, October). _On Equivalence of Automated Market Maker and Limit Order Book Systems_. Retrieved from https://professorjey.com/assets/papers/AMM_Order_Book_Equivalence_DRAFT_2020_10_16.pdf.

  2. Adams, H., Zinsmeister, N., & Robinson, D. (2020, March). _Uniswap v2 Core_. Retrieved from https://uniswap.org/whitepaper.pdf.

  3. @slash125. _Dune Analytics: Hegic v1 Dashboard_. Dune Analytics. Retrieved October 5, 2021, from https://dune.xyz/slash125/hegic_test_1.

  4. @slash125. _Dune Analytics: Hegic v2 Dashboard_. Dune Analytics. Retrieved October 5, 2021, from https://dune.xyz/slash125/hegic-v2.

  5. Hennessy, W. (n.d.). _Uniswap: Gas fees on optimistic Ethereum_. Uniswap Help Center. Retrieved from https://help.uniswap.org/en/articles/5410300-gas-fees-on-optimistic-ethereum.



