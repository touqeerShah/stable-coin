# stable-coin

We user Foundry for development and deployment of the porject.

1. ( Relvative stability ) Anchored or Peg  -> Dollar $1.00
    1. Chainlink Price Feed (To calculate Coin Price always around the Price)
    2. Set a Function to exchange ETH& BTC -> Dollar 
2. Stability Mechanism (Minting): Algorithmic (decentrialized)
   1.  People can only mint the stablecoin with enough collateral (coded)
3. Collaterial : Exogenous (Crypto) {wBTC, or wETH}
 

### Step to install and setup

1. Follow step from link to install `https://book.getfoundry.sh/getting-started/installation`

2. Create project `forge init`

3. Add Openzeppelin Contract for support  `forge install openzeppelin/openzeppelin-contracts --no-commit` and `forge install smartcontractkit/chainlink-brownie-contracts --no-commit`

4. we create two contract Stable ERC20 coin and Engine
5. we set threshold to let said %150  to collateral mean we never all system to be go down to this if it happend we liquidated coin to make it stable token price 
    - Ask someone to liqiuidated there coin in return he will recevied reward of collateral which always more then the actual coint values to motivate user to make system stable
6. to run network local you `avvil` it give you network some as `hardhat node` 
7. compile `forge build`
8. Run Specfic Test `forge test -m nameOfFunction`  and `-vvv` for get more details in case of fail  Local or if one chain `forge test -m nameOfFunction --fork-url $SEPOLIA_RPC_RUL`
9. To check test coverage and analys contract ` forge coverage`


### Read Doc 

AAve For health factor which mean it health to allow user to mint more stable coin agistn his/her collateral 

```
https://docs.aave.com/risk/asset-risk/risk-parameters#health-factor
```
To see Price Seed details on chainlink
```
https://docs.chain.link/data-feeds/price-feeds/addresses
```
# Thank you!

[![Touqeer Medium](https://img.shields.io/badge/Medium-000000?style=for-the-badge&logo=medium&logoColor=white)](https://medium.com/@touqeershah32)
[![Touqeer YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/channel/UC3oUDpfMOBefugPp4GADyUQ)
[![Touqeer Linkedin](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/touqeer-shah/)
