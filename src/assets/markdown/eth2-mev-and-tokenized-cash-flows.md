# ETH2, MEV & Tokenized Cash-Flows

## A discussion surrounding the utility of tokenized cash-flows in the context of staking derivatives, MEV, and decentralized volatility prediction markets.

**Date not found**

**Likes:** 2

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F7534fe0d-0369-4058-b243-747ce550a55f_3358x1535.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F7534fe0d-0369-4058-b243-747ce550a55f_3358x1535.png)

In part two of our series, we discussed a number of Swivel’s primary use-cases within the current ecosystem. 

However as the ecosystem approaches the ETH2 merge and staking derivatives enable the interoperable capture of ETH2 yields (and therefore MEV), Swivel’s use cases expand.

### M̶i̶n̶e̶r̶ Maximal Extractable Value (MEV)

While proof-of-work (PoW) provides a guarantee that peers will process transactions and eventually come to a consensus regarding their validity, PoW provides no guarantee as to the order in which transactions will be processed, nor even whether they will be processed at all.

This arbitrary transaction ordering allows miners to ignore the sequence in which transactions are received, and generally reorder transactions such that the miner extracts any mutually available opportunities and captures additional revenue.

The extracted revenue (MEV) then primarily consists of decentralized-exchange arbitrage, with additional revenue coming from malicious transaction realignment (e.g., sandwich attacks) and smart-contract vulnerability frontrunning. 

### Validator Extractable Value

While the ETH2 merge reinforces the long-term health of the Ethereum ecosystem, arbitrary transaction sequencing/ordering will remain for the foreseeable future.

That said, given ETH2 ushers in the transition to PoS (proof-of-stake), the cohort controlling this arbitrary sequencing shifts from miners and mining pools to validators and staking pools.

MEV will continue to consist of the same activity (e.g. arbitrage, liquidation), however instead of revenue accruing to centralized mining services, it will accrue to a variety of centralized and decentralized staking services which each have varying incentive structures as to MEV distribution.

* * *

# MEV and ETH2 Yields

Accepting that MEV is likely here to stay, those staking should understand the impact that it will have on their returns, and the volatility of their potential yields.

Unfortunately, estimating MEV is particularly difficult. Miners can easily obfuscate their activity, leaving Flashbots (a public marketplace for MEV auctions) as the only real source of MEV data. 

For those less familiar, Flashbots facilitates an off-chain auction for transaction sequencing separate from the standard mempool. This allows for the efficient and more democratized distribution of MEV, and importantly serves as a lower bound/estimate of MEV based solely on the blocks produced by those miners running Flashbots-compatible clients. 

To broadly summarize some of Flashbots’ initial research, there appears to be a “Realized Extractable Value” (actual profit) of roughly ~0.185 ETH per block. 

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F3f053a29-9dc7-4314-9325-18de97addd55_717x496.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F3f053a29-9dc7-4314-9325-18de97addd55_717x496.png)VEV’s Impact on Validator Returns (Flashbots’ Research)

Then applying this ~0.185 reward to ETH2 validation, validators receive a conservatively estimated ~70-100%+ enhanced yield when including MEV extraction, as shown above.

* * *

# Liquid Staking & MEV

### Liquid Staking “Derivatives”

In order to stake ETH, a user must deposit 32 ETH to back a validator, as well as acquire the hardware to run said validator. Accordingly, whether due to the high cost or inconvenience of running a validator, many ETH stakers have instead been turning to third party staking services. _(Lido now stakes almost[1M ETH](https://defillama.com/protocol/lido); and JP Morgan [conservatively claims](https://www.forbes.com/sites/emilymason/2021/07/01/jpmorgan-says-ethereum-upgrades-could-jumpstart-40-billion-staking-industry/) that staking will be a $40B industry in the coming years.)_

Whether centralized or decentralized, most of the top staking services provide a token that represents a user’s deposit 1-1. Users can then withdraw this “staking derivative” token, and exchange/transfer the token as they might with their underlying ETH (e.g. lending, trading), while still generating a yield from staking. 

#### Enforcing fair MEV distribution

Given MEV revenue then accounts for ~50%+ of ETH2 yields (as a lower bound), the fair distribution of that revenue is critical to ensure equity among investors. With this expectation, major staking protocols, [Lido](https://lido.fi/) and [Rocketpool](https://www.rocketpool.net/), both plan to enforce the fair distribution of MEV revenue to stakers.

Rocketpool:

  * [Research](https://github.com/rocket-pool/rocketpool-research/blob/master/Analysis.md)

  * [Medium Post](https://medium.com/rocket-pool/the-merge-0x02-mev-and-the-future-of-the-protocol-c7451337ec40)




Lido:

  * [Research](https://research.lido.fi/t/implementing-mev-strategies-to-increase-apr/712/2)

  * [Hackathon Code](https://github.com/lidofinance/rayonism-mev-hackathon)




Though the transparency of each solution will likely determine their perceived efficacy, both can serve as a basis for the tokenization and trade of MEV. 

* * *

# Tokenizing ETH2 Yields & MEV

In a manner similar to Swivel’s tokenization of yield on Compound, Aave or Yearn, investors can use Swivel to split a staking derivative from either Rocketpool or Lido into two assets — one representing underlying ETH (zcETH), and the other representing the yield generated from staking (nETH).

Given current data suggests MEV will account for >50% of ETH2 staking yields, the yield generating nETH token largely represents a liquid claim to ETH2 yields, and therefore MEV. This MEV however is highly volatile. 

### ETH2 & MEV Volatility

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Ffbe06eb5-6235-4f0a-8dd8-0036c7cb8bf5_13213x2739.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Ffbe06eb5-6235-4f0a-8dd8-0036c7cb8bf5_13213x2739.png)ETH MEV and ETH Spot Volatility

ETH2 yield/MEV volatility is driven by a number of factors including consensus risk (blocks proposed, slashing, etc.) however due to MEV’s significant impact on yields, the largest factor is spot asset volatility across the ecosystem. 

Spot volatility plays two major roles. As spot prices vary, DEX arbitrage opportunities arise, and borrowing collateralization ratios fluctuate leading to liquidation, both representing the primary sources of MEV. Further, with extended periods of spot volatility gas costs increase, directly resulting in an increased tip/reward for ETH2 validators.

### Managing MEV Volatility (Staking Derivative-Derivatives)

With the ability to tokenize ETH2/MEV on Swivel, ETH2 stakers can lock in fixed-yields, manage risks, and/or degen out by maximizing their yields / speculating on MEV.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F5502e6e1-ca69-4b2a-b961-2efcac318590_1129x644.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F5502e6e1-ca69-4b2a-b961-2efcac318590_1129x644.png)Tokenized ETH2 Yields with Swivel

 **Managing risk (Fixed-Yields):  
** For example, a staker might find yields float around 5-6%. With MEV, this staker _might_ be able to receive a floating 10-12%, but this 10-12% relies on volatility, and involves unpredictable risk. Instead this user could use Swivel to lock in a ~10% rate up-front, avoiding complication/risks and significantly exceeding the rate they otherwise would receive without transparent MEV distribution.

 **Maximizing MEV:  
** Alternatively, a staker might _*want*_ to extend this risk and maximize their exposure to MEV yields. This staker could easily purchase nETH from Swivel, and assuming a similar rate, receive exposure to 10 ETH of ETH2/MEV yield for every 1 ETH spent/year.

 **Volatility Prediction Markets:**

Given the established correlation between MEV and volatility, the liquid value of nETH can partially serve as a decentralized volatility index for the entirety of the Ethereum ecosystem. ( _This deserves its own causal research_ )

Insofar, volatility indexes require off-chain oracles, and as such nETH is unique in its ability to mirror the future volatility of assets within the Ethereum ecosystem, without necessitating a centralized price feed.

* * *

## Conclusion:

The ETH2 merge in tandem with staking derivatives such as Lido and Rocketpool can enable the liquid capture of ETH2 yields. 

Given MEV accounts for the majority of ETH2 yields, Swivel’s tokenization of ETH2 staking derivative cash-flows will result in the liquid capture of MEV.

Through this mechanic, Swivel enables investors to stake for fixed-yields, optimize their staking exposure, or otherwise manage their staking cash-flows.

Further, due to the strong correlation/causation between volatility and MEV, Swivel enables the creation of a decentralized volatility prediction market.

#### What’s Next

In upcoming articles, we’ll take a look at the larger impact that decentralized cash-flow markets can have on CeFi. With purposeful collaboration, the market for cash-flows will continue to grow, and we can’t wait to share all that we’ve worked on to push for this growth.

Our Kovan [testnet](https://swivel.exchange/) is still live, with a _*large*_ update in the next couple weeks.  
  
Stay tuned for more information on our token, audit and mainnet release!

— Julian Traversa

* * *

[Website](https://swivel.finance/) | [Substack](https://swivel.substack.com/) | [Discord](https://discord.gg/SkYskDQyVY) | [Twitter](https://twitter.com/SwivelFinance) | [Github](https://github.com/Swivel-Finance) | [Gitcoin](https://gitcoin.co/grants/1773/swivel-finance) | [Careers](https://angel.co/swivel-finance/recruiting/listings)

* * *

## Citations:

  1. Obadia, A., & Vemulapalli, T. (n.d.). _MEV in eth2 - an early exploration_. HackMD. https://hackmd.io/@flashbots/mev-in-eth2. 

  2. Obadia, A., & Vemulapalli, T. (n.d.). _Analysis of MEV rewards in ETH2_. GitHub. https://github.com/flashbots/eth2-research/blob/main/notebooks/mev-in-eth2/eth2-mev-calc.ipynb. 

  3. _Implementing MEV strategies to increase APR_. Lido Governance. (2021, June 15). https://research.lido.fi/t/implementing-mev-strategies-to-increase-apr/712/2. 

  4. Lidofinance. (n.d.). _lidofinance/rayonism-mev-hackathon_. GitHub. https://github.com/lidofinance/rayonism-mev-hackathon. 

  5. Langley, D. (2021, June 23). _The Merge, 0x02, MEV, and the Future of the Protocol_. Medium. https://medium.com/rocket-pool/the-merge-0x02-mev-and-the-future-of-the-protocol-c7451337ec40. 

  6. Rocket-Pool. (n.d.). _Post-Merge APY Analysis_. GitHub. https://github.com/rocket-pool/rocketpool-research/blob/master/Analysis.md. 




* * *
