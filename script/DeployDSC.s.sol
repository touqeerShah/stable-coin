// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Script} from "forge-std/Script.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {DecentralizedStableCoin} from "../src/core/DecenttializedStableCoin.sol";
import {DSCEngine} from "../src/core/DSCEngine.sol";
import "forge-std/console.sol";

contract DeployDSC is Script {
    address[] public tokenAddresses;
    address[] public priceFeedAddresses;

    function run() external returns (DecentralizedStableCoin, DSCEngine, HelperConfig) {
        HelperConfig config = new HelperConfig();
        (address wethUsdPriceFeed, address wbtcUsdPriceFeed, address weth, address wbtc, uint256 deployerKey) =
            config.activeNetworkConfig();
        tokenAddresses = [weth, wbtc];
        priceFeedAddresses = [wethUsdPriceFeed, wbtcUsdPriceFeed];

        console.log("tokenAddresses   = > ", weth, wbtc);
        console.log("priceFeedAddresses   = > ", wethUsdPriceFeed, wbtcUsdPriceFeed);

        vm.startBroadcast(deployerKey);
        DecentralizedStableCoin dsc = new DecentralizedStableCoin();
        DSCEngine dscEngine = new DSCEngine(tokenAddresses,priceFeedAddresses,address(dsc));
        console.log("dsc   = > ", address(dsc));

        dsc.transferOwnership(address(dscEngine));
        console.log("dscEngine => ", address(dscEngine));
        vm.stopBroadcast();
        return (dsc, dscEngine, config);
    }
}
