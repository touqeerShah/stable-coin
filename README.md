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
6. to run network local you `anvil` it give you network some as `hardhat node` 
7. compile `forge build`
8. Run Specfic Test `forge test -m nameOfFunction`  and `-vvv` for get more details in case of fail  Local or if one chain `forge test -m nameOfFunction --fork-url $SEPOLIA_RPC_RUL`
9. To check test coverage and analys contract ` forge coverage`

10. We move to fuzz testing in which we are main focus is on statfull testing (invariants) we config our `foundry.toml` file that run the function in sequence define in handler to make test more effective `fail_on_revert` is main one if you want to continue testing even it fails to check all other possibility.

11. Get list of all function in contract `forge inspect Contract-Nmae methods`

12. also create `.secret` for you `env` variables add config into `foundry.toml` file.

```
fs_permissions = [{ access = "read", path = "./"}]

```
### Read Doc 

AAve For health factor which mean it health to allow user to mint more stable coin agist his/her collateral 

```
https://docs.aave.com/risk/asset-risk/risk-parameters#health-factor
```
To see Price Seed details on chainlink
```
https://docs.chain.link/data-feeds/price-feeds/addresses
```

### Command to deploy contract
```
export PROVIDER_URL=http://127.0.0.1:8545
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
forge create --rpc-url "http://127.0.0.1:8545"  --private-key $PRIVATE_KEY src/lib/OracleLib.sol:OracleLib


forge create --rpc-url $PROVIDER_URL  --constructor-args 8 100000000000   --private-key $PRIVATE_KEY src/mock/MockV3Aggregator.sol:MockV3Aggregator



btcUsdPriceFeed BTC Address 0x5FbDB2315678afecb367f032d93F642f64180aa3
sepolia btcUsdPriceFeed BTC Address 0xAB8d249De93951b2c53284d97030B3e715172ff3

forge create --rpc-url $PROVIDER_URL  --constructor-args 8 200000000000   --private-key $PRIVATE_KEY src/mock/MockV3Aggregator.sol:MockV3Aggregator


ethUsdPriceFeed  0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
sepolia ethUsdPriceFeed  0x8aa3Fe2bb955443691dAca5f6A7CCF521CbE6a6a


forge create --rpc-url $PROVIDER_URL  --constructor-args "WETH" "WETH" 0x0308b55f7bACa0324Ba6Ff06b22Af1B4e5d71a74 200000000000   --private-key $PRIVATE_KEY src/mock/ERC20Mock.sol:ERC20Mock

wethMock 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
sepolia wethMock 0x682f6Aa39072dD888b4A5ee98e1BAe97732b4e5C

forge create --rpc-url $PROVIDER_URL  --constructor-args "WBTC" "WBTC" 0x0308b55f7bACa0324Ba6Ff06b22Af1B4e5d71a74 200000000000   --private-key $PRIVATE_KEY src/mock/ERC20Mock.sol:ERC20Mock

wbtcMock 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
sepolia wbtcMock 0xD3b9689aa79Fff82AAdC0798B59090799761E6de



forge create --rpc-url $PROVIDER_URL --private-key $PRIVATE_KEY src/core/DecenttializedStableCoin.sol:DecentralizedStableCoin


DecentralizedStableCoin 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
sepolia DecentralizedStableCoin 0xc987EFDd8f17a23EC899bBa38E57D47BF8249FaD

export tokenAddresses="[0xD3b9689aa79Fff82AAdC0798B59090799761E6de,0x682f6Aa39072dD888b4A5ee98e1BAe97732b4e5C]"
export priceFeedAddresses="[0xAB8d249De93951b2c53284d97030B3e715172ff3,0x8aa3Fe2bb955443691dAca5f6A7CCF521CbE6a6a]"
export dsc="0xc987EFDd8f17a23EC899bBa38E57D47BF8249FaD"
export ETHERSCAN_API_KEY=<YOUR-SNOWTRACE-API-KEY>

forge create --rpc-url $PROVIDER_URL  --constructor-args $tokenAddresses $priceFeedAddresses 0xc987EFDd8f17a23EC899bBa38E57D47BF8249FaD      --private-key $PRIVATE_KEY src/core/DSCEngine.sol:DSCEngine


DSCEngine 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
sepolia DSCEngine 0xBbEa7857e75aE30bC71708c190aCd4159268d5BF

change ownership

cast send 0xc987EFDd8f17a23EC899bBa38E57D47BF8249FaD  "transferOwnership(address)"  0xa81532b2d134CdB8b26f5eCd712436f28a62Aa80 --rpc-url $PROVIDER_URL --private-key $PRIVATE_KEY

forge verify-contract --chain-id 11155111 --constructor-args $(cast abi-encode "constructor(address[],address[],address)" "[0xD3b9689aa79Fff82AAdC0798B59090799761E6de,0x682f6Aa39072dD888b4A5ee98e1BAe97732b4e5C]" "[0xAB8d249De93951b2c53284d97030B3e715172ff3,0x8aa3Fe2bb955443691dAca5f6A7CCF521CbE6a6a]" "0xc987EFDd8f17a23EC899bBa38E57D47BF8249FaD"  ) --etherscan-api-key  $ETHERSCAN_API_KEY 0xBbEa7857e75aE30bC71708c190aCd4159268d5BF src/core/DSCEngine.sol:DSCEngine



forge verify-contract  0xBbEa7857e75aE30bC71708c190aCd4159268d5BF --constructor-args  $tokenAddresses $priceFeedAddresses 0xE8828A94Aea8B718dA0a36b4171723F12080Bb3f src/core/DSCEngine.sol:DSCEngine --etherscan-api-key  E68FRNFXV8W9IC7ZVYUQ4WNZRH7MRXURV8 --chain-id 11155111 --verifier-url https://sepolia.infura.io/v3/d5c41dccf31d4df99af77831b59ea59f  




cast send DSC_ADDRESS  "transferOwnership(address)"  DSC_ENGINE --rpc-url $PROVIDER_URL --private-key $PRIVATE_KEY

forge script script/DeployDSC.s.sol:DeployDSC --broadcast --verify --rpc-url ${GOERLI_RPC_URL}


```
# Thank you!

[![Touqeer Medium](https://img.shields.io/badge/Medium-000000?style=for-the-badge&logo=medium&logoColor=white)](https://medium.com/@touqeershah32)
[![Touqeer YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/channel/UC3oUDpfMOBefugPp4GADyUQ)
[![Touqeer Linkedin](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/touqeer-shah/)
