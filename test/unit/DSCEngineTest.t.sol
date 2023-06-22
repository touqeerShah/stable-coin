// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Test} from "forge-std/Test.sol";
import "forge-std/console.sol";

import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {DeployDSC} from "../../script/DeployDSC.s.sol";
import {DecentralizedStableCoin} from "../../src/core/DecenttializedStableCoin.sol";
import {DSCEngine} from "../../src/core/DSCEngine.sol";
import {ERC20Mock} from "../../src/mock/ERC20Mock.sol";
import {IDSCEngine} from "../../src/interfaces/IDSCEngine.sol";

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
    address[] public tokenAddresses;
    address[] public priceFeedAddresses;
    uint256 amountCollateral = 10 ether;
    uint256 amountToMint = 1 ether;
    address public user = address(1);

    modifier depositedCollateral(bool isMint) {
        vm.startPrank(USER);
        ERC20Mock(weth).approve(address(engine), amountCollateral);
        if (!isMint) {
            engine.depostCollateral(weth, amountCollateral);
        } else {
            engine.depostCollateralAndMintDsc(weth, amountCollateral, amountToMint);
        }
        vm.stopPrank();
        _;
    }

    function setUp() public {
        deployDSC = new DeployDSC();
        (dsc, engine, helperConfig) = deployDSC.run();

        (ethUsdPriceFeed, btcUsdPriceFeed, weth, wbtc, deployerKey) = helperConfig.activeNetworkConfig();
        ERC20Mock(weth).mint(USER, START_ERC20_BALANCE);
    }

    /**
     * constructor Test **********
     */
    function testWhenLengthAreNoMatch() public {
        tokenAddresses = [weth, wbtc];
        priceFeedAddresses = [ethUsdPriceFeed];
        vm.expectRevert(IDSCEngine.DSCEngine__TokenAddressesAndPriceFeedAddressesAmountsDontMatch.selector);
        new DSCEngine(tokenAddresses,priceFeedAddresses,address(dsc));
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

    function testGetTokenAmountFromUsd() public {
        uint256 usdAmount = 100 ether;
        // $2000/ETH / 100 ETH = 0.05
        uint256 expectedWeth = 0.05 ether;
        uint256 actualUSD = engine.getTokenAmountFromUsd(weth, usdAmount);
        assertEq(expectedWeth, actualUSD);
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

    function testGetAccountInfoOfDeposit() public depositedCollateral(false) {
        (uint256 totalDscMinted, uint256 collateralValueInUsd) = engine.getAccountInformation(USER);
        uint256 expectedTotalDSC = 0;

        uint256 expectedCollateralValue = engine.getTokenAmountFromUsd(weth, collateralValueInUsd);
        assertEq(expectedTotalDSC, totalDscMinted);
        assertEq(expectedCollateralValue, AMOUNT_COLLATERAL);
    }

    function testDepostCollateralAndMintDsc() public depositedCollateral(true) {
        (uint256 totalDscMinted, uint256 collateralValueInUsd) = engine.getAccountInformation(USER);
        uint256 expectedTotalDSC = 1 ether;

        uint256 expectedCollateralValue = engine.getTokenAmountFromUsd(weth, collateralValueInUsd);
        assertEq(expectedTotalDSC, totalDscMinted);
        assertEq(expectedCollateralValue, AMOUNT_COLLATERAL);
    }

    function testRedeemCollateral() public depositedCollateral(true) {
        vm.startPrank(USER);

        uint256 oldBalance = ERC20Mock(weth).balanceOf(USER);
        uint256 redeemAmount = 0.1 ether;
        // uint256 engineBalance = ERC20Mock(weth).balanceOf(address(engine));
        // console.log("USER", USER);
        // console.log("address(engine)", address(engine));

        // console.log("engineBalance", engineBalance);

        // console.log("getCollateralDeposited", engine.getCollateralDeposited(weth));

        engine.redeemCollateral(weth, redeemAmount);
        uint256 currentBalance = ERC20Mock(weth).balanceOf(USER);

        assertEq(oldBalance + redeemAmount, currentBalance);
        vm.stopPrank();
    }

    function testRedeemCollateralFroDec() public depositedCollateral(true) {
        vm.startPrank(USER);
        (uint256 oldTotalDscMinted, uint256 oldCollateralValueInUsd) = engine.getAccountInformation(USER);
        uint256 redeemAmount = 1 ether;
        uint256 actualUSD = engine.getUsdValue(weth, redeemAmount);
        dsc.approve(address(engine), 0.1 ether);

        engine.redeemCollateralFroDec(weth, redeemAmount, 0.1 ether);
        (uint256 totalDscMinted, uint256 collateralValueInUsd) = engine.getAccountInformation(USER);
        assertEq(collateralValueInUsd, oldCollateralValueInUsd - actualUSD);
        assertEq(oldTotalDscMinted - 0.1 ether, totalDscMinted);

        vm.stopPrank();
    }
}
