# Cash-Flow Instruments pt 3: Interest-Coupons

## Part 3, A Discussion of Alternative Interest-Coupon Designs

**Date not found**

**Likes:** 1

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F91c3c6d7-8d57-410c-95c9-e6ff2fa3eda1_3298x1535.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F91c3c6d7-8d57-410c-95c9-e6ff2fa3eda1_3298x1535.png)

* * *

In our [part two](https://swivel.substack.com/p/cash-flow-instruments-pt-2-defi-cash) of this series, we discussed some of the unique opportunities that tokenized cash-flows and interest-rate derivatives can bring to decentralized finance. 

Among them include:

  * Low volatility risk, fixed-yield lending

  * Low consensus risk, fixed-yield lending

  * Low volatility risk, stable-yield borrowing

  * Low consensus, low volatility risk, fixed-yield ETH2 staking

  * Predictably valid speculative opportunities




Swivel’s specifically brings capital efficiency to these markets in order to enable institutional market participation and provide access to deep liquidity. However, Swivel is not the only project working on tokenized yields, with _Element, Pendle,_ and _APWine_ each working on a way to split principal and yield, as well as their own version of an AMM for interest-coupons.

Today, we will discuss the advantages and drawbacks of each each project’s design _(with the exception of APWine which has yet to release information on their V1)_ , as well as what led us to the optimized design we have today at Swivel.

* * *

# Element Finance

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fb56ed847-ca4d-4237-b2ab-f18a297dc303_1280x640.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fb56ed847-ca4d-4237-b2ab-f18a297dc303_1280x640.png)

Element publicly released their mission statement with their funding announcement in late March:

> “The Element Protocol brings the attractive high fixed rate yields that DeFi users crave while maximizing capital efficiency, creating market liquidity, and reducing user costs.”

It’s clear that Element’s stated goal is to optimize capital efficiency for all market participants, however Element’s implementation itself speaks towards other emphasized dimensions (namely interoperability).

#### Minting Interest-Coupons

One large difference between each protocol is the manner in which the protocol’s interest-coupons (and their corresponding zero-coupon bonds) are initially minted, and fungibly pooled.

In Element’s case, interest-coupons, termed “Yield Tokens” (YTs) are only mintable when any interest generated within a given pooled maturity is proportionally deposited.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fabf29bdd-b98c-4454-b34b-71d40822262f_6572x2560.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fabf29bdd-b98c-4454-b34b-71d40822262f_6572x2560.png)Required deposit size over 12 months

This mechanism effectively means that while Element’s YTs are fungible ERC-20s, the backing of Element’s YT’s is progressively less capital efficient and more liquidity intensive as time passes and the required interest deposit increases. 

#### Principal Token & Yield Token AMM’s 

Of note, Element utilizes Balancer V2 to provide a time-appreciating AMM for their Principal Tokens ( _PT_ s). That said, YTs are expected to be traded on their own AMM, which accounts for neither theta-decay, nor any of the other important facets derivative pricing.

This results in a much riskier and less capital efficient environment for liquidity provision than spot AMMs, and likely results in the need to subsidize liquidity providers (LPs) perpetually with protocol tokens in order to maintain a competitive spread.

This is highlighted by Element’s recent “Yield Token Compounding” [article](https://medium.com/element-finance/element-finance-raises-4-4m-to-bring-liquidity-to-fixed-rate-income-and-interest-markets-fea72f4ef726) which ignores the YT market completely in favor of their time-appreciating PT AMM. 

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F22eeaedc-d891-4a85-82c3-adafa73e6d45_600x371.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F22eeaedc-d891-4a85-82c3-adafa73e6d45_600x371.png)9 cycles of “Yield Compounding” - https://medium.com/element-finance/intro-to-yield-token-compounding-40a75a11e18c

Effectively Element suggests users spend multiple “cycles” collateralizing principal into both PT and YT, while selling off PTs using their AMM, resulting in the user having spent the majority of their principal on YT’s (yield exposure). 

While conceptually valid, this suggestion implies that the YT market itself may be so inefficient, that users could not simply purchase YTs using their principal to begin with, and that somehow 20+ transactions using a PT AMM would be more capital efficient than a single transaction on a YT AMM.

* * *

# Pendle Finance

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F973ee13a-08e6-4d22-9175-96fc77f06a5f_8335x4684.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F973ee13a-08e6-4d22-9175-96fc77f06a5f_8335x4684.png)

> “Pendle is powered by an AMM specifically designed to support tokens with depreciating time value, creating a new type of DeFi derivative. Pendle focuses on developing this layer of yield derivatives - expanding the supported token pairs, creating market depth, and growing the ecosystem. “

While Pendle doesn’t necessarily directly discuss a direct mission statement, there is a clear and specific focus on developing an AMM that maximizes capital efficiency for time-depreciating assets.

#### Minting Interest-Coupons

While Pendle has yet to release information on the core mechanics of their protocol (outside the AMM), one can nonetheless conclude that Pendle maintains a fungible pool of interest-coupons called “ _Future Yield Tokens_ ” (XYT _)_ by including interest tracking functionality within the tokens transfer functions. Thus, in Pendle, minting can occur without requiring additional deposits. 

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fbd019b90-319e-44ac-a847-e5caf532bf80_8509x3201.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fbd019b90-319e-44ac-a847-e5caf532bf80_8509x3201.png)

Further, as seen above, the cost to transfer XYT is ~2.75x higher than a standard ERC-20 token, implying significantly more calculation is involved.

At Swivel, we have a similar mechanism, and are fans of this design due to the lower overhead and capital efficiency it affords those who are minting tokens.

#### Ownership Token & Future Yield Token AMM’s 

Similar to Element, Pendle has a unique AMM for one-side of the market, in their case a time-depreciating AMM for _Future-Yield Tokens_ (XYTs).

Although the exchange of _Ownership Tokens_ (OTs) is not explicitly mentioned in Pendle’s documentation it is implied that OT’s are expected to be traded on a secondary AMM which does not account for the appreciation that OTs experience as they approach maturity.

Thus, as with Element’s YTs, bootstrapping OT AMM liquidity will be difficult, and the exchange of OT’s generally inefficient. More specifically, users wanting to enter OT positions externally will likely face high slippage given liquidity providers are constantly exposed to theta decay.

* * *

# Swivel Finance

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F2b6f632a-5848-4446-a9f7-89e20b922d84_3298x1535.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F2b6f632a-5848-4446-a9f7-89e20b922d84_3298x1535.png)

> “To enable wider market participation, as well as capital efficient risk management, Swivel introduces interest-rate derivatives in the form of tokenized cash-flows.   
>   
> More specifically, Swivel focuses on providing a professional interface for fixed-yields and risk-management, with an emphasis on capital efficiency for _all_ market participants.”

At Swivel, our mission statement is clear. Our goal is to bring tokenized cash-flows to web3 with an priority placed on marketplace capital efficiency.

#### Minting Interest-Coupons

Accordingly, Swivel’s issuance of interest-coupons _,_ termed _Notional Tokens_ (nTokens) _,_ is optimized in two ways:

  * Notional Tokens include interest-generation and tracking functionality within their transfer function (reducing the overhead present in Element’s _YT_ design).

  * Swivel atomically mints tokens as orders are filled (reducing inventory requirements and transaction overhead).




That said, as with Pendle’s XYTs, the transfer of Swivel’s nTokens is considerably more expensive than Element’s YTs given the costs associated with calculating marginal interest generated between each user’s transfers.

#### Liquidity Provision

Commendably, both Element’s and Pendle’s AMMs account for theta on one side of the market. However, as with most other derivative AMMs, neither account for the wider array of factors involved in standard derivative pricing.

This means that the LPs of either of the protocols constantly give up an edge to takers (who can externally analyze pricing). Further, as with most AMM’s capital efficiency is poor as very little capital is allocated at market prices.

[![Image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F198e2c1b-e12c-4c41-879b-f2d5716f44f2_2276x646.jpeg)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F198e2c1b-e12c-4c41-879b-f2d5716f44f2_2276x646.jpeg)HEGIC Liquidity Provider PnL %

While we are optimistic that there will be continuous development to account for these factors, the demonstrated losses experienced by LPs can be significant ( _as seen above with Hegic LP’s_ ). 

As previously mentioned this likely means riskier and less capital efficient liquidity provision which results in the need to subsidize LP’s perpetually with protocol tokens in order to maintain a competitive spread.

For this reason, we at Swivel conclude that orderbooks are currently, and for the foreseeable future, a necessary component of interest-rate derivative marketplaces, and further, have implemented a flexible orderbook specifically built for these instruments.

#### Combined Markets

An additional optimization present in our design is the combination of interest-coupon ( _nToken_ ) and zero-coupon token ( _zcToken_ ) markets. 

Of note, zcTokens and nTokens together represent full ownership of an underlying asset. This established, a market can remain solvent while allowing users to exit currently held positions in nTokens by either selling them to an initiating nTokens counter-party, or by purchasing zcTokens from an exiting zcToken counterparty.

Swivel applies this concept atomically, and brings the ability to facilitate all of these exchanges through a single orderbook. 

With the alternative to this single orderbook being two separate AMMs (e.g. Element’s YT-Underlying & PT-Underlying), Swivel’s optimization brings an additional **~2x** enhanced capital efficiency. _(Assuming the goal is to facilitate the liquid exchange of both tokens)_

* * *

## Conclusion

Swivel, Pendle, and Element have made different design decisions with different implications for market efficiency:

  * Swivel implements an orderbook that provides customizability and _significant_ capital efficiency enhancements for all market participants (liquidity providers as well as takers).

  * Pendle implements a time-depreciating AMM for interest-coupons that allows liquidity providers to avoid theta-decay.

  * Element implements a time-appreciating AMM for zero-coupon tokens that allows liquidity providers to avoid theta. Element is slightly more interoperable and has a lower cost for token transfers.




#### What’s Next

In upcoming articles, we’ll review a few of the more interesting use-cases emerging for the tokenization of cash-flows, as well as analyze the wider industry that can be bootstrapped with collaboration within the fixed-income and tokenized cash-flow space.

We believe that the next wave of DeFi adoption comes with the bootstrapping of liquidity across all of our protocols and the best way to do so is with purposeful effort towards establishing industry standards. There is an unimaginably large market out there for cash-flows, and collaboration allows it to be realized, so watch out for partnerships on the horizon. 

Beyond this, our kovan [testnet](https://swivel.exchange) is still live, but mainnet inches closer!  
  
Keep an eye out for more announcements as to our audit and mainnet timeline!

— Julian Traversa

* * *

[Website](https://swivel.finance/) | [Substack](https://swivel.substack.com/) | [Discord](https://discord.gg/SkYskDQyVY) | [Twitter](https://twitter.com/SwivelFinance) | [Github](https://github.com/Swivel-Finance) | [Gitcoin](https://gitcoin.co/grants/1773/swivel-finance) | [Careers](https://angel.co/swivel-finance/recruiting/listings)

* * *

### Citations:

  1. Julian Traversa. (2020, December 10). _Swivel Finance Closes 1.15M Seed Round, Bringing Rate-Derivatives to DeFi_. https://swivel.substack.com/p/swivel-finance-closes-115m-seed-round. 

  2. _Swivel Finance Litepaper_. https://swivel.substack.com/p/swivel-finance-closes-115m-seed-round.

  3. Villanueva, W. (2021, March 31). _Element Finance Raises $4.4M to Bring Liquidity to Fixed Rate Income and Interest Markets_. https://medium.com/element-finance/element-finance-raises-4-4m-to-bring-liquidity-to-fixed-rate-income-and-interest-markets-fea72f4ef726. 

  4. _Element Finance Construction paper_. https://paper.element.fi/

  5. Gane, J. (2021, May 10). _Intro to Yield Token Compounding_. https://medium.com/element-finance/intro-to-yield-token-compounding-40a75a11e18c. 

  6. _Pendle Litepaper._ https://docs.pendle.finance/resources/lite-paper



