// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

// Invariants:
// protocol must never be insolvent / undercollateralized
// TODO: users cant create stablecoins with a bad health factor
// TODO: a user should only be able to be liquidated if they have a bad health factor
import {Test} from "forge-std/Test.sol";
import {StdInvariant} from "forge-std/StdInvariant.sol";
import {DSCEngine} from "../../../src/core/DSCEngine.sol";
import {DecentralizedStableCoin} from "../../../src/core/DecenttializedStableCoin.sol";
import {HelperConfig} from "../../../script/HelperConfig.s.sol";
import {ERC20Mock} from "../../../src/mock/ERC20Mock.sol";
import {StopOnRevertHandler} from "./StopOnRevertHandler.t.sol";
import {console} from "forge-std/console.sol";
import {DeployDSC} from "../../../script/DeployDSC.s.sol";

contract StopOnRevertInvariants is StdInvariant, Test {
    DecentralizedStableCoin public dsc;
    HelperConfig public helperConfig;
    DSCEngine public engine;
    StopOnRevertHandler public handler;

    address public ethUsdPriceFeed;
    address public btcUsdPriceFeed;
    address public weth;
    address public wbtc;

    uint256 amountCollateral = 10 ether;
    uint256 amountToMint = 100 ether;

    function setUp() external {
        DeployDSC deployDSC = new DeployDSC();
        (dsc, engine, helperConfig) = deployDSC.run();
        (ethUsdPriceFeed, btcUsdPriceFeed, weth, wbtc,) = helperConfig.activeNetworkConfig();
        handler = new StopOnRevertHandler(engine,dsc);

        targetContract(address(handler));
    }

    function invariant_protocolMustHaveMoreValueThatTotalSupplyDollars() public view {
        uint256 totalSupply = dsc.totalSupply();
        uint256 wethDeposit = ERC20Mock(weth).balanceOf(address(engine));
        uint256 wbtcDeposit = ERC20Mock(wbtc).balanceOf(address(engine));
        uint256 wethValue = engine.getUsdValue(weth, wethDeposit);
        uint256 wbtcValue = engine.getUsdValue(wbtc, wbtcDeposit);

        console.log("wethValue: %s", wethValue);
        console.log("wbtcValue: %s", wbtcValue);
        console.log("totalSupply: %s", totalSupply);
        console.log("count: %s", handler.count());

        assert(wethValue + wbtcValue >= totalSupply);
    }

    // function invariant_gettersCantRevert() public view {
    //     engine.getAdditionalFeedPrecision();
    //     engine.getCollateralTokens();
    //     engine.getLiquidationBonus();
    //     engine.getLiquidationBonus();
    //     engine.getLiquidationThreshold();
    //     engine.getMinHealthFactor();
    //     engine.getPrecision();
    //     engine.getDsc();
    //     // dsce.getTokenAmountFromUsd();
    //     // dsce.getCollateralTokenPriceFeed();
    //     // dsce.getCollateralBalanceOfUser();
    //     // getAccountCollateralValue();
    // }
}
