# Swivel v3: Euler & Leveraged Gauges

## An overview of how Euler gauges and governance impact yield token pricing

**Date not found**

**Likes:** 1

With Swivel v3, we introduced a number of key integrations, notably the recent launch of our Euler USDC markets.

At face value, this integration is relatively straightforward — Users can lend at the highest available fixed rate for USDC, or alternatively can speculate on Euler’s USDC yields.

However with the addition of Euler’s unique incentive Gauges, the integration represents a much more interesting proposition, _**access to gauge and governance derivatives.**_

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F5ed3933e-b8a3-458f-8bab-7d18e46c6231_8334x4688.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F5ed3933e-b8a3-458f-8bab-7d18e46c6231_8334x4688.png)

* * *

## Pricing Yield Tokens

As discussed in previous articles ([1](https://swivel.substack.com/p/swivel-v3-composable-blockspace-capital) -[ 2](https://swivel.substack.com/p/market-making-in-yield-markets) -[ 3](https://swivel.substack.com/p/so-why-an-orderbook)), the approximate “value” of a yield token is equivalent to its projected future yield.

However in order accurately project future yield one must consider a handful of variables which influence yield accrual (and therefore yield token value).

### Theta

The factor most commonly discussed, and the only factor accounted for by contemporary AMMs — _Time._

As time passes, a yield token’s maturity inches closer and less time remains to accrue yield.

[![Pendle AMM — A Closer Look. A deeper dive on Pendle&#39;s AMM for asset… | by  Pendle Team | Pendle | Medium](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fdab676e9-cb8d-4793-9cdb-7de337c94adf_381x278.gif)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fdab676e9-cb8d-4793-9cdb-7de337c94adf_381x278.gif)Pendle YT AMM

As less time remains, less yield can be accrued. Therefore, the “value” of a yield token is always depreciating, as accounted for in the Pendle AMM shown above.

### Market APY

The most obvious factor that determines yield projection and thus yield token “value” — the actual APY that the yield tokens are earning.

If the USDC APY on Euler increases, the value of an Euler USDC yield token should increase. Similarly should the APY decrease, the value of its yield token also should decrease.

 _ **No contemporary AMMs account for changes in APY (leading to permanent “impermanent” loss for LPs), however at Swivel our LPs can adjust their orders and ensure their quotes accurately represent a current projection of future yield.**_

### APY Volatility

Most similar to options, one major factor influencing yield token value is ithe volatility of a yield token’s underlying APY.

More Volatility = More Value

[![Finding the implied volatility | Code and Finance](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F047a4232-8f07-4d84-b747-d43adde2b8ae_419x120.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F047a4232-8f07-4d84-b747-d43adde2b8ae_419x120.png)Options Pricing & Volatility

Options valuation typically assumes an option is worth more if its market is more volatile because the strike is more likely to hit during the option period.

Similarly, yield tokens are assumed to be more valuable if their underlying APY is more volatile because a future return to mean may be more likely.

* * *

## Euler Gauges, Borrow Demand & APY

One of the interesting ways that Euler onboards users is through the EUL token’s direction of borrowing incentives — “Gauges”

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Faaf480f6-5d31-46fd-9915-6cd0235f7f7d_1149x836.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Faaf480f6-5d31-46fd-9915-6cd0235f7f7d_1149x836.png)

Euler’s gauges allow EUL token holders to vote for supported assets, and in doing so direct a quadratically proportional amount of future EUL incentives.

### Euler Gauge Impact on Yield

These incentives reward borrowers for their activity and absorb their costs, resulting in a direct relationship between APY and EUL incentives.

As an asset’s gauge receives more votes, its APY increases, and inversely a reduction of votes leads to a reduction in APY.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F15e2d659-6c79-4114-aa82-da1589190aa1_4764x1638.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F15e2d659-6c79-4114-aa82-da1589190aa1_4764x1638.png)+.03% Cost to borrow USDC

As shown above, in many cases these incentives account for the majority of the borrow demand, leading to situations where the APY from EUL incentives eclipses the cost to borrow until arbitrageurs come in.

### Case Studies — DAI & WBTC

This relationship has been highlighted as certain asset’s gauges lost popularity, and incentives dropped off completely — namely the DAI and WBTC markets.

####  **DAI**

DAI is a relatively liquid asset on Euler with $5.67M supplied and a historic average APY of ~1.3%.

 _ **However in early September, the DAI incentives ceased and this led to an immediate decrease in APY to ~0.2%, implying EUL incentives accounted for ~85% of DAI borrow demand.**_

####  **WBTC**

While DAI has natural borrowers as a stablecoin, WBTC borrowers tend to long/short and its borrow demand is much less predictable. Historically, WBTC’s APY’s on Euler have ranged from 0.6-0.9% APY, with ~$5-10m in WBTC supplied.

 _However during September’s second epoch, WBTC’s incentives also ceased, leading to the depression of WBTC APYs from 0.8% → 0.04% and implying EUL incentives contribute to a significant ~95% of WBTC borrow demand._

* * *

## Swivel v3 & Leveraged Gauges

Given borrow demand is largely fueled by Euler gauges and EUL incentives, Euler’s Swivel v3 integration represents much more than a simple fixed-rate lending integration.

### Leveraged Gauges

Recent profitable gauging strategies have relied on deposits into niche markets like STG or VEGA, leaving speculators exposed to significant risks and opportunities largely limited to insiders.

 _ **However with the launch of Swivel v3, EUL holders can use Swivel to purchase yield tokens and increase their exposure to a given market before voting for its gauge.**_

This effectively means that EUL holders have the ability to gain significant leverage and increase profit from any gauge strategy.

As an example, if an EUL holder purchased yield tokens during the period in which DAI APYs dropped to ~0.2%, they would have captured a ~400% profit as their gauge reactivated.

### The Euler Central Bank

With access to yield derivatives and the ability to speculate on future Euler yields, Euler can begin to serve as a central reserve for the lending stack, with EUL holders acting as a DeFi native reserve board.

EUL holders are able to project, enforce and speculate on Euler APYs and EUL gauges while themselves actively participating in the direction of EUL incentives.

Moreover, with the additional profit possible through the application of EUL gauges, the launch of Swivel v3’s Euler integration represents a significant mechanic that enhances EUL token value accrual.

* * *

###  **About Swivel Finance**

Swivel is the protocol for fixed-rate lending and tokenized cash-flows.

Currently live on [Mainnet](https://mainnet.swivel.exchange/), Swivel provides lenders the most efficient way to lock in a fixed rate as well as trade rates, and liquidity providers the most familiar and effective way to manage their capital.

* * *

[Website](https://swivel.finance/) | [Substack](https://swivel.substack.com/) | [Discord](https://discord.gg/SkYskDQyVY) | [Twitter](https://twitter.com/SwivelFinance) | [Github](https://github.com/Swivel-Finance) | [Gitcoin](https://gitcoin.co/grants/1773/swivel-finance) | [Careers](https://angel.co/swivel-finance/recruiting/listings)

* * *
