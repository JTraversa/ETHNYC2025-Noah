# Securing DeFi's Legos

## A review of our recent FeiRari exposure as well as our learnings, and some suggested best practices

**Date not found**

**Likes:** 0

On Saturday April 30th, one month ago, Rari’s major pools were attacked through the abuse of a re-entrancy vulnerability to the tune of roughly ~$80,000,000.

This included FeiRari Pool-8, leaving Swivel with an exposure of ~$2m, 90% of which was quickly recovered with the aid of our team, with a full post-mortem released quickly thereafter: [Link](https://swivel.substack.com/p/rari-vulnerability-post-mortem?s=w)

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F106ef1ea-0948-4244-83f4-d0f69cf71685_10680x6201.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F106ef1ea-0948-4244-83f4-d0f69cf71685_10680x6201.png)

These events tested the mettle of our team, but more importantly tested our security procedures – resulting in the identification of our current strengths, as well as key learnings regarding potential improvements.

* * *

## Key Highlights:

To organize our analysis, we’ve separated our security considerations into those regarding an exploit in our own codebase, and those regarding potential exploits in a partner money-market (e.g. Compound, Aave, Euler).

####  **Internal Considerations:**

  * Pausing All Markets

  * Pausing Individual Markets

  * Security Module Implementation




####  **External Considerations:**

  * Pausing Individual Markets

  * Potential Cancellation of Individual Markets

  * Marking PTs/YTs:

    * Implying Prices

    * Socializing Losses

  * Audit Procedures and Security Module Coverage




* * *

## Pausing Markets

To respond to a shortfall event / vulnerability, most protocols intuitively choose to implement admin functionality with the ability to pause contract execution to prevent any further loss.

This ability to pause contracts unfortunately has complicated implications for protocols like ours which lock user funds until a future date. This risk is compounded by potential exposure across multiple integrated partner protocols.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F5d0b8ab9-3986-4a6e-9a5a-33c5cadc3f70_4445x2501.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F5d0b8ab9-3986-4a6e-9a5a-33c5cadc3f70_4445x2501.png)

####  **Pausing All Markets**

In many cases, it may be necessary to pause a protocol completely as an initial failsafe to prevent loss. Examples of such a scenario include those when a protocol like Swivel experiences a shortfall or when an endemic event happens, such as chain halts or oracle failures.

Most protocols, including our own, include the ability to pause markets completely. However, doing so opens a number of questions regarding the redemption of funds.

####  **Pausing Individual Markets**

In other cases, a vulnerability may not reside in the Swivel integration layer, but in a partner protocol’s codebase. In such cases, including the recent Rari hack, it may not make sense to pause a protocol completely, but to pause only those markets exposed to a vulnerable partner.

Swivel did not have this functionality in our current deployment, but has already added it for our upcoming Swivel v3 release. 

Doing so allows unaffected users to continue to lend freely. However, questions remain regarding redemption for users exposed to affected partners..

####  **Reactive User Interfaces**

One issue Rari faced after their loss was confusion surrounding which pools were impacted or paused, and how their deposits were affected. Only after users deposited and lost additional funds was the protocol’s user interface updated to reflect the current insolvent state.

To prevent unnecessary user losses, it is extremely important to pre-emptively develop a paused market UI and ideally tie its transition to your on-chain pause events. Doing so prevents potential confusion while ensuring users avoid potentially disadvantageous transactions.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F147411ff-bd95-45fa-aed8-1f520412af1f_2756x2918.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F147411ff-bd95-45fa-aed8-1f520412af1f_2756x2918.png)

* * *

## Canceling A Market

In the case of our FeiRari market, the FEI team has committed to a full fund reimbursement with 75% of the community’s support: [Snapshot Link](https://snapshot.org/#/fei.eth/proposal/0x17f4d3b0f4d54296b4c36e79fa186d6379d0c0a1ac2b27a599780b5db853de43)

Further, Swivel likely will be able to recover 100% of funds regardless of any FeiRari reimbursement.

However, should recovery _not_ have been possible, a complete market cancellation and attempt to distribute funds appropriately would be necessary.

####  **Cancellation**

While a paused market may retain the ability to combine PTs/YTs for redemption, a canceled market locks in current balances and prevents any further user interaction.

Further actions are required to distribute remaining funds in the marking of protocol tokens, and socialization of losses.

####  **Funds Distribution & Token Marking**

While nTokens represent the claim to future yield (that may not exist in the event of a hack), they still have current value.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F2188a2ae-2c60-4b25-b6b8-2f90004e4dbb_1106x266.gif)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F2188a2ae-2c60-4b25-b6b8-2f90004e4dbb_1106x266.gif)

As users lend and trade YTs (nTokens) and PTs (zcTokens) in any protocol, they establish some implied ownership of the underlying deposit.

That said, in order to ensure all users are proportionally reimbursed in the event of a market cancellation, a reasonable price needs to be established for both PTs, and YTs.

The methodology to mark tokens may vary; however we suggest a 7-day TWAP (time-weighted average price).

Once a TWAP has been established, each token’s price represents its claim to the total reimbursement, with any losses addressed proportionally for example, if a $10,000,000 TVL market was canceled after a $2,000,000 vulnerability and the nToken TWAP is $0.05, nToken holders would have a claim to 5% of the remaining $8,000,000.

* * *

## Security Modules

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fd1e04c4a-d149-4a53-9840-c4a4be77a27a_4626x4643.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fd1e04c4a-d149-4a53-9840-c4a4be77a27a_4626x4643.png)

As discussed in one of our previous blogs ([Link](https://medium.com/swivel-finance/the-swiv-token-swivel-dao-the-ssm-dd8ce33f0b36)), as well as proposed in governance ([Link](https://gov.swivel.finance/t/stkswiv-a-core-mechanic-of-the-swivel-safety-module/205)) Swivel will be launching a security module to backstop shortfall events in the very near future, and we recommend most fixed-rate protocols implement a similar module or derivative.

Nonetheless, questions remain regarding the coverage a security modules should have to effectively and equitably address vulnerabilities in internal/external codebases.

####  **Covering Internal Vulnerability**

Intuitively, should a vulnerability exist in our own codebase, our security module should cover its shortfall loss.

That said, conceptual questions still arise. Should we cover loss from peg divergence? Should we cover loss from front-end fat fingers? Questions like these need to be answered preemptively.

####  **Covering External Codebases**

External codebase coverage is a much more difficult proposition for a number of reasons:

  * Potential double-coverage (leading to abusable attacker incentives)

  * Limited integration opportunity (only battle-tested protocols can be covered)

  * Increased audit costs (regular external reviews required)




Nonetheless, selected external codebases may still be covered with thorough due diligence. Should a battle-tested protocol receive sufficient internal and third party review, as well as a significant exposure factor and uptime, coverage could rationally be extended to that external codebase.

* * *

###  **About Swivel Finance**

Swivel is the protocol for fixed-rate lending and tokenized cash-flows.

Currently live on [Mainnet](https://mainnet.swivel.exchange/), Swivel provides lenders the most efficient way to lend at a fixed rate as well as trade rates, and provides liquidity providers the most familiar and effective way to manage their capital.

* * *

[Website](https://swivel.finance/) | [Substack](https://swivel.substack.com/) | [Discord](https://discord.gg/SkYskDQyVY) | [Twitter](https://twitter.com/SwivelFinance) | [Github](https://github.com/Swivel-Finance) | [Gitcoin](https://gitcoin.co/grants/1773/swivel-finance) | [Careers](https://angel.co/swivel-finance/recruiting/listings)

* * *
