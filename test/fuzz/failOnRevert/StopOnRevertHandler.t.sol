// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {StdInvariant} from "forge-std/StdInvariant.sol";
import {DSCEngine} from "../../../src/core/DSCEngine.sol";
import {DecentralizedStableCoin} from "../../../src/core/DecenttializedStableCoin.sol";
import {HelperConfig} from "../../../script/HelperConfig.s.sol";
import {DeployDSC} from "../../../script/DeployDSC.s.sol";
import {ERC20Mock} from "../../../src/mock/ERC20Mock.sol";
import {MockV3Aggregator} from "../../../src/mock/MockV3Aggregator.sol";

import {console} from "forge-std/console.sol";

contract StopOnRevertHandler is StdInvariant, Test {
    DecentralizedStableCoin public dsc;
    HelperConfig public helperConfig;
    DSCEngine public engine;

    MockV3Aggregator public ethUsdPriceFeed;
    MockV3Aggregator public btcUsdPriceFeed;
    ERC20Mock public weth;
    ERC20Mock public wbtc;
    // this limit of how much fuzz allow to deposit collateral
    uint96 public constant MAX_DEPOSIT_SIZE = type(uint96).max;
    uint256 public count = 0;
    address[] public userDeposit;

    constructor(DSCEngine _dscEngine, DecentralizedStableCoin _dsc) {
        engine = _dscEngine;
        dsc = _dsc;

        address[] memory collateralAddress = engine.getCollateralTokens();
        weth = ERC20Mock(collateralAddress[0]);
        wbtc = ERC20Mock(collateralAddress[1]);
        ethUsdPriceFeed = MockV3Aggregator(engine.getCollateralTokenPriceFeed(address(weth)));
        btcUsdPriceFeed = MockV3Aggregator(engine.getCollateralTokenPriceFeed(address(wbtc)));
    }

    // Depost and Mint
    function mintAndDepositCollateral(uint256 collateralSeed, uint256 amountCollateral) public {
        // here we restrict to don't depost zero
        amountCollateral = bound(amountCollateral, 1, MAX_DEPOSIT_SIZE);
        ERC20Mock collateral = _getCollateralFromSeed(collateralSeed);
        vm.startPrank(msg.sender);
        collateral.mint(msg.sender, amountCollateral);
        collateral.approve(address(engine), amountCollateral);
        engine.depostCollateral(address(collateral), amountCollateral);
        vm.stopPrank();
        userDeposit.push(msg.sender);
        count++;
    }

    // function redeemCollateral(uint256 collateralSeed, uint256 amountCollateral) public {
    //     ERC20Mock collateral = _getCollateralFromSeed(collateralSeed);
    //     amountCollateral = bound(amountCollateral, 1, MAX_DEPOSIT_SIZE);
    //     vm.startPrank(msg.sender);
    //     collateral.mint(msg.sender, amountCollateral);
    //     collateral.approve(address(engine), amountCollateral);
    //     engine.depostCollateral(address(collateral), amountCollateral);

    //     uint256 maxCollateral = engine.getCollateralBalanceOfUser(msg.sender, address(collateral));
    //     console.log("maxCollateral", maxCollateral);

    //     amountCollateral = bound(amountCollateral, 0, maxCollateral);
    //     if (amountCollateral == 0) {
    //         return;
    //     }
    //     engine.redeemCollateral(address(collateral), amountCollateral);
    //     vm.stopPrank();
    // }

    function burnDsc(uint256 amountDsc, uint256 addressSeed) public {
        // Must burn more than 0
        if (userDeposit.length == 0) {
            return;
        }
        address sender = userDeposit[addressSeed % userDeposit.length];

        amountDsc = bound(amountDsc, 0, dsc.balanceOf(sender));
        if (amountDsc == 0) {
            return;
        }
        engine.burnDsc(amountDsc);
    }
    // Only the DSCEngine can mint DSC!

    function mintDsc(uint256 amountDsc, uint256 addressSeed) public {
        if (userDeposit.length == 0) {
            return;
        }
        address sender = userDeposit[addressSeed % userDeposit.length];

        (uint256 totalDscMinted, uint256 collateralValueInUsd) = engine.getAccountInformation(sender);

        int256 maxDscMinted = (int256(collateralValueInUsd) / 2) - int256(totalDscMinted);
        if (maxDscMinted < 0) {
            return;
        }
        amountDsc = bound(amountDsc, 0, uint256(maxDscMinted));
        if (amountDsc == 0) {
            return;
        }
        vm.startPrank(sender);
        engine.minDsc(amountDsc);
        vm.stopPrank();
    }

    function liquidate(uint256 collateralSeed, address userToBeLiquidated, uint256 debtToCover) public {
        uint256 minHealthFactor = engine.getMinHealthFactor();
        uint256 userHealthFactor = engine.getHealthFactor(userToBeLiquidated);
        if (userHealthFactor >= minHealthFactor) {
            return;
        }
        debtToCover = bound(debtToCover, 1, uint256(type(uint96).max));
        ERC20Mock collateral = _getCollateralFromSeed(collateralSeed);
        engine.liquidate(address(collateral), userToBeLiquidated, debtToCover);
    }

    /////////////////////////////
    // DecentralizedStableCoin //
    /////////////////////////////
    function transferDsc(uint256 amountDsc, address to) public {
        if (to == address(0)) {
            to = address(1);
        }
        amountDsc = bound(amountDsc, 0, dsc.balanceOf(msg.sender));
        vm.prank(msg.sender);
        dsc.transfer(to, amountDsc);
    }

    /////////////////////////////
    // Aggregator //
    /////////////////////////////
    function updateCollateralPrice(uint96 newPrice, uint256 collateralSeed) public {
        int256 intNewPrice = int256(uint256(newPrice));
        ERC20Mock collateral = _getCollateralFromSeed(collateralSeed);
        MockV3Aggregator priceFeed = MockV3Aggregator(engine.getCollateralTokenPriceFeed(address(collateral)));

        priceFeed.updateAnswer(intNewPrice);
    }

    /// Helper Functions
    // this will allow to give one of two valid collateral allow URL in our case

    function _getCollateralFromSeed(uint256 collateralSeed) private view returns (ERC20Mock) {
        if (collateralSeed % 2 == 0) {
            return weth;
        } else {
            return wbtc;
        }
    }
}
