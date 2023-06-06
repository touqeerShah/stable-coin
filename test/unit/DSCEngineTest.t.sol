// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Test} from "forge-std/Test.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {DeployDSC} from "../../script/DeployDSC.s.sol";
import {DecentralizedStableCoin} from "../../src/core/DecenttializedStableCoin.sol";
import {DSCEngine} from "../../src/core/DSCEngine.sol";
import {ERC20Mock} from "../../src/mock/ERC20Mock.sol";
import {IDSCEngine} from "../../src/interface/IDSCEngine.sol";

/**
 * Here we wirte our unit test for all the fucntion which we have created so far
 */

contract DSCEngineTest is Test {
    DeployDSC deployDSC;
    DecentralizedStableCoin dsc;
    DSCEngine engine;
    HelperConfig helperConfig;

    address public ethUsdPriceFeed;
    address public btcUsdPriceFeed;
    address public weth;
    address public wbtc;
    uint256 public deployerKey;

    address public USER = makeAddr("user");
    uint256 public constant AMOUNT_COLLATERAL = 10 ether;
    uint256 public constant START_ERC20_BALANCE = 1000 ether;

    function setUp() public {
        deployDSC = new DeployDSC();
        (dsc, engine, helperConfig) = deployDSC.run();

        (ethUsdPriceFeed, btcUsdPriceFeed, weth, wbtc, deployerKey) = helperConfig.activeNetworkConfig();
        ERC20Mock(weth).mint(USER, START_ERC20_BALANCE);
    }

    /**
     * Price Test **********
     */

    function testGetUsdValue() public {
        uint256 ethAmount = 15e18;
        // 15e18 *2000/ETH it is Default price when we run local on mock contract
        uint256 expectedUsd = 30000e18;
        uint256 actualUSD = engine.getUsdValue(weth, ethAmount);
        assertEq(expectedUsd, actualUSD);
    }
    /**
     * Deposit Test **********
     */

    function testRevertIfCollateralZero() public {
        vm.startPrank(USER);
        ERC20Mock(weth).approve(address(engine), AMOUNT_COLLATERAL);
        vm.expectRevert(IDSCEngine.DSCEngine__AmountMustBeMoreThanZero.selector);
        engine.depostCollateral(weth, 0);
        vm.stopPrank();
    }

    function testRevertIfInvlaidCollatarlAddress() public {
        vm.startPrank(USER);
        ERC20Mock(weth).approve(address(engine), AMOUNT_COLLATERAL);
        vm.expectRevert(abi.encodeWithSelector(IDSCEngine.DSCEngine__TokenNotAllowed.selector, address(address(0))));
        engine.depostCollateral(address(0), AMOUNT_COLLATERAL);
        vm.stopPrank();
    }
}
