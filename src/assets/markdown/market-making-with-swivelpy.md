# Market-Making with Swivel.py

## Part 2: An example market-making integration with Scrivel & Swivel.py

**Date not found**

**Likes:** 1

In [part one of our series on market-making](https://swivel.substack.com/p/market-making-in-yield-markets), we described the primary parameters that should be considered in pricing Yield Tokens (YTs), alongside the advantages Swivel offers to YT liquidity providers (LPs).

Our primary conclusion is that a viable solution must offer the custom liquidity ranges of Uniswap v3, while also offering the ability to cancel order and move liquidity at little to no cost.

 **Further, Swivel’s exchange is the only venue that addresses these concerns by allowing users to place limit orders and create custom liquidity ranges at little to no cost.**

By providing quotes with short expiries, LPs can easily adjust their prices with respect to any number of variables, all without incurring transaction fees that would otherwise significantly impact their returns.

This post provides an overview of YT market yield variable management strategy implementation in python, as a companion piece to Part 1.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F7f6e867e-9c2e-4b72-8b3b-33afef8c6c2b_10446x5664.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F7f6e867e-9c2e-4b72-8b3b-33afef8c6c2b_10446x5664.png)

* * *

For an in-depth technical implementation check out our next post, “Part 3” where we will explain in detail how to integrate with Swivel.py.

Today, however, we will review a basic example strategy — Uni v3 range positions that also account for changes in underlying rates, theta and delta. For a full code example, check out Scrivel.

## Improved Uniswap v3 Range Positions

#### Setup:

The first step of any Uni v3 based market-making algorithm is to establish the market you are trading in, and then to set your price range.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F622e82d5-07cc-4c0a-bb48-50e32320ecd3_788x210.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F622e82d5-07cc-4c0a-bb48-50e32320ecd3_788x210.png)

In the above snippet, we set the following variables manually:  
  
 **Market:**

  *  **Underlying** : The underlying token address 

  * **Maturity** : The Swivel market maturity 

  * **Decimals** : The number of underlying token decimals 

  * **Network** : The network on which you are market-making




 **Position:**

  *  **UpperRate** : The highest rate at which to quote 

  * **LowerRate** : The lowest rate at which to quote 

  * **Amount** : The amount of nTokens to use market-making

  *  **NumTicks** : The number of liquidity ticks to split your amount into

  *  **ExpiryLength** : How often orders should be refreshed (in seconds) 

  * **CompoundRateLean** : How much your quote should change when Compound’s rate varies (e.g. 1 = 1:1 change in price) 




* * *

#### Initiation:

After setting up the necessary parameters, the next step in our example is identifying exactly where to place liquidity, while also creating some initial orders.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F329d54dd-c92d-4769-b43a-e78ab87dc637_1315x681.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F329d54dd-c92d-4769-b43a-e78ab87dc637_1315x681.png)

In the above snippet, our strategy:  
 **1.** Identifies the last traded price  
 **2.** Identifies a tick price and liquidity amount  
 **3.** Creates a principal and premium amount from the price and amount  
 **4.** Creates an order with Swivel.py  
 **5.** Signs the order  
 **6.** Places the order

After doing this for each tick, our strategy waits for the user-defined “expiryLength” to pass.

* * *

#### Refreshing Quotes (Queuing Orders):

Once orders expire (we recommend every ~10 minutes), the example then executes these primary steps:  
 **1.** Adjusts price for the time that has passed (maintaining a constant rate)  
 **2.** Adjusts price for changes in Compound’s Rate (scaled by user set delta)  
 **3.** Creates an order queue  
 **4.** Identifies whether orders any have been filled  
 **5.** Queues unfilled orders with adjusted prices  
 **6.** Queues filled orders with adjusted prices (reversed buy/sell)

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F5a44d48c-177f-4766-a7f7-684497e53de8_677x126.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F5a44d48c-177f-4766-a7f7-684497e53de8_677x126.png)Identifying changes in Compound’s underlying rate

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fb035a4ae-7d5d-4cf3-a3ce-14246881e55b_899x90.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fb035a4ae-7d5d-4cf3-a3ce-14246881e55b_899x90.png)Adjusting price with respect to Compound’s rate, and user set lean (Delta)

To adjust for changes in Compound’s rate, the example first identifies the amount the rate has changed, and then identifies the extent to which any change should impact our quote (“compoundRateLean”).

* * *

####  **Consolidating & Placing Orders:**

One caveat: A minimum order size is required in order to reduce gas costs for our takers.

To avoid for triggering minimum, orders with the same price should be consolidated into one single position.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F4fc96f80-9fbe-47b4-89dd-f799c9052fe5_1500x875.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F4fc96f80-9fbe-47b4-89dd-f799c9052fe5_1500x875.png)

We accomplish this order consolidation in the above code snippet by:  
 **1.** Creating an array of “userOrderKeys” and comparing it to the current key.  
 **2.** Looping through the order queue and identifying any orders with the same price, and side (buy/sell).  
 **3a.** If there are any duplicates, combine any necessary order principal & premium, and create a new order.  
 **3b.** Place the combined order.  
 **3c.** If there are no orders to combine, place the original order.  
 **4.** Mark the current order or combined orders as “used.”  
 **5.** Reset and wait the user-set duration until refreshing quotes again. 

* * *

## Conclusion

Using this example Swivel integration, LPs can use the same range-liquidity strategies they are accustomed to utilizing on platforms like Uniswap v3. 

**Further, with the unique design of Swivel’s protocol and exchange, LPs can account for standard derivative pricing models, and utilizing this example can significantly outperform any Yield Token AMM.**

Check in this coming weekend for an in-depth video, as well as a step-by-step walkthrough on running our improved range position example, as well as integrating with swivel-py.

For any questions or interest in testing out the example, stop by our discord: <https://discord.gg/swivel>! Always feel free to ping me at Julian | Swivel#6740!

And, we’re also in search of some talented folks to join our team! If you think you might fit in, regardless of your skillset (devs, artists, operations, whatever!), feel free to reach out directly or [apply](https://www.notion.so/swivelfinance/Swivel-Finance-Job-Board-86a2054c6f61486e9c98494b7cf35f33)!

* * *

 **About Swivel Finance**

Swivel is the decentralized protocol for fixed-rate lending and tokenized cash-flows.

Currently [live](https://swivel.exchange/) on Rinkeby, Swivel Finance provides lenders the most efficient way to lock in a fixed rate as well as trade rates, and liquidity providers the most familiar and effective way to manage their inventory. Through our exchange, traders can take on positions with minimal slippage, even in low liquidity markets. 

* * *

[Website](https://swivel.finance/) | [Substack](https://swivel.substack.com/) | [Discord](https://discord.gg/SkYskDQyVY) | [Twitter](https://twitter.com/SwivelFinance) | [Github](https://github.com/Swivel-Finance) | [Gitcoin](https://gitcoin.co/grants/1773/swivel-finance) | [Careers](https://angel.co/swivel-finance/recruiting/listings)

* * *
