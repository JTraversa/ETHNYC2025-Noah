# Swivel v3: Composable Blockspace Capital Markets & Lido

## The first of a multi-part series on Swivel v3's integration with Lido, Rocketpool & Euler

**Date not found**

**Likes:** 0

_**TL;DR: With the upcoming launch of Swivel v3 and our integration of Lido, lenders can optimize their blockspace production and avoid slashing risks, validator pool dilution and gas price volatility.**_

With the ETH PoS merge complete and discussion surrounding various forks now an afterthought, markets have recently refocused toward both the stETH ←→ ETH premium and the potential increase in yields that come with the merge.

Thanks for reading Swivel Finance! Subscribe for free to receive new posts and support my work.

Subscribe

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fcde60db2-a49e-41cd-9efc-6899497d2795_1920x1080.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fcde60db2-a49e-41cd-9efc-6899497d2795_1920x1080.png)

Today, we’ll investigate the optimal strategies behind ETH2 staking, as well as introduce a new concept — Blockspace Capital Markets.

* * *

# Blockspace Capital Markets & ETH2 

All transactions depend on the settlement of blockspace. Validators and miners supply blockspace, while demand is fueled by the number of transactions processed and the computations these transactions require.

Blockspace supply is relatively static, depending solely on the number of suppliers. However, as on-chain activity increases, blockspace demand scales exponentially. This shifting demand results in network fee increases, MEV tip increases and inherent volatility in blockspace suppliers’(I.e. miner/staker returns).

Moreover, ETH2’s PoS design furthers this dynamic with the introduction of slashing mechanics.

All this means that while ETH’s blockspace may be the most valuable commodity in crypto, valuing ETH’s PoS blockspace is difficult.

* * *

## Blockspace Demand & Value:

In order to estimate the value of ETH’s blockspace, we need to establish the primary factors that contribute to staking yields, as well as the risks that could reduce the APY of stakers.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F6ec92cec-1390-4f68-bb4e-1bbeea9ec359_1920x596.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F6ec92cec-1390-4f68-bb4e-1bbeea9ec359_1920x596.png)

### Primary Yield Contributors

#### Base Reward

The base reward is a relatively static ETH reward that is distributed to the validators of each block, regardless of whether any transactions are actually processed. For those staking pre-merge, 100% of the validator yield was comprised solely of this base reward.

#### Mempool Fees

  *  **Base Fee:** The base fee is determined by the network rather than users looking to transact or miners validating transactions. Ethereum targets 50% full blocks, and the current base fee depends on the congestion of the previous block.

  *  **Priority & Max Fee:** The max fee is what people generally refer to when speaking of “gas price”. Specifically, the max fee refers to the amount of Ethereum paid per unit of computation (gas) in a transaction and users increase this value to ensure their transactions are processed in a timely manner.




[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fdaa27177-7a5b-4796-90c4-dcf5b6eb6507_5834x3880.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fdaa27177-7a5b-4796-90c4-dcf5b6eb6507_5834x3880.png)Increasing Fee Reward Contribution: 1/2018 - 3/2021

#### MEV & Flashbots:

Separate from the mempool fee structure, miners and/or validators can monitor the mempool and execute mutually extractable opportunities to generate yield. Users can also pay external relayers (miners/validators) directly to expedite their transactions, tipping them directly instead of through the mempool.

#### ETH Volatility:

Although mempool fees and MEV contribute independently to blockspace demand, both depend on price volatility.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F06d819dc-5b41-4339-88e7-9c555227e090_5059x1530.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F06d819dc-5b41-4339-88e7-9c555227e090_5059x1530.png)Volatility and ETH Gas Price Correlation

As seen above, both MEV and fee generation are tied to ETH volatility itself. With volatility, general demand of course increases. More specifically, volatility introduces mutually-extractable arbitrage and liquidation opportunities that lead to rapid auctions and increases in blockspace demand.

This means that blockspace demand is also highly dependent on demand for each ecosystem's native asset itself.

 _(The largest remaining confound being NFT auction demand)_

* * *

# Blockspace Value Risks & Performance

Direct user tipping may lead to high APYs, but capturing these tips may also involve adegree of risk, both to a staker’s deposit and to projected blockspace value.

#### Slashing:

As an ETH blockspace producer (validator) your primary role is to validate transactions. However, if a block producer fails to properly validate transactions (due to malicious activity or technical issues / events like power loss, internet downtime, etc.), their deposits may be slashed.

This “slashing” means that a staker can be charged a fee that eats into their yield, and potentially even into their deposit itself.

#### Validator Pool Size:

As time passes, more blockspace producers are given the opportunity to enter the pool of ETH validators.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fe4ef3765-b52d-4056-8a71-d62636e79847_5263x1418.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fe4ef3765-b52d-4056-8a71-d62636e79847_5263x1418.png)ETH2 Deposits Over Time

However, this growth may not be met with growth in blockspace demand, effectively diluting the yield of all stakers progressively over time.

 _Since this time last year, validator growth has diluted yields by ~50%._

#### Gas Prices & Ecosystem Progression:

With the growth of various rollup designs, many believe most blockspace demand will be bundled into efficient Layer-2 transactions.

Although the ecosystem itself may generally grow, if activity is concentrated on Layer-2’s, rent may largely be paid to (currently centralized) actors that perform similar blockspace production capacities, rather than ETH validators.

Significant data is not yet available to support this contention. That said, this is a possibility to watch in the coming months.

* * *

# Swivel v3 & Lido

In coming weeks, we will introduce composable blockspace capital markets to defi with our integration of Lido alongside the launch of Swivel v3 🔥🔥🔥.

We have been planning this launch since the release of our previous report on[ETH2, MEV & Tokenized Cash-Flows](https://swivel.substack.com/p/eth2-mevvev-and-tokenized-cash-flows) nearly a year and a half ago. This release will enhance Swivel’s role in the ETH blockspace — the largest yield generating asset, and most valuable commodity in web3.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F64801dd8-d9d7-4766-a6c8-dbc04a9e2089_1920x1080.jpeg)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F64801dd8-d9d7-4766-a6c8-dbc04a9e2089_1920x1080.jpeg)

### Pricing Blockspace

Estimating the value of ETH blockspace has proven to be extremely difficult. In essence, however, it requires an accurate estimate as to the yield that will be generated until a certain date in the future.

More specifically, the value of ETH’s blockspace over one year would be roughly the yield generated by validators over that year, minus the time premium of initial staking.

This results in the following equation:

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Ff2b3f5d8-fa9f-4b47-a695-f0880d99317d_2798x981.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Ff2b3f5d8-fa9f-4b47-a695-f0880d99317d_2798x981.png)

### Removing Risk

In order to remove all risk for Lido stakers involving both slashing and validator pool dilution, Swivel allows stakers to tokenize and sell their future yield for an upfront premium!

With an estimate as to the yield that may be generated, stakers pass along these risks to others, in the process ensuring their own yield is protected.

Through this mechanic, Swivel’s integration with Lido is then able to uniquely provide staking services with a fixed-yield and removed risks.

### Composable Blockspace Capital Markets

Though staking services like Lido undeniably act as minorly centralizing forces, the liquid staking design offers a number of benefits — namely composability.

The potential of this composability has only begun to be harnessed through liquidity of Curve and leverage on Euler. With Swivel v3, composability goes one step further.

Soon users will be able to stake, protect their principal, leverage their stake, underwrite options and trade futures, all at once and all only possible due to the composability of Lido + Swivel.

* * *

# Whats Next

### Swivel v3 Launch 🚀🚀🚀:

Stay tuned for the official launch date announcement this weekend!

### Euler Gauge Derivatives & Leverage ⚗️🔬

With the release of Swivel v3 imminent we will be continuing our series on the benefits and possibilities that Swivel v3 brings alongside our launch partners.

In the next edition of this series we will discuss the valuable possibilities generated by Swivel v3’s integration with Euler, in particular the leveraged gauge strategies that enable Euler’s lenders and stakeholders to coordinate to amplify their yields in ways previously not possible.

#### Podcast Series — Index Coop 🦉:

We’re also keeping it rolling with “[The DeFi Fix](https://www.youtube.com/channel/UCxS8OBVOPGF-6VQ_H7JWXkA)”, so join in our next livestream and podcast with our friends from the Index Coop!

We’ll talk all things indexes, as well as fixed-yields, and 🚨 we’ll be sure to throw in a few more bits of 🚨 alpha 🚨 on some secret projects in the works across the DeFi space.

* * *

###  **About Swivel Finance**

Swivel is the protocol for fixed-rate lending and tokenized cash-flows.

Currently live on [Mainnet](https://mainnet.swivel.exchange/), Swivel provides lenders the most efficient way to lock in a fixed rate as well as trade rates, and liquidity providers the most familiar and effective way to manage their capital.

* * *

[Website](https://swivel.finance/) | [Substack](https://swivel.substack.com/) | [Discord](https://discord.gg/SkYskDQyVY) | [Twitter](https://twitter.com/SwivelFinance) | [Github](https://github.com/Swivel-Finance) | [Gitcoin](https://gitcoin.co/grants/1773/swivel-finance) | [Careers](https://angel.co/swivel-finance/recruiting/listings)

* * *

Thanks for reading Swivel Finance! Subscribe for free to receive new posts and support my work.

Subscribe
